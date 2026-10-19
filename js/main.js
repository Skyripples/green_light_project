import { Simulation } from './simulation.js';
import { I18n } from './i18n.js';

const $ = (selector) => document.querySelector(selector);
const elements = {
  canvas: $('#simulationCanvas'), start: $('#startButton'), pause: $('#pauseButton'), reset: $('#resetButton'),
  languageToggle: $('#languageToggle'), systemStatus: $('#systemStatus'), statusContainer: $('.system-status'),
  currentStrategy: $('#currentStrategy'), strategyDescription: $('#strategyDescription'), scenario: $('#scenarioSelect'), seed: $('#seedInput'),
  canvasTime: $('#canvasTime'), elapsedTime: $('#elapsedTime'), activeVehicles: $('#activeVehicles'), completedVehicles: $('#completedVehicles'),
  averageTravelTime: $('#averageTravelTime'), averageWaitingTime: $('#averageWaitingTime'), averageStops: $('#averageStops'),
  maximumWaitingTime: $('#maximumWaitingTime'), totalIdleTime: $('#totalIdleTime'), throughput: $('#throughput'),
  mainRoadDelay: $('#mainRoadDelay'), secondaryRoadDelay: $('#secondaryRoadDelay'), spillbackEvents: $('#spillbackEvents'),
  greenWaveSuccessRate: $('#greenWaveSuccessRate'), platoons: $('#platoons'), congestedSegments: $('#congestedSegments'),
  mainQueue: $('#mainQueue'), secondaryQueue: $('#secondaryQueue'), mainQueueBar: $('#mainQueueBar'), secondaryQueueBar: $('#secondaryQueueBar')
};

const i18n = new I18n(elements.languageToggle);
let latestState = null;
const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const simulation = new Simulation(elements.canvas, updateInterface);

function updateInterface(state) {
  latestState = state;
  const time = formatTime(state.elapsedTime);
  elements.canvasTime.textContent = time;
  elements.elapsedTime.textContent = time;
  for (const key of ['activeVehicles', 'completedVehicles', 'spillbackEvents', 'platoons', 'congestedSegments']) elements[key].textContent = state[key];
  for (const key of ['averageTravelTime', 'averageWaitingTime', 'averageStops', 'maximumWaitingTime', 'throughput', 'mainRoadDelay', 'secondaryRoadDelay', 'greenWaveSuccessRate']) elements[key].textContent = state[key].toFixed(1);
  elements.totalIdleTime.textContent = state.totalIdleTime.toFixed(0);
  elements.mainQueue.textContent = state.mainQueue;
  elements.secondaryQueue.textContent = state.secondaryQueue;
  elements.mainQueueBar.style.width = `${Math.min(100, state.mainQueue * 5)}%`;
  elements.secondaryQueueBar.style.width = `${Math.min(100, state.secondaryQueue * 5)}%`;
  const statusKey = state.paused ? 'status.paused' : state.running ? 'status.running' : 'status.ready';
  elements.systemStatus.textContent = i18n.t(statusKey);
  elements.statusContainer.classList.toggle('running', state.running && !state.paused);
  elements.statusContainer.classList.toggle('paused', state.paused);
  elements.start.textContent = i18n.t(state.paused ? 'action.resume' : state.running ? 'action.running' : 'action.start');
  elements.start.disabled = state.running && !state.paused;
  elements.pause.disabled = !state.running || state.paused;
  updateStrategyText(state.strategy);
}

function updateStrategyText(strategy) {
  elements.currentStrategy.textContent = i18n.t(`strategy.${strategy}`);
  elements.strategyDescription.textContent = i18n.t(`strategy.${strategy}Description`);
}

elements.start.addEventListener('click', () => simulation.start());
elements.pause.addEventListener('click', () => simulation.pause());
elements.reset.addEventListener('click', () => simulation.reset());
elements.languageToggle.addEventListener('click', () => { i18n.toggle(); if (latestState) updateInterface(latestState); });
elements.scenario.addEventListener('change', (event) => simulation.setScenario(event.target.value));
elements.seed.addEventListener('change', (event) => { const seed = Math.max(1, Number(event.target.value) || 42); event.target.value = seed; simulation.setSeed(seed); });
document.querySelectorAll('input[name="strategy"]').forEach((input) => input.addEventListener('change', (event) => simulation.setStrategy(event.target.value)));
document.querySelectorAll('input[name="speed"]').forEach((input) => input.addEventListener('change', (event) => simulation.setSpeed(event.target.value)));
