import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useCryptoData } from "../hooks/useCryptoData";

interface TradingPair {
  symbol: string; base: string; quote: string;
  price: number; change: number; changeAmt: number;
  high: number; low: number; vol: string; turnover: string;
  icon: string;
}
interface Candle { o: number; h: number; l: number; c: number; v: number; t: number; }
interface OrderBookEntry { price: number; amount: number; }

const PAIRS: TradingPair[] = [
  { symbol: "BTC/USDT",  base: "BTC",  quote: "USDT", price: 70896.4, change: -2.93, changeAmt: -2137.94, high: 71805.8,  low: 70604.07, vol: "13.98K", turnover: "1,007.3M", icon: "/crypto-logos/btc.svg"  },
  { symbol: "ETH/USDT",  base: "ETH",  quote: "USDT", price: 2184.6,  change: -3.29, changeAmt: -74.31,   high: 2219.04,  low: 2175,     vol: "325.7K", turnover: "732.15M",  icon: "/crypto-logos/eth.svg"  },
  { symbol: "BNB/USDT",  base: "BNB",  quote: "USDT", price: 596.3,   change: -1.20, changeAmt: -7.25,    high: 605.0,    low: 590.1,    vol: "45.2K",  turnover: "26.9M",    icon: "/crypto-logos/bnb.svg"  },
  { symbol: "NEO/USDT",  base: "NEO",  quote: "USDT", price: 12.45,   change: -0.80, changeAmt: -0.10,    high: 12.80,    low: 12.20,    vol: "1.2M",   turnover: "15.3M",    icon: "/crypto-logos/neo.svg"  },
  { symbol: "LTC/USDT",  base: "LTC",  quote: "USDT", price: 87.32,   change: -1.45, changeAmt: -1.28,    high: 89.50,    low: 86.10,    vol: "320K",   turnover: "28.0M",    icon: "/crypto-logos/ltc.svg"  },
  { symbol: "XRP/USDT",  base: "XRP",  quote: "USDT", price: 2.183,   change: -2.10, changeAmt: -0.047,   high: 2.230,    low: 2.165,    vol: "98.5M",  turnover: "215.0M",   icon: "/crypto-logos/xrp.svg"  },
  { symbol: "QTUM/USDT", base: "QTUM", quote: "USDT", price: 2.87,    change: -3.10, changeAmt: -0.092,   high: 2.99,     low: 2.81,     vol: "4.5M",   turnover: "13.1M",    icon: "/crypto-logos/qtum.svg" },
  { symbol: "IOTA/USDT", base: "IOTA", quote: "USDT", price: 0.178,   change: -1.90, changeAmt: -0.003,   high: 0.183,    low: 0.175,    vol: "22.3M",  turnover: "3.97M",    icon: "/crypto-logos/iota.svg" },
  { symbol: "XLM/USDT",  base: "XLM",  quote: "USDT", price: 0.093,   change: -2.60, changeAmt: -0.002,   high: 0.096,    low: 0.091,    vol: "55.0M",  turnover: "5.11M",    icon: ""                       },
  { symbol: "ONT/USDT",  base: "ONT",  quote: "USDT", price: 0.176,   change: -4.20, changeAmt: -0.008,   high: 0.185,    low: 0.173,    vol: "8.7M",   turnover: "1.53M",    icon: ""                       },
];

const LEVERAGE_TICKS = [1, 25, 50, 75, 100];
const INTERVALS = ["30s-20%", "1m-20%", "2m-20%", "5m-20%"];

function fmt(n: number, d = 2) { return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }); }

function fmtTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}
function fmtDateTime(ts: number): string {
  const d = new Date(ts);
  const yr = d.getFullYear();
  const mo = (d.getMonth() + 1).toString().padStart(2, "0");
  const dy = d.getDate().toString().padStart(2, "0");
  const h  = d.getHours().toString().padStart(2, "0");
  const mn = d.getMinutes().toString().padStart(2, "0");
  const sc = d.getSeconds().toString().padStart(2, "0");
  return `${yr}/${mo}/${dy} ${h}:${mn}:${sc}`;
}

