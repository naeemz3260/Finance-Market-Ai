// ═══════════════════════════════════════════════
//   FinanceMarket AI — script.js
//   Real-Time Intelligence + AI Agent
// ═══════════════════════════════════════════════

// ── Market Data (realistic, updates on refresh) ──
const MARKET_DATA = {
  bitcoin:   { name:'Bitcoin',    type:'Crypto',      symbol:'BTC',  base:108000, change:+3.2 },
  ethereum:  { name:'Ethereum',   type:'Crypto',      symbol:'ETH',  base:3850,   change:+2.1 },
  gold:      { name:'Gold',       type:'Commodity',   symbol:'XAU',  base:2342,   change:+0.8 },
  silver:    { name:'Silver',     type:'Commodity',   symbol:'XAG',  base:29.4,   change:-0.4 },
  apple:     { name:'Apple',      type:'Stock',       symbol:'AAPL', base:213.5,  change:+1.4 },
  tesla:     { name:'Tesla',      type:'Stock',       symbol:'TSLA', base:248.3,  change:-2.1 },
  sp500:     { name:'S&P 500',    type:'Index',       symbol:'SPX',  base:5482,   change:+0.6 },
  nasdaq:    { name:'NASDAQ',     type:'Index',       symbol:'NDX',  base:19820,  change:+0.9 },
  usdpkr:    { name:'USD/PKR',    type:'Forex',       symbol:'PKR',  base:278.5,  change:+0.2 },
  eurusd:    { name:'EUR/USD',    type:'Forex',       symbol:'EUR',  base:1.085,  change:-0.1 },
  oil:       { name:'Crude Oil',  type:'Commodity',   symbol:'WTI',  base:78.4,   change:-1.2 },
  microsoft: { name:'Microsoft',  type:'Stock',       symbol:'MSFT', base:415.2,  change:+0.7 },
};

// Add live price variance
function getLivePrice(base) {
  const drift = (Math.random() - 0.49) * 0.003;
  return base * (1 + drift);
}
function getLiveChange(base) {
  return +(base + (Math.random() - 0.48) * 0.5).toFixed(2);
}

// ── Signal Logic ──────────────────────────────────
function getSignal(change) {
  if (change > 1.5) return { label: '🟢 STRONG BUY', cls: 'buy' };
  if (change > 0)   return { label: '🟢 BUY',        cls: 'buy' };
  if (change > -1)  return { label: '🟡 HOLD',       cls: 'hold' };
  return               { label: '🔴 SELL',            cls: 'sell' };
}

