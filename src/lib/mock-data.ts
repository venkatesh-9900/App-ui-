export const mockTransactionVolume = [
  { name: "Jan", volume: 120000 },
  { name: "Feb", volume: 135000 },
  { name: "Mar", volume: 128000 },
  { name: "Apr", volume: 145000 },
  { name: "May", volume: 162000 },
  { name: "Jun", volume: 158000 },
  { name: "Jul", volume: 175000 },
];

export const mockAnomalyData = [
  { name: "Week 1", high: 45, medium: 120, low: 85 },
  { name: "Week 2", high: 52, medium: 145, low: 92 },
  { name: "Week 3", high: 38, medium: 98, low: 78 },
  { name: "Week 4", high: 61, medium: 132, low: 89 },
];

export const mockKpiData = {
  totalTransactions: {
    value: "2.4M",
    change: "+12.5% from last week",
    changeType: "positive" as const
  },
  riskAlerts: {
    value: "847", 
    change: "+3.2% from last week",
    changeType: "negative" as const
  },
  walletsScreened: {
    value: "156K",
    change: "+8.1% from last week", 
    changeType: "positive" as const
  },
  networksMonitored: {
    value: "12",
    change: "Active blockchains",
    changeType: "neutral" as const
  }
};

export const mockChatSuggestions = [
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
  }
];

export const mockThreatTypes = [
  {
    name: "OFAC Sanctioned",
    description: "Addresses on OFAC sanctions list",
    priority: "High Priority",
    enabled: true
  },
  {
    name: "Ransomware", 
    description: "Known ransomware-associated addresses",
    priority: "High Priority",
    enabled: true
  },
  {
    name: "Phishing",
    description: "Addresses linked to phishing campaigns", 
    priority: "Medium Priority",
    enabled: true
  },
  {
    name: "Nation State Threats",
    description: "State-sponsored criminal activities",
    priority: "High Priority", 
    enabled: false
  },
  {
    name: "Unknowns",
    description: "Unidentified suspicious patterns",
    priority: "Low Priority",
    enabled: false
  },
  {
    name: "Large Volume Transfers",
    description: "Unusually large transactions",
    priority: "Medium Priority",
    enabled: true
  }
];
