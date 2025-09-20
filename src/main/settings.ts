import { AppSettings, DEFAULT_SETTINGS } from '../shared/types/settings';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

// Use a simple JSON file for settings instead of electron-store to avoid ES module issues
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function readSettingsFile(): AppSettings {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error reading settings:', error);
  }
  return DEFAULT_SETTINGS;
}

function writeSettingsFile(settings: AppSettings): void {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error writing settings:', error);
  }
}

export async function loadSettings(): Promise<AppSettings> {
  const settings = readSettingsFile();
  
  // Set default paths if not set
  if (!settings.general.streamLibraryPath) {
    settings.general.streamLibraryPath = path.join(app.getPath('userData'), 'streams.db');
  }
  
  if (!settings.advanced.logPath) {
    settings.advanced.logPath = path.join(app.getPath('userData'), 'logs');
  }
  
  writeSettingsFile(settings);
  return settings;
}

export async function saveSettings(settings?: Partial<AppSettings>) {
  if (settings) {
    const currentSettings = readSettingsFile();
    const newSettings = { ...currentSettings, ...settings };
    writeSettingsFile(newSettings);
  }
}

export async function getSettings(): Promise<AppSettings> {
  return readSettingsFile();
}

// Allowed setting paths for validation - FIXED: Added all missing paths
const ALLOWED_SETTING_PATHS = [
  // General settings
  'general.theme',
  'general.language',
  'general.autoStart',
  'general.minimizeToTray',
  'general.checkUpdates',
  'general.defaultLayout',
  'general.streamLibraryPath',
  
  // Display settings
  'display.windowMode',
  'display.alwaysOnTop',
  'display.hardwareAcceleration',
  'display.vsync',
  'display.defaultAspectRatio',
  'display.gridGapSize',
  'display.showLabels',
  'display.showStatistics',
  'display.labelPosition',
  
  // Performance settings
  'performance.maxConcurrentStreams',
  'performance.streamBufferSize',
  'performance.decoderThreads',
  'performance.gpuDecoding',
  'performance.adaptiveQuality',
  'performance.targetCpuUsage',
  'performance.targetMemoryUsage',
  
  // Audio settings  
  'audio.defaultVolume',
  'audio.defaultMuted',
  'audio.outputDevice',
  'audio.enableAudioMixing',
  'audio.audioLatency',
  'audio.normalizationEnabled',
  'audio.compressionEnabled',
  
  // Advanced settings
  'advanced.logLevel',
  'advanced.logPath',
  'advanced.enableTelemetry',
  'advanced.rtmpTimeout',
  'advanced.rtmpBufferTime',
  'advanced.proxySettings.enabled',
  'advanced.proxySettings.host',
  'advanced.proxySettings.port',
  'advanced.proxySettings.username',
  'advanced.proxySettings.password'
];

export async function updateSettings(path: string, value: unknown) {
  // Validate the path against allowed paths
  if (!ALLOWED_SETTING_PATHS.includes(path)) {
    console.error(`Attempted to update disallowed setting path: ${path}`);
    throw new Error('Invalid settings path');
  }
  
  const settings = readSettingsFile();
  
  // Simple path setter with validation
  const keys = path.split('.');
  let obj: Record<string, any> = settings;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) {
      obj[keys[i]] = {};
    }
    obj = obj[keys[i]];
  }
  
  obj[keys[keys.length - 1]] = value;
  writeSettingsFile(settings);
}