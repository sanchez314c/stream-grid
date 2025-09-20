import { contextBridge, ipcRenderer } from 'electron';
import { Stream, ValidationResult } from '../shared/types/stream';
import { Layout } from '../shared/types/layout';
import { AppSettings, RecordingQuality, StreamRecordingState, VFXFilter } from '../shared/types/settings';
import { DiscoveryOptions, DiscoveryProgress, DiscoveryResult } from '../shared/types/discovery';

const api = {
  stream: {
    add: (url: string, label: string): Promise<Stream> => 
      ipcRenderer.invoke('stream:add', url, label),
    update: (streamId: string, updates: Partial<Stream>): Promise<void> => 
      ipcRenderer.invoke('stream:update', streamId, updates),
    delete: (streamId: string): Promise<void> => 
      ipcRenderer.invoke('stream:delete', streamId),
    getAll: (): Promise<Stream[]> => 
      ipcRenderer.invoke('stream:getAll'),
    get: (streamId: string): Promise<Stream | null> => 
      ipcRenderer.invoke('stream:get', streamId),
    save: (stream: Stream): Promise<void> => 
      ipcRenderer.invoke('stream:save', stream),
    validate: (url: string): Promise<ValidationResult> => 
      ipcRenderer.invoke('stream:validate', url)
  },
  
  db: {
    getStreams: (): Promise<Stream[]> => 
      ipcRenderer.invoke('stream:getAll'),
    getStream: (streamId: string): Promise<Stream | null> => 
      ipcRenderer.invoke('stream:get', streamId)
  },
  
  layout: {
    create: (name: string, grid: any): Promise<Layout> => 
      ipcRenderer.invoke('layout:create', name, grid),
    update: (layoutId: string, updates: Partial<Layout>): Promise<void> => 
      ipcRenderer.invoke('layout:update', layoutId, updates),
    delete: (layoutId: string): Promise<void> => 
      ipcRenderer.invoke('layout:delete', layoutId),
    getAll: (): Promise<Layout[]> => 
      ipcRenderer.invoke('layout:getAll'),
    setActive: (layoutId: string): Promise<void> => 
      ipcRenderer.invoke('layout:setActive', layoutId)
  },
  
  settings: {
    get: (): Promise<AppSettings> => 
      ipcRenderer.invoke('settings:get'),
    update: (path: string, value: any): Promise<void> => 
      ipcRenderer.invoke('settings:update', path, value)
  },
  
  system: {
    getInfo: (): Promise<any> => 
      ipcRenderer.invoke('system:getInfo')
  },

  discovery: {
    start: (options?: Partial<DiscoveryOptions>): Promise<string> =>
      ipcRenderer.invoke('discovery:start', options),
    stop: (sessionId: string): Promise<void> =>
      ipcRenderer.invoke('discovery:stop', sessionId),
    getProgress: (sessionId: string): Promise<DiscoveryProgress> =>
      ipcRenderer.invoke('discovery:getProgress', sessionId),
    getResults: (sessionId: string): Promise<DiscoveryResult> =>
      ipcRenderer.invoke('discovery:getResults', sessionId)
  },

  monitoring: {
    startBandwidth: (): Promise<string> =>
      ipcRenderer.invoke('monitoring:startBandwidth'),
    stopBandwidth: (): Promise<string> =>
      ipcRenderer.invoke('monitoring:stopBandwidth'),
    getBandwidthMetrics: (): Promise<any[]> =>
      ipcRenderer.invoke('monitoring:getBandwidthMetrics'),
    startGPU: (): Promise<string> =>
      ipcRenderer.invoke('monitoring:startGPU'),
    stopGPU: (): Promise<string> =>
      ipcRenderer.invoke('monitoring:stopGPU'),
    getGPUInfo: (): Promise<any> =>
      ipcRenderer.invoke('monitoring:getGPUInfo'),
    getHardwareVerification: (): Promise<any> =>
      ipcRenderer.invoke('monitoring:getHardwareVerification'),
    performHardwareVerification: (): Promise<any> =>
      ipcRenderer.invoke('monitoring:performHardwareVerification')
  },

  hardware: {
    verify: (): Promise<any> =>
      ipcRenderer.invoke('hardware:verify'),
    getVerification: (): Promise<any> =>
      ipcRenderer.invoke('hardware:getVerification'),
    getVideoToolboxInfo: (): Promise<any> =>
      ipcRenderer.invoke('hardware:getVideoToolboxInfo'),
    startContinuousVerification: (intervalMs?: number): Promise<string> =>
      ipcRenderer.invoke('hardware:startContinuousVerification', intervalMs),
    stopContinuousVerification: (): Promise<string> =>
      ipcRenderer.invoke('hardware:stopContinuousVerification')
  },

  // Advanced Controls API
  advancedControls: {
    // Recording controls
    startRecording: (streamId: string, streamUrl: string, quality: RecordingQuality, outputPath?: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('advanced-controls:start-recording', streamId, streamUrl, quality, outputPath),
    stopRecording: (streamId: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('advanced-controls:stop-recording', streamId),
    pauseRecording: (streamId: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('advanced-controls:pause-recording', streamId),
    getRecordingState: (streamId: string): Promise<StreamRecordingState | null> =>
      ipcRenderer.invoke('advanced-controls:get-recording-state', streamId),

    // Randomizer controls
    randomizeNow: (): Promise<void> =>
      ipcRenderer.invoke('advanced-controls:randomize-now'),
    randomizeSingleTile: (): Promise<void> =>
      ipcRenderer.invoke('advanced-controls:randomize-single-tile'),

    // VFX controls
    applyVFXFilter: (streamId: string, filters: VFXFilter[]): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('advanced-controls:apply-vfx-filter', streamId, filters),
    updateVFXIntensity: (streamId: string, filterIndex: number, intensity: number): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('advanced-controls:update-vfx-intensity', streamId, filterIndex, intensity),

    // Stream controls
    reloadStreams: (): Promise<void> =>
      ipcRenderer.invoke('advanced-controls:reload-streams'),
    pauseStreams: (): Promise<void> =>
      ipcRenderer.invoke('advanced-controls:pause-streams'),
    stopStreams: (): Promise<void> =>
      ipcRenderer.invoke('advanced-controls:stop-streams')
  },

  // Storage monitoring API
  storage: {
    getInfo: (path: string): Promise<any> =>
      ipcRenderer.invoke('storage:getInfo', path),
    openRecordingFolder: (path: string): Promise<void> =>
      ipcRenderer.invoke('storage:openRecordingFolder', path),
    cleanup: (path: string): Promise<void> =>
      ipcRenderer.invoke('storage:cleanup', path)
  },
  
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = [
      'menu:add-stream',
      'menu:import-layout', 
      'menu:export-layout',
      'menu:settings',
      'menu:layout',
      'menu:toggle-frameless',
      'menu:toggle-statistics',
      'menu:toggle-labels',
      'window:fullscreen',
      'discovery:progress',
      'discovery:completed',
      'discovery:error',
      'discovery:stopped',
      'monitoring:bandwidth',
      'monitoring:gpu',
      'hardware:verification-complete',
      'hardware:verification-error',
      // Advanced Controls event channels
      'recording:finished',
      'recording:error',
      'advanced-controls:execute-randomize',
      'advanced-controls:execute-randomize-single',
      'advanced-controls:vfx-applied',
      'advanced-controls:vfx-intensity-updated',
      'advanced-controls:execute-reload-streams',
      'advanced-controls:execute-pause-streams',
      'advanced-controls:execute-stop-streams'
    ];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    }
  },
  
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
};

contextBridge.exposeInMainWorld('api', api);

export type IpcApi = typeof api;