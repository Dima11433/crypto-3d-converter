/**
 * Main Application Logic for Crypto & Fiat 3D Converter
 * Features:
 * - Live exchange calculations with real-time rate updates
 * - Web Audio API synthesizer for cyber sound effects
 * - Currency picker modal with instant search & category filtering
 * - Dynamic network fee and gas estimation
 * - Deep link presets and 1:1 interaction with screenshot cards
 */

(function () {
  'use strict';

  // State
  const state = {
    fromCurrency: 'ETH',
    toCurrency: 'USD',
    fromAmount: 1.0,
    soundEnabled: true,
    activeSelectorTarget: 'from', // 'from' or 'to'
    ratesUSD: {
      ETH: 3450.25,
      BTC: 89420.00,
      SOL: 184.50,
      TON: 6.25,
      USDT: 1.00,
      BNB: 610.80,
      XRP: 0.582,
      DOGE: 0.142,
      USD: 1.00,
      // Official Wise Mid-Market Rates (wise.com/ru/currency-converter/)
      EUR: 1 / 0.893336, // 1 EUR = ~1.1194 USD (1 USD = 0.8933 EUR)
      RUB: 1 / 80.65,    // 1 RUB = ~0.0124 USD (1 USD = 80.65 RUB)
      KZT: 1 / 451.29,   // 1 KZT = ~0.0022 USD (1 USD = 451.29 KZT)
      GBP: 1 / 0.747803, // 1 GBP = ~1.3372 USD (1 USD = 0.7478 GBP)
      CNY: 1 / 6.67005,  // 1 CNY = ~0.1500 USD (1 USD = 6.67 CNY)
      TRY: 1 / 49.7326,  // 1 TRY = ~0.0201 USD (1 USD = 49.73 TRY)
      AED: 1 / 3.6726,   // 1 AED = ~0.2723 USD (1 USD = 3.67 AED)
      JPY: 1 / 156.88,   // 1 JPY = ~0.0064 USD (1 USD = 156.88 JPY)
      CHF: 1 / 0.82525,  // 1 CHF = ~1.2117 USD (1 USD = 0.825 CHF)
      CAD: 1 / 1.4006,   // 1 CAD = ~0.7140 USD (1 USD = 1.40 CAD)
      AUD: 1 / 1.42096,  // 1 AUD = ~0.7037 USD (1 USD = 1.42 AUD)
      UAH: 1 / 45.05,    // 1 UAH = ~0.0222 USD (1 USD = 45.05 UAH)
      PLN: 1 / 3.93195   // 1 PLN = ~0.2543 USD (1 USD = 3.93 PLN)
    },
    currencies: [
      { code: 'ETH', name: 'Ethereum', type: 'crypto', symbol: 'ETH', network: 'ERC-20 / EVM', change24h: '+3.84%', iconBg: 'linear-gradient(135deg, #a855f7, #6366f1)' },
      { code: 'BTC', name: 'Bitcoin', type: 'crypto', symbol: '₿', network: 'Bitcoin Mainnet', change24h: '+2.15%', iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
      { code: 'SOL', name: 'Solana', type: 'crypto', symbol: 'SOL', network: 'Solana SPL', change24h: '+7.62%', iconBg: 'linear-gradient(135deg, #06b6d4, #a855f7)' },
      { code: 'TON', name: 'Toncoin', type: 'crypto', symbol: 'TON', network: 'TON Network', change24h: '+4.10%', iconBg: 'linear-gradient(135deg, #0284c7, #2563eb)' },
      { code: 'USDT', name: 'Tether USD', type: 'crypto', symbol: '₮', network: 'TRC-20 / ERC-20', change24h: '+0.01%', iconBg: 'linear-gradient(135deg, #10b981, #059669)' },
      { code: 'BNB', name: 'BNB Chain', type: 'crypto', symbol: 'BNB', network: 'BNB Smart Chain', change24h: '+1.45%', iconBg: 'linear-gradient(135deg, #eab308, #ca8a04)' },
      { code: 'XRP', name: 'Ripple', type: 'crypto', symbol: 'XRP', network: 'XRP Ledger', change24h: '+0.85%', iconBg: 'linear-gradient(135deg, #64748b, #334155)' },
      { code: 'USD', name: 'US Dollar', type: 'fiat', symbol: '$', network: 'Wise / SWIFT', change24h: '0.00%', iconBg: 'linear-gradient(135deg, #10b981, #059669)' },
      { code: 'EUR', name: 'Euro', type: 'fiat', symbol: '€', network: 'Wise / SEPA', change24h: '-0.12%', iconBg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
      { code: 'RUB', name: 'Российский рубль', type: 'fiat', symbol: '₽', network: 'Wise Mid-Market', change24h: '+0.25%', iconBg: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
      { code: 'KZT', name: 'Казахстанский тенге', type: 'fiat', symbol: '₸', network: 'Wise Mid-Market', change24h: '+0.05%', iconBg: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
      { code: 'UAH', name: 'Українська гривня', type: 'fiat', symbol: '₴', network: 'Wise Mid-Market', change24h: '+0.10%', iconBg: 'linear-gradient(135deg, #38bdf8, #facc15)' },
      { code: 'GBP', name: 'British Pound', type: 'fiat', symbol: '£', network: 'Wise / BACS', change24h: '+0.18%', iconBg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
      { code: 'CNY', name: 'Chinese Yuan', type: 'fiat', symbol: '¥', network: 'Wise / UnionPay', change24h: '-0.08%', iconBg: 'linear-gradient(135deg, #f43f5e, #be123c)' },
      { code: 'JPY', name: 'Japanese Yen', type: 'fiat', symbol: '¥', network: 'Wise / Zengin', change24h: '-0.15%', iconBg: 'linear-gradient(135deg, #f97316, #ea580c)' },
      { code: 'CHF', name: 'Swiss Franc', type: 'fiat', symbol: 'Fr', network: 'Wise / SIC', change24h: '+0.04%', iconBg: 'linear-gradient(135deg, #dc2626, #991b1b)' },
      { code: 'CAD', name: 'Canadian Dollar', type: 'fiat', symbol: 'C$', network: 'Wise / EFT', change24h: '+0.07%', iconBg: 'linear-gradient(135deg, #ef4444, #e11d48)' },
      { code: 'AUD', name: 'Australian Dollar', type: 'fiat', symbol: 'A$', network: 'Wise / NPP', change24h: '+0.12%', iconBg: 'linear-gradient(135deg, #059669, #047857)' },
      { code: 'PLN', name: 'Polski Złoty', type: 'fiat', symbol: 'zł', network: 'Wise / Elixir', change24h: '+0.14%', iconBg: 'linear-gradient(135deg, #e11d48, #be123c)' },
      { code: 'TRY', name: 'Turkish Lira', type: 'fiat', symbol: '₺', network: 'Wise / FAST', change24h: '-0.20%', iconBg: 'linear-gradient(135deg, #e11d48, #9f1239)' },
      { code: 'AED', name: 'UAE Dirham', type: 'fiat', symbol: 'د.إ', network: 'Wise / CBUAE', change24h: '0.00%', iconBg: 'linear-gradient(135deg, #10b981, #047857)' }
    ]
  };

  // DOM Elements
  const fromAmountInput = document.getElementById('fromAmountInput');
  const toAmountOutput = document.getElementById('toAmountOutput');
  const fromSelectBtn = document.getElementById('fromSelectBtn');
  const toSelectBtn = document.getElementById('toSelectBtn');
  const swapCurrenciesBtn = document.getElementById('swapCurrenciesBtn');
  const executeExchangeBtn = document.getElementById('executeExchangeBtn');
  const ratePreviewBadge = document.getElementById('ratePreviewBadge');
  const gasCostEstimate = document.getElementById('gasCostEstimate');

  // Token icon & label elements
  const fromCoinIcon = document.getElementById('fromCoinIcon');
  const fromCoinCode = document.getElementById('fromCoinCode');
  const fromCoinFullName = document.getElementById('fromCoinFullName');
  const toCoinIcon = document.getElementById('toCoinIcon');
  const toCoinCode = document.getElementById('toCoinCode');
  const toCoinFullName = document.getElementById('toCoinFullName');

  // Stage stats elements
  const activeTokenName = document.getElementById('activeTokenName');
  const activeTokenChange = document.getElementById('activeTokenChange');
  const activeTokenNetwork = document.getElementById('activeTokenNetwork');

  // Modal elements
  const currencyModal = document.getElementById('currencyModal');
  const closeCurrencyModalBtn = document.getElementById('closeCurrencyModalBtn');
  const currencySearchInput = document.getElementById('currencySearchInput');
  const currencyList = document.getElementById('currencyList');
  const tabChips = document.querySelectorAll('.tab-chip');

  // Telegram Modal elements
  const tgModal = document.getElementById('tgModal');
  const openTelegramBtn = document.getElementById('openTelegramBtn');
  const closeTgModalBtn = document.getElementById('closeTgModalBtn');
  const dealRouteText = document.getElementById('dealRouteText');

  // Notification & Audio
  const toastNotification = document.getElementById('toastNotification');
  const toastText = document.getElementById('toastText');
  const soundToggleBtn = document.getElementById('soundToggleBtn');

  /* ==========================================================================
     WEB AUDIO SYNTHESIZER (Pure Web Audio API - Zero External Dependencies)
     ========================================================================== */
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'swap') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'success') {
        // High quality chord chime
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.04);
          gain.gain.setValueAtTime(0.08, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.35);
        });
      }
    } catch (e) {
      console.warn('Audio synthesis disabled/failed', e);
    }
  }

  /* ==========================================================================
     CONVERTER CALCULATOR CORE
     ========================================================================== */

  function getCurrency(code) {
    return state.currencies.find(c => c.code === code) || {
      code,
      name: code,
      type: 'crypto',
      symbol: code,
      network: 'Blockchain',
      change24h: '+0.00%',
      iconBg: 'linear-gradient(135deg, #a855f7, #6366f1)'
    };
  }

  function getExchangeRate(from, to) {
    const fromUSD = state.ratesUSD[from] || 1;
    const toUSD = state.ratesUSD[to] || 1;
    return fromUSD / toUSD;
  }

  function formatNumber(num) {
    if (isNaN(num)) return '0.00';
    if (num >= 1000) {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (num >= 1) {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    } else if (num > 0.000001) {
      return num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
    }
    return num.toString();
  }

  function recalculate() {
    const fromVal = parseFloat(fromAmountInput.value) || 0;
    state.fromAmount = fromVal;

    const rate = getExchangeRate(state.fromCurrency, state.toCurrency);
    const result = fromVal * rate;

    toAmountOutput.value = formatNumber(result);

    // Update rate preview text
    const singleRate = getExchangeRate(state.fromCurrency, state.toCurrency);
    const toObj = getCurrency(state.toCurrency);
    const isWiseRate = fromObj.type === 'fiat' || toObj.type === 'fiat';
    ratePreviewBadge.textContent = isWiseRate
      ? `1 ${state.fromCurrency} = ${formatNumber(singleRate)} ${state.toCurrency} (Курс Wise.com)`
      : `1 ${state.fromCurrency} = ${formatNumber(singleRate)} ${state.toCurrency}`;

    // Update Gas & Network estimate
    const fromObj = getCurrency(state.fromCurrency);
    if (fromObj.type === 'crypto') {
      if (state.fromCurrency === 'ETH') {
        gasCostEstimate.textContent = '~ $2.14 (0.00062 ETH)';
      } else if (state.fromCurrency === 'BTC') {
        gasCostEstimate.textContent = '~ $1.85 (0.000021 BTC)';
      } else if (state.fromCurrency === 'SOL') {
        gasCostEstimate.textContent = '~ $0.0025 (0.000014 SOL)';
      } else {
        gasCostEstimate.textContent = '~ $0.80 (Мгновенно)';
      }
    } else {
      gasCostEstimate.textContent = 'Комиссия шлюза 0%';
    }

    // Update deal route in TG modal
    if (dealRouteText) {
      dealRouteText.textContent = `${formatNumber(fromVal)} ${state.fromCurrency} → ${formatNumber(result)} ${state.toCurrency}`;
    }
  }

  function updateCurrencyUI() {
    const fromObj = getCurrency(state.fromCurrency);
    const toObj = getCurrency(state.toCurrency);

    // Update FROM trigger
    fromCoinCode.textContent = fromObj.code;
    fromCoinFullName.textContent = fromObj.name;
    fromCoinIcon.style.background = fromObj.iconBg;
    fromCoinIcon.querySelector('.coin-symbol-txt').textContent = fromObj.symbol;

    // Update TO trigger
    toCoinCode.textContent = toObj.code;
    toCoinFullName.textContent = toObj.name;
    toCoinIcon.style.background = toObj.iconBg;
    toCoinIcon.querySelector('.coin-symbol-txt').textContent = toObj.symbol;

    // Update Stage Token & details
    const activeObj = fromObj.type === 'crypto' ? fromObj : (toObj.type === 'crypto' ? toObj : fromObj);
    activeTokenName.textContent = `${activeObj.name} (${activeObj.code})`;
    activeTokenChange.textContent = `${activeObj.change24h} ▲`;
    activeTokenNetwork.textContent = activeObj.network;

    // Sync Three.js 3D model
    if (window.ThreeApp) {
      window.ThreeApp.setToken(activeObj.code);
    }

    recalculate();
  }

  function swapCurrencies() {
    playSound('swap');
    const temp = state.fromCurrency;
    state.fromCurrency = state.toCurrency;
    state.toCurrency = temp;

    // Swap rotation visual effect
    swapCurrenciesBtn.style.transform = 'rotate(180deg) scale(1.15)';
    setTimeout(() => {
      swapCurrenciesBtn.style.transform = '';
    }, 300);

    updateCurrencyUI();
  }

  /* ==========================================================================
     CURRENCY SELECTOR MODAL
     ========================================================================== */

  function renderCurrencyList(filterType = 'all', searchQuery = '') {
    currencyList.innerHTML = '';
    const query = searchQuery.trim().toLowerCase();

    const filtered = state.currencies.filter(c => {
      const matchType = filterType === 'all' || c.type === filterType;
      const matchQuery = !query ||
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        c.network.toLowerCase().includes(query);
      return matchType && matchQuery;
    });

    if (filtered.length === 0) {
      currencyList.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--text-dim); font-size: 0.9rem;">
          Ничего не найдено
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const row = document.createElement('div');
      row.className = 'currency-item-row';
      const rateUsd = state.ratesUSD[item.code] || 1;

      row.innerHTML = `
        <div class="item-left">
          <div class="coin-icon-bubble" style="background: ${item.iconBg}; width: 32px; height: 32px;">
            <span class="coin-symbol-txt">${item.symbol}</span>
          </div>
          <div>
            <div class="item-code">${item.code}</div>
            <div class="item-name">${item.name} &bull; ${item.network}</div>
          </div>
        </div>
        <div class="item-right">
          <div class="item-rate">$${formatNumber(rateUsd)}</div>
          <div style="font-size: 0.72rem; color: var(--neon-green);">${item.change24h}</div>
        </div>
      `;

      row.addEventListener('click', () => {
        playSound('click');
        if (state.activeSelectorTarget === 'from') {
          if (state.toCurrency === item.code) {
            state.toCurrency = state.fromCurrency;
          }
          state.fromCurrency = item.code;
        } else {
          if (state.fromCurrency === item.code) {
            state.fromCurrency = state.toCurrency;
          }
          state.toCurrency = item.code;
        }

        closeModal(currencyModal);
        updateCurrencyUI();
      });

      currencyList.appendChild(row);
    });
  }

  function openCurrencyModal(target) {
    playSound('click');
    state.activeSelectorTarget = target;
    currencySearchInput.value = '';
    tabChips.forEach(t => t.classList.toggle('active', t.dataset.filter === 'all'));
    renderCurrencyList('all', '');
    openModal(currencyModal);
    setTimeout(() => currencySearchInput.focus(), 150);
  }

  function openModal(modalEl) {
    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalEl) {
    modalEl.classList.remove('active');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ==========================================================================
     TOAST NOTIFICATION
     ========================================================================== */
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = message;
    toastNotification.classList.add('active');
    playSound('success');

    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('active');
    }, 2800);
  }

  /* ==========================================================================
     LIVE RATES SIMULATION & FETCH
     ========================================================================== */
  async function fetchLiveCryptoPrices() {
    try {
      // Free public Binance ticker for real live prices
      const symbols = ['ETHUSDT', 'BTCUSDT', 'SOLUSDT', 'TONUSDT'];
      const res = await fetch('https://api.binance.com/api/v3/ticker/price', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const map = {};
        data.forEach(item => { map[item.symbol] = parseFloat(item.price); });

        if (map['ETHUSDT']) state.ratesUSD.ETH = map['ETHUSDT'];
        if (map['BTCUSDT']) state.ratesUSD.BTC = map['BTCUSDT'];
        if (map['SOLUSDT']) state.ratesUSD.SOL = map['SOLUSDT'];
        if (map['TONUSDT']) state.ratesUSD.TON = map['TONUSDT'];

        updateTickerDisplays();
        recalculate();
      }
    } catch (e) {
      // Offline fallback: graceful micro-oscillation
      simulateMicroFluctuations();
    }
  }

  function simulateMicroFluctuations() {
    ['ETH', 'BTC', 'SOL', 'TON'].forEach(code => {
      const drift = (Math.random() - 0.495) * 0.0015;
      state.ratesUSD[code] *= (1 + drift);
    });
    updateTickerDisplays();
    recalculate();
  }

  async function fetchWiseRates() {
    try {
      const res = await fetch('./wise-rates.json?nocache=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (data.ratesInUSD) {
          Object.assign(state.ratesUSD, data.ratesInUSD);
          console.log('✓ Wise live rates synchronized successfully from wise-rates.json', data.lastUpdated);
          updateTickerDisplays();
          recalculate();
        }
      }
    } catch (e) {
      console.warn('Using built-in Wise mid-market rates table', e);
    }
  }

  function updateTickerDisplays() {
    const elUsdRub = document.getElementById('tickerUsdRub');
    const elEurUsd = document.getElementById('tickerEurUsd');
    const elUsdKzt = document.getElementById('tickerUsdKzt');
    const elEthRub = document.getElementById('tickerEthRub');

    if (elUsdRub) {
      const usdRub = 1 / state.ratesUSD.RUB;
      elUsdRub.textContent = `${formatNumber(usdRub)} ₽`;
    }
    if (elEurUsd) {
      elEurUsd.textContent = `$${formatNumber(state.ratesUSD.EUR)}`;
    }
    if (elUsdKzt) {
      const usdKzt = 1 / state.ratesUSD.KZT;
      elUsdKzt.textContent = `${formatNumber(usdKzt)} ₸`;
    }
    if (elEthRub) {
      const ethRub = state.ratesUSD.ETH / state.ratesUSD.RUB;
      elEthRub.textContent = `${formatNumber(ethRub)} ₽`;
    }
  }

  /* ==========================================================================
     EVENT LISTENERS & BINDINGS
     ========================================================================== */

  // Currency inputs
  fromAmountInput.addEventListener('input', recalculate);

  fromSelectBtn.addEventListener('click', () => openCurrencyModal('from'));
  toSelectBtn.addEventListener('click', () => openCurrencyModal('to'));
  swapCurrenciesBtn.addEventListener('click', swapCurrencies);

  // Quick Amount chips
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      fromAmountInput.value = btn.dataset.setFrom;
      recalculate();
    });
  });

  // Material picker chips
  document.querySelectorAll('.mat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      document.querySelectorAll('.mat-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mat = btn.dataset.material;
      if (window.ThreeApp) {
        window.ThreeApp.setMaterial(mat);
      }
    });
  });

  // Modal interactions
  closeCurrencyModalBtn.addEventListener('click', () => closeModal(currencyModal));
  currencyModal.addEventListener('click', (e) => {
    if (e.target === currencyModal) closeModal(currencyModal);
  });

  currencySearchInput.addEventListener('input', (e) => {
    const activeTab = document.querySelector('.tab-chip.active');
    const filter = activeTab ? activeTab.dataset.filter : 'all';
    renderCurrencyList(filter, e.target.value);
  });

  tabChips.forEach(chip => {
    chip.addEventListener('click', () => {
      playSound('click');
      tabChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderCurrencyList(chip.dataset.filter, currencySearchInput.value);
    });
  });

  // Telegram CTA Button (opens @glxs_shop_bot)
  openTelegramBtn.addEventListener('click', () => {
    playSound('click');
  });

  executeExchangeBtn.addEventListener('click', () => {
    playSound('success');
    recalculate();
    openModal(tgModal);
  });

  closeTgModalBtn.addEventListener('click', () => closeModal(tgModal));
  tgModal.addEventListener('click', (e) => {
    if (e.target === tgModal) closeModal(tgModal);
  });

  // Sound Toggle
  soundToggleBtn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    soundToggleBtn.querySelector('.icon').textContent = state.soundEnabled ? '🔊' : '🔇';
    soundToggleBtn.querySelector('.btn-text').textContent = state.soundEnabled ? 'Звук: ВКЛ' : 'Звук: ВЫКЛ';
    if (state.soundEnabled) playSound('click');
  });

  // Popular Pairs quick load
  document.querySelectorAll('.pair-card').forEach(card => {
    card.addEventListener('click', () => {
      playSound('click');
      state.fromCurrency = card.dataset.from;
      state.toCurrency = card.dataset.to;
      updateCurrencyUI();
      // Scroll smoothly to converter
      document.getElementById('converterSection').scrollIntoView({ behavior: 'smooth' });
      showToast(`Пара ${state.fromCurrency} / ${state.toCurrency} загружена в 3D Конвертер!`);
    });
  });

  // Keyboard accessibility
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(currencyModal);
      closeModal(tgModal);
    }
  });

  // Initialize
  fetchWiseRates();
  updateCurrencyUI();
  updateTickerDisplays();
  fetchLiveCryptoPrices();
  setInterval(simulateMicroFluctuations, 4000);
  setInterval(fetchLiveCryptoPrices, 30000);
  setInterval(fetchWiseRates, 60000);

})();
