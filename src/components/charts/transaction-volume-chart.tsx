import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";

const mockData = [
  { name: "Jan", volume: 120000 },
  { name: "Feb", volume: 135000 },
  { name: "Mar", volume: 128000 },
  { name: "Apr", volume: 145000 },
  { name: "May", volume: 162000 },
  { name: "Jun", volume: 158000 },
  { name: "Jul", volume: 175000 },
];

export default function TransactionVolumeChart() {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Transaction Volume Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000)}K`}
            />
            <Line 
              type="monotone" 
              dataKey="volume" 
              stroke="hsl(var(--argus-blue))"
              strokeWidth={2}
              fill="hsl(var(--argus-blue) / 0.1)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
