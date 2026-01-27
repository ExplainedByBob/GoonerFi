"use client";

type SimpleChartProps = {
  data: number[];
  isPositive: boolean;
};

export function SimpleChart({ data, isPositive }: SimpleChartProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  // Blue color scheme - brighter blue for positive, lighter blue for negative
  const color = isPositive ? "#3b82f6" : "#60a5fa";

  return (
    <svg viewBox="0 0 100 100" className="h-16 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${isPositive ? "up" : "down"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#gradient-${isPositive ? "up" : "down"})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// Generate simple price history
export function generatePriceHistory(currentPrice: number, change: number): number[] {
  const data: number[] = [];
  let price = currentPrice / (1 + change / 100);
  
  for (let i = 0; i < 24; i++) {
    const step = (change / 100) / 24;
    const noise = (Math.random() - 0.5) * 0.02 * currentPrice;
    price = price * (1 + step) + noise;
    data.push(price);
  }
  
  return data;
}
