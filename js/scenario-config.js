export const SCENARIOS = Object.freeze({
  balanced: { label: 'Balanced', intervals: { east: [3.5, 6], west: [3.5, 6], north: [3.8, 6.5], south: [3.8, 6.5], localMain: [8, 13], localSecondary: [8, 13] } },
  morning: { label: 'Morning Peak', intervals: { east: [1.5, 2.8], west: [4.5, 7], north: [2.2, 4], south: [5, 8], localMain: [7, 11], localSecondary: [7, 11] } },
  evening: { label: 'Evening Peak', intervals: { east: [4.5, 7], west: [1.5, 2.8], north: [5, 8], south: [2.2, 4], localMain: [7, 11], localSecondary: [7, 11] } },
  mainHeavy: { label: 'Main Road Heavy', intervals: { east: [1.4, 2.6], west: [1.4, 2.6], north: [5.5, 9], south: [5.5, 9], localMain: [9, 14], localSecondary: [7, 12] } },
  secondaryHeavy: { label: 'Secondary Road Heavy', intervals: { east: [5.5, 9], west: [5.5, 9], north: [1.4, 2.6], south: [1.4, 2.6], localMain: [7, 12], localSecondary: [9, 14] } },
  offPeak: { label: 'Off Peak', intervals: { east: [10, 16], west: [10, 16], north: [11, 18], south: [11, 18], localMain: [18, 28], localSecondary: [18, 28] } }
});
export function getScenario(id) { return SCENARIOS[id] || SCENARIOS.balanced; }
