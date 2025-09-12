import { useEffect, useRef, useState } from "react";

interface NetworkNode {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  type: 'L1' | 'L2';
  logo: string;
  shape: 'circle' | 'rectangle' | 'hexagon';
}

interface SingleTransaction {
  from: string;
  to: string;
  progress: number;
  path: { x: number; y: number }[];
}

// Network positions matching the exact diagram layout
const networks: NetworkNode[] = [
  // Top row - main networks
  { id: 'ethereum', name: 'Ethereum', x: 110, y: 90, color: '#627EEA', type: 'L1', logo: '♦', shape: 'circle' },
  { id: 'solana', name: 'Solana', x: 400, y: 90, color: '#9945FF', type: 'L1', logo: '≡', shape: 'circle' },
  
  // Middle left - L2s
  { id: 'optimism', name: 'Optimism', x: 60, y: 160, color: '#FF0420', type: 'L2', logo: 'OP', shape: 'rectangle' },
  { id: 'arbitrum-rect', name: 'Arbitrum', x: 200, y: 190, color: '#28A0F0', type: 'L2', logo: 'ARB', shape: 'rectangle' },
  
  // Middle right - hexagon Arbitrum and bridge
  { id: 'arbitrum-hex', name: 'Arbitrum', x: 450, y: 200, color: '#28A0F0', type: 'L2', logo: '⬢', shape: 'hexagon' },
  
  // Bottom row - networks
  { id: 'base', name: 'Base', x: 110, y: 280, color: '#0052FF', type: 'L2', logo: '○', shape: 'circle' },
  { id: 'polygon', name: 'Polygon', x: 60, y: 370, color: '#8247E5', type: 'L1', logo: '⬟', shape: 'circle' },
  { id: 'avalanche', name: 'Avalanche', x: 250, y: 370, color: '#E84142', type: 'L1', logo: '▲', shape: 'circle' },
  { id: 'zksync', name: 'zkSync Era', x: 400, y: 280, color: '#8C8DFC', type: 'L2', logo: '⚡', shape: 'circle' },
];

// Define the exact arrow paths from the diagram
const arrowPaths = [
  // From Ethereum
  { from: 'ethereum', to: 'solana' },
  { from: 'ethereum', to: 'optimism' },
  { from: 'ethereum', to: 'arbitrum-rect' },
  
  // From Solana
  { from: 'solana', to: 'ethereum' },
  { from: 'solana', to: 'arbitrum-hex' },
  { from: 'solana', to: 'arbitrum-rect' },
  
  // From Optimism
  { from: 'optimism', to: 'base' },
  { from: 'optimism', to: 'arbitrum-rect' },
  
  // From Base
  { from: 'base', to: 'polygon' },
  { from: 'base', to: 'avalanche' },
  { from: 'base', to: 'arbitrum-rect' },
  
  // From Arbitrum (central hub)
  { from: 'arbitrum-rect', to: 'ethereum' },
  { from: 'arbitrum-rect', to: 'solana' },
  { from: 'arbitrum-rect', to: 'base' },
  { from: 'arbitrum-rect', to: 'avalanche' },
  { from: 'arbitrum-rect', to: 'arbitrum-hex' },
  
  // From Arbitrum hexagon
  { from: 'arbitrum-hex', to: 'zksync' },
  { from: 'arbitrum-hex', to: 'avalanche' },
  
  // From zkSync
  { from: 'zksync', to: 'arbitrum-hex' },
  { from: 'zksync', to: 'avalanche' },
  
  // From Avalanche
  { from: 'avalanche', to: 'arbitrum-rect' },
  { from: 'avalanche', to: 'polygon' },
  
  // From Polygon
  { from: 'polygon', to: 'base' },
  { from: 'polygon', to: 'avalanche' },
];

