"use client";

import { useEffect, useRef, useState } from "react";

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type CandlestickChartProps = {
  data: Candle[];
  width: number;
  height: number;
  showMA?: boolean;
  showEMA?: boolean;
  showBB?: boolean;
};

function calculateSMA(data: Candle[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((sum, c) => sum + c.close, 0) / period;
  });
}

function calculateEMA(data: Candle[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const ema: (number | null)[] = [];
  let prevEma: number | null = null;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) ema.push(null);
    else if (i === period - 1) {
      const sma = data.slice(0, period).reduce((sum, c) => sum + c.close, 0) / period;
      ema.push(sma);
      prevEma = sma;
    } else {
      const newEma: number = data[i].close * k + (prevEma as number) * (1 - k);
      ema.push(newEma);
      prevEma = newEma;
    }
  }
  return ema;
}

function calculateBB(data: Candle[], period: number = 20, stdDev: number = 2) {
  const sma = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { upper.push(null); lower.push(null); }
    else {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i]!;
      const variance = slice.reduce((sum, c) => sum + Math.pow(c.close - mean, 2), 0) / period;
      const std = Math.sqrt(variance);
      upper.push(mean + stdDev * std);
      lower.push(mean - stdDev * std);
    }
  }
  return { upper, middle: sma, lower };
}

export function CandlestickChart({ data, width, height, showMA = false, showEMA = false, showBB = false }: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollPosition, setScrollPosition] = useState(100);
  const visibleCandles = 80;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0 || width <= 0 || height <= 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Visible data range
    const totalCandles = data.length;
    const startIndex = Math.floor((scrollPosition / 100) * Math.max(0, totalCandles - visibleCandles));
    const endIndex = Math.min(startIndex + visibleCandles, totalCandles);
    const visibleData = data.slice(startIndex, endIndex);

    if (visibleData.length === 0) {
      ctx.fillStyle = "#0a1628";
      ctx.fillRect(0, 0, width, height);
      return;
    }

    // Background
    ctx.fillStyle = "#0a1628";
    ctx.fillRect(0, 0, width, height);

    // Layout
    const priceAxisWidth = 65;
    const scrollbarHeight = 28;
    const chartWidth = width - priceAxisWidth;
    const availableHeight = height - scrollbarHeight;
    const chartHeight = availableHeight * 0.8;
    const volumeHeight = availableHeight * 0.15;
    const chartTop = 8;
    const volumeTop = chartTop + chartHeight + 8;

    // Price range
    const prices = visibleData.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const pricePadding = priceRange * 0.1;

    // Candle sizing
    const candleWidth = Math.max(6, (chartWidth - 20) / visibleData.length * 0.75);
    const candleGap = (chartWidth - 20) / visibleData.length * 0.25;
    const totalCandleWidth = candleWidth + candleGap;

    // Grid
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 8; i++) {
      const y = chartTop + (chartHeight / 8) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();
      
      const price = maxPrice + pricePadding - ((priceRange + pricePadding * 2) / 8) * i;
      ctx.fillStyle = "#ffffff";
      ctx.font = "11px monospace";
      ctx.textAlign = "left";
      ctx.fillText(price.toFixed(2), chartWidth + 8, y + 4);
    }

    // Vertical grid
    for (let i = 0; i <= 8; i++) {
      const x = (chartWidth / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, chartTop);
      ctx.lineTo(x, chartTop + chartHeight);
      ctx.stroke();
    }

    const normalizeY = (price: number) => {
      return chartTop + chartHeight - ((price - minPrice + pricePadding) / (priceRange + pricePadding * 2)) * chartHeight;
    };

    // BB
    if (showBB && visibleData.length > 20) {
      const bb = calculateBB(visibleData);
      ctx.strokeStyle = "rgba(168, 85, 247, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      bb.upper.forEach((val, i) => {
        if (val === null) return;
        const x = 10 + i * totalCandleWidth + candleWidth / 2;
        if (i === 0 || bb.upper[i - 1] === null) ctx.moveTo(x, normalizeY(val));
        else ctx.lineTo(x, normalizeY(val));
      });
      ctx.stroke();
      ctx.beginPath();
      bb.lower.forEach((val, i) => {
        if (val === null) return;
        const x = 10 + i * totalCandleWidth + candleWidth / 2;
        if (i === 0 || bb.lower[i - 1] === null) ctx.moveTo(x, normalizeY(val));
        else ctx.lineTo(x, normalizeY(val));
      });
      ctx.stroke();
    }

    // MA
    if (showMA && visibleData.length > 20) {
      const ma = calculateSMA(visibleData, 20);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ma.forEach((val, i) => {
        if (val === null) return;
        const x = 10 + i * totalCandleWidth + candleWidth / 2;
        if (i === 0 || ma[i - 1] === null) ctx.moveTo(x, normalizeY(val));
        else ctx.lineTo(x, normalizeY(val));
      });
      ctx.stroke();
    }

    // EMA
    if (showEMA && visibleData.length > 9) {
      const ema = calculateEMA(visibleData, 9);
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ema.forEach((val, i) => {
        if (val === null) return;
        const x = 10 + i * totalCandleWidth + candleWidth / 2;
        if (i === 0 || ema[i - 1] === null) ctx.moveTo(x, normalizeY(val));
        else ctx.lineTo(x, normalizeY(val));
      });
      ctx.stroke();
    }

    // Candles
    const maxVolume = Math.max(...visibleData.map(c => c.volume));

    visibleData.forEach((candle, i) => {
      const x = 10 + i * totalCandleWidth;
      const isUp = candle.close >= candle.open;
      const color = isUp ? "#22c55e" : "#ef4444";

      const openY = normalizeY(candle.open);
      const closeY = normalizeY(candle.close);
      const highY = normalizeY(candle.high);
      const lowY = normalizeY(candle.low);

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(2, Math.abs(closeY - openY));
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);

      // Volume
      const volHeight = (candle.volume / maxVolume) * volumeHeight;
      ctx.fillStyle = isUp ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)";
      ctx.fillRect(x, volumeTop + volumeHeight - volHeight, candleWidth, volHeight);
    });

    // Current price line
    const lastCandle = visibleData[visibleData.length - 1];
    const lastY = normalizeY(lastCandle.close);
    ctx.strokeStyle = lastCandle.close >= lastCandle.open ? "#22c55e" : "#ef4444";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, lastY);
    ctx.lineTo(chartWidth, lastY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price label
    ctx.fillStyle = lastCandle.close >= lastCandle.open ? "#22c55e" : "#ef4444";
    ctx.fillRect(chartWidth, lastY - 10, priceAxisWidth, 20);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(lastCandle.close.toFixed(2), chartWidth + priceAxisWidth / 2, lastY + 4);

    // Scrollbar
    const scrollY = height - scrollbarHeight;
    ctx.fillStyle = "#0f2140";
    ctx.fillRect(0, scrollY, width, scrollbarHeight);
    
    const trackPadding = 15;
    const trackWidth = width - trackPadding * 2;
    const trackY = scrollY + 10;
    const trackHeight = 8;
    ctx.fillStyle = "#1e3a5f";
    ctx.fillRect(trackPadding, trackY, trackWidth, trackHeight);

    const thumbWidth = Math.max(50, (visibleCandles / totalCandles) * trackWidth);
    const thumbX = trackPadding + (scrollPosition / 100) * (trackWidth - thumbWidth);
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(thumbX, trackY, thumbWidth, trackHeight);

    ctx.fillStyle = "#ffffff80";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("◀ Drag to scroll history", trackPadding, scrollY + 24);
    ctx.textAlign = "right";
    ctx.fillText(`Showing ${startIndex + 1}-${endIndex} of ${totalCandles}`, width - trackPadding, scrollY + 24);

  }, [data, width, height, showMA, showEMA, showBB, scrollPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const scrollY = height - 28;
    const y = e.clientY - rect.top;
    
    if (y >= scrollY) {
      const handleDrag = (moveE: MouseEvent) => {
        const x = moveE.clientX - rect.left;
        const trackPadding = 15;
        const trackWidth = width - trackPadding * 2;
        const thumbWidth = Math.max(50, (visibleCandles / data.length) * trackWidth);
        const pos = Math.max(0, Math.min(100, ((x - trackPadding - thumbWidth / 2) / (trackWidth - thumbWidth)) * 100));
        setScrollPosition(pos);
      };
      
      const handleUp = () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleUp);
      };
      
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleUp);
      handleDrag(e.nativeEvent as MouseEvent);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScrollPosition(v => Math.max(0, Math.min(100, v + (e.deltaY > 0 ? 3 : -3))));
  };

  if (width <= 0 || height <= 0) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: "block" }}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    />
  );
}

