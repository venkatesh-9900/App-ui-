import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface TransactionAlert {
  id: number;
  walletAddress: string;
  riskScore: number;
  threatType: string;
  createdAt: string;
}

export default function AnomalousTransactions() {
  const { data: alerts, isLoading } = useQuery<TransactionAlert[]>({
    queryKey: ["/api/transaction-alerts"],
  });

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: "high-risk", color: "text-red-600", bg: "bg-red-50 border-red-200" };
    if (score >= 60) return { level: "medium-risk", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
    return { level: "low-risk", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" };
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (isLoading) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Anomalous Transactions</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Anomalous Transactions</h3>
      <div className="space-y-4">
        {alerts?.map((alert) => {
          const risk = getRiskLevel(alert.riskScore);
          return (
            <div key={alert.id} className={`anomaly-item ${risk.bg}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${risk.color.replace('text-', 'bg-')}`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{alert.walletAddress}</p>
                  <p className="text-xs text-slate-600">{alert.threatType}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${risk.color}`}>Risk: {alert.riskScore}%</p>
                <p className="text-xs text-slate-500">{formatTimeAgo(alert.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200">
        <Button variant="link" className="text-[var(--argus-blue)] p-0">
          View All Anomalies →
        </Button>
      </div>
    </div>
  );
}