// â”€â”€â”€ Enhanced Chart Renderer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function drawChart(
  canvas: HTMLCanvasElement,
  candles: Candle[],
  viewStart: number,
  viewEnd: number,
  mx: number | null,
  my: number | null,
  chartType: 'candle' | 'line' = 'candle'
): { ma5: number; ma10: number; ma30: number; ma60: number; volMa5: number; volMa10: number; volMa20: number; lastVol: number; hovCandle: Candle | null } {
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const vis = candles.slice(Math.max(0, viewStart), Math.min(candles.length, viewEnd));
  const n = vis.length;

  const PAD_RIGHT = 68;
  const PAD_TOP   = 12;
  const PAD_BTM   = 22;
  const VOL_H     = Math.floor(H * 0.18);
  const MAIN_H    = H - PAD_TOP - PAD_BTM - VOL_H - 6;

  const defaults = { ma5: 0, ma10: 0, ma30: 0, ma60: 0, volMa5: 0, volMa10: 0, volMa20: 0, lastVol: 0, hovCandle: null };

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0b0b10";
  ctx.fillRect(0, 0, W, H);

  if (n === 0) return defaults;

  const priceMin = Math.min(...vis.map(c => c.l)) * 0.9997;
  const priceMax = Math.max(...vis.map(c => c.h)) * 1.0003;
  const pRange   = priceMax - priceMin || 1;
  const toY      = (p: number) => PAD_TOP + MAIN_H - ((p - priceMin) / pRange) * MAIN_H;
  const chartW   = W - PAD_RIGHT;
  const step     = chartW / n;
  const cW       = Math.max(1, step * 0.65);
  const volMax   = Math.max(...vis.map(c => c.v)) || 1;
  const volY0    = PAD_TOP + MAIN_H + 6;

  // â”€â”€ Grid lines â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const gridRows = 6;
  ctx.strokeStyle = "rgba(255,255,255,0.045)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridRows; i++) {
    const y = PAD_TOP + (MAIN_H / gridRows) * i;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W - PAD_RIGHT, y); ctx.stroke();
  }
  const gridCols = 8;
  for (let i = 0; i <= gridCols; i++) {
    const x = (chartW / gridCols) * i;
    ctx.beginPath(); ctx.moveTo(x, PAD_TOP); ctx.lineTo(x, PAD_TOP + MAIN_H + VOL_H + 6); ctx.stroke();
  }

  // â”€â”€ Price scale (right) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  ctx.fillStyle = "rgba(130,130,150,0.85)";
  ctx.font = "10px 'Roboto Mono', monospace";
  ctx.textAlign = "left";
  for (let i = 0; i <= gridRows; i++) {
    const p = priceMin + (pRange / gridRows) * (gridRows - i);
    const y = PAD_TOP + (MAIN_H / gridRows) * i;
    ctx.fillText(fmt(p, 2), W - PAD_RIGHT + 4, y + 4);
  }

  // â”€â”€ Volume bars â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  vis.forEach((c, i) => {
    const x  = step * i + step / 2;
    const bH = Math.max(1, (c.v / volMax) * (VOL_H - 4));
    ctx.fillStyle = c.c >= c.o ? "rgba(14,203,129,0.55)" : "rgba(246,70,93,0.55)";
    ctx.fillRect(x - cW / 2, volY0 + VOL_H - bH, cW, bH);
  });

  // â”€â”€ MA on volume â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const computeMA = (arr: number[], period: number): (number | null)[] =>
    arr.map((_, i) => i < period - 1 ? null : arr.slice(i - period + 1, i + 1).reduce((s, v) => s + v, 0) / period);

  const vols = vis.map(c => c.v);
  const drawVolMA = (period: number, color: string) => {
    const ma = computeMA(vols, period);
    ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.beginPath();
    let started = false;
    ma.forEach((v, i) => {
      if (v === null) return;
      const x = step * i + step / 2;
      const y = volY0 + VOL_H - (v / volMax) * (VOL_H - 4);
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };
  drawVolMA(5, "#f5c518"); drawVolMA(10, "#5090d3"); drawVolMA(20, "#e84393");

  // â”€â”€ Candles or Line chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (chartType === 'line') {
    // Draw area/line chart using close prices
    const gradient = ctx.createLinearGradient(0, PAD_TOP, 0, PAD_TOP + MAIN_H);
    gradient.addColorStop(0, 'rgba(90,144,211,0.35)');
    gradient.addColorStop(1, 'rgba(90,144,211,0.02)');
    ctx.beginPath();
    vis.forEach((c, i) => {
      const x = step * i + step / 2;
      const y = toY(c.c);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    // Close path for fill
    const lastX = step * (n - 1) + step / 2;
    ctx.lineTo(lastX, PAD_TOP + MAIN_H);
    ctx.lineTo(step * 0 + step / 2, PAD_TOP + MAIN_H);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    // Draw the line on top
    ctx.beginPath();
    vis.forEach((c, i) => {
      const x = step * i + step / 2;
      const y = toY(c.c);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#5090d3';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  } else {
    // â”€â”€ Candles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    vis.forEach((c, i) => {
      const x = step * i + step / 2;
      const color = c.c >= c.o ? "#0ecb81" : "#f6465d";
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, toY(c.h)); ctx.lineTo(x, toY(c.l)); ctx.stroke();
      const bTop = Math.min(toY(c.o), toY(c.c));
      const bH   = Math.max(1, Math.abs(toY(c.o) - toY(c.c)));
      ctx.fillRect(x - cW / 2, bTop, cW, bH);
    });
  }

  // â”€â”€ MA lines on candles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const closes = vis.map(c => c.c);
  const priceMA = computeMA(closes, 5);
  const ma5val  = priceMA[n - 1] ?? 0;
  const ma10val = (computeMA(closes, 10))[n - 1] ?? 0;
  const ma30val = (computeMA(closes, 30))[n - 1] ?? 0;
  const ma60val = (computeMA(closes, 60))[n - 1] ?? 0;

  const drawPriceMA = (period: number, color: string) => {
    const ma = computeMA(closes, period);
    ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.beginPath();
    let started = false;
    ma.forEach((v, i) => {
      if (v === null) return;
      const x = step * i + step / 2;
      const y = toY(v);
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };
  drawPriceMA(5, "#f5c518"); drawPriceMA(10, "#f5a623"); drawPriceMA(30, "#5090d3"); drawPriceMA(60, "#e84393");

  // â”€â”€ Current price dashed line â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const last = vis[n - 1];
  const lastY = toY(last.c);
  const isUp  = last.c >= last.o;
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = isUp ? "#0ecb81" : "#f6465d";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, lastY); ctx.lineTo(W - PAD_RIGHT, lastY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle  = isUp ? "#0ecb81" : "#f6465d";
  ctx.fillRect(W - PAD_RIGHT, lastY - 9, PAD_RIGHT, 18);
  ctx.fillStyle  = "#fff";
  ctx.font       = "bold 10px 'Roboto Mono', monospace";
  ctx.textAlign  = "center";
  ctx.fillText(fmt(last.c, 2), W - PAD_RIGHT + PAD_RIGHT / 2, lastY + 4);

  // â”€â”€ Time axis labels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  ctx.textAlign  = "center";
  ctx.fillStyle  = "rgba(100,100,120,0.9)";
  ctx.font       = "9px 'Roboto Mono', monospace";
  const tStep    = Math.max(1, Math.floor(n / 8));
  for (let i = 0; i < n; i += tStep) {
    const x = step * i + step / 2;
    ctx.fillText(fmtTime(vis[i].t), x, H - 6);
  }

  // â”€â”€ Crosshair only (no tooltip â€” overlay handles OHLCV display) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (mx !== null && my !== null && mx >= 0 && mx < W - PAD_RIGHT && my >= PAD_TOP && my < PAD_TOP + MAIN_H) {
    ctx.strokeStyle = "rgba(180,180,210,0.35)";
    ctx.lineWidth   = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(mx, PAD_TOP); ctx.lineTo(mx, PAD_TOP + MAIN_H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, my); ctx.lineTo(W - PAD_RIGHT, my); ctx.stroke();
    ctx.setLineDash([]);

    const hPrice = priceMin + (1 - (my - PAD_TOP) / MAIN_H) * pRange;
    ctx.fillStyle   = "#1c1c2e";
    ctx.strokeStyle = "rgba(120,120,180,0.5)";
    ctx.lineWidth   = 1;
    ctx.fillRect(W - PAD_RIGHT, my - 9, PAD_RIGHT, 18);
    ctx.strokeRect(W - PAD_RIGHT, my - 9, PAD_RIGHT, 18);
    ctx.fillStyle  = "#ddd";
    ctx.font       = "10px 'Roboto Mono', monospace";
    ctx.textAlign  = "center";
    ctx.fillText(fmt(hPrice, 2), W - PAD_RIGHT + PAD_RIGHT / 2, my + 4);

    const ci = Math.min(n - 1, Math.max(0, Math.floor(mx / step)));
    const hc = vis[ci];
    const cx = step * ci + step / 2;

    const tlabel = fmtDateTime(hc.t);
    ctx.fillStyle   = "#1c1c2e";
    ctx.strokeStyle = "rgba(120,120,180,0.5)";
    const tlW = 128;
    ctx.fillRect(cx - tlW / 2, H - PAD_BTM + 1, tlW, 16);
    ctx.strokeRect(cx - tlW / 2, H - PAD_BTM + 1, tlW, 16);
    ctx.fillStyle  = "#ddd";
    ctx.font       = "9px 'Roboto Mono', monospace";
    ctx.textAlign  = "center";
    ctx.fillText(tlabel.slice(0, 16), cx, H - PAD_BTM + 12);
  }

  const vmArr = computeMA(vols, 5);
  const vm10  = computeMA(vols, 10);
  const vm20  = computeMA(vols, 20);

  let hovCandle: Candle | null = vis[n - 1] ?? null;
  if (mx !== null && my !== null && mx >= 0 && mx < W - PAD_RIGHT && my >= PAD_TOP && my < PAD_TOP + MAIN_H) {
    const ci = Math.min(n - 1, Math.max(0, Math.floor(mx / step)));
    hovCandle = vis[ci];
  }

  ctx.textAlign = "left";
  return {
    ma5: ma5val, ma10: ma10val, ma30: ma30val, ma60: ma60val,
    volMa5:  vmArr[n - 1] ?? 0,
    volMa10: vm10[n - 1]  ?? 0,
    volMa20: vm20[n - 1]  ?? 0,
    lastVol: last.v,
    hovCandle,
  };
}

// â”€â”€â”€ Toggle helper for settings modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SettingToggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between">
    <span style={{ color: '#ccc' }}>{label}</span>
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 36, height: 20, borderRadius: 10, cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
        background: value ? '#4a90e2' : '#333355',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: value ? 18 : 3, width: 14, height: 14, borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
      }} />
    </div>
  </div>
);

