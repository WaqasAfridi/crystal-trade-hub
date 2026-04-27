// ─── useCryptoData.ts ────────────────────────────────────────────────────────
// Real-time crypto data via Binance public REST + WebSocket APIs.
// No API key required. Provides live candles, order book and 24hr ticker.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from "react";

export interface Candle {
  o: number; h: number; l: number; c: number; v: number; t: number;
}
export interface OrderBookEntry {
  price: number; amount: number;
}
export interface LiveTicker {
  price: number;
  change: number;      // percent e.g. -2.93
  changeAmt: number;   // absolute
  high: number;
  low: number;
  vol: string;         // formatted e.g. "13.98K"
  turnover: string;    // formatted e.g. "1,007.3M"
}

// ── helpers ──────────────────────────────────────────────────────────────────
function toBinanceSym(symbol: string): string {
  return symbol.replace("/", "").toUpperCase();
}

function toBinanceInterval(tf: string): string {
  const map: Record<string, string> = {
    "30s": "1m", "1m": "1m", "5m": "5m", "15m": "15m",
    "30m": "30m", "1H": "1h", "1D": "1d",
  };
  return map[tf] ?? "1m";
}

function fmtVol(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(2);
}

// ── REST fetchers ─────────────────────────────────────────────────────────────
async function fetchKlines(symbol: string, interval: string, limit = 200): Promise<Candle[]> {
  const sym = toBinanceSym(symbol);
  const url = `https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Klines fetch failed: ${res.status}`);
  const data: unknown[][] = await res.json();
  return data.map(k => ({
    t: k[0] as number,
    o: parseFloat(k[1] as string),
    h: parseFloat(k[2] as string),
    l: parseFloat(k[3] as string),
    c: parseFloat(k[4] as string),
    v: parseFloat(k[5] as string),
  }));
}

async function fetchDepthSnapshot(symbol: string, limit = 20): Promise<{ asks: OrderBookEntry[]; bids: OrderBookEntry[] }> {
  const sym = toBinanceSym(symbol);
  const url = `https://api.binance.com/api/v3/depth?symbol=${sym}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Depth fetch failed: ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: any = await res.json();
  return {
    asks: (d.asks as string[][]).map((a: string[]) => ({ price: parseFloat(a[0]), amount: parseFloat(a[1]) })),
    bids: (d.bids as string[][]).map((b: string[]) => ({ price: parseFloat(b[0]), amount: parseFloat(b[1]) })),
  };
}

async function fetch24hrTicker(symbol: string): Promise<LiveTicker> {
  const sym = toBinanceSym(symbol);
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Ticker fetch failed: ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: any = await res.json();
  return {
    price:     parseFloat(d.lastPrice),
    change:    parseFloat(d.priceChangePercent),
    changeAmt: parseFloat(d.priceChange),
    high:      parseFloat(d.highPrice),
    low:       parseFloat(d.lowPrice),
    vol:       fmtVol(parseFloat(d.volume)),
    turnover:  fmtVol(parseFloat(d.quoteVolume)),
  };
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useCryptoData(symbol: string, timeframe: string) {
  const [candles,    setCandles]    = useState<Candle[]>([]);
  const [orderBook,  setOrderBook]  = useState<{ asks: OrderBookEntry[]; bids: OrderBookEntry[] }>({ asks: [], bids: [] });
  const [ticker,     setTicker]     = useState<LiveTicker | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const wsRef       = useRef<WebSocket | null>(null);
  const mountedRef  = useRef(true);

  // Keep refs so reconnect closure sees latest values
  const symbolRef   = useRef(symbol);
  const tfRef       = useRef(timeframe);
  useEffect(() => { symbolRef.current   = symbol;    }, [symbol]);
  useEffect(() => { tfRef.current       = timeframe; }, [timeframe]);

  const connect = useCallback((sym: string, tf: string) => {
    if (wsRef.current) {
      wsRef.current.onclose = null; // prevent reconnect from old socket
      wsRef.current.close();
      wsRef.current = null;
    }
    const binSym   = toBinanceSym(sym).toLowerCase();
    const interval = toBinanceInterval(tf);
    const streams  = [
      `${binSym}@kline_${interval}`,
      `${binSym}@depth20@100ms`,
      `${binSym}@miniTicker`,
    ].join("/");

    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      if (!mountedRef.current) return;
      try {
        const msg   = JSON.parse(evt.data as string);
        const sname: string = msg.stream ?? "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d: any = msg.data;

        if (sname.includes("@kline_")) {
          const k = d.k;
          const candle: Candle = {
            t: k.t as number,
            o: parseFloat(k.o), h: parseFloat(k.h),
            l: parseFloat(k.l), c: parseFloat(k.c), v: parseFloat(k.v),
          };
          setCandles(prev => {
            if (prev.length === 0) return [candle];
            const last = prev[prev.length - 1];
            if (last.t === candle.t) {
              // update current candle in place
              return [...prev.slice(0, -1), candle];
            }
            return [...prev.slice(-299), candle];
          });
        } else if (sname.includes("@depth20")) {
          const asks: OrderBookEntry[] = (d.asks as string[][]).slice(0, 20).map(a => ({
            price: parseFloat(a[0]), amount: parseFloat(a[1]),
          }));
          const bids: OrderBookEntry[] = (d.bids as string[][]).slice(0, 20).map(b => ({
            price: parseFloat(b[0]), amount: parseFloat(b[1]),
          }));
          setOrderBook({ asks, bids });
        } else if (sname.includes("@miniTicker")) {
          const price     = parseFloat(d.c);
          const open      = parseFloat(d.o);
          const changeAmt = price - open;
          const change    = open > 0 ? (changeAmt / open) * 100 : 0;
          setTicker(prev => prev ? {
            ...prev,
            price,
            changeAmt,
            change,
            high:      parseFloat(d.h),
            low:       parseFloat(d.l),
            vol:       fmtVol(parseFloat(d.v)),
            turnover:  fmtVol(parseFloat(d.q)),
          } : null);
        }
      } catch { /* ignore parse errors */ }
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      setError("WebSocket error — retrying…");
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      // Auto-reconnect after 3 s if symbol/tf unchanged
      setTimeout(() => {
        if (mountedRef.current && symbolRef.current === sym && tfRef.current === tf) {
          connect(sym, tf);
        }
      }, 3000);
    };

    return ws;
  }, []);

  // Load history + start WebSocket whenever symbol or timeframe changes
  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setError(null);
    setCandles([]);
    setOrderBook({ asks: [], bids: [] });

    const interval = toBinanceInterval(timeframe);

    // Fetch historical klines, 24hr ticker, and order book snapshot in parallel
    Promise.all([
      fetchKlines(symbol, interval, 200),
      fetch24hrTicker(symbol),
      fetchDepthSnapshot(symbol, 20),
    ])
      .then(([klines, tick, depth]) => {
        if (!mountedRef.current) return;
        setCandles(klines);
        setTicker(tick);
        setOrderBook(depth);  // seed order book immediately — WS updates will override
        setError(null);
      })
      .catch(err => {
        if (!mountedRef.current) return;
        console.warn("[useCryptoData] REST fetch failed:", err);
        setError("Failed to load market data");
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });

    connect(symbol, timeframe);

    return () => {
      mountedRef.current = false;
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, timeframe]);

  return { candles, orderBook, ticker, loading, error };
}
