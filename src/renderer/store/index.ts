import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import { Stream, StreamStatus } from '@shared/types/stream';
import { Layout } from '@shared/types/layout';

// Enable Map and Set support in Immer
enableMapSet();

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  fps: number;
  droppedFrames: number;
}

// Advanced Controls State Interfaces
interface StreamRecordingState {
  isRecording: boolean;
  startTime: Date | null;
  outputFile: string | null;
  processId: string | null;
  duration: number;
  fileSize: number;
  status: 'idle' | 'starting' | 'recording' | 'stopping' | 'error';
  errorMessage?: string;
}

interface TileVFXState {
  activeFilters: Array<{
    id: string;
    name: string;
    type: 'vhs' | 'grain' | 'interference' | 'custom';
    intensity: number;
    enabled: boolean;
  }>;
  presetName: string | null;
  customSettings: Record<string, any>;
}

interface StreamGridStore {
  // Streams
  streams: Map<string, Stream>;
  activeStreams: Set<string>;
  streamConnectionCount: number; // FIXED: Centralized stream counter to prevent race conditions
  
  // Layouts
  layouts: Map<string, Layout>;
  activeLayoutId: string | null;
  
  // UI State
  isFullscreen: boolean;
  isFrameless: boolean;
  showStatistics: boolean;
  showLabels: boolean;
  selectedStreamId: string | null;
  
  // Performance
  performanceMetrics: PerformanceMetrics;
  
  // Video Settings
  bufferSize: number; // Buffer size in seconds (1-30)
  
  // GPU Acceleration Control
  accelerationMode: 'gpu' | 'cpu';
  hardwareVerificationStatus: 'unknown' | 'verifying' | 'active' | 'inactive' | 'failed';
  
  // Advanced Controls State
  advancedControls: {
    enabled: boolean;
    activeProfile: string;
    windowProfiles: Map<string, string>; // windowId -> profileName
    
    // Recording state
    recordingState: Map<string, StreamRecordingState>; // streamId -> recording state
    recordingProcesses: Map<string, string>; // streamId -> processId
    
    // VFX state
    vfxFilters: Map<string, TileVFXState>; // streamId -> VFX state
    
    // Randomizer state
    randomizerActive: boolean;
    randomizerTimer: NodeJS.Timeout | null;
    randomizerInterval: 1 | 15 | 30;
    lastRandomizedStreams: string[];
    
    // Keyboard state
    keyboardShortcutsEnabled: boolean;
    focusedWindow: string | null;
    
    // Storage monitoring
    storageWarning: boolean;
    availableStorage: number;
  };
  
  // Actions
  addStream: (stream: Stream) => void;
  removeStream: (streamId: string) => void;
  updateStream: (streamId: string, updates: Partial<Stream>) => void;
  connectStream: (streamId: string) => void;
  disconnectStream: (streamId: string) => void;
  incrementStreamCount: () => void;
  decrementStreamCount: () => void;
  
  setActiveLayout: (layoutId: string) => void;
  createLayout: (layout: Layout) => void;
  updateLayout: (layoutId: string, updates: Partial<Layout>) => void;
  deleteLayout: (layoutId: string) => void;
  
  toggleFullscreen: () => void;
  toggleFrameless: () => void;
  toggleStatistics: () => void;
  toggleLabels: () => void;
  
  updatePerformanceMetrics: (metrics: PerformanceMetrics) => void;
  setBufferSize: (size: number) => void;
  
  // GPU Acceleration Actions
  setAccelerationMode: (mode: 'gpu' | 'cpu') => void;
  setHardwareVerificationStatus: (status: 'unknown' | 'verifying' | 'active' | 'inactive' | 'failed') => void;
  
  // Advanced Controls Actions
  setAdvancedControlsProfile: (profileName: string, windowId?: string) => void;
  toggleAdvancedControls: (windowId?: string) => void;
  
