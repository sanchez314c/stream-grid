export interface AppSettings {
  general: GeneralSettings;
  display: DisplaySettings;
  performance: PerformanceSettings;
  audio: AudioSettings;
  advanced: AdvancedSettings;
}

export interface GeneralSettings {
  theme: 'dark' | 'light';
  language: string;
  autoStart: boolean;
  minimizeToTray: boolean;
  checkUpdates: boolean;
  defaultLayout: string;
  streamLibraryPath: string;
}

export interface DisplaySettings {
  windowMode: 'windowed' | 'frameless' | 'fullscreen';
  alwaysOnTop: boolean;
  hardwareAcceleration: boolean;
  vsync: boolean;
  defaultAspectRatio: AspectRatio;
  gridGapSize: number;
  showLabels: boolean;
  showStatistics: boolean;
  labelPosition: 'top' | 'bottom' | 'overlay';
}

export interface PerformanceSettings {
  maxConcurrentStreams: number;
  streamBufferSize: number;
  decoderThreads: number;
  gpuDecoding: boolean;
  adaptiveQuality: boolean;
  targetCpuUsage: number;
  targetMemoryUsage: number;
  // New GPU acceleration control system
  accelerationMode: 'gpu' | 'cpu';
  hardwareVerification: boolean;
  forceHardwareDecoding: boolean;
  videoToolboxEnabled: boolean;
}

export interface AudioSettings {
  defaultVolume: number;
  defaultMuted: boolean;
  outputDevice: string;
  enableAudioMixing: boolean;
  audioLatency: number;
  normalizationEnabled: boolean;
  compressionEnabled: boolean;
}

export interface AdvancedSettings {
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  logPath: string;
  enableTelemetry: boolean;
  proxySettings: ProxySettings;
  rtmpTimeout: number;
  rtmpBufferTime: number;
  
  // Advanced Controls Settings
  advancedControls: AdvancedControlsSettings;
}

// Advanced Controls Type Definitions
export interface AdvancedControlsSettings {
  enabled: boolean;
  profiles: AdvancedControlsProfileSettings;
  keyboard: KeyboardControlsSettings;
  recording: RecordingSettings;
  vfxFilters: VFXFilterSettings;
  randomizer: RandomizerSettings;
  windowManagement: WindowManagementSettings;
}

export interface AdvancedControlsProfileSettings {
  activeProfile: string;
  customProfiles: Record<string, AdvancedControlsProfile>;
  windowProfiles: Record<string, string>; // windowId -> profileName
}

export interface AdvancedControlsProfile {
  id: string;
  name: string;
  description: string;
  settings: {
    keyboard: boolean;
    recording: boolean;
    vfxFilters: boolean;
    randomizer: boolean;
    indicators: boolean;
    storageMonitoring: boolean;
  };
}

export interface KeyboardControlsSettings {
  enabled: boolean;
  shortcuts: {
    randomizeGrid: string;
    reloadStreams: string;
    pausePlayback: string;
    stopStreams: string;
    toggleRecording: string;
    cycleVFX: string;
  };
}

export type RecordingQuality = 'high' | 'medium' | 'low' | 'custom';

export interface StreamRecordingState {
  isRecording: boolean;
  startTime: Date | null;
  outputFile: string | null;
  processId: string | null;
  duration: number;
  fileSize: number;
  status: 'idle' | 'starting' | 'recording' | 'stopping' | 'error';
  errorMessage?: string;
}

export interface RecordingSettings {
  enabled: boolean;
  outputPath: string;
  fileNaming: 'timestamp' | 'streamname_timestamp' | 'custom';
  videoQuality: RecordingQuality;
  hardwareAcceleration: boolean;
  customSettings: {
    width: number;
    height: number;
    bitrate: number;
    codec: 'h264' | 'h265';
  };
  storageMonitoring: {
    enabled: boolean;
    warningThreshold: number;
    autoStopThreshold: number;
  };
}

export interface VFXFilterSettings {
  enabled: boolean;
  availableFilters: VFXFilter[];
  perTileSettings: Record<string, TileVFXSettings>;
}

export interface VFXFilter {
  id: string;
  name: string;
  type: 'vhs' | 'grain' | 'interference' | 'custom';
  intensity: number;
  enabled: boolean;
}

export interface TileVFXSettings {
  activeFilters: VFXFilter[];
  presetName: string | null;
  customSettings: Record<string, any>;
}

export type RandomizerInterval = 1 | 15 | 30;

export interface RandomizerSettings {
  enabled: boolean;
  interval: RandomizerInterval;
  smartRandomization: boolean;
  profileSets: Record<string, string[]>;
}

