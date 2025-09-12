export const generateRandomChartData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const chartTypes: Array<'line' | 'bar' | 'pie'> = ['line', 'bar', 'pie'];
  const randomType = chartTypes[Math.floor(Math.random() * chartTypes.length)];
  
  return {
    type: randomType,
    data: months.map(month => ({
      name: month,
      value: Math.floor(Math.random() * 1000),
      average: Math.floor(Math.random() * 800),
    }))
  };
};