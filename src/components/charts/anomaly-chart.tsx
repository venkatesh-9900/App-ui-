import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Week 1", high: 45, medium: 120, low: 85 },
  { name: "Week 2", high: 52, medium: 145, low: 92 },
  { name: "Week 3", high: 38, medium: 98, low: 78 },
  { name: "Week 4", high: 61, medium: 132, low: 89 },
];

export default function AnomalyChart() {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Anomalous Transaction Trends</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
            />
            <Legend />
            <Bar dataKey="high" stackId="a" fill="#dc2626" name="High Risk" />
            <Bar dataKey="medium" stackId="a" fill="#ca8a04" name="Medium Risk" />
            <Bar dataKey="low" stackId="a" fill="#059669" name="Low Risk" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
