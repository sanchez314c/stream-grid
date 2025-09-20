import React, { useState, useEffect } from 'react';
import { AppSettings } from '@shared/types/settings';
import StreamManager from '../StreamManager';
import { useStreamGridStore } from '../../store';
import { AdvancedControlsSettings } from '../advanced-controls/AdvancedControlsSettings';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const { streams, updateStream, accelerationMode, setAccelerationMode } = useStreamGridStore();
  
  useEffect(() => {
    window.api.settings.get().then(setSettings);
  }, []);
  
  const handleSave = async () => {
    if (!settings) return;
    
    try {
      // Flatten settings object to dot notation paths that backend expects
      const flattenSettings = (obj: any, prefix = ''): Record<string, any> => {
        const flattened: Record<string, any> = {};
        for (const [key, value] of Object.entries(obj)) {
          const path = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.assign(flattened, flattenSettings(value, path));
          } else {
            flattened[path] = value;
          }
        }
        return flattened;
      };
      
      const flatSettings = flattenSettings(settings);
      
      // Update each setting individually as the backend expects
      for (const [path, value] of Object.entries(flatSettings)) {
        try {
          await window.api.settings.update(path, value);
        } catch (error) {
          console.warn(`Failed to update setting ${path}:`, error);
          // Continue updating other settings even if one fails
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
      // TODO: Show error notification to user
    }
  };
  
  if (!settings) {
    return null;
  }
  
  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'streams', label: 'Streams' },
    { id: 'display', label: 'Display' },
    { id: 'performance', label: 'Performance' },
    { id: 'audio', label: 'Audio' },
    { id: 'advanced', label: 'Advanced' }
  ];
  
  const handleMuteAllStreams = (muted: boolean) => {
    streams.forEach((stream) => {
      updateStream(stream.id, {
        settings: { ...stream.settings, muted }
      });
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
      <div className="bg-bg-secondary rounded-lg w-full max-w-6xl h-[80vh] min-h-[600px] flex flex-col resize overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bg-tertiary rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-bg-primary p-4">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-4">General Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Theme</label>
                  <select
                    value={settings.general.theme}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, theme: e.target.value as 'dark' | 'light' }
                    })}
                    className="input"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <select
                    value={settings.general.language}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, language: e.target.value }
                    })}
                    className="input"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.autoStart}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, autoStart: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Auto-start with system</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.minimizeToTray}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, minimizeToTray: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Minimize to system tray</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.checkUpdates}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, checkUpdates: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Check for updates</span>
                  </label>
                </div>
              </div>
            )}
            
            {activeTab === 'display' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-4">Display Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Window Mode</label>
                  <select
                    value={settings.display.windowMode}
                    onChange={(e) => setSettings({
                      ...settings,
                      display: { ...settings.display, windowMode: e.target.value as any }
                    })}
                    className="input"
                  >
                    <option value="windowed">Windowed</option>
                    <option value="frameless">Frameless</option>
                    <option value="fullscreen">Fullscreen</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.display.alwaysOnTop}
                      onChange={(e) => setSettings({
                        ...settings,
                        display: { ...settings.display, alwaysOnTop: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Always on top</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.display.hardwareAcceleration}
                      onChange={(e) => setSettings({
                        ...settings,
                        display: { ...settings.display, hardwareAcceleration: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Hardware acceleration</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.display.showLabels}
                      onChange={(e) => setSettings({
                        ...settings,
                        display: { ...settings.display, showLabels: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Show stream labels</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.display.showStatistics}
                      onChange={(e) => setSettings({
                        ...settings,
                        display: { ...settings.display, showStatistics: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Show statistics bar</span>
                  </label>
                </div>
              </div>
            )}
            
            {activeTab === 'streams' && (
              <div className="space-y-4 h-full">
                <h3 className="text-lg font-medium mb-4">Stream Management</h3>
                <div className="h-[calc(100%-4rem)] -m-6">
                  <StreamManager isOpen={true} onClose={() => {}} />
                </div>
              </div>
            )}
            
            {activeTab === 'audio' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-4">Audio Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Default Volume: {settings.audio.defaultVolume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.audio.defaultVolume}
                    onChange={(e) => setSettings({
                      ...settings,
                      audio: { ...settings.audio, defaultVolume: Number(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.audio.defaultMuted || false}
                      onChange={(e) => setSettings({
                        ...settings,
                        audio: { ...settings.audio, defaultMuted: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Start streams muted by default</span>
                  </label>
                  
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        onChange={(e) => handleMuteAllStreams(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Mute all streams</span>
                    </label>
                    <p className="text-xs text-gray-400 mt-1 ml-6">
                      This will immediately mute/unmute all active streams
                    </p>
                  </div>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.audio.enableAudioMixing || false}
                      onChange={(e) => setSettings({
                        ...settings,
                        audio: { ...settings.audio, enableAudioMixing: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Enable audio mixing</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.audio.normalizationEnabled || false}
                      onChange={(e) => setSettings({
                        ...settings,
                        audio: { ...settings.audio, normalizationEnabled: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Audio normalization</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Audio Output Device</label>
                  <select
                    value={settings.audio.outputDevice}
                    onChange={(e) => setSettings({
                      ...settings,
                      audio: { ...settings.audio, outputDevice: e.target.value }
                    })}
                    className="input"
                  >
                    <option value="default">System Default</option>
                  </select>
                </div>
              </div>
            )}
            
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium mb-4">Performance Settings</h3>
                
                {/* GPU/CPU Acceleration Mode - Primary Control */}
                <div className="bg-bg-tertiary p-4 rounded-lg border border-border">
                  <h4 className="text-md font-medium mb-3 text-primary">Video Decode Acceleration</h4>
                  <p className="text-sm text-text-muted mb-4">
                    Choose between GPU hardware acceleration or CPU software decoding for video streams.
                  </p>
                  
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="accelerationMode"
                        value="gpu"
                        checked={accelerationMode === 'gpu'}
                        onChange={(e) => {
                          setAccelerationMode(e.target.value as 'gpu' | 'cpu');
                          setSettings({
                            ...settings,
                            performance: { 
                              ...settings.performance, 
                              accelerationMode: e.target.value as 'gpu' | 'cpu',
                              gpuDecoding: true,
                              hardwareVerification: true
                            }
                          });
                        }}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-success">GPU Acceleration Mode</div>
                        <div className="text-sm text-text-muted">
                          Uses VideoToolbox/hardware decoders for optimal performance and lower CPU usage.
                          Recommended for AMD RX 580 and other modern GPUs.
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="accelerationMode"
                        value="cpu"
                        checked={accelerationMode === 'cpu'}
                        onChange={(e) => {
                          setAccelerationMode(e.target.value as 'gpu' | 'cpu');
                          setSettings({
                            ...settings,
                            performance: { 
                              ...settings.performance, 
                              accelerationMode: e.target.value as 'gpu' | 'cpu',
                              gpuDecoding: false,
                              hardwareVerification: false
                            }
                          });
                        }}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-warning">CPU Only Mode</div>
                        <div className="text-sm text-text-muted">
                          Forces software decoding using CPU only. Higher CPU usage but useful for debugging 
                          or when hardware acceleration causes issues.
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  {accelerationMode === 'gpu' && (
                    <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-sm font-medium text-success">GPU Mode Active</span>
                      </div>
                      <p className="text-xs text-success/80 mt-1">
                        System will attempt hardware-accelerated video decoding for optimal performance.
                      </p>
                    </div>
                  )}
                  
                  {accelerationMode === 'cpu' && (
                    <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-warning rounded-full"></div>
                        <span className="text-sm font-medium text-warning">CPU Mode Active</span>
                      </div>
                      <p className="text-xs text-warning/80 mt-1">
                        All video decoding will use software (CPU) processing. Expect higher CPU usage.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Advanced GPU Settings - Only show in GPU mode */}
                {accelerationMode === 'gpu' && settings && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-text-secondary">Advanced GPU Settings</h4>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.performance.hardwareVerification}
                        onChange={(e) => setSettings({
                          ...settings,
                          performance: { ...settings.performance, hardwareVerification: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm">Enable hardware verification</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.performance.forceHardwareDecoding}
                        onChange={(e) => setSettings({
                          ...settings,
                          performance: { ...settings.performance, forceHardwareDecoding: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm">Force hardware decoding (experimental)</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.performance.videoToolboxEnabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          performance: { ...settings.performance, videoToolboxEnabled: e.target.checked }
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm">VideoToolbox integration (macOS)</span>
                    </label>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Concurrent Streams: {settings.performance.maxConcurrentStreams}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={settings.performance.maxConcurrentStreams}
                    onChange={(e) => setSettings({
                      ...settings,
                      performance: { ...settings.performance, maxConcurrentStreams: Number(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stream Buffer Size: {settings.performance.streamBufferSize} MB
                  </label>
                  <input
                    type="range"
                    min="64"
                    max="512"
                    step="64"
                    value={settings.performance.streamBufferSize}
                    onChange={(e) => setSettings({
                      ...settings,
                      performance: { ...settings.performance, streamBufferSize: Number(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.performance.adaptiveQuality}
                      onChange={(e) => setSettings({
                        ...settings,
                        performance: { ...settings.performance, adaptiveQuality: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm">Adaptive quality</span>
                  </label>
                </div>
              </div>
            )}
            
            {activeTab === 'advanced' && (
              <div className="space-y-4">
                <AdvancedControlsSettings 
                  settings={settings}
                  onSettingsChange={(updates) => {
                    setSettings(prev => prev ? { ...prev, ...updates } : null);
                  }}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 p-4 border-t border-border">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;