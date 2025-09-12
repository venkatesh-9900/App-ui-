export const generateRandomTableData = () => {
  const products = ['Laptop', 'Smartphone', 'Tablet', 'Smartwatch', 'Headphones'];
  return products.map(product => ({
    product,
    sales: Math.floor(Math.random() * 1000),
    revenue: Math.floor(Math.random() * 10000),
    growth: `${(Math.random() * 100 - 50).toFixed(1)}%`
  }));
};