  // Recording actions
  startRecording: (streamId: string) => void;
  stopRecording: (streamId: string) => void;
  updateRecordingState: (streamId: string, state: Partial<StreamRecordingState>) => void;
  
  // VFX actions
  toggleVFXFilter: (streamId: string, filterId: string) => void;
  setVFXIntensity: (streamId: string, filterId: string, intensity: number) => void;
  applyVFXPreset: (streamId: string, presetName: string) => void;
  
  // Randomizer actions
  startRandomizer: (interval: 1 | 15 | 30) => void;
  stopRandomizer: () => void;
  triggerRandomization: () => void;
  
  // Keyboard actions
  handleKeyboardShortcut: (key: string, windowId: string) => void;
  setFocusedWindow: (windowId: string) => void;
  
  // Storage monitoring
  updateStorageStatus: (available: number, warning: boolean) => void;
  
  // Stream selection
  setSelectedStreamId: (streamId: string | null) => void;
  
  // Initialize
  loadStreams: (streams: Stream[]) => void;
  loadLayouts: (layouts: Layout[]) => void;
  resetStore: () => void;
}

export const useStreamGridStore = create<StreamGridStore>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        streams: new Map(),
        activeStreams: new Set(),
        streamConnectionCount: 0,
        layouts: new Map(),
        activeLayoutId: null,
        isFullscreen: false,
        isFrameless: false,
        showStatistics: false,
        showLabels: true,
        selectedStreamId: null,
        performanceMetrics: {
          cpuUsage: 0,
          memoryUsage: 0,
          fps: 0,
          droppedFrames: 0
        },
        bufferSize: 10, // Default 10 seconds as user requested
        accelerationMode: 'gpu', // Default to GPU mode
        hardwareVerificationStatus: 'unknown',
        
        // Advanced Controls Initial State
        advancedControls: {
          enabled: false,
          activeProfile: 'clean',
          windowProfiles: new Map(),
          recordingState: new Map(),
          recordingProcesses: new Map(),
          vfxFilters: new Map(),
          randomizerActive: false,
          randomizerTimer: null,
          randomizerInterval: 15,
          lastRandomizedStreams: [],
          keyboardShortcutsEnabled: false,
          focusedWindow: null,
          storageWarning: false,
          availableStorage: 0,
        },
        
        // Stream actions
        addStream: (stream) => set((state) => {
          state.streams.set(stream.id, stream);
        }),
        
        removeStream: (streamId) => set((state) => {
          state.streams.delete(streamId);
          state.activeStreams.delete(streamId);
        }),
        
        updateStream: (streamId, updates) => set((state) => {
          const stream = state.streams.get(streamId);
          if (stream) {
            state.streams.set(streamId, { ...stream, ...updates });
          }
        }),
        
        connectStream: (streamId) => set((state) => {
          state.activeStreams.add(streamId);
          const stream = state.streams.get(streamId);
          if (stream) {
            stream.status = StreamStatus.CONNECTING;
          }
        }),
        
        disconnectStream: (streamId) => set((state) => {
          state.activeStreams.delete(streamId);
          const stream = state.streams.get(streamId);
          if (stream) {
            stream.status = StreamStatus.DISCONNECTED;
          }
        }),
        
        incrementStreamCount: () => set((state) => {
          state.streamConnectionCount += 1;
        }),
        
        decrementStreamCount: () => set((state) => {
          state.streamConnectionCount = Math.max(0, state.streamConnectionCount - 1);
        }),
        
        // Layout actions
        setActiveLayout: (layoutId) => set((state) => {
          state.activeLayoutId = layoutId;
        }),
        
        createLayout: (layout) => set((state) => {
          state.layouts.set(layout.id, layout);
        }),
        
        updateLayout: (layoutId, updates) => set((state) => {
          const layout = state.layouts.get(layoutId);
          if (layout) {
            state.layouts.set(layoutId, { ...layout, ...updates });
          }
        }),
        
        deleteLayout: (layoutId) => set((state) => {
          state.layouts.delete(layoutId);
          if (state.activeLayoutId === layoutId) {
            state.activeLayoutId = null;
          }
        }),
        
        // UI actions
        toggleFullscreen: () => set((state) => {
          state.isFullscreen = !state.isFullscreen;
        }),
        
        toggleFrameless: () => set((state) => {
          state.isFrameless = !state.isFrameless;
        }),
        
        toggleStatistics: () => set((state) => {
          state.showStatistics = !state.showStatistics;
        }),
        
        toggleLabels: () => set((state) => {
          state.showLabels = !state.showLabels;
        }),
        
        // Performance
        updatePerformanceMetrics: (metrics) => set((state) => {
          state.performanceMetrics = metrics;
        }),
        
        // Video Settings
        setBufferSize: (size) => set((state) => {
          state.bufferSize = Math.max(1, Math.min(30, size)); // Clamp between 1-30 seconds
        }),
        
        // GPU Acceleration Actions
        setAccelerationMode: (mode) => set((state) => {
          state.accelerationMode = mode;
          state.hardwareVerificationStatus = 'unknown'; // Reset verification status on mode change
        }),
        
        setHardwareVerificationStatus: (status) => set((state) => {
          state.hardwareVerificationStatus = status;
        }),
        
        // Advanced Controls Actions
        setAdvancedControlsProfile: (profileName, windowId) => set((state) => {
          if (windowId) {
            state.advancedControls.windowProfiles.set(windowId, profileName);
          } else {
            state.advancedControls.activeProfile = profileName;
          }
        }),
        
        toggleAdvancedControls: (windowId) => set((state) => {
          state.advancedControls.enabled = !state.advancedControls.enabled;
        }),
        
        // Recording actions
        startRecording: (streamId) => set((state) => {
          state.advancedControls.recordingState.set(streamId, {
            isRecording: true,
            startTime: new Date(),
            outputFile: null,
            processId: null,
            duration: 0,
            fileSize: 0,
            status: 'starting',
          });
          // IPC call will be handled by the component
        }),
        
        stopRecording: (streamId) => set((state) => {
          const recordingState = state.advancedControls.recordingState.get(streamId);
          if (recordingState) {
            recordingState.status = 'stopping';
            recordingState.isRecording = false;
          }
        }),
        
        updateRecordingState: (streamId, stateUpdate) => set((state) => {
          const currentState = state.advancedControls.recordingState.get(streamId);
          if (currentState) {
            state.advancedControls.recordingState.set(streamId, {
              ...currentState,
              ...stateUpdate,
            });
          }
        }),
        
        // VFX actions
        toggleVFXFilter: (streamId, filterId) => set((state) => {
          const vfxState = state.advancedControls.vfxFilters.get(streamId) || {
            activeFilters: [],
            presetName: null,
            customSettings: {},
          };
          
          const existingFilterIndex = vfxState.activeFilters.findIndex(f => f.id === filterId);
          if (existingFilterIndex >= 0) {
            vfxState.activeFilters[existingFilterIndex].enabled = !vfxState.activeFilters[existingFilterIndex].enabled;
          } else {
            // Add new filter with default settings
            const defaultFilters = {
              'vhs': { id: 'vhs', name: 'VHS Distortion', type: 'vhs' as const, intensity: 50, enabled: true },
              'grain': { id: 'grain', name: 'Film Grain', type: 'grain' as const, intensity: 30, enabled: true },
              'interference': { id: 'interference', name: 'Static Interference', type: 'interference' as const, intensity: 40, enabled: true },
            };
            const filter = defaultFilters[filterId as keyof typeof defaultFilters];
            if (filter) {
              vfxState.activeFilters.push(filter);
            }
          }
          
          state.advancedControls.vfxFilters.set(streamId, vfxState);
        }),
        
        setVFXIntensity: (streamId, filterId, intensity) => set((state) => {
          const vfxState = state.advancedControls.vfxFilters.get(streamId);
          if (vfxState) {
            const filter = vfxState.activeFilters.find(f => f.id === filterId);
            if (filter) {
              filter.intensity = Math.max(0, Math.min(100, intensity));
            }
          }
        }),
        
        applyVFXPreset: (streamId, presetName) => set((state) => {
          const vfxState = state.advancedControls.vfxFilters.get(streamId) || {
            activeFilters: [],
            presetName: null,
            customSettings: {},
          };
          
          vfxState.presetName = presetName;
          // Preset application logic would be handled by the component
          state.advancedControls.vfxFilters.set(streamId, vfxState);
        }),
        
        // Randomizer actions
        startRandomizer: (interval) => set((state) => {
          state.advancedControls.randomizerActive = true;
          state.advancedControls.randomizerInterval = interval;
          // Timer will be managed by the component using useEffect
        }),
        
        stopRandomizer: () => set((state) => {
          state.advancedControls.randomizerActive = false;
          if (state.advancedControls.randomizerTimer) {
            clearInterval(state.advancedControls.randomizerTimer);
            state.advancedControls.randomizerTimer = null;
          }
        }),
        
        triggerRandomization: () => set((state) => {
          // This will trigger a randomization event
          // The actual randomization logic will be in the component
        }),
        
        // Keyboard actions
        handleKeyboardShortcut: (key, windowId) => set((state) => {
          state.advancedControls.focusedWindow = windowId;
          // Shortcut handling logic will be in the component
        }),
        
        setFocusedWindow: (windowId) => set((state) => {
          state.advancedControls.focusedWindow = windowId;
        }),
        
        // Storage monitoring
        updateStorageStatus: (available, warning) => set((state) => {
          state.advancedControls.availableStorage = available;
          state.advancedControls.storageWarning = warning;
        }),
        
        // Stream selection
        setSelectedStreamId: (streamId) => set((state) => {
          state.selectedStreamId = streamId;
        }),
        
        // Initialize
        loadStreams: (streams) => set((state) => {
          state.streams.clear();
          streams.forEach(stream => {
            state.streams.set(stream.id, stream);
          });
        }),
        
        loadLayouts: (layouts) => set((state) => {
          state.layouts.clear();
          layouts.forEach(layout => {
            state.layouts.set(layout.id, layout);
          });
        }),

        resetStore: () => set(() => ({
          streams: new Map(),
          activeStreams: new Set(),
          streamConnectionCount: 0,
          layouts: new Map(),
          activeLayoutId: null,
          isFullscreen: false,
          isFrameless: false,
          showStatistics: false,
          showLabels: true,
          selectedStreamId: null,
          performanceMetrics: {
            cpuUsage: 0,
            memoryUsage: 0,
            fps: 0,
            droppedFrames: 0
          },
          bufferSize: 10,
          accelerationMode: 'gpu',
          hardwareVerificationStatus: 'unknown'
        }))
      })),
      {
        name: 'streamgrid-store',
        storage: {
          getItem: (name: string) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            try {
              const parsed = JSON.parse(str);
              return {
                state: {
                  ...parsed.state,
                  streams: new Map(parsed.state.streams || []),
                  activeStreams: new Set(parsed.state.activeStreams || []),
                  layouts: new Map(parsed.state.layouts || [])
                },
                version: parsed.version
              };
            } catch {
              return null;
            }
          },
          setItem: (name: string, value: any) => {
            const serialized = {
              ...value,
              state: {
                ...value.state,
                streams: Array.from(value.state.streams?.entries() || []),
                activeStreams: Array.from(value.state.activeStreams || []),
                layouts: Array.from(value.state.layouts?.entries() || [])
              }
            };
            localStorage.setItem(name, JSON.stringify(serialized));
          },
          removeItem: (name: string) => localStorage.removeItem(name)
        }
      }
    )
  )
);