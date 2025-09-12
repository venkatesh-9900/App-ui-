import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const suggestedQuestions = [
  {
    title: "Analyze wallet risk score",
    description: "Get comprehensive risk assessment"
  },
  {
    title: "Track transaction patterns",
    description: "Identify suspicious activities"
  },
  {
    title: "Network relationship mapping",
    description: "Visualize wallet connections"
  },
  {
    title: "Compliance screening",
    description: "Check against OFAC sanctions"
  },
  {
    title: "Investigate the transactions from a file, and analyze for its anomalous behavior",
    description: "Upload and analyze transaction data"
  },
  {
    title: "Show me interconnected wallets for address 0x742d35Cc6Cc5e8a",
    description: "Map wallet network relationships"
  },
  {
    title: "Anomalous Transaction trends sample",
    description: "Analyze anomalous transaction patterns over time"
  }
];

// Mock transaction data for "track transaction patterns" response
const mockTransactionData = [
  { date: '2024-01-01', value: 1250, count: 3, type: 'Normal' },
  { date: '2024-01-02', value: 890, count: 2, type: 'Normal' },
  { date: '2024-01-03', value: 2340, count: 5, type: 'Normal' },
  { date: '2024-01-04', value: 5670, count: 1, type: 'High Value' },
  { date: '2024-01-05', value: 1120, count: 4, type: 'Normal' },
  { date: '2024-01-06', value: 890, count: 2, type: 'Normal' },
  { date: '2024-01-07', value: 15000, count: 1, type: 'Suspicious' },
  { date: '2024-01-08', value: 780, count: 3, type: 'Normal' },
  { date: '2024-01-09', value: 1450, count: 2, type: 'Normal' },
  { date: '2024-01-10', value: 12500, count: 1, type: 'High Value' },
  { date: '2024-01-11', value: 650, count: 4, type: 'Normal' },
  { date: '2024-01-12', value: 980, count: 3, type: 'Normal' },
  { date: '2024-01-13', value: 2100, count: 5, type: 'Normal' },
  { date: '2024-01-14', value: 18500, count: 1, type: 'Suspicious' },
  { date: '2024-01-15', value: 1340, count: 2, type: 'Normal' },
  { date: '2024-01-16', value: 750, count: 3, type: 'Normal' },
  { date: '2024-01-17', value: 1890, count: 4, type: 'Normal' },
  { date: '2024-01-18', value: 1050, count: 2, type: 'Normal' },
  { date: '2024-01-19', value: 22000, count: 1, type: 'Suspicious' },
  { date: '2024-01-20', value: 1200, count: 3, type: 'Normal' },
];

// Mock anomalous transaction trends data
const mockAnomalousData = [
  { date: '2024-01-01', normalTx: 1250, anomalousTx: 0, riskScore: 0.1, frequency: 3 },
  { date: '2024-01-02', normalTx: 890, anomalousTx: 0, riskScore: 0.05, frequency: 2 },
  { date: '2024-01-03', normalTx: 2340, anomalousTx: 0, riskScore: 0.15, frequency: 5 },
  { date: '2024-01-04', normalTx: 1200, anomalousTx: 8500, riskScore: 0.75, frequency: 1 },
  { date: '2024-01-05', normalTx: 1120, anomalousTx: 0, riskScore: 0.08, frequency: 4 },
  { date: '2024-01-06', normalTx: 890, anomalousTx: 0, riskScore: 0.04, frequency: 2 },
  { date: '2024-01-07', normalTx: 780, anomalousTx: 15000, riskScore: 0.95, frequency: 1 },
  { date: '2024-01-08', normalTx: 1450, anomalousTx: 0, riskScore: 0.12, frequency: 3 },
  { date: '2024-01-09', normalTx: 2100, anomalousTx: 0, riskScore: 0.18, frequency: 2 },
  { date: '2024-01-10', normalTx: 980, anomalousTx: 12500, riskScore: 0.88, frequency: 1 },
  { date: '2024-01-11', normalTx: 650, anomalousTx: 0, riskScore: 0.03, frequency: 4 },
  { date: '2024-01-12', normalTx: 1890, anomalousTx: 0, riskScore: 0.16, frequency: 3 },
  { date: '2024-01-13', normalTx: 1050, anomalousTx: 0, riskScore: 0.07, frequency: 5 },
  { date: '2024-01-14', normalTx: 750, anomalousTx: 18500, riskScore: 0.92, frequency: 1 },
  { date: '2024-01-15', normalTx: 1340, anomalousTx: 0, riskScore: 0.11, frequency: 2 },
  { date: '2024-01-16', normalTx: 2200, anomalousTx: 0, riskScore: 0.19, frequency: 3 },
  { date: '2024-01-17', normalTx: 1560, anomalousTx: 0, riskScore: 0.13, frequency: 4 },
  { date: '2024-01-18', normalTx: 820, anomalousTx: 0, riskScore: 0.06, frequency: 2 },
  { date: '2024-01-19', normalTx: 1100, anomalousTx: 22000, riskScore: 0.98, frequency: 1 },
  { date: '2024-01-20', normalTx: 1200, anomalousTx: 0, riskScore: 0.09, frequency: 3 },
];

