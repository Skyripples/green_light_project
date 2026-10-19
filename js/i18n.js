const EN = {
  'meta.title': 'Green Light Project V2.0.0', 'meta.description': 'A multi-intersection corridor traffic control simulator.',
  'header.subtitle': 'Multi-Intersection Corridor Simulation', 'aria.systemStatus': 'System status', 'aria.controls': 'Simulation controls',
  'aria.simulation': 'Road network simulation', 'aria.canvas': 'Multi-intersection road network', 'aria.statistics': 'Network statistics',
  'control.label': 'CONTROL', 'control.title': 'Network Setup', 'control.strategy': 'Control Strategy', 'control.scenario': 'Traffic Scenario',
  'control.seed': 'Random Seed', 'control.speed': 'Simulation Speed',
  'strategy.fixedShort': 'Fixed', 'strategy.localShort': 'Local', 'strategy.coordinatedShort': 'Coordinated', 'strategy.current': 'Current Strategy',
  'strategy.fixed': 'FIXED TIMING', 'strategy.local': 'LOCAL ADAPTIVE', 'strategy.coordinated': 'COORDINATED ADAPTIVE',
  'strategy.fixedDescription': 'Every intersection follows a fixed signal plan.',
  'strategy.localDescription': 'Each intersection reacts only to its own queues.',
  'strategy.coordinatedDescription': 'The corridor shares platoon ETA and downstream capacity.',
  'scenario.balanced': 'Balanced', 'scenario.morning': 'Morning Peak', 'scenario.evening': 'Evening Peak',
  'scenario.mainHeavy': 'Main Road Heavy', 'scenario.secondaryHeavy': 'Secondary Road Heavy', 'scenario.offPeak': 'Off Peak',
  'action.start': 'Start simulation', 'action.running': 'Simulation running', 'action.resume': 'Resume simulation', 'action.pause': 'Pause', 'action.reset': 'Reset',
  'status.ready': 'READY', 'status.running': 'SIMULATING', 'status.paused': 'PAUSED',
  'simulation.live': 'LIVE NETWORK', 'simulation.corridor': '9-Node Corridor', 'simulation.time': 'SIM TIME',
  'simulation.note': 'Rule-based control · deterministic traffic · straight routes only',
  'metrics.label': 'NETWORK KPI', 'metrics.title': 'Live Performance', 'metrics.elapsed': 'Elapsed Time', 'metrics.active': 'Active Vehicles',
  'metrics.completed': 'Completed', 'metrics.travel': 'Avg. Travel', 'metrics.average': 'Avg. Wait', 'metrics.stops': 'Avg. Stops',
  'metrics.maximum': 'Max. Wait', 'metrics.idle': 'Total Idle', 'metrics.throughput': 'Throughput / min',
  'metrics.mainDelay': 'Main Delay', 'metrics.secondaryDelay': 'Secondary Delay', 'metrics.spillback': 'Spillback Events', 'metrics.greenWave': 'Green Wave',
  'network.intersections': 'Intersections', 'network.platoons': 'Platoons', 'network.congestion': 'Congested', 'unit.seconds': 's',
  'queue.load': 'CORRIDOR QUEUE', 'queue.vehicles': 'VEHICLES', 'queue.main': 'Main road', 'queue.secondary': 'Secondary',
  'footer.project': 'GREEN LIGHT PROJECT · CORRIDOR CONTROL LAB', 'footer.version': 'V2.0.0 / 9 INTERSECTIONS',
  'language.switch': '切換為繁體中文', 'language.button': '繁中'
};

