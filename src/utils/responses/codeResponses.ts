export const getRandomCodeExample = () => {
  const examples = [
    {
      language: 'javascript',
      summary: "Here's a JavaScript function that generates a random color:",
      code: `function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}`
    },
    {
      language: 'python',
      summary: "Here's a Python function that checks if a number is prime:",
      code: `def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True`
    }
  ];

  return examples[Math.floor(Math.random() * examples.length)];
};