// â”€â”€â”€ Order Book Icon SVGs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Icon 1: Mixed â€” left top: crimson block, left bottom: green block; right: 3 gray bars
const IconMixed = ({ active }: { active: boolean }) => {
  const barColor = active ? '#b0b0c0' : '#606070';
  return (
    <svg width="26" height="20" viewBox="0 0 26 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0"  width="9" height="8.5" rx="0.8" fill="#8B1C2C"/>
      <rect x="0" y="11" width="9" height="9"   rx="0.8" fill="#1C6B38"/>
      <rect x="13" y="0"    width="13" height="4.5" rx="0.8" fill={barColor}/>
      <rect x="13" y="7.5"  width="13" height="4.5" rx="0.8" fill={barColor}/>
      <rect x="13" y="15"   width="13" height="5"   rx="0.8" fill={barColor}/>
    </svg>
  );
};

// Icon 2: Bids only â€” left: full-height dark green block; right: 3 gray bars
const IconBids = ({ active }: { active: boolean }) => {
  const barColor = active ? '#b0b0c0' : '#606070';
  return (
    <svg width="26" height="20" viewBox="0 0 26 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="9" height="20" rx="0.8" fill="#1C6B38"/>
      <rect x="13" y="0"    width="13" height="4.5" rx="0.8" fill={barColor}/>
      <rect x="13" y="7.5"  width="13" height="4.5" rx="0.8" fill={barColor}/>
      <rect x="13" y="15"   width="13" height="5"   rx="0.8" fill={barColor}/>
    </svg>
  );
};