export interface WindowManagementSettings {
  profileSyncAcrossWindows: boolean;
  inheritProfileForNewWindows: boolean;
  showProfileIndicators: boolean;
}

// Built-in Profiles
export const BUILTIN_ADVANCED_PROFILES: Record<string, AdvancedControlsProfile> = {
  clean: {
    id: 'clean',
    name: 'Clean',
    description: 'All Advanced Controls disabled for clean viewing experience',
    settings: {
      keyboard: false,
      recording: false,
      vfxFilters: false,
      randomizer: false,
      indicators: false,
      storageMonitoring: false,
    },
  },
  broadcast: {
    id: 'broadcast',
    name: 'Broadcast',
    description: 'Recording and keyboard shortcuts for professional broadcasting',
    settings: {
      keyboard: true,
      recording: true,
      vfxFilters: false,
      randomizer: false,
      indicators: true,
      storageMonitoring: true,
    },
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'All features enabled for creative content production',
    settings: {
      keyboard: true,
      recording: true,
      vfxFilters: true,
      randomizer: true,
      indicators: true,
      storageMonitoring: true,
    },
  },
  monitoring: {
    id: 'monitoring',
    name: 'Monitoring',
    description: 'Randomizer and shortcuts for stream monitoring workflows',
    settings: {
      keyboard: true,
      recording: false,
      vfxFilters: false,
      randomizer: true,
      indicators: false,
      storageMonitoring: false,
    },
  },
};

export interface ProxySettings {
  enabled: boolean;
  host: string;
  port: number;
  username?: string;
  password?: string;
}

import { AspectRatio } from './layout';

export const DEFAULT_SETTINGS: AppSettings = {
  general: {
    theme: 'dark',
    language: 'en',
    autoStart: false,
    minimizeToTray: false,
    checkUpdates: true,
    defaultLayout: '2x2',
    streamLibraryPath: ''
  },
  display: {
    windowMode: 'windowed',
    alwaysOnTop: false,
    hardwareAcceleration: true,
    vsync: true,
    defaultAspectRatio: AspectRatio.SIXTEEN_NINE,
    gridGapSize: 4,
    showLabels: true,
    showStatistics: false,
    labelPosition: 'bottom'
  },
  performance: {
    maxConcurrentStreams: 9,
    streamBufferSize: 128,
    decoderThreads: 4,
    gpuDecoding: true,
    adaptiveQuality: true,
    targetCpuUsage: 60,
    targetMemoryUsage: 2048,
    accelerationMode: 'gpu',
    hardwareVerification: true,
    forceHardwareDecoding: false,
    videoToolboxEnabled: true
  },
  audio: {
    defaultVolume: 50,
    defaultMuted: false,
    outputDevice: 'default',
    enableAudioMixing: false,
    audioLatency: 50,
    normalizationEnabled: false,
    compressionEnabled: false
  },
  advanced: {
    logLevel: 'info',
    logPath: '',
    enableTelemetry: false,
    proxySettings: {
      enabled: false,
      host: '',
      port: 0
    },
    rtmpTimeout: 10000,
    rtmpBufferTime: 1000,
    
    // Advanced Controls Default Settings
    advancedControls: {
      enabled: false,
      profiles: {
        activeProfile: 'clean',
        customProfiles: {},
        windowProfiles: {},
      },
      keyboard: {
        enabled: true,
        shortcuts: {
          randomizeGrid: 'ArrowRight',
          reloadStreams: 'ArrowLeft',
          pausePlayback: 'Space',
          stopStreams: 'ArrowDown',
          toggleRecording: 'KeyR',
          cycleVFX: 'KeyF',
        },
      },
      recording: {
        enabled: false,
        outputPath: '',
        fileNaming: 'streamname_timestamp',
        videoQuality: 'high',
        hardwareAcceleration: true,
        customSettings: {
          width: 1920,
          height: 1080,
          bitrate: 5000,
          codec: 'h264',
        },
        storageMonitoring: {
          enabled: true,
          warningThreshold: 5, // 5GB
          autoStopThreshold: 1, // 1GB
        },
      },
      vfxFilters: {
        enabled: false,
        availableFilters: [
          { id: 'vhs', name: 'VHS Distortion', type: 'vhs', intensity: 50, enabled: false },
          { id: 'grain', name: 'Film Grain', type: 'grain', intensity: 30, enabled: false },
          { id: 'interference', name: 'Static Interference', type: 'interference', intensity: 40, enabled: false },
        ],
        perTileSettings: {},
      },
      randomizer: {
        enabled: false,
        interval: 15,
        smartRandomization: true,
        profileSets: {},
      },
      windowManagement: {
        profileSyncAcrossWindows: false,
        inheritProfileForNewWindows: true,
        showProfileIndicators: true,
      },
    },
  }
};