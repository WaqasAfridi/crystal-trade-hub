import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCryptoData } from "../hooks/useCryptoData";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

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
const OPTIONS_INTERVALS = [
  { label: "30s-20%",  interval: "30s",  profitRate: 0.20, seconds: 30,  min: 100,    max: 999999999 },
  { label: "60s-30%",  interval: "60s",  profitRate: 0.30, seconds: 60,  min: 50000,  max: 99999999  },
  { label: "120s-50%", interval: "120s", profitRate: 0.50, seconds: 120, min: 150000, max: 99999999  },
];
const OPTIONS_FEE_RATE = 0.001; // 0.1% fee — Available ≈ Balance - Balance × Fees
const CALL_THRESHOLD = 0.0095;

function fmt(n: number, d = 2) { return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }); }
function fmtTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}
function fmtDateTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getDate().toString().padStart(2,"0")} ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}`;
}

function drawChart(
  canvas: HTMLCanvasElement, candles: Candle[], viewStart: number, viewEnd: number,
  mx: number | null, my: number | null, chartType: 'candle' | 'line' = 'candle'
): { ma5: number; ma10: number; ma30: number; ma60: number; volMa5: number; volMa10: number; volMa20: number; lastVol: number; hovCandle: Candle | null } {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  const vis = candles.slice(Math.max(0, viewStart), Math.min(candles.length, viewEnd));
  const n = vis.length;
  const PAD_RIGHT = 68, PAD_TOP = 12, PAD_BTM = 22;
  const VOL_H = Math.floor(H * 0.18);
  const MAIN_H = H - PAD_TOP - PAD_BTM - VOL_H - 6;
  const defaults = { ma5:0, ma10:0, ma30:0, ma60:0, volMa5:0, volMa10:0, volMa20:0, lastVol:0, hovCandle:null };

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0b0b10"; ctx.fillRect(0, 0, W, H);
  if (n === 0) return defaults;

  const priceMin = Math.min(...vis.map(c=>c.l))*0.9997, priceMax = Math.max(...vis.map(c=>c.h))*1.0003;
  const pRange = priceMax - priceMin || 1;
  const toY = (p: number) => PAD_TOP + MAIN_H - ((p-priceMin)/pRange)*MAIN_H;
  const chartW = W - PAD_RIGHT, step = chartW/n, cW = Math.max(1,step*0.65);
  const volMax = Math.max(...vis.map(c=>c.v))||1, volY0 = PAD_TOP+MAIN_H+6;

  ctx.strokeStyle="rgba(255,255,255,0.045)"; ctx.lineWidth=1;
  for(let i=0;i<=6;i++){const y=PAD_TOP+(MAIN_H/6)*i;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W-PAD_RIGHT,y);ctx.stroke();}
  for(let i=0;i<=8;i++){const x=(chartW/8)*i;ctx.beginPath();ctx.moveTo(x,PAD_TOP);ctx.lineTo(x,PAD_TOP+MAIN_H+VOL_H+6);ctx.stroke();}

  ctx.fillStyle="rgba(130,130,150,0.85)"; ctx.font="10px 'Roboto Mono',monospace"; ctx.textAlign="left";
  for(let i=0;i<=6;i++){const p=priceMin+(pRange/6)*(6-i);const y=PAD_TOP+(MAIN_H/6)*i;ctx.fillText(fmt(p,2),W-PAD_RIGHT+4,y+4);}

  vis.forEach((c,i)=>{const x=step*i+step/2,bH=Math.max(1,(c.v/volMax)*(VOL_H-4));ctx.fillStyle=c.c>=c.o?"rgba(14,203,129,0.55)":"rgba(246,70,93,0.55)";ctx.fillRect(x-cW/2,volY0+VOL_H-bH,cW,bH);});

  const computeMA=(arr:number[],p:number):(number|null)[]=>arr.map((_,i)=>i<p-1?null:arr.slice(i-p+1,i+1).reduce((s,v)=>s+v,0)/p);
  const vols=vis.map(c=>c.v);
  const drawVolMA=(period:number,color:string)=>{const ma=computeMA(vols,period);ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();let s=false;ma.forEach((v,i)=>{if(v===null)return;const x=step*i+step/2,y=volY0+VOL_H-(v/volMax)*(VOL_H-4);if(!s){ctx.moveTo(x,y);s=true;}else ctx.lineTo(x,y);});ctx.stroke();};
  drawVolMA(5,"#f5c518");drawVolMA(10,"#5090d3");drawVolMA(20,"#e84393");

  if(chartType==='line'){
    const grad=ctx.createLinearGradient(0,PAD_TOP,0,PAD_TOP+MAIN_H);grad.addColorStop(0,'rgba(90,144,211,0.35)');grad.addColorStop(1,'rgba(90,144,211,0.02)');
    ctx.beginPath();vis.forEach((c,i)=>{const x=step*i+step/2,y=toY(c.c);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});
    ctx.lineTo(step*(n-1)+step/2,PAD_TOP+MAIN_H);ctx.lineTo(step*0+step/2,PAD_TOP+MAIN_H);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
    ctx.beginPath();vis.forEach((c,i)=>{const x=step*i+step/2,y=toY(c.c);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.strokeStyle='#5090d3';ctx.lineWidth=1.8;ctx.stroke();
  } else {
    vis.forEach((c,i)=>{const x=step*i+step/2,color=c.c>=c.o?"#0ecb81":"#f6465d";ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,toY(c.h));ctx.lineTo(x,toY(c.l));ctx.stroke();const bTop=Math.min(toY(c.o),toY(c.c)),bH=Math.max(1,Math.abs(toY(c.o)-toY(c.c)));ctx.fillRect(x-cW/2,bTop,cW,bH);});
  }

  const closes=vis.map(c=>c.c);
  const ma5val=(computeMA(closes,5))[n-1]??0,ma10val=(computeMA(closes,10))[n-1]??0,ma30val=(computeMA(closes,30))[n-1]??0,ma60val=(computeMA(closes,60))[n-1]??0;
  const drawPriceMA=(period:number,color:string)=>{const ma=computeMA(closes,period);ctx.strokeStyle=color;ctx.lineWidth=1.2;ctx.beginPath();let s=false;ma.forEach((v,i)=>{if(v===null)return;const x=step*i+step/2,y=toY(v);if(!s){ctx.moveTo(x,y);s=true;}else ctx.lineTo(x,y);});ctx.stroke();};
  drawPriceMA(5,"#f5c518");drawPriceMA(10,"#f5a623");drawPriceMA(30,"#5090d3");drawPriceMA(60,"#e84393");

  const last=vis[n-1],lastY=toY(last.c),isUp=last.c>=last.o;
  ctx.setLineDash([4,4]);ctx.strokeStyle=isUp?"#0ecb81":"#f6465d";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,lastY);ctx.lineTo(W-PAD_RIGHT,lastY);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=isUp?"#0ecb81":"#f6465d";ctx.fillRect(W-PAD_RIGHT,lastY-9,PAD_RIGHT,18);
  ctx.fillStyle="#fff";ctx.font="bold 10px 'Roboto Mono',monospace";ctx.textAlign="center";ctx.fillText(fmt(last.c,2),W-PAD_RIGHT+PAD_RIGHT/2,lastY+4);

  ctx.textAlign="center";ctx.fillStyle="rgba(100,100,120,0.9)";ctx.font="9px 'Roboto Mono',monospace";
  const tStep=Math.max(1,Math.floor(n/8));
  for(let i=0;i<n;i+=tStep){ctx.fillText(fmtTime(vis[i].t),step*i+step/2,H-6);}

  if(mx!==null&&my!==null&&mx>=0&&mx<W-PAD_RIGHT&&my>=PAD_TOP&&my<PAD_TOP+MAIN_H){
    ctx.strokeStyle="rgba(180,180,210,0.35)";ctx.lineWidth=1;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(mx,PAD_TOP);ctx.lineTo(mx,PAD_TOP+MAIN_H);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,my);ctx.lineTo(W-PAD_RIGHT,my);ctx.stroke();ctx.setLineDash([]);
    const hPrice=priceMin+(1-(my-PAD_TOP)/MAIN_H)*pRange;
    ctx.fillStyle="#1c1c2e";ctx.strokeStyle="rgba(120,120,180,0.5)";ctx.lineWidth=1;ctx.fillRect(W-PAD_RIGHT,my-9,PAD_RIGHT,18);ctx.strokeRect(W-PAD_RIGHT,my-9,PAD_RIGHT,18);
    ctx.fillStyle="#ddd";ctx.font="10px 'Roboto Mono',monospace";ctx.textAlign="center";ctx.fillText(fmt(hPrice,2),W-PAD_RIGHT+PAD_RIGHT/2,my+4);
    const ci=Math.min(n-1,Math.max(0,Math.floor(mx/step))),hc=vis[ci],cx=step*ci+step/2,tlabel=fmtDateTime(hc.t);
    ctx.fillStyle="#1c1c2e";ctx.strokeStyle="rgba(120,120,180,0.5)";const tlW=128;ctx.fillRect(cx-tlW/2,H-PAD_BTM+1,tlW,16);ctx.strokeRect(cx-tlW/2,H-PAD_BTM+1,tlW,16);
    ctx.fillStyle="#ddd";ctx.font="9px 'Roboto Mono',monospace";ctx.textAlign="center";ctx.fillText(tlabel.slice(0,16),cx,H-PAD_BTM+12);
  }

  let hovCandle:Candle|null=vis[n-1]??null;
  if(mx!==null&&my!==null&&mx>=0&&mx<W-PAD_RIGHT&&my>=PAD_TOP&&my<PAD_TOP+MAIN_H){hovCandle=vis[Math.min(n-1,Math.max(0,Math.floor(mx/step)))];}
  ctx.textAlign="left";
  return {ma5:ma5val,ma10:ma10val,ma30:ma30val,ma60:ma60val,volMa5:(computeMA(vols,5))[n-1]??0,volMa10:(computeMA(vols,10))[n-1]??0,volMa20:(computeMA(vols,20))[n-1]??0,lastVol:last.v,hovCandle};
}

const IconMixed=({active}:{active:boolean})=>{const c=active?'#b0b0c0':'#606070';return(<svg width="26"height="20"viewBox="0 0 26 20"fill="none"xmlns="http://www.w3.org/2000/svg"><rect x="0"y="0"width="9"height="8.5"rx="0.8"fill="#8B1C2C"/><rect x="0"y="11"width="9"height="9"rx="0.8"fill="#1C6B38"/><rect x="13"y="0"width="13"height="4.5"rx="0.8"fill={c}/><rect x="13"y="7.5"width="13"height="4.5"rx="0.8"fill={c}/><rect x="13"y="15"width="13"height="5"rx="0.8"fill={c}/></svg>);};
const IconBids=({active}:{active:boolean})=>{const c=active?'#b0b0c0':'#606070';return(<svg width="26"height="20"viewBox="0 0 26 20"fill="none"xmlns="http://www.w3.org/2000/svg"><rect x="0"y="0"width="9"height="20"rx="0.8"fill="#1C6B38"/><rect x="13"y="0"width="13"height="4.5"rx="0.8"fill={c}/><rect x="13"y="7.5"width="13"height="4.5"rx="0.8"fill={c}/><rect x="13"y="15"width="13"height="5"rx="0.8"fill={c}/></svg>);};
const IconAsks=({active}:{active:boolean})=>{const c=active?'#b0b0c0':'#606070';return(<svg width="26"height="20"viewBox="0 0 26 20"fill="none"xmlns="http://www.w3.org/2000/svg"><rect x="0"y="0"width="9"height="20"rx="0.8"fill="#8B1C2C"/><rect x="13"y="0"width="13"height="4.5"rx="0.8"fill={c}/><rect x="13"y="7.5"width="13"height="4.5"rx="0.8"fill={c}/><rect x="13"y="15"width="13"height="5"rx="0.8"fill={c}/></svg>);};

const LeverageSlider=({value,onChange}:{value:number;onChange:(v:number)=>void})=>(
  <div style={{display:'flex',flexDirection:'column',gap:10}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#292d33',borderRadius:8,padding:'12px 14px'}}>
      <span style={{color:'#9ca3af',fontSize:15}}>Leverage</span>
      <span style={{color:'#fff',fontSize:15,fontWeight:600}}>{value}</span>
      <span style={{color:'#9ca3af',fontSize:15}}>x</span>
    </div>
    <div style={{position:'relative',padding:'4px 0'}}>
      <input type="range" min={1} max={100} value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:'100%',accentColor:'#4a90e2',cursor:'pointer'}}/>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
        {LEVERAGE_TICKS.map(t=>(<button key={t} onClick={()=>onChange(t)} style={{background:'none',border:'none',color:value===t?'#4a90e2':'#6b7280',fontSize:12,cursor:'pointer',padding:0,fontWeight:value===t?700:400}}>{t}x</button>))}
      </div>
    </div>
  </div>
);

const TpSlToggle=({enabled,onToggle}:{enabled:boolean;onToggle:()=>void})=>(
  <div style={{display:'flex',alignItems:'center',gap:10}}>
    <span style={{color:'#9ca3af',fontSize:15}}>TP/SL</span>
    <div onClick={onToggle} style={{width:40,height:22,borderRadius:11,cursor:'pointer',position:'relative',background:enabled?'#25a750':'#333355',transition:'background 0.2s'}}>
      <div style={{position:'absolute',top:3,left:enabled?20:3,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'left 0.2s'}}/>
    </div>
  </div>
);

/* ─── Circular countdown timer ─────────────────────────────── */
const CircularTimer=({totalSeconds,remaining}:{totalSeconds:number;remaining:number})=>{
  const R=54, C=2*Math.PI*R;
  const pct=Math.max(0,Math.min(1,remaining/totalSeconds));
  const offset=C*(1-pct);
  const h=Math.floor(remaining/3600);
  const m=Math.floor((remaining%3600)/60);
  const s=remaining%60;
  const label=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return(
    <div style={{position:'relative',width:140,height:140,margin:'0 auto'}}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={R} fill="none" stroke="#e5e7eb" strokeWidth={10}/>
        <circle cx={70} cy={70} r={R} fill="none" stroke="#22c55e" strokeWidth={10}
          strokeDasharray={C} strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{transition:'stroke-dashoffset 1s linear'}}/>
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <span style={{fontSize:18,fontWeight:700,color:'#222',fontFamily:'monospace'}}>{label}</span>
      </div>
    </div>
  );
};

/* ─── Options Trade Modal ──────────────────────────────────── */
interface ModalOrder {
  id:string; pair:string; side:string; interval:string; seconds:number;
  profitRate:number; amount:number; entryPrice:number;
  createdAt:string; expiresAt:string;
  status:'PENDING'|'WIN'|'LOSS'|'CANCELLED';
  pnl?:number; settlePrice?:number;
}
const OptionsTradeModal=({order,displayPrice,onClose}:{
  order:ModalOrder; displayPrice:number; onClose:()=>void;
})=>{
  // Self-contained countdown — computes from expiresAt each tick so modal works instantly
  const [remaining,setRemaining]=useState(()=>Math.max(0,Math.ceil((new Date(order.expiresAt).getTime()-Date.now())/1000)));
  useEffect(()=>{
    const t=setInterval(()=>{
      setRemaining(Math.max(0,Math.ceil((new Date(order.expiresAt).getTime()-Date.now())/1000)));
    },250);
    return()=>clearInterval(t);
  },[order.expiresAt]);

  const isSettled=order.status!=='PENDING';
  const feeRate=0.001;
  const isLong=order.side==='LONG';
  const createdStr=(()=>{
    const d=new Date(order.createdAt);
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
  })();
  const pairBase=order.pair.split('/')[0];
  const iconMap:Record<string,string>={BTC:'/crypto-logos/btc.svg',ETH:'/crypto-logos/eth.svg',BNB:'/crypto-logos/bnb.svg',XRP:'/crypto-logos/xrp.svg',LTC:'/crypto-logos/ltc.svg'};
  const icon=iconMap[pairBase]||'';

  return(
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.55)'}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{width:420,maxWidth:'95vw',borderRadius:16,overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.4)'}}>
        {/* Header */}
        <div style={{background:'#f3f4f6',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #e5e7eb'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            {icon&&<img src={icon} alt={pairBase} style={{width:30,height:30,borderRadius:'50%'}} onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>}
            {!icon&&<div style={{width:30,height:30,borderRadius:'50%',background:'#f97316',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:13}}>{pairBase[0]}</div>}
            <span style={{fontWeight:700,fontSize:16,color:'#111'}}>{order.pair}</span>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:4,color:'#888',lineHeight:0}}>
            <X size={20}/>
          </button>
        </div>
        {/* Body */}
        <div style={{background:'#ffffff',padding:'24px 28px 20px'}}>
          {!isSettled&&(
            <div style={{display:'flex',justifyContent:'center',marginBottom:24}}>
              <CircularTimer totalSeconds={order.seconds} remaining={remaining}/>
            </div>
          )}
          {isSettled&&(
            <div style={{textAlign:'center',marginBottom:20}}>
              <div style={{width:72,height:72,borderRadius:'50%',background:order.status==='WIN'?'#dcfce7':'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px'}}>
                <span style={{fontSize:32}}>{order.status==='WIN'?'🏆':'📉'}</span>
              </div>
              <div style={{fontSize:22,fontWeight:800,color:order.status==='WIN'?'#16a34a':'#dc2626'}}>
                {order.status==='WIN'?'WIN':'LOSS'}
              </div>
              {order.pnl!=null&&(
                <div style={{fontSize:15,color:order.status==='WIN'?'#16a34a':'#dc2626',fontWeight:600,marginTop:4}}>
                  {order.status==='WIN'?`+${order.pnl.toFixed(2)}`:`${order.pnl.toFixed(2)}`} USDT
                </div>
              )}
            </div>
          )}
          {/* Details table */}
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {([
              {label:'Time',      val:createdStr, color:'#222'},
              {label:'Entry Price',val:order.entryPrice.toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:2}), color:'#222'},
              !isSettled&&{label:'Current Price',val:displayPrice.toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:2}), color:'#222'},
              isSettled&&{label:'Settle Price', val:(order.settlePrice??displayPrice).toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:2}), color:'#222'},
              {label:'Options Duration',val:order.interval, color:'#222'},
              {label:'Direction',  val:isLong?'Long':'Short', color:isLong?'#25a750':'#ca3f64'},
              {label:'Amount',     val:`${order.amount.toLocaleString('en-US')} USDT`, color:'#222'},
              {label:'Fee Rate',   val:`${(feeRate*100).toFixed(1)}%`, color:'#222'},
            ] as any[]).filter(Boolean).map((row:any)=>(
              <div key={row.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{color:'#888',fontSize:14}}>{row.label}</span>
                <span style={{color:row.color,fontSize:14,fontWeight:row.label==='Direction'?700:400}}>{row.val}</span>
              </div>
            ))}
          </div>
          {!isSettled&&(
            <p style={{textAlign:'center',color:'#aaa',fontSize:12,marginTop:18}}>Realized PnL is calculated post-trade</p>
          )}
        </div>
      </div>
    </div>
  );
};

const FuturesTrading=()=>{
  const location=useLocation(), navigate=useNavigate(), {isAuthenticated, token}=useAuth();
  const [pair,setPair]=useState<TradingPair>(PAIRS[0]);
  const [showSearch,setShowSearch]=useState(false);
  const [searchQ,setSearchQ]=useState('');
  const [timeframe,setTimeframe]=useState('1m');
  const [showLeftBar,setShowLeftBar]=useState(true);
  const [bottomTab,setBottomTab]=useState<'current'|'history'>('current');
  const [orderBook,setOrderBook]=useState<{asks:OrderBookEntry[];bids:OrderBookEntry[]}>({asks:[],bids:[]});
  const [candles,setCandles]=useState<Candle[]>([]);
  const [chartType,setChartType]=useState<'candle'|'line'>('candle');
  const chartTypeRef=useRef<'candle'|'line'>('candle');
  const [livePrice,setLivePrice]=useState(PAIRS[0].price);
  const [liveHigh,setLiveHigh]=useState(PAIRS[0].high);
  const [liveLow,setLiveLow]=useState(PAIRS[0].low);
  const [liveChange,setLiveChange]=useState(PAIRS[0].change);
  const [liveChangeAmt,setLiveChangeAmt]=useState(PAIRS[0].changeAmt);

  // Futures panel state
  const [rightTab,setRightTab]=useState<'perpetual'|'options'>('perpetual');
  const [perpOrderType,setPerpOrderType]=useState<'market'|'limit'>('market');
  const [leverage,setLeverage]=useState(60);
  const [perpAmount,setPerpAmount]=useState('');
  const [perpLimitPrice,setPerpLimitPrice]=useState('');
  const [perpPct,setPerpPct]=useState<number|null>(null);
  const [perpVolume,setPerpVolume]=useState('');
  const [tpslEnabled,setTpslEnabled]=useState(false);
  const [isSubmittingPerp,setIsSubmittingPerp]=useState(false);
  const [optSide,setOptSide]=useState<'long'|'short'>('long');
  const [optInterval,setOptInterval]=useState(OPTIONS_INTERVALS[0]);
  const [optAmount,setOptAmount]=useState('');
  const [optPct,setOptPct]=useState<number|null>(null);
  const [isSubmittingOpt,setIsSubmittingOpt]=useState(false);
  const [showIntervalDropdown,setShowIntervalDropdown]=useState(false);
  // FUTURES wallet balance (USDT)
  const [futuresBalance,setFuturesBalance]=useState(0);   // total (balance + locked)
  const [futuresAvailable,setFuturesAvailable]=useState(0); // spendable (balance only)

  // Chart state
  const [indicators,setIndicators]=useState<{ma5:number;ma10:number;ma30:number;ma60:number;volMa5:number;volMa10:number;volMa20:number;lastVol:number;hovCandle:Candle|null}>({ma5:0,ma10:0,ma30:0,ma60:0,volMa5:0,volMa10:0,volMa20:0,lastVol:0,hovCandle:null});
  const [viewCount,setViewCount]=useState(100);
  const [viewOffset,setViewOffset]=useState(0);
  const [overlayPos,setOverlayPos]=useState<{x:number;y:number}|null>(null);
  const [orderBookView,setOrderBookView]=useState<'mixed'|'bids'|'asks'>('mixed');
  const [showIndicatorModal,setShowIndicatorModal]=useState(false);
  const [showTimezoneModal,setShowTimezoneModal]=useState(false);
  const [showSettingsModal,setShowSettingsModal]=useState(false);
  const [showScreenshotModal,setShowScreenshotModal]=useState(false);
  const [screenshotDataUrl,setScreenshotDataUrl]=useState('');
  const [isFullscreen,setIsFullscreen]=useState(false);
  const [selectedTimezone,setSelectedTimezone]=useState('UTC (Coordinated Universal Time)');
  const [candlestickType,setCandlestickType]=useState('Full Solid');
  const [showLastPrice,setShowLastPrice]=useState(true);
  const [showHighPrice,setShowHighPrice]=useState(true);
  const [showLowPrice,setShowLowPrice]=useState(true);
  const [showLastIndicatorVal,setShowLastIndicatorVal]=useState(false);
  const [invertCoordinate,setInvertCoordinate]=useState(false);
  const [showGrid,setShowGrid]=useState(true);
  const [activeMainIndicators,setActiveMainIndicators]=useState<string[]>(['MA (Moving Average)']);
  const [activeSubIndicators,setActiveSubIndicators]=useState<string[]>(['VOL (Volume)']);
  const [futuresOrders,setFuturesOrders]=useState<any[]>([]);
  const [optionsOrders,setOptionsOrders]=useState<any[]>([]);
  // Countdown timers: map from orderId -> seconds remaining
  const [countdowns,setCountdowns]=useState<Record<string,number>>({});
  const countdownRef=useRef<Record<string,ReturnType<typeof setInterval>>>({});
  // Options trade modal
  const [modalOrder,setModalOrder]=useState<ModalOrder|null>(null);
  const [modalOpen,setModalOpen]=useState(false);
  // ForceWin: user profile flag + price manipulation
  const [userForceWin,setUserForceWin]=useState(false);
  const realPriceRef=useRef<number>(PAIRS[0].price);
  const [displayPrice,setDisplayPrice]=useState<number>(PAIRS[0].price);
  const displayPriceRef=useRef<number>(PAIRS[0].price); // always-current ref used in stale closures
  const priceOffsetRef=useRef<number>(0);          // running offset applied on top of realPrice
  const forceWinTickRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const canvasRef=useRef<HTMLCanvasElement>(null);
  const chartContainerRef=useRef<HTMLDivElement>(null);
  const chartSectionRef=useRef<HTMLDivElement>(null);
  const searchRef=useRef<HTMLDivElement>(null);
  const mouseRef=useRef<{x:number;y:number}|null>(null);
  const isDragging=useRef(false);
  const dragStartX=useRef(0);
  const dragStartOff=useRef(0);
  const viewCountRef=useRef(viewCount);
  const viewOffsetRef=useRef(viewOffset);
  const candlesRef=useRef(candles);

  useEffect(()=>{viewCountRef.current=viewCount;},[viewCount]);
  useEffect(()=>{viewOffsetRef.current=viewOffset;},[viewOffset]);
  useEffect(()=>{candlesRef.current=candles;},[candles]);

  const [activeSymbol,setActiveSymbol]=useState(PAIRS[0].symbol);
  const {candles:liveCandles,orderBook:liveOrderBook,ticker:liveTicker}=useCryptoData(activeSymbol,timeframe);
  useEffect(()=>{if(liveCandles.length>0)setCandles(liveCandles);},[liveCandles]);
  useEffect(()=>{if(liveOrderBook.asks.length>0||liveOrderBook.bids.length>0)setOrderBook(liveOrderBook);},[liveOrderBook]);
  useEffect(()=>{
    if(liveTicker){
      realPriceRef.current=liveTicker.price;
      const dp=liveTicker.price+priceOffsetRef.current;
      displayPriceRef.current=dp;
      setLivePrice(dp);
      setDisplayPrice(dp);
      setLiveHigh(liveTicker.high);
      setLiveLow(liveTicker.low);
      setLiveChange(liveTicker.change);
      setLiveChangeAmt(liveTicker.changeAmt);
    }
  },[liveTicker]);

  // Fetch user forceWin flag
  useEffect(()=>{
    if(!token)return;
    api.get<any>('/users/profile',token).then((r:any)=>{
      const fw=r?.forceWin??r?.data?.forceWin??false;
      setUserForceWin(!!fw);
    }).catch(()=>{});
  },[token]);

  // ForceWin / ForceLoss price manipulation
  useEffect(()=>{
    if(forceWinTickRef.current){clearInterval(forceWinTickRef.current);forceWinTickRef.current=null;}
    const pendingFromModal=modalOpen&&modalOrder?.status==='PENDING'?modalOrder:null;
    const pendingFromOrders=(optionsOrders as any[]).find((o:any)=>o.status==='PENDING');
    const pendingOpt=pendingFromModal||pendingFromOrders;

    if(!pendingOpt){
      // No active trade — quietly bleed offset back to zero with small noise
      const returnInterval=setInterval(()=>{
        const cur=priceOffsetRef.current;
        if(Math.abs(cur)<0.2){
          priceOffsetRef.current=0;
          clearInterval(returnInterval);
          displayPriceRef.current=realPriceRef.current;
          setDisplayPrice(realPriceRef.current);
          setLivePrice(realPriceRef.current);
          return;
        }
        const noise=(Math.random()-0.5)*Math.abs(realPriceRef.current)*0.00006;
        priceOffsetRef.current=cur*0.96+noise;
        const dp=realPriceRef.current+priceOffsetRef.current;
        displayPriceRef.current=dp;
        setDisplayPrice(dp);
        setLivePrice(dp);
      },500);
      forceWinTickRef.current=returnInterval;
      return;
    }

    const isLong=pendingOpt.side==='LONG';
    const entry=pendingOpt.entryPrice;
    const ivMap:Record<string,number>={'30s':30,'60s':60,'120s':120};
    const totalSecs:number=('seconds' in pendingOpt?(pendingOpt as any).seconds:undefined)||
                           ivMap[pendingOpt.interval as string]||30;
    const startedAt=new Date(pendingOpt.createdAt||Date.now()).getTime();
    // Per-tick noise magnitude: ~0.013% of price — matches real BTC tick noise
    const naturalVol=Math.abs(entry)*0.00013;
    const tickMs=400;

    if(userForceWin){
      // ✅ FORCE WIN: push price in WIN direction (LONG↑, SHORT↓)
      // Keep existing 3-phase algorithm that user confirmed works well
      const direction=isLong?1:-1;
      const totalTargetOffset=direction*entry*0.005;
      const totalTicks=Math.ceil((totalSecs*1000)/tickMs);
      let tickCount=0;
      const manipulate=setInterval(()=>{
        tickCount++;
        const cur=priceOffsetRef.current;
        const remaining=Math.max(1,totalTicks-tickCount);
        const needed=totalTargetOffset-cur;
        const noise=(Math.random()+Math.random()-1)*naturalVol;
        const pct=tickCount/totalTicks;
        let drift:number;
        if(pct<0.65){drift=direction*naturalVol*0.15;}
        else if(pct<0.85){drift=needed/remaining*0.25;}
        else{const ok=(direction>0&&cur>totalTargetOffset*0.8)||(direction<0&&cur<totalTargetOffset*0.8);drift=ok?direction*naturalVol*0.1:needed/remaining*0.6;}
        priceOffsetRef.current=cur+drift+noise;
        const dp=realPriceRef.current+priceOffsetRef.current;
        displayPriceRef.current=dp;
        setDisplayPrice(dp);
        setLivePrice(dp);
      },tickMs);
      forceWinTickRef.current=manipulate;

    } else {
      // ❌ FORCE LOSS (toggle OFF): observe real data, guaranteed loss at settlement
      //
      // Zone 1 (secsRemaining > 10): pure real data, zero offset
      // Zone 2 (5 < secsRemaining <= 10): watch and nudge
      // Zone 3 (secsRemaining <= 5): guaranteed convergence to lossTarget
      //
      // CRITICAL RULE in Zone 2+3: NEVER fully release control to the market.
      //   If currently WINNING  -> converge offset toward lossTarget
      //   If currently LOSING   -> clamp offset so it CANNOT flip to a win
      //                           (handles last-second price bounces)

      const expiresAt=new Date((pendingOpt as any).expiresAt||Date.now()+totalSecs*1000).getTime();
      // lossTarget: display price just barely past entry in the losing direction
      const lossTarget=isLong?(entry-1.0):(entry+1.0);
      // clampSign: the sign of offset that keeps the user losing
      // LONG loses when displayPrice < entry -> need offset <= 0 when already losing
      // SHORT loses when displayPrice > entry -> need offset >= 0 when already losing
      const clampSign=isLong?-1:1;

      const manipulate=setInterval(()=>{
        const secsRemaining=Math.max(0,(expiresAt-Date.now())/1000);
        const realNow=realPriceRef.current;
        const curOffset=priceOffsetRef.current;
        const currentDisplay=realNow+curOffset;

        // —— Zone 1: pure observe ——
        if(secsRemaining>10){
          if(Math.abs(curOffset)>0.1) priceOffsetRef.current=curOffset*0.93;
          else priceOffsetRef.current=0;
          const dp=realNow+priceOffsetRef.current;
          displayPriceRef.current=dp; setDisplayPrice(dp); setLivePrice(dp);
          return;
        }

        const isWinning=(isLong&&realNow>entry)||(!isLong&&realNow<entry);

        if(!isWinning){
          // —— Currently LOSING with real data — clamp offset so a bounce can\'t save them ——
          // Only allow offsets in the losing direction (negative for LONG, positive for SHORT)
          // This means: even if real price bounces across entry in the next tick,
          // displayPrice will still be on the loss side.
          let safeOffset:number;
          if(isLong){
            // LONG: offset must be <= (entry - 1 - realNow) to keep displayPrice <= entry-1
            safeOffset=Math.min(0,curOffset); // never positive when losing long
          } else {
            // SHORT: offset must be >= (entry + 1 - realNow) to keep displayPrice >= entry+1
            safeOffset=Math.max(0,curOffset); // never negative when losing short
          }
          // Bleed toward 0 gently (not all the way - maintain the clamp)
          const noise=(Math.random()-0.5)*naturalVol*0.15;
          priceOffsetRef.current=safeOffset*0.92+noise*clampSign*0; // keep clamped direction
          // ensure clamp is respected after noise
          if(isLong) priceOffsetRef.current=Math.min(0,priceOffsetRef.current);
          else       priceOffsetRef.current=Math.max(0,priceOffsetRef.current);
          const dp=realNow+priceOffsetRef.current;
          displayPriceRef.current=dp; setDisplayPrice(dp); setLivePrice(dp);
          return;
        }

        // —— Currently WINNING — converge display price toward lossTarget ——
        const neededOffset=lossTarget-realNow; // the offset that shows lossTarget
        const distToTarget=neededOffset-curOffset;
        const ticksLeft=Math.max(1,Math.ceil(secsRemaining*(1000/tickMs)));

        let step:number;
        let noiseMag:number;

        if(secsRemaining>5){
          // Zone 2: gentle nudge masked by noise (5-10s remaining)
          step=distToTarget/(ticksLeft*1.8);
          noiseMag=naturalVol*0.7;
        } else {
          // Zone 3: guaranteed convergence (last 5s)
          // 1.3x factor ensures we cross even with noise
          step=(distToTarget/ticksLeft)*1.3;
          noiseMag=naturalVol*0.25; // small noise: looks like a real reversal, won\'t derail
        }

        const noise=(Math.random()+Math.random()-1)*noiseMag;
        priceOffsetRef.current=curOffset+step+noise;
        const dp=realNow+priceOffsetRef.current;
        displayPriceRef.current=dp; setDisplayPrice(dp); setLivePrice(dp);
      },tickMs);
      forceWinTickRef.current=manipulate;
    }

    return()=>{if(forceWinTickRef.current)clearInterval(forceWinTickRef.current);};
  },[userForceWin,optionsOrders,modalOrder,modalOpen]);

  // Fetch FUTURES USDT wallet balance
  const fetchFuturesWallet=useCallback(async()=>{
    if(!token)return;
    try{
      const wallet:any=await api.get('/wallets/USDT?account=FUTURES',token);
      if(wallet&&typeof wallet.balance==='number'){
        setFuturesBalance(wallet.balance+( wallet.locked||0));
        setFuturesAvailable(wallet.balance);
      } else {
        setFuturesBalance(0); setFuturesAvailable(0);
      }
    }catch{ setFuturesBalance(0); setFuturesAvailable(0); }
  },[token]);

  useEffect(()=>{
    if(!isAuthenticated||!token)return;
    api.get<any[]>('/trading/futures/orders',token).then(r=>setFuturesOrders(Array.isArray(r)?r:[])).catch(()=>{});
    api.get<any[]>('/trading/options/orders',token).then(r=>setOptionsOrders(Array.isArray(r)?r:[])).catch(()=>{});
    fetchFuturesWallet();
  },[isAuthenticated,token,fetchFuturesWallet]);

  // Start countdown timers for PENDING options orders and auto-settle when expired
  useEffect(()=>{
    optionsOrders.forEach(order=>{
      if(order.status!=='PENDING')return;
      if(countdownRef.current[order.id])return; // already running
      const expiry=new Date(order.expiresAt).getTime();
      const tick=()=>{
        const secsLeft=Math.max(0,Math.ceil((expiry-Date.now())/1000));
        setCountdowns(prev=>({...prev,[order.id]:secsLeft}));
        // Update modal remaining if this is the active modal order
        setModalOrder(prev=>prev&&prev.id===order.id?{...prev}:prev);
        if(secsLeft<=0){
          clearInterval(countdownRef.current[order.id]);
          delete countdownRef.current[order.id];
          // Auto-settle: use displayPriceRef.current (always-fresh, avoids stale closure)
          // This is the fully-converged manipulated price at settlement time
          const settlePx=displayPriceRef.current;
          (api as any).post(`/trading/options/orders/${order.id}/settle`,{settlePrice:settlePx},token)
            .then((settled:any)=>{
              api.get<any[]>('/trading/options/orders',token).then(r=>setOptionsOrders(Array.isArray(r)?r:[])).catch(()=>{});
              fetchFuturesWallet();
              // Show settlement modal
              const result=settled?.data||settled;
              const updatedOrder:ModalOrder={
                ...order,
                status:result?.status||'LOSS',
                pnl:result?.pnl,
                settlePrice:result?.settlePrice||displayPrice,
              };
              setModalOrder(updatedOrder);
              setModalOpen(true);
              // Switch to Options orders tab
              setBottomTab('history');
            })
            .catch(()=>{});
        }
      };
      tick();
      countdownRef.current[order.id]=setInterval(tick,1000);
    });
    return()=>{};
  },[optionsOrders,token]);

  const redraw=useCallback(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const raw=candlesRef.current;if(raw.length===0)return;
    // Apply price offset to the most recent candle so the chart reflects manipulation
    let c=raw;
    if(priceOffsetRef.current!==0&&raw.length>0){
      c=[...raw];
      const last={...c[c.length-1]};
      last.c=last.c+priceOffsetRef.current;
      last.h=Math.max(last.h,last.c);
      last.l=Math.min(last.l,last.c);
      c[c.length-1]=last;
    }
    const vc=viewCountRef.current,vo=viewOffsetRef.current,total=c.length;
    const endIdx=Math.max(1,total-vo),startIdx=Math.max(0,endIdx-vc);
    const mouse=mouseRef.current;
    const result=drawChart(canvas,c,startIdx,endIdx,mouse?.x??null,mouse?.y??null,chartTypeRef.current);
    setIndicators(result);
  },[]);

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ro=new ResizeObserver(()=>{canvas.width=canvas.offsetWidth||900;canvas.height=canvas.offsetHeight||420;redraw();});
    ro.observe(canvas);return()=>ro.disconnect();
  },[redraw]);

  const handleWheel=useCallback((e:WheelEvent)=>{
    e.preventDefault();e.stopPropagation();
    const delta=e.deltaY>0?1:-1,factor=Math.max(1,Math.ceil(viewCountRef.current*0.08));
    setViewCount(prev=>Math.max(20,Math.min(candlesRef.current.length,prev+delta*factor)));
  },[]);
  useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;canvas.addEventListener('wheel',handleWheel,{passive:false});return()=>canvas.removeEventListener('wheel',handleWheel);},[handleWheel]);
  useEffect(()=>{redraw();},[candles,viewCount,viewOffset,redraw]);
  // Redraw whenever displayPrice changes so chart reflects the manipulated price
  useEffect(()=>{redraw();},[displayPrice,redraw]);
  useEffect(()=>{chartTypeRef.current=chartType;redraw();},[chartType,redraw]);
  useEffect(()=>{const h=()=>setIsFullscreen(!!document.fullscreenElement);document.addEventListener('fullscreenchange',h);return()=>document.removeEventListener('fullscreenchange',h);},[]);

  const switchPair=useCallback((p:TradingPair)=>{setPair(p);setShowSearch(false);setSearchQ('');setActiveSymbol(p.symbol);setViewOffset(0);setViewCount(100);setCandles([]);setOrderBook({asks:[],bids:[]});},[]);
  useEffect(()=>{const h=(e:MouseEvent)=>{if(searchRef.current&&!searchRef.current.contains(e.target as Node))setShowSearch(false);};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);},[]);

  const handleMouseMove=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const rect=canvas.getBoundingClientRect(),sx=canvas.width/rect.width,sy=canvas.height/rect.height;
    void sy;
    mouseRef.current={x:(e.clientX-rect.left)*sx,y:(e.clientY-rect.top)*sx};
    const container=chartContainerRef.current;
    if(container){const cr=container.getBoundingClientRect();setOverlayPos({x:e.clientX-cr.left,y:e.clientY-cr.top});}
    if(isDragging.current){const dx=e.clientX-dragStartX.current,vc=viewCountRef.current,cW=(canvas.width-68)/vc,delta=Math.round(-dx/cW);const newOff=Math.max(0,Math.min(candlesRef.current.length-vc,dragStartOff.current+delta));viewOffsetRef.current=newOff;setViewOffset(newOff);}
    redraw();
  },[redraw]);
  const handleMouseDown=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{isDragging.current=true;dragStartX.current=e.clientX;dragStartOff.current=viewOffsetRef.current;},[]);
  const handleMouseUp=useCallback(()=>{isDragging.current=false;},[]);
  const handleMouseLeave=useCallback(()=>{isDragging.current=false;mouseRef.current=null;setOverlayPos(null);redraw();},[redraw]);
  const handleScreenshot=useCallback(()=>{const canvas=canvasRef.current;if(!canvas)return;setScreenshotDataUrl(canvas.toDataURL('image/png'));setShowScreenshotModal(true);},[]);
  const toggleFullscreen=useCallback(()=>{if(!isFullscreen)chartSectionRef.current?.requestFullscreen?.();else document.exitFullscreen?.();},[isFullscreen]);

  const handlePerpSubmit=async(side:'long'|'short')=>{
    if(!isAuthenticated){navigate('/login',{state:{from:location}});return;}
    const amt=parseFloat(perpAmount);
    if(isNaN(amt)||amt<=0){toast.error('Enter a valid amount');return;}
    const payload:any={market:'futures/crypto',pair:pair.symbol,side:side==='long'?'BUY':'SELL',amount:amt,leverage,type:perpOrderType.toUpperCase()};
    if(perpOrderType==='limit'){const lp=parseFloat(perpLimitPrice);if(isNaN(lp)||lp<=0){toast.error('Enter a valid limit price');return;}payload.entryPrice=lp;}
    setIsSubmittingPerp(true);
    try{
      await api.post('/trading/futures/orders',payload,token);
      toast.success(`${side==='long'?'Long':'Short'} position opened!`);
      setPerpAmount('');
      api.get<any[]>('/trading/futures/orders',token).then(r=>setFuturesOrders(Array.isArray(r)?r:[])).catch(()=>{});
      fetchFuturesWallet();
    }catch(err:any){toast.error(err?.message||'Failed to open position');}
    finally{setIsSubmittingPerp(false);}
  };

  const handleOptSubmit=async()=>{
    if(!isAuthenticated){navigate('/login',{state:{from:location}});return;}
    const amt=parseFloat(optAmount);
    if(isNaN(amt)||amt<optInterval.min){toast.error(`Minimum amount is ${optInterval.min.toLocaleString()} USDT`);return;}
    if(amt>optInterval.max){toast.error(`Maximum amount is ${optInterval.max.toLocaleString()} USDT`);return;}
    if(isAuthenticated&&amt>futuresBalance){toast.error(`Insufficient balance. Available: ${futuresBalance.toFixed(2)} USDT`);return;}

    // ⚡ Open modal INSTANTLY with provisional data — don't wait for API
    const now=new Date();
    const provisionalExpiry=new Date(now.getTime()+optInterval.seconds*1000);
    const provisionalId='prov-'+Date.now();
    const provisionalOrder:ModalOrder={
      id:provisionalId,
      pair:pair.symbol,
      side:optSide.toUpperCase(),
      interval:optInterval.interval,
      seconds:optInterval.seconds,
      profitRate:optInterval.profitRate,
      amount:amt,
      entryPrice:displayPrice,
      createdAt:now.toISOString(),
      expiresAt:provisionalExpiry.toISOString(),
      status:'PENDING',
    };
    setModalOrder(provisionalOrder);
    setModalOpen(true);
    setBottomTab('current');
    setOptAmount('');
    setOptPct(null);
    setIsSubmittingOpt(true);

    try{
      const created:any=await api.post('/trading/options/orders',{
        pair:pair.symbol,
        side:optSide.toUpperCase(),
        interval:optInterval.interval,
        profitRate:optInterval.profitRate,
        callThreshold:CALL_THRESHOLD,
        amount:amt,
        entryPrice:displayPrice,
      },token);
      const orderData=created?.data||created;
      if(orderData?.id){
        // Update modal with real server order data
        const realOrder:ModalOrder={
          id:orderData.id,
          pair:orderData.pair||pair.symbol,
          side:orderData.side||optSide.toUpperCase(),
          interval:orderData.interval||optInterval.interval,
          seconds:optInterval.seconds,
          profitRate:orderData.profitRate||optInterval.profitRate,
          amount:orderData.amount||amt,
          entryPrice:orderData.entryPrice||displayPrice,
          createdAt:orderData.createdAt||now.toISOString(),
          expiresAt:orderData.expiresAt||provisionalExpiry.toISOString(),
          status:'PENDING',
        };
        setModalOrder(realOrder);
      }
      // Refresh orders list and wallet in background
      api.get<any[]>('/trading/options/orders',token).then(r=>setOptionsOrders(Array.isArray(r)?r:[])).catch(()=>{});
      fetchFuturesWallet();
    }catch(err:any){
      toast.error(err?.message||'Failed to place options order');
      setModalOpen(false);
      setModalOrder(null);
    }finally{
      setIsSubmittingOpt(false);
    }
  };

  const isUp=liveChange>=0;
  const filteredPairs=PAIRS.filter(p=>p.symbol.toLowerCase().includes(searchQ.toLowerCase()));
  const decimalPlaces=(b:string)=>['XRP','XLM','IOTA','ONT'].includes(b)?4:2;
  const mixedAsks=orderBook.asks.slice(0,11),mixedBids=orderBook.bids.slice(0,11);
  const soloAsks=orderBook.asks.slice(0,20),soloBids=orderBook.bids.slice(0,20);
  const cumSums=(entries:OrderBookEntry[])=>{let r=0;return entries.map(e=>{r+=e.amount;return r;});};
  const askCumSums=cumSums(mixedAsks),bidCumSums=cumSums(mixedBids);
  const soloAskCumSums=cumSums(soloAsks),soloBidCumSums=cumSums(soloBids);
  const maxAskCum=askCumSums[askCumSums.length-1]||1,maxBidCum=bidCumSums[bidCumSums.length-1]||1;
  const maxSoloAskCum=soloAskCumSums[soloAskCumSums.length-1]||1,maxSoloBidCum=soloBidCumSums[soloBidCumSums.length-1]||1;

  const buildOverlayRows=(hc:Candle|null)=>{
    if(!hc)return null;
    const ts=new Date(hc.t);
    const timeStr=`${ts.getFullYear()}/${String(ts.getMonth()+1).padStart(2,'0')}/${String(ts.getDate()).padStart(2,'0')} ${String(ts.getHours()).padStart(2,'0')}:${String(ts.getMinutes()).padStart(2,'0')}`;
    return[{label:'Time',val:timeStr,color:'#c8c8cc'},{label:'O',val:fmt(hc.o,2),color:'#c8c8cc'},{label:'H',val:fmt(hc.h,2),color:'#c8c8cc'},{label:'L',val:fmt(hc.l,2),color:'#c8c8cc'},{label:'C',val:fmt(hc.c,2),color:'#c8c8cc'},{label:'Volume',val:hc.v.toFixed(2),color:'#c8c8cc'}];
  };
  const overlayRows=buildOverlayRows(indicators.hovCandle);
  const OVERLAY_W=160,OVERLAY_H=128;
  const overlayStyle:React.CSSProperties=(()=>{
    const base:React.CSSProperties={position:'absolute',pointerEvents:'none',zIndex:20,background:'rgba(14,14,26,0.92)',border:'1px solid rgba(80,80,130,0.55)',borderRadius:4,padding:'6px 10px',fontFamily:"'Roboto Mono',monospace",fontSize:10,width:OVERLAY_W};
    if(!overlayPos)return{...base,top:8,left:8};
    const container=chartContainerRef.current;
    const maxX=container?container.clientWidth-OVERLAY_W-4:9999,maxY=container?container.clientHeight-OVERLAY_H-4:9999;
    let ox=overlayPos.x+14,oy=overlayPos.y+14;
    if(ox+OVERLAY_W>maxX)ox=overlayPos.x-OVERLAY_W-14;
    if(oy+OVERLAY_H>maxY)oy=overlayPos.y-OVERLAY_H-14;
    return{...base,top:Math.max(4,oy),left:Math.max(4,ox)};
  })();

  const SettingToggle=({label,value,onChange}:{label:string;value:boolean;onChange:(v:boolean)=>void})=>(
    <div className="flex items-center justify-between">
      <span style={{color:'#ccc'}}>{label}</span>
      <div onClick={()=>onChange(!value)} style={{width:36,height:20,borderRadius:10,cursor:'pointer',position:'relative',background:value?'#4a90e2':'#333355',transition:'background 0.2s'}}>
        <div style={{position:'absolute',top:3,left:value?18:3,width:14,height:14,borderRadius:'50%',background:'#fff',transition:'left 0.2s'}}/>
      </div>
    </div>
  );

  // suppress unused warnings
  void perpPct; void showHighPrice; void showLowPrice; void showLastPrice; void showLastIndicatorVal; void invertCoordinate; void showGrid; void activeMainIndicators; void activeSubIndicators; void selectedTimezone; void candlestickType;

  return (
    <>
    {/* Options Trade Modal */}
    {modalOpen&&modalOrder&&(
      <OptionsTradeModal
        order={modalOrder}
        displayPrice={displayPrice}
        onClose={()=>setModalOpen(false)}
      />
    )}
    <div className="flex flex-col text-white" style={{minHeight:'calc(100vh - 64px)',fontFamily:"'Roboto Mono',monospace,sans-serif",background:'#000000',gap:'2px'}}>

      {/* Top Stats Bar */}
      <div className="flex items-center w-full flex-shrink-0" style={{minHeight:60,background:'#0c0c0f'}}>
        <div ref={searchRef} className="relative flex-shrink-0 flex items-center px-4" style={{minWidth:190}}>
          <button onClick={()=>setShowSearch(!showSearch)} className="flex items-center gap-2 font-extrabold text-lg text-white hover:text-yellow-400 transition-colors whitespace-nowrap">
            {pair.symbol}<ChevronDown size={16} className={`transition-transform ${showSearch?'rotate-180':''}`}/>
          </button>
          {showSearch&&(
            <div className="absolute top-full left-0 mt-1 w-56 bg-[#131320] border border-[#2a2a3e] rounded-lg shadow-2xl z-50">
              <div className="p-2 border-b border-[#2a2a3e]">
                <div className="flex items-center gap-2 bg-[#1a1a2e] rounded px-2 py-1.5">
                  <Search size={12} className="text-gray-500"/>
                  <input autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search symbol" className="bg-transparent text-xs text-white placeholder-gray-500 outline-none w-full"/>
                </div>
              </div>
              <div className="px-2 pt-1 pb-1 text-[10px] text-gray-500 font-semibold">Trading Symbol</div>
              <div className="max-h-64 overflow-y-auto">
                {filteredPairs.map(p=>(
                  <button key={p.symbol} onClick={()=>switchPair(p)} className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1e1e32] transition-colors text-left ${p.symbol===pair.symbol?'bg-[#1e1e32]':''}`}>
                    {p.icon?<img src={p.icon} alt={p.base} className="w-5 h-5 rounded-full" onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>:<div className="w-5 h-5 rounded-full bg-[#2a2a3e] flex items-center justify-center text-[8px] text-gray-400">{p.base[0]}</div>}
                    <span className="text-xs text-white font-medium">{p.base}</span>
                    <span className="text-[10px] text-gray-500">/{p.quote}</span>
                    <span className={`ml-auto text-[10px] font-medium ${p.change>=0?'text-[#0ecb81]':'text-[#f6465d]'}`}>{p.change>=0?'+':''}{p.change.toFixed(2)}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 px-4">
          <div className={`text-base font-bold leading-tight ${isUp?'text-[#0ecb81]':'text-[#f6465d]'}`}>{fmt(livePrice,decimalPlaces(pair.base))}</div>
          <div className="text-sm font-medium text-white mt-0.5">${fmt(livePrice,decimalPlaces(pair.base))}</div>
        </div>
        <div className="flex flex-1 items-center justify-around h-full">
          <div className="flex flex-col justify-center"><div className="text-[11px] text-gray-400 mb-0.5">24h Change</div><div className={`text-sm font-semibold ${isUp?'text-[#0ecb81]':'text-[#f6465d]'}`}>{liveChangeAmt>=0?'+':''}{liveChangeAmt.toFixed(2)}&nbsp;&nbsp;{liveChange>=0?'+':''}{liveChange.toFixed(2)}%</div></div>
          <div className="flex flex-col justify-center"><div className="text-[11px] text-gray-400 mb-0.5">24h High</div><div className="text-sm font-semibold text-gray-100">{fmt(liveHigh,decimalPlaces(pair.base))}</div></div>
          <div className="flex flex-col justify-center"><div className="text-[11px] text-gray-400 mb-0.5">24h Low</div><div className="text-sm font-semibold text-gray-100">{fmt(liveLow,decimalPlaces(pair.base))}</div></div>
          <div className="flex flex-col justify-center"><div className="text-[11px] text-gray-400 mb-0.5">24h Vol ({pair.base})</div><div className="text-sm font-semibold text-gray-100">{pair.vol}</div></div>
          <div className="flex flex-col justify-center"><div className="text-[11px] text-gray-400 mb-0.5">24h Turnover (USDT)</div><div className="text-sm font-semibold text-gray-100">{pair.turnover}</div></div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex overflow-hidden" style={{gap:'2px',minHeight:'calc(110vh - 290px)'}}>

        {/* Chart Area */}
        <div ref={chartSectionRef} className="flex flex-col flex-1 overflow-hidden" style={{background:'#0c0c0f',position:'relative'}}>
          {/* Toolbar */}
          <div className="flex items-center flex-shrink-0 w-full" style={{height:48,background:'#0c0c0f',borderBottom:'1px solid #222230'}}>
            <div className="flex items-center gap-0 flex-shrink-0 h-full" style={{borderRight:'1px solid #222230'}}>
              <button title={showLeftBar?'Hide toolbar':'Show toolbar'} onClick={()=>setShowLeftBar(v=>!v)} className="flex items-center justify-center text-gray-400 hover:text-white transition-colors h-full" style={{width:48,borderRight:'1px solid #222230'}}>
                <svg width="22" height="18" viewBox="0 0 24 18" fill="none" style={{transform:showLeftBar?'rotate(0deg)':'rotate(180deg)',transition:'transform 0.3s ease'}}>
                  <rect x="0" y="0" width="24" height="2.6" rx="1.3" fill="currentColor"/><rect x="0" y="7.7" width="16" height="2.6" rx="1.3" fill="currentColor"/><rect x="0" y="15.4" width="24" height="2.6" rx="1.3" fill="currentColor"/>
                  <polyline points="10,2 5,9 10,16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </button>
              <span className="text-white font-extrabold tracking-wide px-4 whitespace-nowrap" style={{fontSize:16}}>{pair.symbol}</span>
            </div>
            <div className="flex items-center h-full px-3 gap-1 flex-shrink-0" style={{borderRight:'1px solid #222230'}}>
              <span className="text-gray-400 font-medium mr-2 cursor-pointer hover:text-white transition-colors" style={{fontSize:14}} onClick={()=>setChartType(ct=>ct==='line'?'candle':'line')}>
                {chartType==='line'?<span style={{color:'#5eb8ff'}}>Time</span>:'Time'}
              </span>
              {['1m','5m','15m','30m','1H','1D'].map(tf=>(
                <button key={tf} onClick={()=>{setTimeframe(tf);setChartType('candle');}} className="transition-colors font-medium"
                  style={{padding:'4px 10px',fontSize:14,borderRadius:5,background:timeframe===tf?'#1a3a5c':'transparent',color:timeframe===tf?'#5eb8ff':'#8888aa'}}
                  onMouseEnter={e=>{if(timeframe!==tf)(e.currentTarget as HTMLButtonElement).style.color='#ffffff';}}
                  onMouseLeave={e=>{if(timeframe!==tf)(e.currentTarget as HTMLButtonElement).style.color='#8888aa';}}>{tf}</button>
              ))}
            </div>
            <div className="flex items-center h-full" style={{borderLeft:'1px solid #222230'}}>
              <button title="Indicators" onClick={()=>setShowIndicatorModal(true)} className="flex items-center justify-center text-gray-300 hover:text-white transition-colors h-full" style={{width:52,borderRight:'1px solid #222230',fontFamily:'Georgia,serif',fontStyle:'italic',fontWeight:700,fontSize:15}}>
                <span style={{border:'1.5px solid #3a3a55',borderRadius:6,padding:'2px 6px',lineHeight:1}}><span style={{letterSpacing:'-1px'}}>f</span><span style={{fontStyle:'normal',fontWeight:900,fontSize:13}}>x</span></span>
              </button>
              <button title="Timezone" onClick={()=>setShowTimezoneModal(true)} className="flex items-center justify-center text-gray-400 hover:text-white transition-colors h-full" style={{width:52,borderRight:'1px solid #222230'}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              </button>
              <button title="Settings" onClick={()=>setShowSettingsModal(true)} className="flex items-center justify-center text-gray-400 hover:text-white transition-colors h-full" style={{width:52,borderRight:'1px solid #222230'}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
              <button title="Screenshot" onClick={handleScreenshot} className="flex items-center justify-center text-gray-400 hover:text-white transition-colors h-full" style={{width:52,borderRight:'1px solid #222230'}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </button>
              <button title={isFullscreen?'Exit Fullscreen':'Fullscreen'} onClick={toggleFullscreen} className="flex items-center justify-center text-gray-400 hover:text-white transition-colors h-full" style={{width:52}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {isFullscreen?<><polyline points="8 3 3 3 3 8"/><polyline points="21 8 21 3 16 3"/><polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/></>:<><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></>}
                </svg>
              </button>
            </div>
          </div>

          {/* Sidebar + Canvas */}
          <div className="flex flex-1 overflow-hidden" style={{gap:'2px'}}>
            {showLeftBar&&(
              <div className="flex-shrink-0 flex flex-col items-center" style={{width:48,background:'#0c0c0f',borderRight:'1px solid #222230'}}>
                {[{title:'Price Line',d:<><line x1="3" y1="12" x2="21" y2="12"/><circle cx="8" cy="12" r="2.2" fill="currentColor" stroke="none"/></>},{title:'Parallel',d:<><line x1="3" y1="15" x2="15" y2="4"/><line x1="9" y1="20" x2="21" y2="9"/></>},{title:'Circle',d:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/></>},{title:'Indicators',d:<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}].map((tool,i)=>(
                  <button key={i} title={tool.title} className="w-full flex items-center justify-center text-gray-500 hover:text-white transition-colors" style={{height:46}}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">{tool.d}</svg>
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-col flex-1 overflow-hidden bg-[#0c0c0f]">
              <div className="flex items-center gap-2 px-2 bg-[#0b0b10] flex-shrink-0" style={{height:20,borderBottom:'1px solid #111118'}}>
                <span className="text-[10px] text-gray-600">MA(5,10,30,60)</span>
                <span className="text-[10px]" style={{color:'#f5c518'}}>MA5: {fmt(indicators.ma5,2)}</span>
                <span className="text-[10px]" style={{color:'#f5a623'}}>MA10: {fmt(indicators.ma10,2)}</span>
                <span className="text-[10px]" style={{color:'#5090d3'}}>MA30: {fmt(indicators.ma30,2)}</span>
                <span className="text-[10px]" style={{color:'#e84393'}}>MA60: {fmt(indicators.ma60,2)}</span>
              </div>
              <div ref={chartContainerRef} className="flex-1 relative overflow-hidden" style={{cursor:isDragging.current?'grabbing':'crosshair'}}>
                <canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%'}} onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}/>
                {overlayRows&&(
                  <div style={overlayStyle}>
                    <table style={{borderCollapse:'collapse',width:'100%'}}><tbody>
                      {overlayRows.map(row=>(<tr key={row.label}><td style={{color:'rgba(150,150,175,0.85)',paddingRight:8,paddingTop:2,paddingBottom:2,whiteSpace:'nowrap',fontSize:10}}>{row.label}:</td><td style={{color:row.color,paddingTop:2,paddingBottom:2,whiteSpace:'nowrap',fontSize:10,textAlign:'right'}}>{row.val}</td></tr>))}
                    </tbody></table>
                  </div>
                )}
              </div>
              <div className="px-2 text-[10px] text-gray-600 bg-[#0b0b10] flex-shrink-0 flex items-center gap-2" style={{height:20,borderTop:'1px solid #1a1a24'}}>
                <span>VOL(5,10,20)</span>
                <span style={{color:'#f5c518'}}>MA5: {indicators.volMa5.toFixed(2)}</span>
                <span style={{color:'#5090d3'}}>MA10: {indicators.volMa10.toFixed(2)}</span>
                <span style={{color:'#e84393'}}>MA20: {indicators.volMa20.toFixed(2)}</span>
                <span className="text-gray-400">VOLUME: {indicators.lastVol.toFixed(2)}</span>
              </div>
            </div>

            {/* Chart Modals */}
            {showIndicatorModal&&(
              <div onClick={e=>{if(e.target===e.currentTarget)setShowIndicatorModal(false);}} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{background:'#1c1c1f',border:'1px solid #2a2a3a',borderRadius:4,minWidth:320,maxHeight:'80%',display:'flex',flexDirection:'column',color:'#fff',overflow:'hidden'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',borderBottom:'1px solid #2a2a3a'}}><span style={{fontSize:14,fontWeight:700}}>Indicator</span><button onClick={()=>setShowIndicatorModal(false)} style={{color:'#888',fontSize:16,background:'none',border:'none',cursor:'pointer'}}>✕</button></div>
                  <div style={{overflowY:'auto',padding:'14px 18px'}}>
                    <div style={{fontSize:12,color:'#777',fontWeight:600,marginBottom:10}}>Main Indicator</div>
                    {['MA (Moving Average)','EMA','BOLL (Bollinger Bands)','SAR'].map(ind=>(<label key={ind} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,fontSize:13,cursor:'pointer'}}><input type="checkbox" checked={activeMainIndicators.includes(ind)} onChange={e=>setActiveMainIndicators(prev=>e.target.checked?[...prev,ind]:prev.filter(i=>i!==ind))} style={{accentColor:'#4a90e2',width:14,height:14}}/>{ind}</label>))}
                    <div style={{fontSize:12,color:'#777',fontWeight:600,marginBottom:10,marginTop:14,paddingTop:10,borderTop:'1px solid #2a2a3a'}}>Sub Indicator</div>
                    {['VOL (Volume)','MACD','RSI','KDJ','BOLL'].map(ind=>(<label key={ind} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,fontSize:13,cursor:'pointer'}}><input type="checkbox" checked={activeSubIndicators.includes(ind)} onChange={e=>setActiveSubIndicators(prev=>e.target.checked?[...prev,ind]:prev.filter(i=>i!==ind))} style={{accentColor:'#4a90e2',width:14,height:14}}/>{ind}</label>))}
                  </div>
                </div>
              </div>
            )}
            {showTimezoneModal&&(
              <div onClick={e=>{if(e.target===e.currentTarget)setShowTimezoneModal(false);}} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{background:'#1c1c1f',border:'1px solid #2a2a3a',borderRadius:4,minWidth:320,color:'#fff'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',borderBottom:'1px solid #2a2a3a'}}><span style={{fontSize:14,fontWeight:700}}>Timezone</span><button onClick={()=>setShowTimezoneModal(false)} style={{color:'#888',fontSize:16,background:'none',border:'none',cursor:'pointer'}}>✕</button></div>
                  <div style={{padding:'18px 18px 20px'}}>
                    <select value={selectedTimezone} onChange={e=>setSelectedTimezone(e.target.value)} style={{width:'100%',background:'#111114',border:'1px solid #2a2a3a',borderRadius:4,padding:'8px 10px',color:'#fff',fontSize:13,cursor:'pointer',outline:'none',marginBottom:20}}>
                      {['UTC (Coordinated Universal Time)','(UTC+5) Ashkhabad','(UTC+8) Shanghai','(UTC+9) Tokyo'].map(tz=><option key={tz}>{tz}</option>)}
                    </select>
                    <div style={{display:'flex',justifyContent:'flex-end'}}><button onClick={()=>setShowTimezoneModal(false)} style={{background:'#4a90e2',color:'#fff',border:'none',borderRadius:4,padding:'7px 24px',fontSize:13,cursor:'pointer',fontWeight:600}}>Confirm</button></div>
                  </div>
                </div>
              </div>
            )}
            {showSettingsModal&&(
              <div onClick={e=>{if(e.target===e.currentTarget)setShowSettingsModal(false);}} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{background:'#1c1c1f',border:'1px solid #2a2a3a',borderRadius:4,minWidth:440,color:'#fff'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',borderBottom:'1px solid #2a2a3a'}}><span style={{fontSize:14,fontWeight:700}}>Setting</span><button onClick={()=>setShowSettingsModal(false)} style={{color:'#888',fontSize:16,background:'none',border:'none',cursor:'pointer'}}>✕</button></div>
                  <div style={{padding:'18px 18px 8px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px 24px',fontSize:13}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                      <span style={{color:'#bbb'}}>Candlestick Type</span>
                      <select value={candlestickType} onChange={e=>setCandlestickType(e.target.value)} style={{background:'#111114',border:'1px solid #2a2a3a',borderRadius:4,padding:'3px 8px',color:'#fff',fontSize:12,cursor:'pointer',outline:'none'}}>
                        {['Full Solid','Full Hollow','OHLC','Area Chart'].map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <SettingToggle label="Show Last Price" value={showLastPrice} onChange={setShowLastPrice}/>
                    <SettingToggle label="Show High Price" value={showHighPrice} onChange={setShowHighPrice}/>
                    <SettingToggle label="Show Low Price" value={showLowPrice} onChange={setShowLowPrice}/>
                    <SettingToggle label="Show Last Indicator Val" value={showLastIndicatorVal} onChange={setShowLastIndicatorVal}/>
                    <SettingToggle label="Invert Coordinate" value={invertCoordinate} onChange={setInvertCoordinate}/>
                    <SettingToggle label="Show Grid" value={showGrid} onChange={setShowGrid}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'flex-end',padding:'12px 18px 16px'}}>
                    <button onClick={()=>{setCandlestickType('Full Solid');setShowLastPrice(true);setShowHighPrice(true);setShowLowPrice(true);setShowLastIndicatorVal(false);setInvertCoordinate(false);setShowGrid(true);}} style={{background:'#2a2a3a',color:'#999',border:'1px solid #3a3a4a',borderRadius:4,padding:'7px 18px',fontSize:13,cursor:'pointer'}}>Restore Default</button>
                  </div>
                </div>
              </div>
            )}
            {showScreenshotModal&&(
              <div onClick={e=>{if(e.target===e.currentTarget)setShowScreenshotModal(false);}} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.65)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{background:'#1c1c1f',border:'1px solid #2a2a3a',borderRadius:4,minWidth:340,maxWidth:560,width:'90%',color:'#fff',maxHeight:'82%',display:'flex',flexDirection:'column'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom:'1px solid #2a2a3a',flexShrink:0}}><span style={{fontSize:13,fontWeight:700}}>Screenshot</span><button onClick={()=>setShowScreenshotModal(false)} style={{color:'#aaa',fontSize:18,background:'none',border:'none',cursor:'pointer'}}>✕</button></div>
                  <div style={{padding:'14px 16px 16px',overflowY:'auto'}}>
                    <img src={screenshotDataUrl} alt="Chart screenshot" style={{width:'100%',maxHeight:260,objectFit:'contain',borderRadius:3,border:'1px solid #2a2a3a',marginBottom:14,display:'block'}}/>
                    <div style={{display:'flex',justifyContent:'flex-end'}}><a href={screenshotDataUrl} download="chart-screenshot.png" style={{background:'#4a90e2',color:'#fff',borderRadius:4,padding:'7px 24px',fontSize:13,fontWeight:600,textDecoration:'none',display:'inline-block'}}>Save</a></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ORDER BOOK PANEL */}
        <div className="flex-shrink-0 flex flex-col overflow-hidden" style={{width:'calc(7.5% + 184px)',background:'#0b0b10'}}>
          <div style={{padding:'14px 12px 12px 12px',borderBottom:'1px solid #1e1e2e',flexShrink:0}}><span style={{color:'#c8c8d0',fontSize:14}}>Limit</span></div>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'12px 10px 10px 10px',flexShrink:0}}>
            {(['mixed','bids','asks'] as const).map((view,i)=>{const Icon=i===0?IconMixed:i===1?IconBids:IconAsks;return(<button key={view} onClick={()=>setOrderBookView(view)} title={view} style={{padding:'3px 4px',borderRadius:3,border:'none',background:orderBookView===view?'rgba(255,255,255,0.09)':'transparent',cursor:'pointer',lineHeight:0,display:'flex',alignItems:'center',justifyContent:'center',outline:'none'}}><Icon active={orderBookView===view}/></button>);})}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',padding:'4px 10px',flexShrink:0}}><span style={{fontSize:14,color:'#9ca3af'}}>Price($)</span><span style={{fontSize:14,color:'#9ca3af'}}>Amount</span></div>
          <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
            {orderBookView==='mixed'&&(<>
              <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
                {mixedAsks.slice().reverse().map((ask,ri)=>{const oi=mixedAsks.length-1-ri,bp=(askCumSums[oi]/maxAskCum)*100;return(<div key={ask.price.toString()} style={{position:'relative',height:26,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 10px'}}><div style={{position:'absolute',right:0,top:0,height:'100%',width:`${bp}%`,background:'rgba(202,63,100,0.23)',pointerEvents:'none'}}/><span style={{position:'relative',zIndex:1,fontSize:12,color:'#f6465d'}}>{fmt(ask.price,2)}</span><span style={{position:'relative',zIndex:1,fontSize:12,color:'#c8c8d0'}}>{ask.amount<0.0001?ask.amount.toExponential(2):ask.amount<1?ask.amount.toPrecision(4):fmt(ask.amount,4)}</span></div>);})}
              </div>
              <div style={{flexShrink:0,height:32,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 10px',background:isUp?'rgba(14,203,129,0.07)':'rgba(246,70,93,0.07)',borderTop:`1px solid ${isUp?'rgba(14,203,129,0.2)':'rgba(246,70,93,0.2)'}`,borderBottom:`1px solid ${isUp?'rgba(14,203,129,0.2)':'rgba(246,70,93,0.2)'}`}}>
                <span style={{fontSize:15,fontWeight:700,color:isUp?'#0ecb81':'#f6465d'}}>{fmt(livePrice,decimalPlaces(pair.base))}</span>
                <span style={{fontSize:11,color:isUp?'#0ecb81':'#f6465d',opacity:0.75}}>{isUp?'▲':'▼'}</span>
              </div>
              <div style={{flex:1,overflow:'hidden'}}>
                {mixedBids.map((bid,i)=>{const bp=(bidCumSums[i]/maxBidCum)*100;return(<div key={bid.price.toString()} style={{position:'relative',height:26,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 10px'}}><div style={{position:'absolute',right:0,top:0,height:'100%',width:`${bp}%`,background:'rgba(14,203,129,0.2)',pointerEvents:'none'}}/><span style={{position:'relative',zIndex:1,fontSize:12,color:'#0ecb81'}}>{fmt(bid.price,2)}</span><span style={{position:'relative',zIndex:1,fontSize:12,color:'#c8c8d0'}}>{bid.amount<0.0001?bid.amount.toExponential(2):bid.amount<1?bid.amount.toPrecision(4):fmt(bid.amount,4)}</span></div>);})}
              </div>
            </>)}
            {orderBookView==='bids'&&(<div style={{overflow:'hidden'}}>{soloBids.map((bid,i)=>{const bp=(soloBidCumSums[i]/maxSoloBidCum)*100;return(<div key={bid.price.toString()} style={{position:'relative',height:26,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 10px'}}><div style={{position:'absolute',right:0,top:0,height:'100%',width:`${bp}%`,background:'rgba(14,203,129,0.2)',pointerEvents:'none'}}/><span style={{position:'relative',zIndex:1,fontSize:12,color:'#0ecb81'}}>{fmt(bid.price,2)}</span><span style={{position:'relative',zIndex:1,fontSize:12,color:'#c8c8d0'}}>{bid.amount<0.0001?bid.amount.toExponential(2):bid.amount<1?bid.amount.toPrecision(4):fmt(bid.amount,4)}</span></div>);})}</div>)}
            {orderBookView==='asks'&&(<div style={{overflow:'hidden'}}>{soloAsks.slice().reverse().map((ask,ri)=>{const oi=soloAsks.length-1-ri,bp=(soloAskCumSums[oi]/maxSoloAskCum)*100;return(<div key={ask.price.toString()} style={{position:'relative',height:26,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 10px'}}><div style={{position:'absolute',right:0,top:0,height:'100%',width:`${bp}%`,background:'rgba(202,63,100,0.23)',pointerEvents:'none'}}/><span style={{position:'relative',zIndex:1,fontSize:12,color:'#f6465d'}}>{fmt(ask.price,2)}</span><span style={{position:'relative',zIndex:1,fontSize:12,color:'#c8c8d0'}}>{ask.amount<0.0001?ask.amount.toExponential(2):ask.amount<1?ask.amount.toPrecision(4):fmt(ask.amount,4)}</span></div>);})}</div>)}
          </div>
        </div>

        {/* FUTURES TRADING PANEL */}
        <div className="flex-shrink-0 flex flex-col overflow-y-auto" style={{width:'calc(7.5% + 184px)',background:'#14151a',fontFamily:"'Inter',sans-serif"}}>
          <div style={{display:'flex',borderBottom:'1px solid #2a2a3a',flexShrink:0}}>
            <button onClick={()=>setRightTab('perpetual')} style={{flex:1,padding:'14px 6px',background:'none',border:'none',cursor:'pointer',fontSize:13,fontWeight:rightTab==='perpetual'?700:400,color:rightTab==='perpetual'?'#ffffff':'#6b7280',borderBottom:rightTab==='perpetual'?'2px solid #4a90e2':'2px solid transparent',transition:'all 0.15s',marginBottom:-1}}>Perpetual contract</button>
            <button onClick={()=>setRightTab('options')} style={{flex:1,padding:'14px 6px',background:'none',border:'none',cursor:'pointer',fontSize:13,fontWeight:rightTab==='options'?700:400,color:rightTab==='options'?'#ffffff':'#6b7280',borderBottom:rightTab==='options'?'2px solid #4a90e2':'2px solid transparent',transition:'all 0.15s',marginBottom:-1}}>Options</button>
          </div>

          {/* PERPETUAL TAB */}
          {rightTab==='perpetual'&&(
            <div style={{padding:'16px 16px 24px',display:'flex',flexDirection:'column',gap:18}}>
              <LeverageSlider value={leverage} onChange={setLeverage}/>
              <div style={{display:'flex',gap:20}}>
                {(['market','limit'] as const).map(t=>(<button key={t} onClick={()=>setPerpOrderType(t)} style={{background:'none',border:'none',padding:0,fontSize:16,fontWeight:perpOrderType===t?700:400,color:perpOrderType===t?'#fff':'#6b7280',cursor:'pointer',textTransform:'capitalize'}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>))}
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#292d33',borderRadius:8,padding:'12px 14px',gap:6}}>
                <span style={{color:'#9ca3af',fontSize:15}}>Price</span>
                {perpOrderType==='market'?(<span style={{flex:1,textAlign:'center',color:'#9ca3af',fontSize:15}}>Market</span>):(<input type="number" value={perpLimitPrice} onChange={e=>setPerpLimitPrice(e.target.value)} style={{flex:1,background:'transparent',border:'none',outline:'none',textAlign:'right',color:'#fff',fontSize:15,minWidth:0}} placeholder={livePrice.toFixed(2)}/>)}
                <span style={{color:'#9ca3af',fontSize:15}}>USDT</span>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#292d33',borderRadius:8,padding:'12px 14px',gap:6}}>
                <span style={{color:'#9ca3af',fontSize:15}}>Amount</span>
                <input type="number" value={perpAmount} onChange={e=>setPerpAmount(e.target.value)} style={{flex:1,background:'transparent',border:'none',outline:'none',textAlign:'right',color:'#fff',fontSize:15,minWidth:0}} placeholder="0"/>
                <span style={{color:'#9ca3af',fontSize:15}}>USDT</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#6b7280',fontSize:12}}>Minimum 1</span><span style={{color:'#6b7280',fontSize:12}}>Maximum 1000000</span></div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {([0.25,0.5,0.75,1] as const).map(pct=>(<button key={pct} onClick={()=>setPerpPct(pct)} style={{padding:'10px 0',background:perpPct===pct?'#fff':'#292d33',border:'1px solid #4a4a5e',borderRadius:6,color:perpPct===pct?'#000':'#7a7a90',fontSize:13,cursor:'pointer'}}>{pct*100}%</button>))}
              </div>
              <TpSlToggle enabled={tpslEnabled} onToggle={()=>setTpslEnabled(v=>!v)}/>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#292d33',borderRadius:8,padding:'12px 14px',gap:6}}>
                <span style={{color:'#9ca3af',fontSize:15}}>Volume</span>
                <input type="number" value={perpVolume} onChange={e=>setPerpVolume(e.target.value)} style={{flex:1,background:'transparent',border:'none',outline:'none',textAlign:'right',color:'#fff',fontSize:15,minWidth:0}} placeholder="0"/>
                <span style={{color:'#9ca3af',fontSize:15}}>USDT</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#9ca3af',fontSize:14}}>Balance</span><span style={{color:'#fff',fontSize:14}}>0 <span style={{color:'#9ca3af'}}>USDT ⓘ</span></span></div>
                <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#9ca3af',fontSize:14}}>Available</span><span style={{color:'#fff',fontSize:14}}>0 USDT</span></div>
              </div>
              {isAuthenticated?(
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>handlePerpSubmit('long')} disabled={isSubmittingPerp} style={{flex:1,padding:'12px 0',borderRadius:6,border:'none',background:'#25a750',color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',opacity:isSubmittingPerp?0.7:1}}>{isSubmittingPerp?'...':'Buy Long'}</button>
                  <button onClick={()=>handlePerpSubmit('short')} disabled={isSubmittingPerp} style={{flex:1,padding:'12px 0',borderRadius:6,border:'none',background:'#ca3f64',color:'#fff',fontWeight:700,fontSize:15,cursor:'pointer',opacity:isSubmittingPerp?0.7:1}}>{isSubmittingPerp?'...':'Sell Short'}</button>
                </div>
              ):(
                <button onClick={()=>navigate('/login',{state:{from:location}})} style={{width:'100%',padding:'12px 0',borderRadius:6,border:'1px solid rgba(232,121,160,0.35)',background:'#1a1a2e',color:'#e879a0',fontWeight:700,fontSize:15,cursor:'pointer'}}>Login or Register</button>
              )}
            </div>
          )}

          {/* OPTIONS TAB */}
          {rightTab==='options'&&(
            <div style={{padding:'16px 16px 24px',display:'flex',flexDirection:'column',gap:18}}>

              {/* Balance / Available — live from FUTURES wallet */}
              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{color:'#9ca3af',fontSize:14}}>Balance</span>
                  <span style={{color:'#fff',fontSize:14}}>
                    {isAuthenticated ? `${futuresBalance.toFixed(2)} USDT` : '0 USDT'}
                  </span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{color:'#9ca3af',fontSize:14}}>Available</span>
                  <span style={{color:'#fff',fontSize:14}}>
                    {isAuthenticated
                      ? `${(futuresBalance - futuresBalance * OPTIONS_FEE_RATE).toFixed(2)} USDT`
                      : '0  USDT'}
                  </span>
                </div>
                {/* ⓘ tooltip — below Available row, left-aligned */}
                <div style={{position:'relative',display:'inline-block'}} title={`Available ≈ Balance - Balance × Fees (Fee rate: ${(OPTIONS_FEE_RATE*100).toFixed(1)}%)\nYour spendable balance after accounting for trading fees.`}>
                  <span style={{color:'#9ca3af',fontSize:14,cursor:'help',userSelect:'none'}}>ⓘ</span>
                </div>
              </div>

              {/* Long / Short pill */}
              <div style={{display:'flex',background:'#14151a',borderRadius:999,padding:3,border:'1px solid #3a3a50'}}>
                <button onClick={()=>setOptSide('long')} style={{flex:1,padding:'10px 0',borderRadius:999,border:'none',background:optSide==='long'?'#25a750':'transparent',color:optSide==='long'?'#fff':'#6b7280',fontWeight:700,fontSize:16,cursor:'pointer',transition:'background 0.18s'}}>Long</button>
                <button onClick={()=>setOptSide('short')} style={{flex:1,padding:'10px 0',borderRadius:999,border:'none',background:optSide==='short'?'#ca3f64':'transparent',color:optSide==='short'?'#fff':'#6b7280',fontWeight:700,fontSize:16,cursor:'pointer',transition:'background 0.18s'}}>Short</button>
              </div>

              {/* Interval dropdown */}
              <div style={{position:'relative'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#292d33',borderRadius:8,padding:'12px 14px',cursor:'pointer'}} onClick={()=>setShowIntervalDropdown(v=>!v)}>
                  <span style={{color:'#9ca3af',fontSize:15}}>Interval</span>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{color:'#fff',fontSize:15,fontWeight:500}}>{optInterval.label}</span>
                    <ChevronDown size={16} style={{color:'#9ca3af',transform:showIntervalDropdown?'rotate(180deg)':'none',transition:'transform 0.15s'}}/>
                  </div>
                </div>
                {showIntervalDropdown&&(
                  <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#1e2026',border:'1px solid #2a2a3a',borderRadius:8,zIndex:30,marginTop:4,overflow:'hidden'}}>
                    {OPTIONS_INTERVALS.map(iv=>(
                      <button key={iv.label} onClick={()=>{setOptInterval(iv);setShowIntervalDropdown(false);setOptAmount('');setOptPct(null);}} style={{width:'100%',padding:'11px 20px',background:optInterval.label===iv.label?'#292d33':'transparent',border:'none',color:'#9ca3af',fontSize:15,cursor:'pointer',textAlign:'left',fontWeight:optInterval.label===iv.label?700:400}}>
                        {iv.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount input */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#292d33',borderRadius:8,padding:'12px 14px',gap:6}}>
                <span style={{color:'#9ca3af',fontSize:15}}>Amount</span>
                <input
                  type="number"
                  value={optAmount}
                  onChange={e=>{
                    setOptAmount(e.target.value);
                    setOptPct(null);
                  }}
                  style={{flex:1,background:'transparent',border:'none',outline:'none',textAlign:'center',color:'#fff',fontSize:15,minWidth:0}}
                  placeholder="0"
                  min={optInterval.min}
                  max={optInterval.max}
                />
                <span style={{color:'#9ca3af',fontSize:15}}>USDT</span>
              </div>

              {/* Min / Max hint — changes per interval */}
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{color:'#6b7280',fontSize:12}}>Minimum {optInterval.min.toLocaleString()}</span>
                <span style={{color:'#6b7280',fontSize:12}}>Maximum {optInterval.max.toLocaleString()}</span>
              </div>

              {/* Percentage quick-fill buttons */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {([0.25,0.5,0.75,1] as const).map(pct=>(
                  <button
                    key={pct}
                    onClick={()=>{
                      const avail=futuresAvailable;
                      const calc=parseFloat((pct*avail).toFixed(2));
                      setOptAmount(calc>0?String(calc):'');
                      setOptPct(pct);
                    }}
                    style={{padding:'10px 0',background:optPct===pct?'#fff':'#292d33',border:'1px solid #4a4a5e',borderRadius:6,color:optPct===pct?'#000':'#7a7a90',fontSize:13,cursor:'pointer',fontWeight:optPct===pct?700:400}}
                  >
                    {pct*100}%
                  </button>
                ))}
              </div>

              {/* Call / Put condition display */}
              <div style={{background:'#1e2026',borderRadius:8,padding:'11px 14px',display:'flex',alignItems:'center',gap:6}}>
                <span style={{color:'#9ca3af',fontSize:14,flex:1}}>
                  {optSide==='long'?'Call |> ':'Put |< '}{(CALL_THRESHOLD*100).toFixed(2)}%
                </span>
                <span style={{color:'#6b7280',fontSize:14}}>(*)</span>
              </div>

              {/* Action button */}
              {isAuthenticated?(
                <button
                  onClick={handleOptSubmit}
                  disabled={isSubmittingOpt||parseFloat(optAmount)<optInterval.min||parseFloat(optAmount)>Math.min(optInterval.max,futuresBalance)}
                  style={{width:'100%',padding:'13px 0',borderRadius:6,border:'none',background:optSide==='long'?'#25a750':'#ca3f64',color:'#fff',fontWeight:700,fontSize:16,cursor:'pointer',opacity:(isSubmittingOpt||parseFloat(optAmount)<optInterval.min||parseFloat(optAmount)>Math.min(optInterval.max,futuresBalance))?0.7:1}}
                >
                  {isSubmittingOpt?'Placing...':(optSide==='long'?'Buy Long':'Buy Short')}
                </button>
              ):(
                <button onClick={()=>navigate('/login',{state:{from:location}})} style={{width:'100%',padding:'13px 0',borderRadius:6,border:'1px solid rgba(232,121,160,0.35)',background:'#1a1a2e',color:'#e879a0',fontWeight:700,fontSize:15,cursor:'pointer'}}>Login or Register</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tabs */}
      <div className="flex-shrink-0" style={{minHeight:400,background:'#0b0b10',fontFamily:"'Inter',sans-serif"}}>
        <div className="flex items-center px-4" style={{height:48,borderBottom:'1px solid #222230'}}>
          <div className="flex items-center gap-8 h-full">
            {(['current','history'] as const).map(t=>{
              const label=t==='current'?'Current order':'Options orders';
              return(<button key={t} onClick={()=>setBottomTab(t)} style={{background:'none',border:'none',padding:0,height:'100%',cursor:'pointer',fontSize:17,fontWeight:bottomTab===t?600:400,color:bottomTab===t?'#fff':'#818181'}}>{label}</button>);
            })}
          </div>
        </div>

        {/* Current order: PENDING options orders only */}
        {bottomTab==='current'&&(
          <div className="overflow-x-auto">
            {optionsOrders.filter((o:any)=>o.status==='PENDING').length>0?(
              <table className="w-full" style={{fontSize:14}}>
                <thead><tr>{['Time','Symbol','Amount','Price','Direction','Options Duration','Rate %'].map(h=>(<th key={h} style={{padding:'12px 16px',textAlign:'left',color:'#70798c',fontWeight:400,fontSize:13}}>{h}</th>))}</tr></thead>
                <tbody>
                  {optionsOrders.filter((o:any)=>o.status==='PENDING').map((o:any)=>{
                    const secs=countdowns[o.id]??0;
                    const totalSecs=OPTIONS_INTERVALS.find(iv=>iv.interval===o.interval)?.seconds||30;
                    return(
                      <tr key={o.id}
                        onClick={()=>{
                          const mo:ModalOrder={id:o.id,pair:o.pair,side:o.side,interval:o.interval,
                            seconds:totalSecs,profitRate:o.profitRate,amount:o.amount,
                            entryPrice:o.entryPrice,createdAt:o.createdAt,expiresAt:o.expiresAt,status:'PENDING'};
                          setModalOrder(mo);
                          setModalOpen(true);
                        }}
                        style={{borderTop:'1px solid #1e1e2e',cursor:'pointer'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='rgba(255,255,255,0.03)'}
                        onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background='transparent'}
                      >
                        <td style={{padding:'10px 16px',color:'#9ca3af',fontSize:13}}>{new Date(o.createdAt).toLocaleString()}</td>
                        <td style={{padding:'10px 16px',color:'#fff',fontWeight:600}}>{o.pair}</td>
                        <td style={{padding:'10px 16px',color:'#fff'}}>{o.amount.toLocaleString()} USDT</td>
                        <td style={{padding:'10px 16px',color:'#fff'}}>{o.entryPrice.toLocaleString('en-US',{minimumFractionDigits:1})} USDT</td>
                        <td style={{padding:'10px 16px',color:o.side==='LONG'?'#0ecb81':'#ca3f64',fontWeight:600}}>{o.side==='LONG'?'Long':'Short'}</td>
                        <td style={{padding:'10px 16px'}}>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <span style={{color:'#fff'}}>{o.interval}</span>
                            {secs>0&&(
                              <span style={{color:'#5eb8ff',fontSize:12,fontFamily:'monospace'}}>
                                {String(Math.floor(secs/60)).padStart(2,'0')}:{String(secs%60).padStart(2,'0')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{padding:'10px 16px',color:'#fff'}}>{((o.profitRate||0)*100).toFixed(0)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ):(<div style={{textAlign:'center',padding:'36px 0',color:'#70798c',fontSize:16}}>No active orders</div>)}
          </div>
        )}

        {/* Options orders: all settled options orders */}
        {bottomTab==='history'&&(
          <div className="overflow-x-auto">
            {optionsOrders.filter((o:any)=>o.status!=='PENDING').length>0?(
              <table className="w-full" style={{fontSize:14}}>
                <thead><tr>{['Time','Symbol','Amount','Price','Direction','Options Duration','Rate %','Profit situation','Settlement Price','Fees','Status'].map(h=>(<th key={h} style={{padding:'12px 16px',textAlign:'left',color:'#70798c',fontWeight:400,fontSize:13}}>{h}</th>))}</tr></thead>
                <tbody>
                  {optionsOrders.filter((o:any)=>o.status!=='PENDING')
                    .sort((a:any,b:any)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())
                    .map((o:any)=>(
                      <tr key={o.id} style={{borderTop:'1px solid #1e1e2e'}}>
                        <td style={{padding:'10px 16px',color:'#9ca3af',fontSize:13}}>{new Date(o.createdAt).toLocaleString()}</td>
                        <td style={{padding:'10px 16px',color:'#fff',fontWeight:600}}>{o.pair}</td>
                        <td style={{padding:'10px 16px',color:'#fff'}}>{o.amount.toLocaleString()} USDT</td>
                        <td style={{padding:'10px 16px',color:'#fff'}}>{(o.entryPrice||0).toLocaleString('en-US',{minimumFractionDigits:1})} USDT</td>
                        <td style={{padding:'10px 16px',color:o.side==='LONG'?'#0ecb81':'#ca3f64',fontWeight:600}}>{o.side==='LONG'?'Long':'Short'}</td>
                        <td style={{padding:'10px 16px',color:'#fff'}}>{o.interval}</td>
                        <td style={{padding:'10px 16px',color:'#fff'}}>{((o.profitRate||0)*100).toFixed(0)}%</td>
                        <td style={{padding:'10px 16px',color:o.status==='WIN'?'#0ecb81':'#f6465d',fontWeight:600}}>
                          {o.status==='WIN'?`+${((o.amount||0)*(o.profitRate||0)).toFixed(1)} USDT`:`-${(o.amount||0).toFixed(1)} USDT`}
                        </td>
                        <td style={{padding:'10px 16px',color:'#9ca3af',fontSize:13}}>{o.settlePrice?(o.settlePrice.toLocaleString('en-US',{minimumFractionDigits:1})+' USDT'):'—'}</td>
                        <td style={{padding:'10px 16px',color:'#9ca3af',fontSize:13}}>{((o.amount||0)*0.001).toFixed(2)} USDT</td>
                        <td style={{padding:'10px 16px'}}>
                          <span style={{background:o.status==='WIN'?'rgba(14,203,129,0.15)':'rgba(246,70,93,0.15)',color:o.status==='WIN'?'#0ecb81':'#f6465d',borderRadius:4,padding:'2px 8px',fontSize:12,fontWeight:600}}>Done</span>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            ):(<div style={{textAlign:'center',padding:'36px 0',color:'#70798c',fontSize:16}}>No records</div>)}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default FuturesTrading;
