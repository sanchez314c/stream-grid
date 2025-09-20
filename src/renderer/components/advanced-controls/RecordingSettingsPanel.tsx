import React, { useState, useEffect } from 'react';
import { AppSettings } from '@shared/types/settings';

interface RecordingSettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (updates: Partial<AppSettings>) => void;
}

const RecordingSettingsPanel: React.FC<RecordingSettingsPanelProps> = ({
  settings,
  onSettingsChange,
}) => {
  const [customOutputPath, setCustomOutputPath] = useState(
    settings.advanced.advancedControls.recording.outputPath
  );
  const [storageInfo, setStorageInfo] = useState<{
    available: number;
    total: number;
    warning: boolean;
  } | null>(null);

  const recordingSettings = settings.advanced.advancedControls.recording;

  useEffect(() => {
    // Mock storage check - in real implementation, this would be an IPC call
    const checkStorage = async () => {
      try {
        // Simulate storage check
        setStorageInfo({
          available: 125.6, // GB
          total: 512,
          warning: false,
        });
      } catch (error) {
        console.error('Failed to check storage:', error);
      }
    };

    if (recordingSettings.enabled) {
      checkStorage();
    }
  }, [recordingSettings.enabled]);

  const handleOutputPathSelect = async () => {
    try {
      // In real implementation, this would open a folder dialog via IPC
      const mockPath = '/Users/username/StreamGRID_Recordings';
      setCustomOutputPath(mockPath);
      updateRecordingSetting('outputPath', mockPath);
    } catch (error) {
      console.error('Failed to select output path:', error);
    }
  };

  const updateRecordingSetting = (key: string, value: any) => {
    onSettingsChange({
      advanced: {
        ...settings.advanced,
        advancedControls: {
          ...settings.advanced.advancedControls,
          recording: {
            ...recordingSettings,
            [key]: value,
          },
        },
      },
    });
  };

  const updateCustomSetting = (key: string, value: any) => {
    onSettingsChange({
      advanced: {
        ...settings.advanced,
        advancedControls: {
          ...settings.advanced.advancedControls,
          recording: {
            ...recordingSettings,
            customSettings: {
              ...recordingSettings.customSettings,
              [key]: value,
            },
          },
        },
      },
    });
  };

  const updateStorageMonitoring = (key: string, value: any) => {
    onSettingsChange({
      advanced: {
        ...settings.advanced,
        advancedControls: {
          ...settings.advanced.advancedControls,
          recording: {
            ...recordingSettings,
            storageMonitoring: {
              ...recordingSettings.storageMonitoring,
              [key]: value,
            },
          },
        },
      },
    });
  };

  const toggleRecording = () => {
    updateRecordingSetting('enabled', !recordingSettings.enabled);
  };

  const qualityPresets = {
    high: { width: 1920, height: 1080, bitrate: 8000, label: 'High (1080p, 8Mbps)' },
    medium: { width: 1280, height: 720, bitrate: 4000, label: 'Medium (720p, 4Mbps)' },
    low: { width: 854, height: 480, bitrate: 2000, label: 'Low (480p, 2Mbps)' },
    custom: { width: 0, height: 0, bitrate: 0, label: 'Custom' },
  };

  const handleQualityPresetChange = (preset: string) => {
    updateRecordingSetting('videoQuality', preset);
    
    if (preset !== 'custom') {
      const presetValues = qualityPresets[preset as keyof typeof qualityPresets];
      updateCustomSetting('width', presetValues.width);
      updateCustomSetting('height', presetValues.height);
      updateCustomSetting('bitrate', presetValues.bitrate);
    }
  };

  const formatFileSize = (gb: number): string => {
    if (gb < 1) return `${(gb * 1024).toFixed(1)} MB`;
    return `${gb.toFixed(1)} GB`;
  };

  const estimateRecordingSize = (): string => {
    const { bitrate } = recordingSettings.customSettings;
    const mbPerMinute = (bitrate * 60) / 8 / 1024; // Convert kbps to MB per minute
    const gbPerHour = (mbPerMinute * 60) / 1024;
    return `~${gbPerHour.toFixed(1)} GB/hour per stream`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-md font-medium mb-2">Recording Settings</h4>
          <p className="text-sm text-text-muted">
            Configure per-tile recording with FFmpeg and hardware acceleration.
          </p>
        </div>
        
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={recordingSettings.enabled}
              onChange={toggleRecording}
              className="sr-only"
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${
              recordingSettings.enabled ? 'bg-primary' : 'bg-bg-tertiary'
            }`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
              recordingSettings.enabled ? 'translate-x-4' : 'translate-x-0'
            }`}></div>
          </div>
          <span className="ml-2 text-sm">
            {recordingSettings.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      </div>

      {recordingSettings.enabled && (
        <div className="space-y-6">
          {/* Output Configuration */}
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-primary">Output Configuration</h5>
            
            {/* Output Path */}
            <div>
              <label className="block text-sm font-medium mb-2">Output Directory</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customOutputPath}
                  onChange={(e) => setCustomOutputPath(e.target.value)}
                  placeholder="Select recording output directory..."
                  className="input flex-1"
                  readOnly
                />
                <button
                  onClick={handleOutputPathSelect}
                  className="btn btn-secondary whitespace-nowrap"
                >
                  Browse...
                </button>
              </div>
              {!customOutputPath && (
                <p className="text-xs text-warning mt-1">
                  Please select an output directory for recordings
                </p>
              )}
            </div>

            {/* File Naming */}
            <div>
              <label className="block text-sm font-medium mb-2">File Naming Convention</label>
              <select
                value={recordingSettings.fileNaming}
                onChange={(e) => updateRecordingSetting('fileNaming', e.target.value)}
                className="input w-full"
              >
                <option value="streamname_timestamp">Stream Name + Timestamp</option>
                <option value="timestamp">Timestamp Only</option>
                <option value="custom">Custom Pattern</option>
              </select>
              <p className="text-xs text-text-muted mt-1">
                Example: {recordingSettings.fileNaming === 'streamname_timestamp' 
                  ? 'Camera_01_2024-08-27_14-30-15.mp4'
                  : recordingSettings.fileNaming === 'timestamp'
                  ? '2024-08-27_14-30-15.mp4'
                  : 'custom_pattern.mp4'}
              </p>
            </div>
          </div>

          {/* Video Quality */}
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-primary">Video Quality</h5>
            
            <div>
              <label className="block text-sm font-medium mb-2">Quality Preset</label>
              <select
                value={recordingSettings.videoQuality}
                onChange={(e) => handleQualityPresetChange(e.target.value)}
                className="input w-full"
              >
                {Object.entries(qualityPresets).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Quality Settings */}
            {recordingSettings.videoQuality === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Width</label>
                  <input
                    type="number"
                    value={recordingSettings.customSettings.width}
                    onChange={(e) => updateCustomSetting('width', parseInt(e.target.value))}
                    className="input w-full"
                    min="480"
                    max="3840"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Height</label>
                  <input
                    type="number"
                    value={recordingSettings.customSettings.height}
                    onChange={(e) => updateCustomSetting('height', parseInt(e.target.value))}
                    className="input w-full"
                    min="270"
                    max="2160"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bitrate (kbps)</label>
                  <input
                    type="number"
                    value={recordingSettings.customSettings.bitrate}
                    onChange={(e) => updateCustomSetting('bitrate', parseInt(e.target.value))}
                    className="input w-full"
                    min="500"
                    max="50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Codec</label>
                  <select
                    value={recordingSettings.customSettings.codec}
                    onChange={(e) => updateCustomSetting('codec', e.target.value)}
                    className="input w-full"
                  >
                    <option value="h264">H.264 (Compatible)</option>
                    <option value="h265">H.265 (Smaller files)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Size Estimate */}
            <div className="bg-bg-secondary p-3 rounded-lg">
              <div className="text-sm">
                <span className="font-medium">Estimated file size: </span>
                <span className="text-text-muted">{estimateRecordingSize()}</span>
              </div>
            </div>
          </div>

          {/* Hardware Acceleration */}
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-primary">Performance</h5>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={recordingSettings.hardwareAcceleration}
                  onChange={(e) => updateRecordingSetting('hardwareAcceleration', e.target.checked)}
                  className="mr-3"
                />
                <div>
                  <span className="text-sm font-medium">Hardware Acceleration</span>
                  <p className="text-xs text-text-muted">
                    Use GPU encoding for better performance and lower CPU usage
                  </p>
                </div>
              </label>

              {recordingSettings.hardwareAcceleration && (
                <div className="ml-6 p-3 bg-success/10 border border-success/20 rounded">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-xs text-success">
                      Hardware acceleration will be used when available
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Storage Monitoring */}
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-primary">Storage Monitoring</h5>
            
            {storageInfo && (
              <div className="bg-bg-secondary p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Available Storage</span>
                  <span className="text-sm">
                    {formatFileSize(storageInfo.available)} of {formatFileSize(storageInfo.total)}
                  </span>
                </div>
                <div className="w-full bg-bg-tertiary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      storageInfo.warning ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{
                      width: `${((storageInfo.total - storageInfo.available) / storageInfo.total) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={recordingSettings.storageMonitoring.enabled}
                  onChange={(e) => updateStorageMonitoring('enabled', e.target.checked)}
                  className="mr-3"
                />
                <span className="text-sm font-medium">Enable storage monitoring</span>
              </label>

              {recordingSettings.storageMonitoring.enabled && (
                <div className="ml-6 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Warning threshold: {recordingSettings.storageMonitoring.warningThreshold} GB remaining
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={recordingSettings.storageMonitoring.warningThreshold}
                      onChange={(e) => updateStorageMonitoring('warningThreshold', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Auto-stop threshold: {recordingSettings.storageMonitoring.autoStopThreshold} GB remaining
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={recordingSettings.storageMonitoring.autoStopThreshold}
                      onChange={(e) => updateStorageMonitoring('autoStopThreshold', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="text-xs text-text-muted">
                    <p>• Warning: Show notification when storage drops below threshold</p>
                    <p>• Auto-stop: Automatically stop all recordings to prevent disk full</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recording Controls Info */}
          <div className="border-t border-border pt-6">
            <h5 className="text-sm font-medium mb-3">How Recording Works</h5>
            <div className="space-y-2 text-sm text-text-muted">
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-text-muted rounded-full mt-2"></div>
                <span>A red REC button will appear on each stream tile when recording is enabled</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-text-muted rounded-full mt-2"></div>
                <span>Click the REC button or use the keyboard shortcut (R) to start/stop recording</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-text-muted rounded-full mt-2"></div>
                <span>Recording indicator shows REC text with a blinking red dot while active</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-text-muted rounded-full mt-2"></div>
                <span>Each stream is recorded independently - you can record multiple streams simultaneously</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-text-muted rounded-full mt-2"></div>
                <span>VFX filters applied to streams will be captured in recordings</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disabled State */}
      {!recordingSettings.enabled && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h6 className="font-medium mb-2">Recording Disabled</h6>
          <p className="text-sm text-text-muted mb-4">
            Enable recording to capture individual stream tiles to MP4 files.
          </p>
          <button
            onClick={toggleRecording}
            className="btn btn-primary btn-sm"
          >
            Enable Recording
          </button>
        </div>
      )}
    </div>
  );
};

export default RecordingSettingsPanel;