// Icon 3: Asks only â€” left: full-height crimson block; right: 3 gray bars
const IconAsks = ({ active }: { active: boolean }) => {
  const barColor = active ? '#b0b0c0' : '#606070';
  return (
    <svg width="26" height="20" viewBox="0 0 26 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="9" height="20" rx="0.8" fill="#8B1C2C"/>
      <rect x="13" y="0"    width="13" height="4.5" rx="0.8" fill={barColor}/>
      <rect x="13" y="7.5"  width="13" height="4.5" rx="0.8" fill={barColor}/>
      <rect x="13" y="15"   width="13" height="5"   rx="0.8" fill={barColor}/>
    </svg>
  );
};

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SpotTrading = () => {
  const [pair, setPair]             = useState<TradingPair>(PAIRS[0]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ]       = useState("");
  const [timeframe, setTimeframe]   = useState("1m");
  const [showLeftBar, setShowLeftBar] = useState(true);
  const [rightTab] = useState<"perpetual" | "options">("perpetual");
  void rightTab;
  const [orderType] = useState<"market" | "limit">("limit");
  const [leverage] = useState(10);
  const [optionSide] = useState<"long" | "short">("long");
  const [interval] = useState(INTERVALS[0]);
  const [amount] = useState("");
  const [price] = useState("");
  void orderType; void leverage; void optionSide; void interval; void amount; void price;
  const [bottomTab, setBottomTab]   = useState<"current" | "history" | "holdings">("current");
  const [hideOtherOrder, setHideOtherOrder] = useState(false);
  const [orderBook, setOrderBook]   = useState<{ asks: OrderBookEntry[]; bids: OrderBookEntry[] }>({ asks: [], bids: [] });
  const [candles, setCandles]       = useState<Candle[]>([]);
  const [chartType, setChartType]   = useState<'candle' | 'line'>('candle');
  const chartTypeRef                = useRef<'candle' | 'line'>('candle');
  const [livePrice, setLivePrice]         = useState(PAIRS[0].price);
  const [liveHigh, setLiveHigh]           = useState(PAIRS[0].high);
  const [liveLow, setLiveLow]             = useState(PAIRS[0].low);
  const [liveChange, setLiveChange]       = useState(PAIRS[0].change);
  const [liveChangeAmt, setLiveChangeAmt] = useState(PAIRS[0].changeAmt);
  const [tpsl] = useState(false); void tpsl;

  // â”€â”€ Spot panel state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [spotSide, setSpotSide]           = useState<'buy' | 'sell'>('buy');
  const [spotOrderType, setSpotOrderType] = useState<'market' | 'limit'>('market');
  const [spotLimitPrice, setSpotLimitPrice] = useState('');
  const [spotAmount, setSpotAmount]       = useState('');
  const [spotVolume, setSpotVolume]       = useState('');
  const [spotSelectedPct, setSpotSelectedPct] = useState<number | null>(null);

  const [indicators, setIndicators] = useState<{ ma5: number; ma10: number; ma30: number; ma60: number; volMa5: number; volMa10: number; volMa20: number; lastVol: number; hovCandle: Candle | null }>({ ma5: 0, ma10: 0, ma30: 0, ma60: 0, volMa5: 0, volMa10: 0, volMa20: 0, lastVol: 0, hovCandle: null });

  const [viewCount, setViewCount] = useState(100);
  const [viewOffset, setViewOffset] = useState(0);

  // â”€â”€ Overlay state: null = default top-left, {x,y} = follow cursor â”€â”€â”€â”€â”€â”€â”€â”€
  const [overlayPos, setOverlayPos] = useState<{ x: number; y: number } | null>(null);

  const canvasRef          = useRef<HTMLCanvasElement>(null);
  const chartContainerRef  = useRef<HTMLDivElement>(null);
  const searchRef          = useRef<HTMLDivElement>(null);
  const mouseRef           = useRef<{ x: number; y: number } | null>(null);
  const isDragging         = useRef(false);
  const dragStartX         = useRef(0);
  const dragStartOff       = useRef(0);
  const viewCountRef       = useRef(viewCount);
  const viewOffsetRef      = useRef(viewOffset);
  const candlesRef         = useRef(candles);
  const baseChangePctRef   = useRef(PAIRS[0].change);
  const baseChangeAmtRef   = useRef(PAIRS[0].changeAmt);
  const anchorPriceRef     = useRef(PAIRS[0].price);

  useEffect(() => { viewCountRef.current = viewCount; }, [viewCount]);
  useEffect(() => { viewOffsetRef.current = viewOffset; }, [viewOffset]);
  useEffect(() => { candlesRef.current = candles; }, [candles]);

  // â”€â”€ Real-time Binance data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [activeSymbol, setActiveSymbol] = useState(PAIRS[0].symbol);
  const { candles: liveCandles, orderBook: liveOrderBook, ticker: liveTicker } =
    useCryptoData(activeSymbol, timeframe);

  // Sync live candles â†’ local state (canvas draws from local state via candlesRef)
  useEffect(() => {
    if (liveCandles.length > 0) {
      setCandles(liveCandles);
    }
  }, [liveCandles]);

  // Sync live order book
  useEffect(() => {
    if (liveOrderBook.asks.length > 0 || liveOrderBook.bids.length > 0) {
      setOrderBook(liveOrderBook);
    }
  }, [liveOrderBook]);

  // Sync live ticker â†’ price / change / high / low / vol
  useEffect(() => {
    if (liveTicker) {
      setLivePrice(liveTicker.price);
      setLiveHigh(liveTicker.high);
      setLiveLow(liveTicker.low);
      setLiveChange(liveTicker.change);
      setLiveChangeAmt(liveTicker.changeAmt);
    }
  }, [liveTicker]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = candlesRef.current;
    if (c.length === 0) return;
    const vc = viewCountRef.current;
    const vo = viewOffsetRef.current;
    const total = c.length;
    const endIdx   = Math.max(1, total - vo);
    const startIdx = Math.max(0, endIdx - vc);
    const mouse = mouseRef.current;
    const result = drawChart(canvas, c, startIdx, endIdx, mouse?.x ?? null, mouse?.y ?? null, chartTypeRef.current);
    setIndicators(result);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth  || 900;
      canvas.height = canvas.offsetHeight || 420;
      redraw();
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [redraw]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta  = e.deltaY > 0 ? 1 : -1;
    const factor = Math.max(1, Math.ceil(viewCountRef.current * 0.08));
    setViewCount(prev => Math.max(20, Math.min(candlesRef.current.length, prev + delta * factor)));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  useEffect(() => { redraw(); }, [candles, viewCount, viewOffset, redraw]);
  useEffect(() => { chartTypeRef.current = chartType; redraw(); }, [chartType, redraw]);

  // Live data is now streamed from Binance WebSocket via useCryptoData hook.

  const switchPair = useCallback((p: TradingPair) => {
    setPair(p);
    setShowSearch(false);
    setSearchQ("");
    setActiveSymbol(p.symbol);   // triggers useCryptoData to fetch new pair
    setViewOffset(0);
    setViewCount(100);
    setCandles([]);              // clear stale candles while new data loads
    setOrderBook({ asks: [], bids: [] });
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;
    mouseRef.current = { x: mx, y: my };

    // Track mouse position relative to the chart container for overlay positioning
    const container = chartContainerRef.current;
    if (container) {
      const cRect = container.getBoundingClientRect();
      setOverlayPos({ x: e.clientX - cRect.left, y: e.clientY - cRect.top });
    }

    if (isDragging.current) {
      const dx = e.clientX - dragStartX.current;
      const vc = viewCountRef.current;
      const cW = (canvas.width - 68) / vc;
      const delta = Math.round(-dx / cW);
      const newOff = Math.max(0, Math.min(candlesRef.current.length - vc, dragStartOff.current + delta));
      viewOffsetRef.current = newOff;
      setViewOffset(newOff);
    }
    redraw();
  }, [redraw]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current   = true;
    dragStartX.current   = e.clientX;
    dragStartOff.current = viewOffsetRef.current;
  }, []);

  const handleMouseUp = useCallback(() => { isDragging.current = false; }, []);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
    mouseRef.current   = null;
    setOverlayPos(null); // return overlay to top-left default
    redraw();
  }, [redraw]);

  const [showSidebar, setShowSidebar] = useState(true);
  const [orderBookView, setOrderBookView] = useState<'mixed'|'bids'|'asks'>('mixed');

  // â”€â”€ Chart toolbar feature state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [showIndicatorModal, setShowIndicatorModal] = useState(false);
  const [showTimezoneModal, setShowTimezoneModal]   = useState(false);
  const [showSettingsModal, setShowSettingsModal]   = useState(false);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [openSubMenu, setOpenSubMenu]               = useState<number | null>(null);
  const [hoveredToolIdx, setHoveredToolIdx]         = useState<number | null>(null);
  const [subMenuPos, setSubMenuPos]                 = useState<{ top: number; left: number } | null>(null);
  const leftBarRef = useRef<HTMLDivElement>(null);
  const [screenshotDataUrl, setScreenshotDataUrl]   = useState('');
  const [isFullscreen, setIsFullscreen]             = useState(false);
  const chartSectionRef = useRef<HTMLDivElement>(null);
  // Indicator selections
  const [activeMainIndicators, setActiveMainIndicators] = useState<string[]>(['MA (Moving Average)']);
  const [activeSubIndicators,  setActiveSubIndicators]  = useState<string[]>(['VOL (Volume)']);
  // Timezone
  const [selectedTimezone, setSelectedTimezone] = useState('UTC (Coordinated Universal Time)');
  // Chart settings
  const [candlestickType,   setCandlestickType]   = useState('Full Solid');
  const [showLastPrice,     setShowLastPrice]     = useState(true);
  const [showHighPrice,     setShowHighPrice]     = useState(true);
  const [showLowPrice,      setShowLowPrice]      = useState(true);
  const [showLastIndicatorVal, setShowLastIndicatorVal] = useState(false);
  const [invertCoordinate,  setInvertCoordinate]  = useState(false);
  const [showGrid,          setShowGrid]          = useState(true);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setScreenshotDataUrl(dataUrl);
    setShowScreenshotModal(true);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      chartSectionRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [isFullscreen]);
  const isUp = liveChange >= 0;
  const filteredPairs = PAIRS.filter(p => p.symbol.toLowerCase().includes(searchQ.toLowerCase()));
  const decimalPlaces = (b: string) => ["XRP","XLM","IOTA","ONT"].includes(b) ? 4 : 2;

  // Order book slices â€“ mixed view shows exactly 11 per side; solo views show 20.
  const mixedAsks = orderBook.asks.slice(0, 11);
  const mixedBids = orderBook.bids.slice(0, 11);
  const soloAsks  = orderBook.asks.slice(0, 20);
  const soloBids  = orderBook.bids.slice(0, 20);

  const cumSums = (entries: OrderBookEntry[]): number[] => {
    let running = 0;
    return entries.map(e => { running += e.amount; return running; });
  };

  const askCumSums     = cumSums(mixedAsks);
  const bidCumSums     = cumSums(mixedBids);
  const soloAskCumSums = cumSums(soloAsks);
  const soloBidCumSums = cumSums(soloBids);

  const maxAskCum     = askCumSums[askCumSums.length - 1]         || 1;
  const maxBidCum     = bidCumSums[bidCumSums.length - 1]         || 1;
  const maxSoloAskCum = soloAskCumSums[soloAskCumSums.length - 1] || 1;
  const maxSoloBidCum = soloBidCumSums[soloBidCumSums.length - 1] || 1;

  // â”€â”€ Spot panel handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const spotEffectivePrice = (limitPriceStr: string) => {
    if (spotOrderType === 'limit' && limitPriceStr) {
      return parseFloat(limitPriceStr) || livePrice;
    }
    return livePrice;
  };

  const handleSpotAmountChange = (val: string) => {
    setSpotAmount(val);
    const a = parseFloat(val);
    const ep = spotEffectivePrice(spotLimitPrice);
    if (!isNaN(a) && a > 0) setSpotVolume((a * ep).toFixed(2));
    else setSpotVolume('');
  };

  const handleSpotVolumeChange = (val: string) => {
    setSpotVolume(val);
    const v = parseFloat(val);
    const ep = spotEffectivePrice(spotLimitPrice);
    if (!isNaN(v) && v > 0 && ep > 0) setSpotAmount((v / ep).toFixed(8));
    else setSpotAmount('');
  };

  const handleSpotOrderTypeChange = (t: 'market' | 'limit') => {
    setSpotOrderType(t);
    if (t === 'limit') {
      const priceStr = livePrice.toFixed(2);
      setSpotLimitPrice(priceStr);
      if (spotAmount) setSpotVolume((parseFloat(spotAmount) * livePrice).toFixed(2));
    } else {
      if (spotAmount) setSpotVolume((parseFloat(spotAmount) * livePrice).toFixed(2));
    }
  };

  const handleSpotLimitPriceChange = (val: string) => {
    setSpotLimitPrice(val);
    const newPrice = parseFloat(val) || livePrice;
    if (spotAmount) {
      const a = parseFloat(spotAmount);
      if (!isNaN(a) && a > 0) setSpotVolume((a * newPrice).toFixed(2));
    } else if (spotVolume) {
      const v = parseFloat(spotVolume);
      if (!isNaN(v) && v > 0) setSpotAmount((v / newPrice).toFixed(8));
    }
  };

  const handleSpotPctClick = (pct: number) => {
    setSpotSelectedPct(pct);
    const balanceAmt = 0;
    if (spotSide === 'buy') {
      const vol = (balanceAmt * pct).toFixed(2);
      setSpotVolume(vol);
      const ep = spotEffectivePrice(spotLimitPrice);
      setSpotAmount(ep > 0 ? (parseFloat(vol) / ep).toFixed(8) : '0');
    } else {
      const amt = (balanceAmt * pct).toFixed(8);
      setSpotAmount(amt);
      const ep = spotEffectivePrice(spotLimitPrice);
      setSpotVolume((parseFloat(amt) * ep).toFixed(2));
    }
  };

  // â”€â”€ Build OHLCV overlay data from hovCandle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const buildOverlayRows = (hc: Candle | null) => {
    if (!hc) return null;
    const ts = new Date(hc.t);
    const timeStr = `${ts.getFullYear()}/${String(ts.getMonth()+1).padStart(2,"0")}/${String(ts.getDate()).padStart(2,"0")} ${String(ts.getHours()).padStart(2,"0")}:${String(ts.getMinutes()).padStart(2,"0")}`;
    const isHcUp = hc.c >= hc.o;
    return [
      { label: "Time",   val: timeStr,         color: "#c8c8cc" },
      { label: "O",      val: fmt(hc.o, 2),     color: "#c8c8cc" },
      { label: "H",      val: fmt(hc.h, 2),     color: "#c8c8cc" },
      { label: "L",      val: fmt(hc.l, 2),     color: "#c8c8cc" },
      { label: "C",      val: fmt(hc.c, 2),     color: "#c8c8cc" },
      { label: "Volume", val: hc.v.toFixed(2),  color: "#c8c8cc" },
    ];
  };

  const overlayRows = buildOverlayRows(indicators.hovCandle);

  // Overlay positioning: follow cursor when inside, default top-left when outside.
  // Overlay is ~155px wide Ã— ~130px tall; keep it inside the container.
  const OVERLAY_W = 160;
  const OVERLAY_H = 128;
  const OVERLAY_OFFSET_X = 14;
  const OVERLAY_OFFSET_Y = 14;

  const overlayStyle: React.CSSProperties = (() => {
    const base: React.CSSProperties = {
      position: "absolute",
      pointerEvents: "none",
      zIndex: 20,
      background: "rgba(14,14,26,0.92)",
      border: "1px solid rgba(80,80,130,0.55)",
      borderRadius: 4,
      padding: "6px 10px",
      fontFamily: "'Roboto Mono', monospace",
      fontSize: 10,
      width: OVERLAY_W,
    };

    if (!overlayPos) {
      // Default: top-left corner
      return { ...base, top: 8, left: 8 };
    }

    // Follow the mouse â€” offset so the box doesn't cover the cursor
    const container = chartContainerRef.current;
    const maxX = container ? container.clientWidth  - OVERLAY_W  - 4 : 9999;
    const maxY = container ? container.clientHeight - OVERLAY_H  - 4 : 9999;

    let ox = overlayPos.x + OVERLAY_OFFSET_X;
    let oy = overlayPos.y + OVERLAY_OFFSET_Y;

    // Flip left if overflowing right
    if (ox + OVERLAY_W > maxX) ox = overlayPos.x - OVERLAY_W - OVERLAY_OFFSET_X;
    // Flip up if overflowing bottom
    if (oy + OVERLAY_H > maxY) oy = overlayPos.y - OVERLAY_H - OVERLAY_OFFSET_Y;

    ox = Math.max(4, ox);
    oy = Math.max(4, oy);

    return { ...base, top: oy, left: ox };
  })();

  return (
    <>
    <div className="flex flex-col text-white" style={{ minHeight: "calc(100vh - 64px)", fontFamily: "'Roboto Mono', monospace, sans-serif", background: "#000000", gap: "2px" }}>

      {/* â”€â”€ Top Stats Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex items-center w-full flex-shrink-0" style={{ minHeight: 60, background: "#0c0c0f" }}>
        <div ref={searchRef} className="relative flex-shrink-0 flex items-center px-4" style={{ minWidth: 190 }}>
          <button onClick={() => setShowSearch(!showSearch)} className="flex items-center gap-2 font-extrabold text-lg text-white hover:text-yellow-400 transition-colors whitespace-nowrap">
            {pair.symbol}
            <ChevronDown size={16} className={`transition-transform ${showSearch ? "rotate-180" : ""}`} />
          </button>
          {showSearch && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[#131320] border border-[#2a2a3e] rounded-lg shadow-2xl z-50">
              <div className="p-2 border-b border-[#2a2a3e]">
                <div className="flex items-center gap-2 bg-[#1a1a2e] rounded px-2 py-1.5">
                  <Search size={12} className="text-gray-500" />
                  <input autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search symbol" className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-full" />
                </div>
              </div>
              <div className="px-2 pt-1 pb-1 text-[10px] text-gray-500 font-semibold">Trading Symbol</div>
              <div className="max-h-64 overflow-y-auto">
                {filteredPairs.map(p => (
                  <button key={p.symbol} onClick={() => switchPair(p)} className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1e1e32] transition-colors text-left ${p.symbol === pair.symbol ? "bg-[#1e1e32]" : ""}`}>
                    {p.icon ? <img src={p.icon} alt={p.base} className="w-5 h-5 rounded-full" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div className="w-5 h-5 rounded-full bg-[#2a2a3e] flex items-center justify-center text-[8px] text-gray-400">{p.base[0]}</div>}
                    <span className="text-xs text-white font-medium">{p.base}</span>
                    <span className="text-[10px] text-gray-500">/{p.quote}</span>
                    <span className={`ml-auto text-[10px] font-medium ${p.change >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>{p.change >= 0 ? "+" : ""}{p.change.toFixed(2)}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 px-4">
          <div className={`text-base font-bold leading-tight ${isUp ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>{fmt(livePrice, decimalPlaces(pair.base))}</div>
          <div className="text-sm font-medium text-white mt-0.5">${fmt(livePrice, decimalPlaces(pair.base))}</div>
        </div>
        <div className="flex flex-1 items-center justify-around h-full">
          <div className="flex flex-col justify-center">
            <div className="text-[11px] text-gray-400 mb-0.5">24h Change</div>
            <div className={`text-sm font-semibold ${isUp ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>{liveChangeAmt >= 0 ? "+" : ""}{liveChangeAmt.toFixed(2)}&nbsp;&nbsp;{liveChange >= 0 ? "+" : ""}{liveChange.toFixed(2)}%</div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-[11px] text-gray-400 mb-0.5">24h High</div>
            <div className="text-sm font-semibold text-gray-100">{fmt(liveHigh, decimalPlaces(pair.base))}</div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-[11px] text-gray-400 mb-0.5">24h Low</div>
            <div className="text-sm font-semibold text-gray-100">{fmt(liveLow, decimalPlaces(pair.base))}</div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-[11px] text-gray-400 mb-0.5">24h Vol ({pair.base})</div>
            <div className="text-sm font-semibold text-gray-100">{pair.vol}</div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-[11px] text-gray-400 mb-0.5">24h Turnover (USDT)</div>
            <div className="text-sm font-semibold text-gray-100">{pair.turnover}</div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Main Body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex overflow-hidden" style={{ gap: "2px", minHeight: "calc(110vh - 290px)" }}>

        {/* â”€â”€ Chart Area Wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div ref={chartSectionRef} className="flex flex-col flex-1 overflow-hidden" style={{ background: '#0c0c0f', position: 'relative' }}>

          {/* â”€â”€ Timeframe / Chart Toolbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div
            className="flex items-center flex-shrink-0 w-full"
            style={{ height: 48, background: "#0c0c0f", borderBottom: "1px solid #222230" }}
          >
            <div
              className="flex items-center gap-0 flex-shrink-0 h-full"
              style={{ borderRight: "1px solid #222230" }}
            >
              <button
                title={showLeftBar ? "Hide toolbar" : "Show toolbar"}
                onClick={() => setShowLeftBar(v => !v)}
                className="flex items-center justify-center text-gray-400 hover:text-white transition-colors h-full"
                style={{ width: 48, borderRight: "1px solid #222230" }}
              >
                <svg
                  width="22" height="18" viewBox="0 0 24 18" fill="none"
                  style={{ transform: showLeftBar ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.3s ease" }}
                >
                  <rect x="0" y="0"    width="24" height="2.6" rx="1.3" fill="currentColor"/>
                  <rect x="0" y="7.7"  width="16" height="2.6" rx="1.3" fill="currentColor"/>
                  <rect x="0" y="15.4" width="24" height="2.6" rx="1.3" fill="currentColor"/>
                  <polyline points="10,2 5,9 10,16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </button>
              <span
                className="text-white font-extrabold tracking-wide px-4 whitespace-nowrap"
                style={{ fontSize: 16 }}
              >
                {pair.symbol}
              </span>
            </div>

            <div
              className="flex items-center h-full px-3 gap-1 flex-shrink-0"
              style={{ borderRight: "1px solid #222230" }}
            >
              <span
                className="text-gray-400 font-medium mr-2 cursor-pointer hover:text-white transition-colors"
                style={{ fontSize: 14 }}
                title="Line chart"
                onClick={() => setChartType(ct => ct === 'line' ? 'candle' : 'line')}
              >
                {chartType === 'line' ? <span style={{ color: '#5eb8ff' }}>Time</span> : 'Time'}
              </span>
              {["1m","5m","15m","30m","1H","1D"].map(tf => (
                <button
                  key={tf}
                  onClick={() => { setTimeframe(tf); setChartType('candle'); }}
                  className="transition-colors font-medium"
                  style={{
                    padding: "4px 10px",
                    fontSize: 14,
                    borderRadius: 5,
                    background: timeframe === tf ? "#1a3a5c" : "transparent",
                    color: timeframe === tf ? "#5eb8ff" : "#8888aa",
                  }}
                  onMouseEnter={e => { if (timeframe !== tf) (e.currentTarget as HTMLButtonElement).style.color = "#ffffff"; }}
                  onMouseLeave={e => { if (timeframe !== tf) (e.currentTarget as HTMLButtonElement).style.color = "#8888aa"; }}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="flex items-center h-full" style={{ borderLeft: "1px solid #222230" }}>
              <button
                title="Indicators"
                onClick={() => setShowIndicatorModal(true)}
                className="flex items-center justify-center text-gray-300 hover:text-white hover:border-gray-400 transition-colors h-full"
                style={{ width: 52, borderRight: "1px solid #222230", fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 700, fontSize: 15 }}
              >
                <span style={{ border: "1.5px solid #3a3a55", borderRadius: 6, padding: "2px 6px", lineHeight: 1 }}>
                  <span style={{ letterSpacing: "-1px" }}>f</span><span style={{ fontStyle: "normal", fontWeight: 900, fontSize: 13 }}>x</span>
                </span>
              </button>
              <button title="Chart templates" onClick={() => setShowTimezoneModal(true)} className="flex items-center justify-center text-gray-400 hover:text-white transition-colors h-full" style={{ width: 52, borderRight: "1px solid #222230" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                  <path d="M12 2v4M12 18v4"/>
                </svg>
              </button>
              <button title="Chart settings" onClick={() => setShowSettingsModal(true)} className="flex items-center justify-center text-gray-400 hover:text-white transition-colors h-full" style={{ width: 52, borderRight: "1px solid #222230" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
              <button title="Screenshot" onClick={handleScreenshot} className="flex items-center justify-center text-gray-400 hover:text-white transition-colors h-full" style={{ width: 52, borderRight: "1px solid #222230" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
              <button title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} onClick={toggleFullscreen} className="flex items-center justify-center text-gray-400 hover:text-white transition-colors h-full" style={{ width: 52 }}>
                {isFullscreen ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="8 3 3 3 3 8"/><polyline points="21 8 21 3 16 3"/>
                    <polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* â”€â”€ Sidebar + Canvas Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="flex flex-1 overflow-hidden" style={{ gap: "2px" }}>

        {/* ─── Left Drawing Toolbar ──────────────────────────────────────────── */}
        {showLeftBar ? (
        <div
          ref={leftBarRef}
          className="flex-shrink-0 flex flex-col items-center relative"
          style={{ width: 48, background: "#0c0c0f", borderRight: "1px solid #222230", zIndex: 30 }}
          onMouseLeave={() => { setHoveredToolIdx(null); setOpenSubMenu(null); }}
        >
