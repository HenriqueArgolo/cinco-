import { AppSettings, DEFAULT_SETTINGS } from '../types';

const SETTINGS_KEY = 'blowout_monitor_settings';
const NOTIFIED_KEY = 'blowout_monitor_notified_ids';

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings', error);
  }
};

export const getSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch (error) {
    console.error('Failed to load settings', error);
    return DEFAULT_SETTINGS;
  }
};

export const getNotifiedMatchIds = (): Set<number> => {
  try {
    const saved = localStorage.getItem(NOTIFIED_KEY);
    if (!saved) return new Set();
    const parsed = JSON.parse(saved);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    return new Set();
  }
};

export const addNotifiedMatchId = (id: number): void => {
  try {
    const current = getNotifiedMatchIds();
    current.add(id);
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(Array.from(current)));
  } catch (error) {
    console.error('Failed to save notified match ID', error);
  }
};

export const clearNotifiedMatchIds = (): void => {
  localStorage.removeItem(NOTIFIED_KEY);
};