export default function BlockchainNetworkMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transaction, setTransaction] = useState<SingleTransaction | null>(null);
  const animationFrameRef = useRef<number>();

  const generatePathPoints = (fromNetwork: NetworkNode, toNetwork: NetworkNode) => {
    const path = [];
    const steps = 50;
    
    // Create smooth curved path between networks
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      
      // Add slight curve for visual appeal
      const distance = Math.sqrt(Math.pow(toNetwork.x - fromNetwork.x, 2) + Math.pow(toNetwork.y - fromNetwork.y, 2));
      const curveOffset = Math.sin(t * Math.PI) * Math.min(20, distance * 0.1);
      
      // Calculate perpendicular offset
      const angle = Math.atan2(toNetwork.y - fromNetwork.y, toNetwork.x - fromNetwork.x);
      const perpAngle = angle + Math.PI / 2;
      
      const x = fromNetwork.x + (toNetwork.x - fromNetwork.x) * t + Math.cos(perpAngle) * curveOffset;
      const y = fromNetwork.y + (toNetwork.y - fromNetwork.y) * t + Math.sin(perpAngle) * curveOffset;
      
      path.push({ x, y });
    }
    
    return path;
  };

  const createRandomTransaction = (): SingleTransaction => {
    // Select random arrow path from the diagram
    const randomPath = arrowPaths[Math.floor(Math.random() * arrowPaths.length)];
    const fromNetwork = networks.find(n => n.id === randomPath.from)!;
    const toNetwork = networks.find(n => n.id === randomPath.to)!;
    
    const path = generatePathPoints(fromNetwork, toNetwork);
    return {
      from: randomPath.from,
      to: randomPath.to,
      progress: 0,
      path
    };
  };

  const drawArrows = (ctx: CanvasRenderingContext2D) => {
    // Draw all arrows from the diagram
    arrowPaths.forEach(arrow => {
      const fromNode = networks.find(n => n.id === arrow.from);
      const toNode = networks.find(n => n.id === arrow.to);
      
      if (fromNode && toNode) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1.0;
        
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
        
        // Draw arrowhead
        const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
        const arrowLength = 8;
        const arrowAngle = 0.5;
        
        const arrowX = toNode.x - Math.cos(angle) * 25; // Stop before node edge
        const arrowY = toNode.y - Math.sin(angle) * 25;
        
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle - arrowAngle),
          arrowY - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle + arrowAngle),
          arrowY - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.stroke();
        
        ctx.globalAlpha = 1;
      }
    });

    // Draw bridge labels
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    
    // Bridge rectangles
    ctx.strokeRect(350, 145, 60, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(350, 145, 60, 20);
    ctx.fillStyle = '#000000';
    ctx.fillText('Bridge', 380, 158);
    
    ctx.strokeRect(280, 240, 60, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(280, 240, 60, 20);
    ctx.fillStyle = '#000000';
    ctx.fillText('Bridge', 310, 253);
  };

  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const pointX = x + size * Math.cos(angle);
      const pointY = y + size * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    ctx.closePath();
  };

  const drawNetwork = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw arrows first (background)
    drawArrows(ctx);
    
    // Draw the single transaction dot if it exists
    if (transaction && transaction.progress < 1) {
      const currentIndex = Math.floor(transaction.progress * (transaction.path.length - 1));
      const nextIndex = Math.min(currentIndex + 1, transaction.path.length - 1);
      const t = (transaction.progress * (transaction.path.length - 1)) - currentIndex;
      
      const currentPos = transaction.path[currentIndex];
      const nextPos = transaction.path[nextIndex];
      
      const x = currentPos.x + (nextPos.x - currentPos.x) * t;
      const y = currentPos.y + (nextPos.y - currentPos.y) * t;
      
      // Draw outer glow
      ctx.fillStyle = '#FF0000';
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Draw main transaction dot
      ctx.fillStyle = '#FF0000';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Inner bright core
      ctx.fillStyle = '#FFFF00';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Draw pulsing rings
      const time = Date.now() * 0.005;
      for (let i = 0; i < 2; i++) {
        const pulse = 1 + Math.sin(time + i * 1.5) * 0.3;
        ctx.strokeStyle = i % 2 === 0 ? '#FF0000' : '#00FF00';
        ctx.lineWidth = 2 - i;
        ctx.globalAlpha = 0.6 - i * 0.2;
        ctx.beginPath();
        ctx.arc(x, y, (15 + i * 6) * pulse, 0, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      
      // Add floating label
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = 0.9;
      ctx.fillRect(x - 35, y - 30, 70, 16);
      ctx.globalAlpha = 1;
      
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 35, y - 30, 70, 16);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fromNetwork = networks.find(n => n.id === transaction.from);
      const toNetwork = networks.find(n => n.id === transaction.to);
      ctx.fillText(`${fromNetwork?.name} → ${toNetwork?.name}`, x, y - 22);
    }
    
    // Draw network nodes
    networks.forEach(network => {
      if (network.shape === 'rectangle') {
        // Draw rectangular nodes (L2s in diagram)
        const width = 70;
        const height = 30;
        
        ctx.fillStyle = network.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        
        ctx.fillRect(network.x - width/2, network.y - height/2, width, height);
        ctx.strokeRect(network.x - width/2, network.y - height/2, width, height);
        ctx.shadowBlur = 0;
        
        // Node logo/text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(network.logo, network.x, network.y);
        
        // Network name below rectangle
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px Arial';
        ctx.fillText(network.name, network.x, network.y + 25);
        
      } else if (network.shape === 'hexagon') {
        // Draw hexagonal node
        ctx.fillStyle = network.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        
        drawHexagon(ctx, network.x, network.y, 20);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Node logo/text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(network.logo, network.x, network.y);
        
        // Network name
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px Arial';
        ctx.fillText(network.name, network.x, network.y + 35);
        
      } else {
        // Draw circular nodes (main networks)
        const radius = 35;
        
        // Node circle with blue border like in diagram
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#4A90E2';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.arc(network.x, network.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Node logo/text
        ctx.fillStyle = network.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(network.logo, network.x, network.y - 5);
        
        // Network name below circle
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(network.name, network.x, network.y + 55);
      }
    });
    
    // Draw title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Cross-Chain Transaction Flow', 15, 20);
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Update transaction
    setTransaction(prev => {
      if (!prev) {
        return createRandomTransaction();
      }
      
      const newProgress = prev.progress + 0.004;
      
      if (newProgress >= 1) {
        // Create new random transaction
        return createRandomTransaction();
      }
      
      return {
        ...prev,
        progress: newProgress
      };
    });
    
    drawNetwork(ctx);
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size to match diagram proportions
    canvas.width = 520;
    canvas.height = 420;
    
    // Initialize with first transaction
    setTransaction(createRandomTransaction());
    
    // Start animation
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full bg-white rounded-lg p-6 border-2 border-black">
      <canvas
        ref={canvasRef}
        className="w-full h-auto max-w-full"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );
}