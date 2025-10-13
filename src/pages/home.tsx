import { ArrowRightLeft, AlertTriangle, Wallet, Network } from "lucide-react";
import KpiCard from "@/components/dashboard/kpi-card";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, alpha, keyframes } from "@mui/material";
import TransactionVolumeChart from "@/components/charts/transaction-volume-chart";
import AnomalyChart from "@/components/charts/anomaly-chart";
import NetworkGraph from "@/components/charts/network-graph";
import BlockchainNetworkMap from "@/components/charts/blockchain-network-map";
import AnomalousTransactions from "@/components/dashboard/anomalous-transactions";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }`;

const frequentSearches = [
  `Find out latest news and information about "0xde.....8as" account address.`,
  `Is this address "0xjr.....w90" suspicious for making payments?`,
  `Find me everything about this transaction "0xbtg.....aj5" as I want to understand the risks associated with parties and activities involved.`,
  `Add "0xpr5.....yw1" into monitoring watchlist and flag any activity involved with any sanctioned wallets.`,
  `What are recent activities from all the accounts and address I am monitoring?`,
  `Create a detailed investigative report on USDC stablecoin and who are holding majority of its reserve?`,
  `Notify me over email if any activity happens on "0x45d.….yt3" in ethereum main net.`
]

// Generate synthetic transaction volume data for last 12 months
const generateVolumeData = () => {
  const months = [
    "Jul 2024",
    "Aug 2024",
    "Sep 2024",
    "Oct 2024",
    "Nov 2024",
    "Dec 2024",
    "Jan 2025",
    "Feb 2025",
    "Mar 2025",
    "Apr 2025",
    "May 2025",
    "Jun 2025",
  ];

  return months.map((month, index) => ({
    month,
    ethereum: Math.floor(Math.random() * 8 + 10) + index * 0.5, // Base 10-18M with slight upward trend
    base: Math.floor(Math.random() * 3 + 2) + index * 0.2, // Base 2-5M with slight upward trend (smaller network)
  }));
};

// Generate synthetic risk alert data for Base network
const generateRiskAlertData = () => {
  const months = [
    "Jul 2024",
    "Aug 2024",
    "Sep 2024",
    "Oct 2024",
    "Nov 2024",
    "Dec 2024",
    "Jan 2025",
    "Feb 2025",
    "Mar 2025",
    "Apr 2025",
    "May 2025",
    "Jun 2025",
  ];

  return months.map((month, index) => ({
    month,
    alerts: Math.floor(Math.random() * 50 + 60) + index * 5, // Base 60-110 with upward trend
  }));
};

// Risk categories data for pie chart
const riskCategoriesData = [
  { name: "Phishing", value: 20, color: "#ef4444" },
  { name: "Scam", value: 25, color: "#f97316" },
  { name: "Rug Pull", value: 20, color: "#eab308" },
  { name: "Pump-n-Dump", value: 20, color: "#8b5cf6" },
  { name: "Others", value: 15, color: "#6b7280" },
];

// Generate synthetic wallet transaction data
const generateWalletTransactions = () => {
  const entityNames = [
    "Binance Exchange",
    "Coinbase Wallet",
    "UniSwap Router",
    "Aave Protocol",
    "Compound Finance",
    "MetaMask Wallet",
    "Trust Wallet",
    "Ledger Hardware",
    "Trezor Device",
    "OpenSea Market",
    "Tornado Cash",
    "USDC Treasury",
    "Chainlink Oracle",
    "MakerDAO Vault",
    "SushiSwap DEX",
    "PancakeSwap Router",
    "Curve Finance",
    "1inch Exchange",
    "Yearn Finance",
    "Synthetix Protocol",
    "Balancer Pool",
    "Gnosis Safe",
    "Polygon Bridge",
    "Arbitrum Gateway",
    "Optimism Bridge",
    "ENS Registry",
    "IPFS Gateway",
    "Filecoin Storage",
    "Storj Network",
    "The Graph Protocol",
    "Chainlink VRF",
    "Band Protocol",
    "API3 Oracle",
    "Tellor Oracle",
    "DIA Data",
    "Kyber Network",
    "Bancor Protocol",
    "Ren Protocol",
    "Keep Network",
    "NuCypher Network",
  ];

  const transactions = [];
  const anomalousIndices = new Set([2, 45, 123, 187, 234, 298]); // Ensure index 2 is anomalous (will be in first 5 items)

  for (let i = 0; i < 350; i++) {
    const isAnomalous = anomalousIndices.has(i);
    const entityName =
      entityNames[Math.floor(Math.random() * entityNames.length)];
    const amount = isAnomalous
      ? Math.floor(Math.random() * 500000 + 100000) // Large amounts for anomalies
      : Math.floor(Math.random() * 10000 + 100);

    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    transactions.push({
      id: i + 1,
      entityName,
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      timestamp: date.toISOString(),
      amount: amount,
      sender:
        Math.random() > 0.5
          ? "0x7e0aedc93d9f898be835a44bfca3842e52416b82"
          : `0x${Math.random().toString(16).substr(2, 40)}`,
      receiver:
        Math.random() > 0.5
          ? "0x7e0aedc93d9f898be835a44bfca3842e52416b82"
          : `0x${Math.random().toString(16).substr(2, 40)}`,
      riskScore: isAnomalous
        ? Math.floor(Math.random() * 3 + 8)
        : Math.floor(Math.random() * 7 + 1), // 8-10 for anomalies, 1-7 for normal
      isAnomalous,
    });
  }

  return transactions.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
};

// Q&A Component for Ethereum Mainnet Transaction Data
function EthereumTransactionQA() {
  const [showCard, setShowCard] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);
  const [volumeData] = useState(generateVolumeData());

  const fullQuestion =
    "What is latest number of transactions on ethereum mainnet, and on Base network?";

  useEffect(() => {
    // Show card with fade-in immediately
    setShowCard(true);

    // Start typing the question after a short delay
    setTimeout(() => {
      setShowQuestion(true);
      let currentIndex = 0;
      const typeQuestion = () => {
        if (currentIndex < fullQuestion.length) {
          setQuestionText(fullQuestion.slice(0, currentIndex + 1));
          currentIndex++;
          setTimeout(typeQuestion, 50); // Type at 50ms per character
        } else {
          // Start response sequence after question is complete
          setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              setShowResponse(true);
            }, 2000);
          }, 500);
        }
      };
      typeQuestion();
    }, 1000);
  }, []);

  return (
    <Card
      className={`h-full border-[var(--argus-blue)]/20 bg-white transition-all duration-1000 ease-in-out ${
        showCard
          ? "opacity-100 transform translate-y-0"
          : "opacity-0 transform translate-y-4"
      }`}
    >
      <CardContent className="p-6">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
              sx={{
                width: 40,
                height: 40,
                bgcolor: "rgba(var(--argus-blue-rgb), 0.1)",
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
              }}
          >
            <ArrowRightLeft style={{ width: 20, height: 20, color: 'var(--argus-blue)' }} />
          </Box>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            Transaction Volume
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Question */}
          {showQuestion && (
            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 2, border: 1, borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>
                Question:
              </Typography>
              <Typography variant="body1" color="text.primary" sx={{ wordBreak: 'break-word' }}>
                {questionText}
                {questionText.length < fullQuestion.length && (
                  <span className="animate-pulse">|</span>
                )}
              </Typography>
            </Box>
          )}

          {/* Response */}
          <Box component={"div"} sx={{ bgcolor: 'rgba(var(--argus-blue-rgb), 0.1)', borderRadius: 2, p: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--argus-blue)', mb: 1 }}>
              Response:
            </Typography>
            {isTyping ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box className="w-2 h-2 rounded-full animate-bounce" sx={{ bgcolor: 'var(--argus-blue)' }} />
                <Box className="w-2 h-2 rounded-full animate-bounce" sx={{ animationDelay: "0.1s", bgcolor: 'var(--argus-blue)' }} />
                <Box className="w-2 h-2 rounded-full animate-bounce" sx={{ animationDelay: "0.2s", bgcolor: 'var(--argus-blue)' }} />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  Analyzing...
                </Typography>
              </Box>
            ) : showResponse ? (
              <Box>
                <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
                  Current number of transactions: Ethereum mainnet 13M, Base
                  network 3.2M.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                  Ethereum down 12% last week, Base up 8% last week
                </Typography>

                {/* Dual Line Chart */}
                <Box sx={{ mt: 2, height: { xs: 220, sm: 232 } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="month"
                        stroke="#64748b"
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={10}
                        label={{
                          value: "Volume (M)",
                          angle: -90,
                          position: "insideLeft",
                          fontSize: 12
                        }}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(1)}M`,
                          name === "ethereum" ? "Ethereum" : "Base",
                        ]}
                        labelFormatter={(label) => label}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="ethereum"
                        stroke="var(--argus-blue)"
                        strokeWidth={2}
                        dot={{
                          fill: "var(--argus-blue)",
                          strokeWidth: 2,
                          r: 3,
                        }}
                        activeDot={{ r: 5, fill: "var(--argus-blue)" }}
                        name="Ethereum"
                      />
                      <Line
                        type="monotone"
                        dataKey="base"
                        stroke="#eab308"
                        strokeWidth={2}
                        dot={{ fill: "#eab308", strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, fill: "#eab308" }}
                        name="Base"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">Waiting for response...</Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// Base Network Risk Alerts Q&A Component