export function generateCandlestickData(basePrice: number, change24h: number, timeframe: string = "15m"): Candle[] {
  const intervals: Record<string, { count: number; ms: number }> = {
    "1m": { count: 250, ms: 60 * 1000 },
    "5m": { count: 200, ms: 5 * 60 * 1000 },
    "15m": { count: 180, ms: 15 * 60 * 1000 },
    "1H": { count: 150, ms: 60 * 60 * 1000 },
    "4H": { count: 120, ms: 4 * 60 * 60 * 1000 },
    "1D": { count: 90, ms: 24 * 60 * 60 * 1000 },
    "1W": { count: 52, ms: 7 * 24 * 60 * 60 * 1000 },
  };

  const { count, ms } = intervals[timeframe] || intervals["15m"];
  const candles: Candle[] = [];
  let price = basePrice * 0.7;
  const now = Date.now();

  for (let i = count; i >= 0; i--) {
    const time = now - i * ms;
    const volatility = 0.015;
    const trend = (change24h / 100 / count) * 2;
    
    const open = price;
    const changePercent = trend + (Math.random() - 0.5) * volatility;
    const close = open * (1 + changePercent);
    
    const wickSize = Math.abs(close - open) * (0.3 + Math.random());
    const high = Math.max(open, close) + wickSize * Math.random();
    const low = Math.min(open, close) - wickSize * Math.random();
    const volume = 100000 + Math.random() * 500000;

    candles.push({ time, open, high, low, close, volume });
    price = close;
  }

  return candles;
}