const ZH = {
  'meta.title': 'Green Light Project V2.0.0｜多路口幹道模擬', 'meta.description': '比較三種規則式控制策略的多路口交通幹道模擬器。',
  'header.subtitle': '多路口幹道交通模擬', 'aria.systemStatus': '系統狀態', 'aria.controls': '模擬控制面板',
  'aria.simulation': '道路網路模擬', 'aria.canvas': '多路口道路網路', 'aria.statistics': '路網統計資料',
  'control.label': '控制中心', 'control.title': '路網設定', 'control.strategy': '控制策略', 'control.scenario': '交通情境',
  'control.seed': '隨機種子', 'control.speed': '模擬速度',
  'strategy.fixedShort': '固定配時', 'strategy.localShort': '局部自適應', 'strategy.coordinatedShort': '協調控制', 'strategy.current': '目前策略',
  'strategy.fixed': '固定週期控制', 'strategy.local': '局部自適應控制', 'strategy.coordinated': '協調式自適應控制',
  'strategy.fixedDescription': '每個路口依照固定秒數獨立切換號誌。',
  'strategy.localDescription': '每個路口只依據自己的排隊狀態調整。',
  'strategy.coordinatedDescription': '整條幹道共享車隊 ETA 與下游容量資訊。',
  'scenario.balanced': '均衡車流', 'scenario.morning': '早晨尖峰', 'scenario.evening': '傍晚尖峰',
  'scenario.mainHeavy': '主幹道高流量', 'scenario.secondaryHeavy': '次幹道高流量', 'scenario.offPeak': '離峰時段',
  'action.start': '開始模擬', 'action.running': '模擬執行中', 'action.resume': '繼續模擬', 'action.pause': '暫停', 'action.reset': '重設',
  'status.ready': '待命', 'status.running': '模擬中', 'status.paused': '已暫停',
  'simulation.live': '即時路網', 'simulation.corridor': '九路口幹道路網', 'simulation.time': '模擬時間',
  'simulation.note': '規則式控制 · 可重現車流 · 車輛僅直行',
  'metrics.label': '路網指標', 'metrics.title': '即時效能', 'metrics.elapsed': '經過時間', 'metrics.active': '路網內車輛',
  'metrics.completed': '已完成旅次', 'metrics.travel': '平均旅行時間', 'metrics.average': '平均等待', 'metrics.stops': '平均停車次數',
  'metrics.maximum': '最長等待', 'metrics.idle': '累積怠速', 'metrics.throughput': '每分鐘通行量',
  'metrics.mainDelay': '主幹道延滯', 'metrics.secondaryDelay': '次幹道延滯', 'metrics.spillback': '回堵事件', 'metrics.greenWave': '綠波成功率',
  'network.intersections': '路口', 'network.platoons': '車隊', 'network.congestion': '壅塞路段', 'unit.seconds': '秒',
  'queue.load': '幹道排隊', 'queue.vehicles': '車輛數', 'queue.main': '主幹道', 'queue.secondary': '次幹道',
  'footer.project': 'GREEN LIGHT PROJECT · 幹道控制實驗室', 'footer.version': 'V2.0.0 / 九個路口',
  'language.switch': 'Switch to English', 'language.button': 'EN'
};

const TRANSLATIONS = { en: EN, 'zh-TW': ZH };

export class I18n {
  constructor(toggleButton) { this.toggleButton = toggleButton; this.language = this.getInitialLanguage(); this.apply(); }
  getInitialLanguage() {
    try { const saved = localStorage.getItem('greenLightLanguage'); if (TRANSLATIONS[saved]) return saved; } catch (error) { void error; }
    return navigator.language.toLowerCase().startsWith('zh') ? 'zh-TW' : 'en';
  }
  t(key) { return TRANSLATIONS[this.language][key] ?? EN[key] ?? key; }
  toggle() { this.setLanguage(this.language === 'en' ? 'zh-TW' : 'en'); }
  setLanguage(language) {
    if (!TRANSLATIONS[language]) return;
    this.language = language;
    try { localStorage.setItem('greenLightLanguage', language); } catch (error) { void error; }
    this.apply();
  }
  apply() {
    document.documentElement.lang = this.language === 'zh-TW' ? 'zh-Hant' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = this.t(element.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach((element) => { element.setAttribute('aria-label', this.t(element.dataset.i18nAria)); });
    document.querySelectorAll('[data-i18n-content]').forEach((element) => { element.setAttribute('content', this.t(element.dataset.i18nContent)); });
    if (this.toggleButton) {
      this.toggleButton.textContent = this.t('language.button');
      this.toggleButton.setAttribute('aria-label', this.t('language.switch'));
      this.toggleButton.title = this.t('language.switch');
    }
  }
}
