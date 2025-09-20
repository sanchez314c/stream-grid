import '@testing-library/jest-dom';

import { vi } from 'vitest';

// Mock window.api for tests
global.window = {
  ...global.window,
  api: {
    stream: {
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn(() => Promise.resolve([])),
      validate: vi.fn(() => Promise.resolve({ valid: true }))
    },
    layout: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn(() => Promise.resolve([])),
      setActive: vi.fn()
    },
    settings: {
      get: vi.fn(() => Promise.resolve({
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
          defaultAspectRatio: '16:9',
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
          targetMemoryUsage: 2048
        },
        audio: {
          defaultVolume: 50,
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
          rtmpBufferTime: 1000
        }
      })),
      update: vi.fn()
    },
    system: {
      getInfo: vi.fn(() => Promise.resolve({
        cpuUsage: 35,
        memoryUsage: 1200,
        platform: 'darwin',
        version: '28.0.0'
      }))
    },
    on: vi.fn(),
    removeAllListeners: vi.fn()
  }
} as any;