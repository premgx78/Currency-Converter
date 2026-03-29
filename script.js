/* ──────────────────────────────────────────────
   Currency Converter — Live Rates via open.er-api.com
   Fallback to hardcoded rates if fetch fails
   ────────────────────────────────────────────── */

// ── Fallback rates (USD base) ──────────────────
const FALLBACK_RATES = {
  AUD: 1.52, CAD: 1.37, CNY: 7.18, EUR: 0.857,
  INR: 85.86, JPY: 147.33, NPR: 137.13,
  KRW: 1382.45, AED: 3.67, USD: 1.00
};

const CURRENCIES = [
  { code: "USD", name: "US Dollar",        flag: "🇺🇸" },
  { code: "EUR", name: "Euro",             flag: "🇪🇺" },
  { code: "INR", name: "Indian Rupee",     flag: "🇮🇳" },
  { code: "JPY", name: "Japanese Yen",     flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar",flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar",  flag: "🇨🇦" },
  { code: "CNY", name: "Chinese Yuan",     flag: "🇨🇳" },
  { code: "NPR", name: "Nepalese Rupee",   flag: "🇳🇵" },
  { code: "KRW", name: "South Korean Won", flag: "🇰🇷" },
  { code: "AED", name: "UAE Dirham",       flag: "🇦🇪" },
  { code: "GBP", name: "British Pound",    flag: "🇬🇧" },
  { code: "CHF", name: "Swiss Franc",      flag: "🇨🇭" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "MYR", name: "Malaysian Ringgit",flag: "🇲🇾" },
  { code: "THB", name: "Thai Baht",        flag: "🇹🇭" },
];

// ── State ──────────────────────────────────────
let rates = { ...FALLBACK_RATES };
let isLive = false;
let lastUpdated = null;

// ── DOM refs ───────────────────────────────────
const amountInput  = document.getElementById('amount');
const fromSelect   = document.getElementById('from');
const toSelect     = document.getElementById('to');
const convertBtn   = document.getElementById('convert-btn');
const resultText   = document.getElementById('result-text');
const swapIcon     = document.querySelector('.swap-icon');
const statusEl     = document.getElementById('rate-status');   // optional badge
const updatedEl    = document.getElementById('last-updated');  // optional timestamp

// ── Populate <select> elements ─────────────────
function populateSelects() {
  [fromSelect, toSelect].forEach((sel, idx) => {
    sel.innerHTML = '';
    CURRENCIES.forEach(({ code, name, flag }) => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = `${flag}  ${code} — ${name}`;
      sel.appendChild(opt);
    });
  });
  fromSelect.value = 'USD';
  toSelect.value   = 'NPR';
}

// ── Fetch live rates ───────────────────────────
async function fetchLiveRates() {
  setStatus('loading');
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.result !== 'success') throw new Error('API error');

    // Filter to only the currencies we support
    const fresh = {};
    CURRENCIES.forEach(({ code }) => {
      if (data.rates[code] !== undefined) fresh[code] = data.rates[code];
    });
    rates = fresh;
    isLive = true;
    lastUpdated = new Date();
    setStatus('live');
    updateTickerBar();
    convert();
  } catch (err) {
    console.warn('Live fetch failed, using fallback rates.', err);
    rates = { ...FALLBACK_RATES };
    isLive = false;
    setStatus('fallback');
    convert();
  }
}

// ── Status badge / timestamp ───────────────────
function setStatus(state) {
  if (statusEl) {
    statusEl.className = 'rate-badge ' + state;
    statusEl.textContent =
      state === 'live'     ? '● Live rates' :
      state === 'loading'  ? '⟳ Updating…'  :
                             '⚠ Offline rates';
  }
  if (updatedEl) {
    updatedEl.textContent = lastUpdated
      ? `Updated: ${lastUpdated.toLocaleTimeString()}`
      : 'Using cached rates';
  }
}

// ── Ticker bar (top scrolling strip) ──────────
function updateTickerBar() {
  const track = document.getElementById('ticker-track');
  if (!track) return;

  const pairs = [
    ['USD','EUR'],['USD','INR'],['USD','NPR'],['USD','JPY'],
    ['USD','GBP'],['USD','AUD'],['USD','KRW'],['USD','CNY'],
    ['EUR','INR'],['GBP','USD'],
  ];

  const items = pairs.map(([a, b]) => {
    const val = (rates[b] / rates[a]).toFixed(4);
    return `<span>${a}/${b} <strong>${val}</strong></span>`;
  }).join('');

  // Duplicate for seamless loop
  track.innerHTML = items + items;
}

// ── Conversion logic ───────────────────────────
function convert() {
  const amount = parseFloat(amountInput.value);
  const from   = fromSelect.value;
  const to     = toSelect.value;

  if (isNaN(amount) || amount < 0) {
    resultText.innerText = 'Please enter a valid amount';
    return;
  }

  const fromRate = rates[from] ?? FALLBACK_RATES[from] ?? 1;
  const toRate   = rates[to]   ?? FALLBACK_RATES[to]   ?? 1;
  const result   = (toRate / fromRate) * amount;

  const fmtAmount = amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const fmtResult = result.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: to === 'JPY' || to === 'KRW' ? 0 : 4,
  });

  resultText.innerText = `${fmtAmount} ${from} = ${fmtResult} ${to}`;

  // Also show inverse rate below if the element exists
  const inverseEl = document.getElementById('inverse-rate');
  if (inverseEl) {
    const inv = (fromRate / toRate).toFixed(6);
    inverseEl.textContent = `1 ${to} = ${inv} ${from}`;
  }
}

// ── Swap currencies ────────────────────────────
function swapCurrencies() {
  const tmp      = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value   = tmp;
  convert();
}

// ── Refresh button ─────────────────────────────
const refreshBtn = document.getElementById('refresh-btn');
if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Refreshing…';
    fetchLiveRates().finally(() => {
      refreshBtn.disabled = false;
      refreshBtn.textContent = '↻ Refresh rates';
    });
  });
}

// ── Auto-refresh every 5 minutes ──────────────
setInterval(fetchLiveRates, 5 * 60 * 1000);

// ── Event listeners ────────────────────────────
convertBtn.addEventListener('click', convert);
swapIcon  ?.addEventListener('click', swapCurrencies);
amountInput.addEventListener('input', convert);
fromSelect .addEventListener('change', convert);
toSelect   .addEventListener('change', convert);
amountInput.addEventListener('keydown', e => { if (e.key === 'Enter') convert(); });

// ── Boot ───────────────────────────────────────
populateSelects();
fetchLiveRates();   // fetch on load; falls back gracefully if offline