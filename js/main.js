import { Simulation } from './simulation.js';
import { I18n } from './i18n.js';

const elements = {
  canvas: document.querySelector('#simulationCanvas'),
  start: document.querySelector('#startButton'),
  pause: document.querySelector('#pauseButton'),
  reset: document.querySelector('#resetButton'),
  languageToggle: document.querySelector('#languageToggle'),
  systemStatus: document.querySelector('#systemStatus'),
  statusContainer: document.querySelector('.system-status'),
  currentMode: document.querySelector('#currentMode'),
  modeDescription: document.querySelector('#modeDescription'),
  canvasTime: document.querySelector('#canvasTime'),
  elapsedTime: document.querySelector('#elapsedTime'),
  generated: document.querySelector('#vehiclesGenerated'),
  passed: document.querySelector('#vehiclesPassed'),
  waiting: document.querySelector('#currentlyWaiting'),
  averageWait: document.querySelector('#averageWaitingTime'),
  maximumWait: document.querySelector('#maximumWaitingTime'),
  totalIdle: document.querySelector('#totalIdleTime'),
  nsQueue: document.querySelector('#nsQueue'),
  ewQueue: document.querySelector('#ewQueue'),
  nsQueueBar: document.querySelector('#nsQueueBar'),
  ewQueueBar: document.querySelector('#ewQueueBar'),
  nsSignal: document.querySelector('#nsSignal'),
  ewSignal: document.querySelector('#ewSignal'),
  nsState: document.querySelector('#nsState'),
  ewState: document.querySelector('#ewState'),
  phaseRemaining: document.querySelector('#phaseRemaining')
};

const i18n = new I18n(elements.languageToggle);
let latestState = null;

const formatTime = (seconds) => {
  const total = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const simulation = new Simulation(elements.canvas, updateInterface);

function updateInterface(state) {
  latestState = state;
  const time = formatTime(state.elapsedTime);
  elements.canvasTime.textContent = time;
  elements.elapsedTime.textContent = time;
  elements.generated.textContent = state.vehiclesGenerated;
  elements.passed.textContent = state.vehiclesPassed;
  elements.waiting.textContent = state.currentlyWaiting;
  elements.averageWait.textContent = state.averageWaitingTime.toFixed(1);
  elements.maximumWait.textContent = state.maximumWaitingTime.toFixed(1);
  elements.totalIdle.textContent = state.totalIdleTime.toFixed(1);
  elements.nsQueue.textContent = state.nsQueue;
  elements.ewQueue.textContent = state.ewQueue;
  elements.nsQueueBar.style.width = `${Math.min(100, state.nsQueue * 12.5)}%`;
  elements.ewQueueBar.style.width = `${Math.min(100, state.ewQueue * 12.5)}%`;
  elements.nsState.textContent = i18n.t(`signal.${state.nsState}`);
  elements.ewState.textContent = i18n.t(`signal.${state.ewState}`);
  elements.nsSignal.dataset.state = state.nsState.toLowerCase();
  elements.ewSignal.dataset.state = state.ewState.toLowerCase();
  elements.phaseRemaining.textContent = Math.max(0, Math.ceil(state.phaseRemaining));

  const statusKey = state.paused ? 'status.paused' : state.running ? 'status.running' : 'status.ready';
  elements.systemStatus.textContent = i18n.t(statusKey);
  elements.statusContainer.classList.toggle('running', state.running && !state.paused);
  elements.statusContainer.classList.toggle('paused', state.paused);
  const startKey = state.paused ? 'action.resume' : state.running ? 'action.running' : 'action.start';
  elements.start.textContent = i18n.t(startKey);
  elements.start.disabled = state.running && !state.paused;
  elements.pause.disabled = !state.running || state.paused;
  updateModeText(state.mode);
}

function updateModeText(mode) {
  elements.currentMode.textContent = i18n.t(mode === 'adaptive' ? 'mode.adaptive' : 'mode.fixed');
  elements.modeDescription.textContent = i18n.t(mode === 'adaptive' ? 'mode.adaptiveDescription' : 'mode.fixedDescription');
}

elements.start.addEventListener('click', () => simulation.start());
elements.pause.addEventListener('click', () => simulation.pause());
elements.reset.addEventListener('click', () => simulation.reset());
elements.languageToggle.addEventListener('click', () => {
  i18n.toggle();
  if (latestState) updateInterface(latestState);
});

document.querySelectorAll('input[name="mode"]').forEach((input) => {
  input.addEventListener('change', (event) => {
    const mode = event.target.value;
    simulation.setMode(mode);
    updateModeText(mode);
  });
});

document.querySelectorAll('input[name="flow"]').forEach((input) => {
  input.addEventListener('change', (event) => simulation.setFlow(event.target.value));
});

document.querySelectorAll('input[name="speed"]').forEach((input) => {
  input.addEventListener('change', (event) => simulation.setSpeed(event.target.value));
});