function fmtPrice(key, price) {
  if (key === 'eurusd') return price.toFixed(4);
  if (key === 'usdpkr') return price.toFixed(2);
  if (price > 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return price.toFixed(2);
}

// ── Init ──────────────────────────────────────────
window.onload = () => {
  tick();
  setInterval(tick, 1000);
  renderTicker();
  renderMarketGrid('market-grid', 8);
  renderMarketGrid('markets-full-grid', 12);
  renderPredictions();
  renderNews();
  renderHeatmap();
  renderMainChart('bitcoin');
  renderPredCharts();
  renderSentimentChart();
  renderImpactScores();
  setInterval(liveUpdate, 4000);
};

function tick() {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
}

// ── Navigation ────────────────────────────────────
function nav(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if (el) el.classList.add('active');
  else document.querySelector(`[onclick*="'${page}'"]`)?.classList.add('active');
}

// ── Ticker Strip ──────────────────────────────────
function renderTicker() {
  const track = document.getElementById('ticker-track');
  const items = Object.entries(MARKET_DATA).map(([k, m]) => {
    const price = getLivePrice(m.base);
    const chg = getLiveChange(m.change);
    return `<div class="ticker-item">
      <span class="ticker-name">${m.symbol}</span>
      <span class="ticker-price">$${fmtPrice(k, price)}</span>
      <span class="ticker-chg ${chg >= 0 ? 'up' : 'dn'}">${chg >= 0 ? '+' : ''}${chg}%</span>
    </div>`;
  }).join('');
  // Duplicate for infinite scroll
  track.innerHTML = items + items;
}

// ── Market Grid ───────────────────────────────────
function renderMarketGrid(id, count) {
  const el = document.getElementById(id);
  if (!el) return;
  const entries = Object.entries(MARKET_DATA).slice(0, count);
  el.innerHTML = entries.map(([key, m], i) => {
    const price = getLivePrice(m.base);
    const chg = getLiveChange(m.change);
    const sig = getSignal(chg);
    return `<div class="market-card" style="animation-delay:${i * 0.07}s" onclick="selectChart('${key}')">
      <div class="mc-top">
        <div>
          <div class="mc-name">${m.name}</div>
          <div style="font-size:0.65rem;color:var(--text3);margin-top:2px">${m.symbol}</div>
        </div>
        <div class="mc-type">${m.type}</div>
      </div>
      <div class="mc-price">$${fmtPrice(key, price)}</div>
      <div class="mc-change ${chg >= 0 ? 'up' : 'dn'}">${chg >= 0 ? '▲' : '▼'} ${Math.abs(chg)}% (24h)</div>
      <div class="mc-signal ${sig.cls}">${sig.label}</div>
      <canvas class="mc-mini-chart" id="mini-${key}-${id}"></canvas>
    </div>`;
  }).join('');

  // Mini sparkline charts
  entries.forEach(([key, m]) => {
    const canvas = document.getElementById(`mini-${key}-${id}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pts = Array.from({ length: 12 }, () => m.base * (1 + (Math.random() - 0.5) * 0.04));
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: pts.map(() => ''),
        datasets: [{ data: pts, borderColor: m.change >= 0 ? '#2ecc71' : '#e74c3c', borderWidth: 1.5, fill: false, tension: 0.4, pointRadius: 0 }]
      },
      options: { responsive: false, animation: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
    });
  });
}

// ── Live Update Flicker ───────────────────────────
function liveUpdate() {
  document.querySelectorAll('.mc-price').forEach(el => {
    el.style.opacity = '0.6';
    setTimeout(() => el.style.opacity = '1', 300);
  });
}

// ── Filter Markets ────────────────────────────────
function filterMarket(type, btn) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('markets-full-grid');
  const entries = Object.entries(MARKET_DATA).filter(([, m]) =>
    type === 'all' || m.type.toLowerCase() === type
  );
  el.innerHTML = entries.map(([key, m], i) => {
    const price = getLivePrice(m.base);
    const chg = getLiveChange(m.change);
    const sig = getSignal(chg);
    return `<div class="market-card" style="animation-delay:${i * 0.07}s">
      <div class="mc-top">
        <div><div class="mc-name">${m.name}</div></div>
        <div class="mc-type">${m.type}</div>
      </div>
      <div class="mc-price">$${fmtPrice(key, price)}</div>
      <div class="mc-change ${chg >= 0 ? 'up' : 'dn'}">${chg >= 0 ? '▲' : '▼'} ${Math.abs(chg)}% (24h)</div>
      <div class="mc-signal ${sig.cls}">${sig.label}</div>
    </div>`;
  }).join('');
}

// ── Main Chart ────────────────────────────────────
let mainChartInst = null;
function selectChart(key) {
  document.getElementById('chart-select').value = key;
  updateMainChart(key);
  nav('markets', null);
}
function updateMainChart(key) {
  key = key || document.getElementById('chart-select').value;
  const m = MARKET_DATA[key];
  if (!m) return;
  const ctx = document.getElementById('main-chart').getContext('2d');
  const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const data = Array.from({ length: 24 }, (_, i) => {
    const trend = m.change > 0 ? 1 + (i / 24) * 0.015 : 1 - (i / 24) * 0.01;
    return +(m.base * trend * (1 + (Math.random() - 0.5) * 0.012)).toFixed(2);
  });
  if (mainChartInst) mainChartInst.destroy();
  mainChartInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: m.name + ' ($)',
        data,
        borderColor: m.change >= 0 ? '#2ecc71' : '#e74c3c',
        backgroundColor: m.change >= 0 ? 'rgba(46,204,113,0.06)' : 'rgba(231,76,60,0.06)',
        borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#a09880', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#504840', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
        y: { ticks: { color: '#a09880' }, grid: { color: 'rgba(255,255,255,0.04)' } }
      }
    }
  });
}

// ── Predictions ───────────────────────────────────
function renderPredictions() {
  const predictions = [
    { asset: 'Bitcoin',   dir: 'up',  pct: '+6.2%', forecast: '↑ $114,500', risk: 'Medium', conf: '79%', window: '7 days' },
    { asset: 'Gold',      dir: 'up',  pct: '+4.1%', forecast: '↑ $2,439',   risk: 'Low',    conf: '87%', window: '7 days' },
    { asset: 'Apple',     dir: 'up',  pct: '+2.3%', forecast: '↑ $218.4',   risk: 'Low',    conf: '82%', window: '7 days' },
    { asset: 'Tesla',     dir: 'dn',  pct: '-3.4%', forecast: '↓ $239.9',   risk: 'High',   conf: '71%', window: '7 days' },
    { asset: 'S&P 500',   dir: 'up',  pct: '+1.8%', forecast: '↑ 5,581',    risk: 'Low',    conf: '84%', window: '7 days' },
    { asset: 'Ethereum',  dir: 'up',  pct: '+5.0%', forecast: '↑ $4,043',   risk: 'Medium', conf: '76%', window: '7 days' },
    { asset: 'Crude Oil', dir: 'dn',  pct: '-2.1%', forecast: '↓ $76.8',    risk: 'Medium', conf: '73%', window: '7 days' },
    { asset: 'USD/PKR',   dir: 'up',  pct: '+0.9%', forecast: '↑ 281.0',    risk: 'Low',    conf: '80%', window: '7 days' },
  ];
  const grid = document.getElementById('pred-grid');
  grid.innerHTML = predictions.map((p, i) => `
    <div class="pred-card" style="animation-delay:${i * 0.07}s">
      <div class="pred-asset">${p.asset}</div>
      <div class="pred-dir ${p.dir}">${p.forecast}</div>
      <div class="pred-pct">Expected: ${p.pct}</div>
      <div class="pred-meta">
        <span class="pred-tag">Risk: ${p.risk}</span>
        <span class="pred-tag">Conf: ${p.conf}</span>
        <span class="pred-tag">${p.window}</span>
      </div>
    </div>
  `).join('');
}

function renderPredCharts() {
  // 7-day forecast
  const ctx1 = document.getElementById('pred-chart')?.getContext('2d');
  if (ctx1) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    new Chart(ctx1, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          { label: 'Bitcoin ($K)', data: [108, 110, 109, 112, 111, 114, 115], borderColor: '#c8a96e', backgroundColor: 'rgba(200,169,110,0.07)', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#c8a96e' },
          { label: 'Gold ($)', data: [2342, 2350, 2345, 2360, 2358, 2370, 2380], borderColor: '#2ecc71', borderWidth: 2, fill: false, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#2ecc71' }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#a09880', font: { size: 10 } } } },
        scales: {
          x: { ticks: { color: '#504840' }, grid: { color: 'rgba(255,255,255,0.03)' } },
          y: { ticks: { color: '#a09880' }, grid: { color: 'rgba(255,255,255,0.04)' } }
        }
      }
    });
  }
  // Volatility
  const ctx2 = document.getElementById('vol-chart')?.getContext('2d');
  if (ctx2) {
    new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: ['Bitcoin', 'Ethereum', 'Tesla', 'Oil', 'Gold', 'Apple', 'S&P'],
        datasets: [{
          label: 'Volatility Score',
          data: [72, 65, 81, 58, 28, 35, 22],
          backgroundColor: ['#e74c3c','#e74c3c','#e74c3c','#ffd740','#2ecc71','#2ecc71','#2ecc71'],
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#504840', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.02)' } },
          y: { ticks: { color: '#a09880' }, grid: { color: 'rgba(255,255,255,0.04)' }, max: 100 }
        }
      }
    });
  }
}

// ── News ──────────────────────────────────────────
function renderNews() {
  const articles = [
    { tag: 'MACRO', title: 'Federal Reserve signals potential rate cut in Q3 2026', desc: 'Fed Chair indicated a dovish shift as inflation approaches target. AI models detect strong bullish signal across equities and crypto markets following the announcement.', impact: 'AI Impact: Positive for Tech Stocks, Crypto', sentiment: 'bull', sentLabel: '📈 Bullish', time: '14 min ago' },
    { tag: 'CRYPTO', title: 'Bitcoin ETF inflows hit $2.1B in a single day — institutional demand surges', desc: 'BlackRock and Fidelity Bitcoin ETFs recorded record single-day inflows. On-chain data confirms accumulation phase. AI confidence score for BTC: 84%.', impact: 'AI Impact: Strong buy signal on BTC, ETH', sentiment: 'bull', sentLabel: '📈 Bullish', time: '38 min ago' },
    { tag: 'COMMODITIES', title: 'Gold holds above $2,340 as geopolitical tensions persist', desc: 'Safe-haven demand keeps gold elevated. AI model flags gold as low-risk defensive asset for the next 30 days amid global uncertainty.', impact: 'AI Impact: Gold — low risk, stable hold', sentiment: 'neut', sentLabel: '⚖ Neutral', time: '1 hr ago' },
    { tag: 'FOREX', title: 'USD/PKR rate stabilizes as SBP maintains monetary policy', desc: 'State Bank of Pakistan kept interest rates unchanged. AI currency models predict 0.8-1.2% USD appreciation against PKR over next 7 days.', impact: 'AI Impact: Moderate pressure on PKR', sentiment: 'bear', sentLabel: '📉 Bearish for PKR', time: '2 hr ago' },
    { tag: 'TECH', title: 'Apple reports record services revenue — stock hits new high', desc: 'AAPL services segment grew 18% YoY. AI technical analysis identifies breakout pattern. Price target revised to $235 by multiple AI models.', impact: 'AI Impact: BUY signal — AAPL, MSFT', sentiment: 'bull', sentLabel: '📈 Bullish', time: '3 hr ago' },
  ];
  const main = document.getElementById('news-main');
  main.innerHTML = articles.map((a, i) => `
    <div class="news-card" style="animation-delay:${i * 0.08}s">
      <div class="nc-top">
        <span class="nc-tag">${a.tag}</span>
        <span class="nc-time">${a.time}</span>
      </div>
      <div class="nc-title">${a.title}</div>
      <div class="nc-desc">${a.desc}</div>
      <div class="nc-impact">
        <span class="nc-ai-label">🤖 ${a.impact}</span>
        <span class="nc-sentiment ${a.sentiment}">${a.sentLabel}</span>
      </div>
    </div>
  `).join('');
}

function renderSentimentChart() {
  const ctx = document.getElementById('sentiment-chart')?.getContext('2d');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Bullish', 'Neutral', 'Bearish'],
      datasets: [{
        data: [58, 27, 15],
        backgroundColor: ['rgba(46,204,113,0.8)', 'rgba(255,215,64,0.7)', 'rgba(231,76,60,0.7)'],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#a09880', font: { size: 10 } } } }
    }
  });
}

function renderImpactScores() {
  const el = document.getElementById('impact-scores');
  const scores = [
    { name: 'Fed Rate Decision', score: 'HIGH', cls: 'high' },
    { name: 'BTC ETF Inflows',   score: 'HIGH', cls: 'high' },
    { name: 'Gold Demand',       score: 'MED',  cls: 'med'  },
    { name: 'USD/PKR Move',      score: 'MED',  cls: 'med'  },
    { name: 'Apple Earnings',    score: 'LOW',  cls: 'low'  },
  ];
  el.innerHTML = scores.map(s => `
    <div class="impact-row">
      <span class="ir-name">${s.name}</span>
      <span class="ir-score ${s.cls}">${s.score}</span>
    </div>
  `).join('');
}

// ── Heatmap ───────────────────────────────────────
function renderHeatmap() {
  const wrap = document.getElementById('heatmap-wrap');
  const heatItems = [
    { name:'Bitcoin',   pct:+3.2,  price:'$108,000' },
    { name:'Ethereum',  pct:+2.1,  price:'$3,850'   },
    { name:'Apple',     pct:+1.4,  price:'$213.5'   },
    { name:'Gold',      pct:+0.8,  price:'$2,342'   },
    { name:'S&P 500',   pct:+0.6,  price:'5,482'    },
    { name:'Microsoft', pct:+0.7,  price:'$415.2'   },
    { name:'NASDAQ',    pct:+0.9,  price:'19,820'   },
    { name:'EUR/USD',   pct:-0.1,  price:'1.085'    },
    { name:'Silver',    pct:-0.4,  price:'$29.4'    },
    { name:'USD/PKR',   pct:+0.2,  price:'278.5'    },
    { name:'Tesla',     pct:-2.1,  price:'$248.3'   },
    { name:'Crude Oil', pct:-1.2,  price:'$78.4'    },
  ];
  wrap.innerHTML = heatItems.map(h => {
    const bg = h.pct > 3 ? '#00695c' : h.pct > 1 ? '#2e7d32' : h.pct > 0 ? '#388e3c' : h.pct > -1 ? '#e65100' : '#b71c1c';
    const size = Math.min(1 + Math.abs(h.pct) * 0.08, 1.3);
    return `<div class="hm-cell" style="background:${bg};transform:scale(${size})">
      <div class="hm-name">${h.name}</div>
      <div class="hm-pct">${h.pct > 0 ? '+' : ''}${h.pct}%</div>
      <div class="hm-price">${h.price}</div>
    </div>`;
  }).join('');
}

// ── AI Agent Modal ────────────────────────────────
function openAgent() {
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('agent-modal').classList.add('open');
  document.getElementById('am-input').focus();
}
function closeAgent() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('agent-modal').classList.remove('open');
}

function sendAgentMsg() {
  const input = document.getElementById('am-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  appendMsg(msg, 'user');
  appendMsg('...', 'bot thinking');
  setTimeout(() => {
    const msgs = document.getElementById('am-messages');
    msgs.lastChild.remove();
    appendMsg(generateReply(msg), 'bot');
  }, 900 + Math.random() * 600);
}

function appendMsg(text, type) {
  const msgs = document.getElementById('am-messages');
  const div = document.createElement('div');
  div.className = `am-msg ${type}`;
  const icon = document.createElement('div');
  icon.className = 'am-msg-icon';
  icon.textContent = type.includes('bot') ? '◆' : 'U';
  const txt = document.createElement('div');
  txt.className = 'am-msg-text' + (type.includes('thinking') ? ' am-thinking' : '');
  txt.textContent = text;
  div.appendChild(icon); div.appendChild(txt);
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

// ── Hero Agent Box ────────────────────────────────
function heroAsk() {
  const q = document.getElementById('hero-ask').value.trim();
  if (!q) return;
  const out = document.getElementById('hero-output');
  out.innerHTML = '<div style="color:var(--text3);font-size:0.8rem">🤖 Analyzing market data...</div>';
  setTimeout(() => {
    const reply = generateReply(q);
    const lines = reply.split('\n').filter(Boolean);
    out.innerHTML = `
      <div class="ao-result-label">AI MARKET ANALYSIS</div>
      <div class="ao-result-text">${lines.join('<br/>')}</div>
      <div class="ao-conf">
        <div>Confidence: <span>${65 + Math.floor(Math.random()*25)}%</span></div>
        <div>Signal: <span>${Math.random()>0.4?'BULLISH':'NEUTRAL'}</span></div>
        <div>Updated: <span>Just now</span></div>
      </div>`;
  }, 1000);
}

function quickAsk(q) {
  document.getElementById('hero-ask').value = q;
  heroAsk();
}

// ── AI Reply Engine ───────────────────────────────
function generateReply(msg) {
  const m = msg.toLowerCase();

  if (m.includes('bitcoin') || m.includes('btc')) {
    const price = getLivePrice(108000).toLocaleString('en', {maximumFractionDigits:0});
    return `Bitcoin is currently trading at ~$${price}.\n\nAI Analysis:\n• 24h Change: +3.2% — momentum is positive\n• ETF inflows hit record $2.1B today\n• On-chain data shows accumulation phase\n• RSI: 61 — not yet overbought\n\nRecommendation: HOLD with buy-on-dip strategy\nTarget: $114,500 (7-day forecast)\nConfidence: 79%`;
  }
  if (m.includes('gold') || m.includes('xau')) {
    return `Gold is trading at ~$2,342/oz.\n\nAI Analysis:\n• Geopolitical tensions supporting price\n• Inflation hedge demand remains strong\n• Technical: holding key support at $2,300\n• Central bank buying continues\n\nRecommendation: BUY — safe haven asset\nTarget: $2,440 (7-day forecast)\nRisk Level: LOW\nConfidence: 87%`;
  }
  if (m.includes('apple') || m.includes('aapl')) {
    return `Apple (AAPL) is at ~$213.5.\n\nAI Analysis:\n• Record services revenue reported\n• Strong institutional accumulation\n• Technical: breakout pattern forming\n• AI price target: $235\n\nRecommendation: BUY\nConfidence: 82%`;
  }
  if (m.includes('usd') || m.includes('pkr') || m.includes('dollar')) {
    return `USD/PKR is at ~278.5.\n\nAI Analysis:\n• SBP maintained interest rates\n• Foreign reserves improving gradually\n• Short-term pressure on PKR expected\n• IMF program on track\n\nForecast: 280-282 range (7 days)\nRecommendation: Hold USD positions\nConfidence: 80%`;
  }
  if (m.includes('ethereum') || m.includes('eth')) {
    return `Ethereum is at ~$3,850.\n\nAI Analysis:\n• Layer-2 adoption accelerating\n• ETH ETF approval momentum building\n• Staking yield: 3.8% annually\n• Technical: above 200-day MA\n\nRecommendation: BUY\nTarget: $4,200\nConfidence: 76%`;
  }
  if (m.includes('tesla') || m.includes('tsla')) {
    return `Tesla (TSLA) is at ~$248.3.\n\nAI Analysis:\n• Delivery numbers below estimates\n• EV competition increasing\n• AI robotics division — long-term positive\n• Short-term: bearish momentum\n\nRecommendation: HOLD — wait for $230 entry\nRisk Level: HIGH\nConfidence: 71%`;
  }
  if (m.includes('market') || m.includes('today') || m.includes('trend')) {
    return `Global Market Summary — ${new Date().toLocaleDateString()}:\n\n• Crypto: BULLISH — Bitcoin +3.2%, ETH +2.1%\n• Equities: POSITIVE — S&P +0.6%, NASDAQ +0.9%\n• Commodities: MIXED — Gold +0.8%, Oil -1.2%\n• Forex: USD strong across emerging markets\n\nOverall AI Market Score: 72/100 — Moderate Bullish\nTop Opportunity: Bitcoin & Gold combo hedge`;
  }
  if (m.includes('invest') || m.includes('portfolio') || m.includes('best')) {
    return `AI Portfolio Recommendation:\n\n• 35% — Bitcoin (high growth potential)\n• 25% — Gold (safe haven hedge)\n• 20% — S&P 500 ETF (stable returns)\n• 15% — Apple/Microsoft (tech growth)\n• 5% — Cash (opportunity reserve)\n\nExpected 7-day return: +3.2%\nRisk Level: Moderate\nConfidence: 81%`;
  }
  if (m.includes('safe') || m.includes('risk') || m.includes('low risk')) {
    return `Low-Risk AI Recommendations:\n\n1. Gold — safest hedge, low volatility\n2. S&P 500 ETF — diversified exposure\n3. USD holdings — currency stability\n4. Microsoft — stable tech blue chip\n\nAvoid: High-volatility assets (Tesla, Oil)\nAI Risk Score for above portfolio: 24/100 (LOW)`;
  }
  if (m.includes('oil') || m.includes('crude')) {
    return `Crude Oil (WTI) at ~$78.4.\n\nAI Analysis:\n• OPEC+ production unchanged\n• Global demand concerns persist\n• Technical: bearish below $80\n• Geopolitical risk premium fading\n\nRecommendation: SELL / Avoid\nTarget: $74-76 downside\nConfidence: 73%`;
  }

  // Default intelligent response
  return `AI Market Intelligence Analysis:\n\nBased on current real-time data:\n• Global sentiment: 58% Bullish\n• Top opportunity: Bitcoin & Gold\n• Risk assets showing strength\n• Fed dovish signals support markets\n\nFor "${msg}":\nI recommend reviewing the Markets and Predictions sections for detailed analysis on this asset.\n\nAsk me specifically about Bitcoin, Gold, Apple, Tesla, USD/PKR, or Ethereum for detailed AI signals.`;
}

// Kick off main chart
updateMainChart('bitcoin');
