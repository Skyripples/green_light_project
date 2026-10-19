const TRANSLATIONS = {
  en: {
    'meta.title': 'Green Light Project',
    'meta.description': 'A single-intersection traffic signal simulator comparing fixed and adaptive control.',
    'header.subtitle': 'Adaptive Traffic Signal Simulation',
    'aria.systemStatus': 'System status',
    'aria.controls': 'Simulation controls',
    'aria.simulation': 'Intersection simulation',
    'aria.canvas': 'Top-down intersection traffic simulation',
    'aria.statistics': 'Live statistics',
    'aria.signals': 'Signal status',
    'aria.metrics': 'Simulation statistics',
    'aria.queues': 'Directional queues',
    'control.label': 'CONTROL',
    'control.title': 'Simulation Setup',
    'control.mode': 'Simulation Mode',
    'control.flow': 'Traffic Flow',
    'control.speed': 'Simulation Speed',
    'mode.fixedShort': 'Fixed Timing',
    'mode.adaptiveShort': 'Adaptive',
    'mode.current': 'Current Mode',
    'mode.fixed': 'FIXED TIMING',
    'mode.adaptive': 'ADAPTIVE CONTROL',
    'mode.fixedDescription': '30-second green phases regardless of demand.',
    'mode.adaptiveDescription': 'Rule-based timing responds to live queue demand.',
    'flow.low': 'Low',
    'flow.medium': 'Medium',
    'flow.high': 'High',
    'flow.unbalanced': 'Unbalanced',
    'action.start': 'Start simulation',
    'action.running': 'Simulation running',
    'action.resume': 'Resume simulation',
    'action.pause': 'Pause',
    'action.reset': 'Reset',
    'status.ready': 'READY',
    'status.running': 'SIMULATING',
    'status.paused': 'PAUSED',
    'simulation.live': 'LIVE INTERSECTION',
    'simulation.junction': 'Junction 01',
    'simulation.time': 'SIM TIME',
    'simulation.note': 'Rule-based traffic simulation · vehicles travel straight only',
    'metrics.label': 'TELEMETRY',
    'metrics.title': 'Live Metrics',
    'metrics.elapsed': 'Elapsed Time',
    'metrics.generated': 'Generated',
    'metrics.passed': 'Passed',
    'metrics.waiting': 'Waiting',
    'metrics.average': 'Avg. Wait',
    'metrics.maximum': 'Max. Wait',
    'metrics.idle': 'Total Idle',
    'signal.GREEN': 'GREEN',
    'signal.YELLOW': 'YELLOW',
    'signal.RED': 'RED',
    'signal.remaining': 'PHASE REMAINING',
    'unit.seconds': 's',
    'queue.load': 'QUEUE LOAD',
    'queue.vehicles': 'VEHICLES',
    'queue.ns': 'North / South',
    'queue.ew': 'East / West',
    'footer.project': 'GREEN LIGHT PROJECT · CONCEPT SIMULATOR',
    'footer.version': 'V1.0.0 / SINGLE INTERSECTION',
    'language.switch': '切換為繁體中文',
    'language.button': '繁中'
  },
  'zh-TW': {
    'meta.title': 'Green Light Project｜智慧交通號誌模擬器',
    'meta.description': '比較固定週期與自適應控制的單一路口交通號誌模擬器。',
    'header.subtitle': '自適應交通號誌模擬',
    'aria.systemStatus': '系統狀態',
    'aria.controls': '模擬控制面板',
    'aria.simulation': '路口模擬動畫',
    'aria.canvas': '俯視十字路口交通模擬',
    'aria.statistics': '即時統計資訊',
    'aria.signals': '號誌狀態',
    'aria.metrics': '模擬統計數據',
    'aria.queues': '各方向排隊狀況',
    'control.label': '控制中心',
    'control.title': '模擬設定',
    'control.mode': '號誌控制模式',
    'control.flow': '交通流量',
    'control.speed': '模擬速度',
    'mode.fixedShort': '固定週期',
    'mode.adaptiveShort': '自適應',
    'mode.current': '目前模式',
    'mode.fixed': '固定週期控制',
    'mode.adaptive': '自適應控制',
    'mode.fixedDescription': '不受即時車流影響，每方向固定維持 30 秒綠燈。',
    'mode.adaptiveDescription': '根據即時排隊需求，以規則動態調整號誌時間。',
    'flow.low': '低流量',
    'flow.medium': '中流量',
    'flow.high': '高流量',
    'flow.unbalanced': '不均衡',
    'action.start': '開始模擬',
    'action.running': '模擬執行中',
    'action.resume': '繼續模擬',
    'action.pause': '暫停',
    'action.reset': '重設',
    'status.ready': '待命',
    'status.running': '模擬中',
    'status.paused': '已暫停',
    'simulation.live': '即時路口',
    'simulation.junction': '路口 01',
    'simulation.time': '模擬時間',
    'simulation.note': '規則式交通模擬 · 車輛僅直線行駛',
    'metrics.label': '遙測數據',
    'metrics.title': '即時統計',
    'metrics.elapsed': '經過時間',
    'metrics.generated': '已生成',
    'metrics.passed': '已通過',
    'metrics.waiting': '等待中',
    'metrics.average': '平均等待',
    'metrics.maximum': '最長等待',
    'metrics.idle': '累積怠速',
    'signal.GREEN': '綠燈',
    'signal.YELLOW': '黃燈',
    'signal.RED': '紅燈',
    'signal.remaining': '階段剩餘時間',
    'unit.seconds': '秒',
    'queue.load': '排隊負載',
    'queue.vehicles': '車輛數',
    'queue.ns': '南北向',
    'queue.ew': '東西向',
    'footer.project': 'GREEN LIGHT PROJECT · 概念模擬器',
    'footer.version': 'V1.0.0 / 單一路口',
    'language.switch': 'Switch to English',
    'language.button': 'EN'
  }
};

export class I18n {
  constructor(toggleButton) {
    this.toggleButton = toggleButton;
    this.language = this.getInitialLanguage();
    this.apply();
  }

  getInitialLanguage() {
    try {
      const saved = localStorage.getItem('greenLightLanguage');
      if (saved && TRANSLATIONS[saved]) return saved;
    } catch (error) {
      // Storage may be unavailable in privacy-restricted contexts.
    }
    return navigator.language.toLowerCase().startsWith('zh') ? 'zh-TW' : 'en';
  }

  t(key) {
    return TRANSLATIONS[this.language][key] ?? TRANSLATIONS.en[key] ?? key;
  }

  toggle() {
    this.setLanguage(this.language === 'en' ? 'zh-TW' : 'en');
  }

  setLanguage(language) {
    if (!TRANSLATIONS[language]) return;
    this.language = language;
    try {
      localStorage.setItem('greenLightLanguage', language);
    } catch (error) {
      // The language still changes for this session if storage is unavailable.
    }
    this.apply();
  }

  apply() {
    document.documentElement.lang = this.language === 'zh-TW' ? 'zh-Hant' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = this.t(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
      element.setAttribute('aria-label', this.t(element.dataset.i18nAria));
    });
    document.querySelectorAll('[data-i18n-content]').forEach((element) => {
      element.setAttribute('content', this.t(element.dataset.i18nContent));
    });
    if (this.toggleButton) {
      this.toggleButton.textContent = this.t('language.button');
      this.toggleButton.setAttribute('aria-label', this.t('language.switch'));
      this.toggleButton.setAttribute('title', this.t('language.switch'));
    }
  }
}