function BaseRiskAlertsQA() {
  const [showCard, setShowCard] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);
  const [showPieChart, setShowPieChart] = useState(false);
  const [riskAlertData] = useState(generateRiskAlertData());

  const fullQuestion =
    "How many potential alerts have been generated on Base network?";

  useEffect(() => {
    // Wait for Transaction Volume card to complete (approximately 15 seconds)
    const cardTimer = setTimeout(() => {
      setShowCard(true);

      // Start typing the question after a short delay
      setTimeout(() => {
        setShowQuestion(true);
        let currentIndex = 0;
        const typeQuestion = () => {
          if (currentIndex < fullQuestion.length) {
            setQuestionText(fullQuestion.slice(0, currentIndex + 1));
            currentIndex++;
            setTimeout(typeQuestion, 50); // Type at 50ms per character
          } else {
            // Start response sequence after question is complete
            setTimeout(() => {
              setIsTyping(true);
              setTimeout(() => {
                setIsTyping(false);
                setShowResponse(true);
              }, 2000);
            }, 500);
          }
        };
        typeQuestion();
      }, 1000);
    }, 10000); // 10 seconds delay (wait for Transaction Volume to complete)

    return () => clearTimeout(cardTimer);
  }, []);

  // Show pie chart 1 second after response is shown
  useEffect(() => {
    if (showResponse) {
      const pieTimer = setTimeout(() => {
        setShowPieChart(true);
      }, 1000);
      return () => clearTimeout(pieTimer);
    }
  }, [showResponse]);

  return (
    <Card
      className={`h-full border-red-200 bg-white transition-all duration-1000 ease-in-out ${
        showCard
          ? "opacity-100 transform translate-y-0"
          : "opacity-0 transform translate-y-4"
      }`}
    >
      <CardContent className="p-6">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'rgba(220, 38, 38, 0.1)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </Box>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            Risk Alerts
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Question */}
          {showQuestion && (
            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 2, border: 1, borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>
                Question:
              </Typography>
              <Typography variant="body1" color="text.primary" sx={{ wordBreak: 'break-word' }}>
                {questionText}
                {questionText.length < fullQuestion.length && (
                  <span className="animate-pulse">|</span>
                )}
              </Typography>
            </Box>
          )}

          {/* Response */}
          <Box sx={{ borderRadius: 2, p: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main', mb: 1 }}>Response:</Typography>
            {isTyping ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box className="w-2 h-2 rounded-full animate-bounce" sx={{ bgcolor: 'error.main' }}></Box>
                <Box
                  className="w-2 h-2 rounded-full animate-bounce"
                  sx={{ bgcolor: 'error.main', animationDelay: "0.1s" }}
                ></Box>
                <Box
                  className="w-2 h-2 rounded-full animate-bounce"
                  sx={{ bgcolor: 'error.main', animationDelay: "0.2s" }}
                ></Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  Analyzing...
                </Typography>
              </Box>
            ) : showResponse ? (
              <Box>
                <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
                  There have been 1000 potential risk alerts generated on the
                  Base network.
                </Typography>

                {/* Risk Alerts Time Series Chart */}
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>
                    Risk Alerts Over Time
                  </Typography>
                  <Box sx={{ height: { xs: 250, sm: 270 } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={riskAlertData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#fecaca" />
                        <XAxis
                          dataKey="month"
                          stroke="#dc2626"
                          fontSize={10}
                          angle={-45}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis
                          stroke="#dc2626"
                          fontSize={10}
                          label={{
                            value: "Number of Risks",
                            angle: -90,
                            position: "insideLeft",
                            fontSize: 12,
                          }}
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            `${value}`,
                            "Risk Alerts",
                          ]}
                          labelFormatter={(label) => label}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #fecaca",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="alerts"
                          stroke="#dc2626"
                          strokeWidth={2}
                          dot={{ fill: "#dc2626", strokeWidth: 2, r: 2 }}
                          activeDot={{ r: 4, fill: "#dc2626" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>

                {/* Risk Categories Pie Chart */}
                {showPieChart && (
                  <Box sx={{ mt: 2 }} className="animate-fade-in">
                    <Typography variant="subtitle2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>
                      Risk Categories
                    </Typography>
                    <Box sx={{ height: 192 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={riskCategoriesData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {riskCategoriesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [
                              `${value}%`,
                              "Percentage",
                            ]}
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #fecaca",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            fontSize={10}
                            formatter={(value) => value}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">Waiting for response...</Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// Wallet Analysis Q&A Component
function WalletAnalysisQA() {
  const [showCard, setShowCard] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions] = useState(generateWalletTransactions());

  const itemsPerPage = 5;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = transactions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const fullQuestion =
    'For contract address "0x7e0aedc93d9f898be835a44bfca3842e52416b82". Identify which entity it belongs to, and also identify all the transactions that it has interacted with in last 30 days. (Spot / highlight any anomalies).';

  useEffect(() => {
    // Wait for Risk Alerts card to complete (approximately 35 seconds total)
    const cardTimer = setTimeout(() => {
      setShowCard(true);

      // Start typing the question after a short delay
      setTimeout(() => {
        setShowQuestion(true);
        let currentIndex = 0;
        const typeQuestion = () => {
          if (currentIndex < fullQuestion.length) {
            setQuestionText(fullQuestion.slice(0, currentIndex + 1));
            currentIndex++;
            setTimeout(typeQuestion, 30); // Faster typing for longer question
          } else {
            // Start response sequence after question is complete
            setTimeout(() => {
              setIsTyping(true);
              setTimeout(() => {
                setIsTyping(false);
                setShowResponse(true);
              }, 2000);
            }, 500);
          }
        };
        typeQuestion();
      }, 1000);
    }, 20000); // 20 seconds delay (wait for Risk Alerts to complete)

    return () => clearTimeout(cardTimer);
  }, []);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card
      className={`h-full border-green-200 bg-white transition-all duration-1000 ease-in-out ${
        showCard
          ? "opacity-100 transform translate-y-0"
          : "opacity-0 transform translate-y-4"
      }`}
      style={{ minWidth: 0 }} // Prevents the grid item from stretching due to wide content like the table
    >
      <CardContent className="p-6">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <Wallet className="w-5 h-5 text-green-600" />
          </Box>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            Wallet Analysis
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Question */}
          {showQuestion && (
            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 2, border: 1, borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>
                Question:
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6, wordBreak: 'break-word' }}>
                {questionText}
                {questionText.length < fullQuestion.length && (
                  <span className="animate-pulse">|</span>
                )}
              </Typography>
            </Box>
          )}

          {/* Response */}
          <Box sx={{ bgcolor: (theme) => alpha(theme.palette.success.main, 0.05), borderRadius: 2, p: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main', mb: 1 }}>Response:</Typography>
            {isTyping ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box className="w-2 h-2 rounded-full animate-bounce" sx={{ bgcolor: 'success.main' }} />
                <Box className="w-2 h-2 rounded-full animate-bounce" sx={{ animationDelay: "0.1s", bgcolor: 'success.main' }} />
                <Box className="w-2 h-2 rounded-full animate-bounce" sx={{ animationDelay: "0.2s", bgcolor: 'success.main' }} />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  Analyzing...
                </Typography>
              </Box>
            ) : showResponse ? (
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 2, wordBreak: 'break-word' }}>
                  The wallet belongs to{" "}
                  <Typography component="span" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                    JPM Dollar Token
                  </Typography>
                  . Below are the entities it has interacted with in the last 30
                  days:
                </Typography>

                {/* Transaction Table */}
                <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
                  <Table sx={{ minWidth: 800 }} size="small" aria-label="wallet transactions table">
                    <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05) }}>
                      <TableRow>
                        <TableCell>Entity</TableCell>
                        <TableCell>Address</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Sender</TableCell>
                        <TableCell>Receiver</TableCell>
                        <TableCell>Risk</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentTransactions.map((tx) => (
                        <TableRow
                          key={tx.id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            ...(tx.isAnomalous && {
                              bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
                              borderLeft: 4,
                              borderColor: 'error.main',
                            }),
                          }}
                        >
                          <TableCell component="th" scope="row" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {tx.entityName}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{formatAddress(tx.address)}</TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(tx.timestamp)}</TableCell>
                          <TableCell sx={{ fontWeight: 500, color: tx.isAnomalous ? 'error.dark' : 'text.primary', whiteSpace: 'nowrap' }}>
                            {formatAmount(tx.amount)}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{formatAddress(tx.sender)}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{formatAddress(tx.receiver)}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                tx.riskScore >= 8
                                  ? "bg-red-100 text-red-800"
                                  : tx.riskScore >= 6
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {tx.riskScore}/10
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </TableContainer>
                  {/* Pagination */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: { xs: 1, sm: 2 },
                      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05),
                      borderTop: 1,
                      borderColor: 'divider',
                      gap: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, transactions.length)}{" "}
                      of {transactions.length} transactions
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="h-8 px-3"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        Page {currentPage} of {totalPages}
                      </Typography>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 px-3"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Box>
                  </Box>

                {/* Anomaly Summary */}
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.dark', mb: 0.5 }}>
                    🚨 Anomalies Detected
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'error.dark' }}>
                    {transactions.filter((tx) => tx.isAnomalous).length}{" "}
                    anomalous transactions identified with high amounts and risk
                    scores 8-10.
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">Waiting for response...</Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// Network Node Interface
interface NetworkNode {
  id: string;
  x: number;
  y: number;
  isAnomalous: boolean;
  isCentral: boolean;
}

// Contract Analysis Q&A Component
function ContractAnalysisQA() {
  const [showCard, setShowCard] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);

  const fullQuestion =
    "For the contract address 0x22342340abbe, identify all the addresses it has interacted in last month. Higlight any potential anomalies in the network graph";
  //The inward arrow indicates fund was transferred to this contract. outward indicates the funds were transferred out of this contract. Create 50 connections in the network graph with black dots and lines. Also add 10% of those as red indicating those are suspicious or anomalous in nature.';

  // Generate network graph data with multi-node interactions
  const generateNetworkData = (): NetworkNode[] => {
    const nodes: NetworkNode[] = [];
    const centerX = 150;
    const centerY = 100;
    const radius = 80;

    // Central contract node
    nodes.push({
      id: "central",
      x: centerX,
      y: centerY,
      isAnomalous: false,
      isCentral: true,
    });

    // Generate 50 surrounding nodes in clusters
    for (let i = 0; i < 50; i++) {
      const clusterAngle = (Math.floor(i / 10) / 5) * 2 * Math.PI; // 5 clusters
      const nodeAngle = clusterAngle + (Math.random() - 0.5) * 1.0; // Spread within cluster
      const nodeRadius = radius + (Math.random() - 0.5) * 40;
      const x = centerX + Math.cos(nodeAngle) * nodeRadius;
      const y = centerY + Math.sin(nodeAngle) * nodeRadius;
      const isAnomalous = Math.random() < 0.1; // 10% anomalous

      nodes.push({
        id: `node-${i}`,
        x,
        y,
        isAnomalous,
        isCentral: false,
      });
    }

    return nodes;
  };

  // Generate connections ensuring every node is connected
  const generateConnections = (nodes: NetworkNode[]) => {
    const connections = [];
    const centerNode = nodes.find((n) => n.isCentral);
    const otherNodes = nodes.filter((n) => !n.isCentral);
    const connectedNodes = new Set();

    // Connect central node to first ring of nodes
    for (let i = 0; i < 20; i++) {
      const targetNode = otherNodes[i];
      connections.push({
        from: centerNode,
        to: targetNode,
        type: "hub",
      });
      connectedNodes.add(targetNode.id);
    }

    // Create inter-node connections to ensure all nodes are connected
    for (let i = 0; i < otherNodes.length; i++) {
      const currentNode = otherNodes[i];

      // If node isn't connected yet, connect it to a nearby connected node
      if (!connectedNodes.has(currentNode.id)) {
        const connectedNodesList = Array.from(connectedNodes)
          .map((id) => otherNodes.find((n) => n.id === id))
          .filter((node): node is NetworkNode => node !== undefined);

        if (connectedNodesList.length > 0) {
          // Find nearest connected node
          let nearestNode = connectedNodesList[0];
          let minDistance = Math.sqrt(
            Math.pow(currentNode.x - nearestNode.x, 2) +
              Math.pow(currentNode.y - nearestNode.y, 2),
          );

          for (const node of connectedNodesList) {
            const distance = Math.sqrt(
              Math.pow(currentNode.x - node.x, 2) +
                Math.pow(currentNode.y - node.y, 2),
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearestNode = node;
            }
          }

          connections.push({
            from: nearestNode,
            to: currentNode,
            type: "inter",
          });
        }
        connectedNodes.add(currentNode.id);
      }

      // Add additional random connections for complexity
      if (i < 30 && Math.random() > 0.6) {
        const randomTarget =
          otherNodes[Math.floor(Math.random() * otherNodes.length)];
        if (randomTarget !== currentNode) {
          connections.push({
            from: currentNode,
            to: randomTarget,
            type: "inter",
          });
        }
      }
    }

    return connections;
  };

  useEffect(() => {
    // Wait for Wallet Analysis card to complete (approximately 45 seconds total)
    const cardTimer = setTimeout(() => {
      setShowCard(true);

      // Start typing the question after a short delay
      setTimeout(() => {
        setShowQuestion(true);
        let currentIndex = 0;
        const typeQuestion = () => {
          if (currentIndex < fullQuestion.length) {
            setQuestionText(fullQuestion.slice(0, currentIndex + 1));
            currentIndex++;
            setTimeout(typeQuestion, 20); // Faster typing for very long question
          } else {
            // Start response sequence after question is complete
            setTimeout(() => {
              setIsTyping(true);
              setTimeout(() => {
                setIsTyping(false);
                setShowResponse(true);
                setNetworkNodes(generateNetworkData());
              }, 2000);
            }, 500);
          }
        };
        typeQuestion();
      }, 1000);
    }, 30000); // 30 seconds delay (wait for Wallet Analysis to complete + 2s buffer)

    return () => clearTimeout(cardTimer);
  }, []);

  return (
    <Card
      className={`h-full border-purple-200 bg-purple-50 transition-all duration-1000 ease-in-out ${
        showCard
          ? "opacity-100 transform translate-y-0"
          : "opacity-0 transform translate-y-4"
      }`}
    >
      <CardContent className="p-6">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <Network className="w-5 h-5 text-purple-600" />
          </Box>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            Network Analysis Summary
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Question */}
          {showQuestion && (
            <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 2, border: 1, borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>
                Question:
              </Typography>
              <Typography variant="body1" color="text.primary" sx={{ wordBreak: 'break-word' }}>
                {questionText}
                {questionText.length < fullQuestion.length && (
                  <span className="animate-pulse">|</span>
                )}
              </Typography>
            </Box>
          )}

          {/* Response */}
          <Box sx={{ bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1), borderRadius: 2, p: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'secondary.main', mb: 1 }}>
              Response:
            </Typography>
            {isTyping ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box className="w-2 h-2 rounded-full animate-bounce" sx={{ bgcolor: 'secondary.main' }} />
                <Box className="w-2 h-2 rounded-full animate-bounce" sx={{ animationDelay: "0.1s", bgcolor: 'secondary.main' }} />
                <Box className="w-2 h-2 rounded-full animate-bounce" sx={{ animationDelay: "0.2s", bgcolor: 'secondary.main' }} />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  Analyzing contract...
                </Typography>
              </Box>
            ) : showResponse ? (
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 2, wordBreak: 'break-word' }}>
                  Contract Address:{" "}
                  <Typography component="span" sx={{ fontFamily: 'monospace', color: 'secondary.dark' }}>
                    0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc214a8
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Network analysis complete. Generated 50 connections with 10%
                  flagged as anomalous.
                </Typography>

                {/* Network Graph */}
                <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider', p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                      Entity Relationships
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: { xs: 200, sm: 250 } }}>
                    <svg
                      width="300"
                      height="200"
                      viewBox="0 0 300 200"
                      className="w-full h-auto"
                    >
                      {/* Background */}
                      <rect width="300" height="200" fill="#fefefe" />

                      {/* Connection Lines */}
                      {(() => {
                        const connections = generateConnections(networkNodes);
                        return connections.map((connection, index) => {
                          if (!connection.from || !connection.to) return null;

                          const isAnomalous =
                            connection.to.isAnomalous ||
                            connection.from.isAnomalous;
                          return (
                            <g key={`connection-${index}`}>
                              <line
                                x1={connection.from.x}
                                y1={connection.from.y}
                                x2={connection.to.x}
                                y2={connection.to.y}
                                stroke={isAnomalous ? "#dc2626" : "#374151"}
                                strokeWidth="1"
                                opacity="0.6"
                              />
                              {/* Arrow indicating direction */}
                              {(() => {
                                const dx = connection.to.x - connection.from.x;
                                const dy = connection.to.y - connection.from.y;
                                const length = Math.sqrt(dx * dx + dy * dy);
                                const unitX = dx / length;
                                const unitY = dy / length;

                                // Position arrow closer to target node
                                const arrowDistance = connection.to.isCentral
                                  ? 8
                                  : 4;
                                const arrowX =
                                  connection.to.x - unitX * arrowDistance;
                                const arrowY =
                                  connection.to.y - unitY * arrowDistance;

                                // Calculate perpendicular vectors for arrow wings
                                const perpX = -unitY * 3;
                                const perpY = unitX * 3;

                                return (
                                  <polygon
                                    points={`${arrowX + unitX * 4},${arrowY + unitY * 4} ${arrowX + perpX},${arrowY + perpY} ${arrowX - perpX},${arrowY - perpY}`}
                                    fill={isAnomalous ? "#dc2626" : "#374151"}
                                    opacity="0.9"
                                  />
                                );
                              })()}
                            </g>
                          );
                        });
                      })()}

                      {/* Nodes */}
                      {networkNodes.map((node, index) => (
                        <circle
                          key={`node-${index}`}
                          cx={node.x}
                          cy={node.y}
                          r={node.isCentral ? 8 : 4}
                          fill={
                            node.isCentral
                              ? "#7c3aed"
                              : node.isAnomalous
                                ? "#dc2626"
                                : "#374151"
                          }
                          stroke={
                            node.isCentral
                              ? "#5b21b6"
                              : node.isAnomalous
                                ? "#b91c1c"
                                : "#1f2937"
                          }
                          strokeWidth={node.isCentral ? 2 : 1}
                          shapeRendering="geometricPrecision"
                        />
                      ))}

                      {/* Legend */}
                      <g transform="translate(5, 5)">
                        <rect
                          x="0"
                          y="0"
                          width="120"
                          height="50"
                          fill="white"
                          stroke="#e5e7eb"
                          strokeWidth="1"
                          rx="4"
                        />
                        <circle cx="12" cy="12" r="3" fill="#7c3aed" />
                        <text x="20" y="16" fontSize="8" fill="#374151">
                          Origin Contract
                        </text>
                        <circle cx="12" cy="25" r="2" fill="#374151" />
                        <text x="20" y="28" fontSize="8" fill="#374151">
                          Normal interaction
                        </text>
                        <circle cx="12" cy="38" r="2" fill="#dc2626" />
                        <text x="20" y="41" fontSize="8" fill="#374151">
                          Anomalous Interaction
                        </text>
                      </g>
                    </svg>
                  </Box>
                </Box>

                {/* Summary */}
                <Box component={"div"} className="bg-purple-50" sx={{ mt: 2, p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: 'secondary.dark', mb: 0.5 }}>
                    📊 Network Analysis Summary
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'secondary.dark' }}>
                    Total connections: 50 | Anomalous:{" "}
                    {networkNodes.filter((n) => n.isAnomalous).length} (
                    {Math.round(
                      (networkNodes.filter((n) => n.isAnomalous).length / 50) *
                        100,
                    )}
                    %)
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">Waiting for response...</Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function SanctionedEntitiesQA() {
  const [showQuestion, setShowQuestion] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState(0);

  const fullQuestion =
    "What is the number of times it has interacted with potentially sanctioned entities?";

  // Generate random data for sanctioned categories
  const sanctionedCategories = [
    { name: "OFAC", count: Math.floor(Math.random() * 101), color: "#dc2626" },
    {
      name: "Privacy Protocols",
      count: Math.floor(Math.random() * 101),
      color: "#7c3aed",
    },
    {
      name: "Ransomware",
      count: Math.floor(Math.random() * 101),
      color: "#ea580c",
    },
    {
      name: "Phishing",
      count: Math.floor(Math.random() * 101),
      color: "#c2410c",
    },
    {
      name: "Nation State Threats",
      count: Math.floor(Math.random() * 101),
      color: "#be123c",
    },
    {
      name: "Large Volume Transfers",
      count: Math.floor(Math.random() * 101),
      color: "#0369a1",
    },
    {
      name: "Others",
      count: Math.floor(Math.random() * 101),
      color: "#059669",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowQuestion(true);
    }, 40000); // 40 seconds delay

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showQuestion && !isTyping) {
      setIsTyping(true);
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= fullQuestion.length) {
          setQuestionText(fullQuestion.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          // Show response after typing is complete
          setTimeout(() => {
            setShowResponse(true);
            // Start showing categories one by one after 1 second
            setTimeout(() => {
              let categoryIndex = 0;
              const showNextCategory = () => {
                if (categoryIndex < sanctionedCategories.length) {
                  setVisibleCategories(categoryIndex + 1);
                  categoryIndex++;
                  setTimeout(showNextCategory, 1000); // 1 second delay between categories
                }
              };
              showNextCategory();
            }, 1000);
          }, 2000);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [showQuestion, fullQuestion]);

  if (!showQuestion) return null;

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider', p: { xs: 1.5, sm: 2 }, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 1.5 }}>
          <Box sx={{ width: 32, height: 32, bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </Box>
        </Box>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
          Sanctioned Entity Analysis
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Question */}
        <Box sx={{ bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05), borderRadius: 2, p: 2, borderLeft: 4, borderColor: 'warning.light' }}>
          <Typography sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
            {questionText}
            {isTyping && <span className="animate-pulse">|</span>}
          </Typography>
        </Box>

        {/* Response */}
        {showResponse && (
          <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2, borderLeft: 4, borderColor: 'divider' }} className="animate-fade-in">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ width: 32, height: 32, bgcolor: 'grey.100', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>A</Typography>
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 500, mb: 2, wordBreak: 'break-word' }}>
                This address has interacted with sanctioned entities in the
                following categories:
              </Typography>

              {/* Bar Chart */}
              <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider', p: 2 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                  Sanctioned Entity Interactions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {sanctionedCategories
                    .slice(0, visibleCategories)
                    .map((category, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                        <Typography variant="body2" color="text.secondary" sx={{
                          fontWeight: 500,
                          width: { xs: 100, sm: 128 },
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {category.name}
                        </Typography>
                        <Box sx={{ flex: 1, bgcolor: 'grey.100', borderRadius: '9999px', height: 24, position: 'relative', overflow: 'hidden' }}>
                          <Box
                            className="transition-all duration-1000 ease-out"
                            sx={{
                              height: '100%',
                              width: `${category.count}%`,
                              bgcolor: category.color,
                              borderRadius: '9999px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              pr: 1
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'common.white', fontWeight: 500 }}>
                              {category.count}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function WalletMonitoringQA() {
  const [showQuestion, setShowQuestion] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const fullQuestion =
    "Can you put a monitoring on following entities, and send me an alert if these entities with my wallet.";

  // Generate synthetic wallet addresses
  const monitoredWallets = [
    {
      address: "0x742d35Cc6634C0532925a3b8D8cF4932aDEaF3d0",
      entityName: "Uniswap V3 Pool",
      lastAccessed: "2 hours ago",
      amount: "50.5 ETH",
      network: "Ethereum",
    },
    {
      address: "0x8B73cF23468C1CbE0b90B0B3d7D47F7eF3842c1A",
      entityName: "Base Bridge",
      lastAccessed: "5 hours ago",
      amount: "125.3 ETH",
      network: "Base",
    },
    {
      address: "0x1f98431c8ad98523631ae4a59f267346ea31f984",
      entityName: "Compound Protocol",
      lastAccessed: "1 day ago",
      amount: "25.8 ETH",
      network: "Ethereum",
    },
    {
      address: "0x534F93D0aFE4e2c2EbC00A77D3E2F85E6C6E5a4D",
      entityName: "Aave Lending Pool",
      lastAccessed: "3 days ago",
      amount: "75.2 ETH",
      network: "Base",
    },
  ];

  const myWallet = "0x7e0aedc93d9f898be835a44bfca3842e52416b82";

  useEffect(() => {
    // Wait for Sanctioned Entities to complete (40s start + 7s categories + 2s delay)
    const timer = setTimeout(() => {
      setShowQuestion(true);
    }, 49000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showQuestion && !isTyping) {
      setIsTyping(true);
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= fullQuestion.length) {
          setQuestionText(fullQuestion.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          // Show response after typing is complete
          setTimeout(() => {
            setShowResponse(true);
          }, 2000);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [showQuestion, fullQuestion]);

  if (!showQuestion) return null;

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider', p: { xs: 1.5, sm: 2 }, mb: 2 }} style={{ minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 32, height: 32, bgcolor: (theme) => alpha(theme.palette.success.main, 0.1), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet className="w-5 h-5 text-green-600" />
          </Box>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            Entity Monitoring
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Question */}
        <Box sx={{ bgcolor: (theme) => alpha(theme.palette.success.main, 0.05), borderRadius: 2, p: 2, borderLeft: 4, borderColor: 'success.light' }}>
          <Typography sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
            {questionText}
            {isTyping && <span className="animate-pulse">|</span>}
          </Typography>
        </Box>

        {/* Response */}
        {showResponse && (
          <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2, borderLeft: 4, borderColor: 'divider' }} className="animate-fade-in">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Box sx={{ width: 32, height: 32, bgcolor: 'grey.100', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>A</Typography>
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 500, mb: 2, wordBreak: 'break-word' }}>
                Monitoring enabled for wallet:{" "}
                <Typography component="span" sx={{ fontFamily: 'monospace', color: 'success.dark' }}>{myWallet}</Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Alert notifications will be sent when interactions occur with
                monitored entities.
              </Typography>

              {/* Monitoring Table */}
              <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider', p: { xs: 1, sm: 2 } }}>
                <Typography variant="h6" component="h4" sx={{ fontWeight: 600, mb: 2 }}>
                  Monitored Entities
                </Typography>
                <TableContainer>
                  <Table size="small" aria-label="monitored entities table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Entity Name</TableCell>
                        <TableCell>Last Accessed</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Network</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monitoredWallets.map((wallet, index) => (
                        <TableRow
                          key={index}
                          sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>
                            {wallet.entityName}
                          </TableCell>
                          <TableCell>
                            {wallet.lastAccessed}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {wallet.amount}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={wallet.network}
                              size="small"
                              sx={{
                                bgcolor: (theme) => wallet.network === "Ethereum" ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                                color: wallet.network === "Ethereum" ? 'primary.dark' : 'warning.dark',
                                height: 22,
                                fontSize: '0.7rem'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function QueryBox( fullQuestion: string ) {
  const navigate = useNavigate();
  const [showQuestion, setShowQuestion] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // const fullQuestion =
  //   "Can you put a monitoring on following entities, and send me an alert if these entities with my wallet.";

  // Generate synthetic wallet addresses

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowQuestion(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showQuestion && !isTyping) {
      setIsTyping(true);
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= fullQuestion.length) {
          setQuestionText(fullQuestion.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [showQuestion, fullQuestion]);

  if (!showQuestion) return null;

  const handleClick = (fullQuestion: string) => () => {
    const queryEncoded = encodeURIComponent(fullQuestion);
    navigate(`/chat/new?user_query=${queryEncoded}`);
  }

  return (
    <Box sx={{ bgcolor: 'white', borderRadius: 2, p: 2, borderLeft: 4, borderColor: 'divider', cursor: 'pointer' }} onClick={handleClick(fullQuestion)}>
      <Typography sx={{ fontWeight: 500, wordBreak: 'break-word', fontSize: 13 }}>
        {questionText}
        {isTyping && <span className="animate-pulse">|</span>}
      </Typography>
    </Box>
  );
}

export default function HomePage() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, mt: 10 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 0.5, animation: `${fadeIn} 1s ease-out` }}>
          How can we help you?
        </Typography>
        {/* <Typography variant="body2" color="text.secondary">
          Converse. Discover. Act.
        </Typography> */}
      </Box>

      {/* KPI Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
        gap: { xs: 2, md: 3 },
        mb: { xs: 2, md: 3 },
        alignItems: 'stretch' // Ensures all items in a row have the same height, complementing the equal widths
      }}>
        {/* <EthereumTransactionQA />
        <BaseRiskAlertsQA />
        <WalletAnalysisQA />
        <ContractAnalysisQA />
        <SanctionedEntitiesQA />
        <WalletMonitoringQA /> */}
        {frequentSearches.map((query) => QueryBox(query))}
      </Box>
    </Box>
  );
}
