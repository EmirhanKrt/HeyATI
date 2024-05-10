const colors = [
  "#D17B69",
  "#708D81",
  "#2B635E",
  "#279AF1",
  "#8685EF",
  "#835B00",
  "#004FB6",
];

const hashString: (str: string) => number = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash * 31) ^ char;
    hash = hash >>> 0;
  }
  return hash;
};

export const selectColor: (input: string) => string = (input) => {
  const hash = hashString(input);
  const index = hash % colors.length;
  return colors[index];
};