export default function ChatInterface() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [responseType, setResponseType] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    
    // Check if the message is about tracking transaction patterns or anomalous trends
    const isTrackingPatterns = message.toLowerCase().includes("track transaction patterns");
    const isAnomalousAnalysis = message.toLowerCase().includes("anomalous transaction trends sample");
    
    setTimeout(() => {
      setIsLoading(false);
      if (isTrackingPatterns) {
        setResponseType("transaction-patterns");
        setShowResponse(true);
      } else if (isAnomalousAnalysis) {
        setResponseType("anomalous-trends");
        setShowResponse(true);
      }
      setMessage("");
    }, 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  const TransactionPatternsResponse = () => (
    <Card className="mt-6 bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg text-blue-900">Transaction Pattern Analysis Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold text-slate-800 mb-3">Transaction Value Over Time</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTransactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, 'Transaction Value']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const color = payload.type === 'Suspicious' ? '#dc2626' : 
                                 payload.type === 'High Value' ? '#f59e0b' : '#2563eb';
                    return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 mb-3">Transaction Count by Day</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTransactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => [`${value}`, 'Transactions']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <h5 className="font-semibold text-red-800 mb-2">Suspicious Transactions</h5>
              <p className="text-2xl font-bold text-red-600">
                {mockTransactionData.filter(d => d.type === 'Suspicious').length}
              </p>
              <p className="text-sm text-red-700">
                Total Value: ${mockTransactionData.filter(d => d.type === 'Suspicious').reduce((sum, d) => sum + d.value, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <h5 className="font-semibold text-yellow-800 mb-2">High Value Transactions</h5>
              <p className="text-2xl font-bold text-yellow-600">
                {mockTransactionData.filter(d => d.type === 'High Value').length}
              </p>
              <p className="text-sm text-yellow-700">
                Total Value: ${mockTransactionData.filter(d => d.type === 'High Value').reduce((sum, d) => sum + d.value, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <h5 className="font-semibold text-green-800 mb-2">Normal Transactions</h5>
              <p className="text-2xl font-bold text-green-600">
                {mockTransactionData.filter(d => d.type === 'Normal').length}
              </p>
              <p className="text-sm text-green-700">
                Total Value: ${mockTransactionData.filter(d => d.type === 'Normal').reduce((sum, d) => sum + d.value, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg">
          <h5 className="font-semibold text-slate-800 mb-2">Pattern Analysis Summary</h5>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• <strong>Anomalous spikes detected:</strong> 3 transactions with values above $15,000</li>
            <li>• <strong>Pattern irregularity:</strong> Suspicious transactions occur on Jan 7, 14, and 19</li>
            <li>• <strong>Risk assessment:</strong> High - Pattern suggests potential money laundering activity</li>
            <li>• <strong>Recommendation:</strong> Further investigation required for flagged transactions</li>
          </ul>
        </div>

        <Button 
          onClick={() => setShowResponse(false)}
          variant="outline"
          className="mt-4"
        >
          Clear Results
        </Button>
      </CardContent>
    </Card>
  );

  const AnomalousTransactionTrendsResponse = () => (
    <Card className="mt-6 bg-red-50 border-red-200">
      <CardHeader>
        <CardTitle className="text-lg text-red-900">Anomalous Transaction Trends Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold text-slate-800 mb-3">Normal vs Anomalous Transaction Values</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockAnomalousData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    const label = name === 'normalTx' ? 'Normal Transactions' : 'Anomalous Transactions';
                    return [`$${value.toLocaleString()}`, label];
                  }}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="normalTx" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="normalTx"
                />
                <Line 
                  type="monotone" 
                  dataKey="anomalousTx" 
                  stroke="#dc2626" 
                  strokeWidth={3}
                  name="anomalousTx"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 mb-3">Risk Score Trends</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockAnomalousData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 1]}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <Tooltip 
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Risk Score']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Bar 
                  dataKey="riskScore" 
                  fill="#dc2626"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <h5 className="font-semibold text-red-800 mb-2">Critical Risk Days</h5>
              <p className="text-2xl font-bold text-red-600">
                {mockAnomalousData.filter(d => d.riskScore > 0.9).length}
              </p>
              <p className="text-sm text-red-700">Risk Score greater than 90%</p>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <h5 className="font-semibold text-orange-800 mb-2">High Risk Days</h5>
              <p className="text-2xl font-bold text-orange-600">
                {mockAnomalousData.filter(d => d.riskScore > 0.7 && d.riskScore <= 0.9).length}
              </p>
              <p className="text-sm text-orange-700">Risk Score 70-90%</p>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <h5 className="font-semibold text-yellow-800 mb-2">Medium Risk Days</h5>
              <p className="text-2xl font-bold text-yellow-600">
                {mockAnomalousData.filter(d => d.riskScore > 0.3 && d.riskScore <= 0.7).length}
              </p>
              <p className="text-sm text-yellow-700">Risk Score 30-70%</p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <h5 className="font-semibold text-green-800 mb-2">Low Risk Days</h5>
              <p className="text-2xl font-bold text-green-600">
                {mockAnomalousData.filter(d => d.riskScore <= 0.3).length}
              </p>
              <p className="text-sm text-green-700">Risk Score less than 30%</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg">
          <h5 className="font-semibold text-slate-800 mb-2">Anomaly Detection Summary</h5>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• <strong>Peak anomaly detected:</strong> January 19th with $22,000 transaction (98% risk score)</li>
            <li>• <strong>Frequency pattern:</strong> Anomalous transactions appear every 3-4 days with increasing severity</li>
            <li>• <strong>Trend analysis:</strong> Escalating pattern suggests coordinated suspicious activity</li>
            <li>• <strong>Total anomalous value:</strong> ${mockAnomalousData.reduce((sum, d) => sum + d.anomalousTx, 0).toLocaleString()}</li>
            <li>• <strong>Average risk score:</strong> {((mockAnomalousData.reduce((sum, d) => sum + d.riskScore, 0) / mockAnomalousData.length) * 100).toFixed(1)}%</li>
          </ul>
        </div>

        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h5 className="font-semibold text-red-800 mb-2">⚠️ Critical Alert</h5>
          <p className="text-sm text-red-700">
            The anomalous transaction pattern shows clear escalation over time, with the highest risk transactions occurring on 
            January 7th ($15,000), 14th ($18,500), and 19th ($22,000). This consistent increase suggests potential organized 
            money laundering activity requiring immediate investigation.
          </p>
        </div>

        <Button 
          onClick={() => setShowResponse(false)}
          variant="outline"
          className="mt-4"
        >
          Clear Results
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-2xl font-semibold text-slate-900">Start Your Analysis</CardTitle>
          <p className="text-slate-600">Ask questions about blockchain transactions, wallet activities, or network patterns</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex space-x-4 mb-6">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter wallet address, transaction hash, or ask a question..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !message.trim()}
              className="bg-[var(--argus-blue)] hover:bg-blue-700"
            >
              <Send size={16} className="mr-2" />
              {isLoading ? "Analyzing..." : "Start Analysis"}
            </Button>
          </form>
          
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Trending Questions:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(question.title)}
                  className="chat-suggestion"
                >
                  <div className="font-medium text-slate-900 text-sm">{question.title}</div>
                  <div className="text-xs text-slate-600 mt-1">{question.description}</div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showResponse && responseType === "transaction-patterns" && <TransactionPatternsResponse />}
      {showResponse && responseType === "anomalous-trends" && <AnomalousTransactionTrendsResponse />}
    </div>
  );
}
