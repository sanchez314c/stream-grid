import React, { useState, useEffect } from 'react';
import { useStreamGridStore } from '../../store';

interface StorageInfo {
  totalSpace: number;
  freeSpace: number;
  usedSpace: number;
  recordingPath: string;
  isMonitoring: boolean;
}

export const StorageMonitor: React.FC = () => {
  const { settings, updateAdvancedControlsSettings, advancedControls } = useStore();
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const recordingSettings = settings.advanced.advancedControls.recording;
  // Fix for Immer proxy issue with Maps
  const recordingStateMap = advancedControls.recordingState;
  const recordingStateValues = recordingStateMap instanceof Map 
    ? Array.from(recordingStateMap.values())
    : Array.from(recordingStateMap || []).map(([_, value]) => value);
  const activeRecordings = recordingStateValues.filter(
    state => state.isRecording
  );

  useEffect(() => {
    // Start monitoring storage
    fetchStorageInfo();
    
    const interval = setInterval(fetchStorageInfo, 5000); // Update every 5 seconds
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [recordingSettings.outputPath]);

  const fetchStorageInfo = async () => {
    try {
      const info = await window.electronAPI?.invoke('storage:getInfo', recordingSettings.outputPath);
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to fetch storage info:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUsagePercentage = (): number => {
    if (!storageInfo) return 0;
    return (storageInfo.usedSpace / storageInfo.totalSpace) * 100;
  };

  const getFreePercentage = (): number => {
    if (!storageInfo) return 0;
    return (storageInfo.freeSpace / storageInfo.totalSpace) * 100;
  };

  const getStorageStatus = (): { color: string; status: string; action?: string } => {
    const freePercentage = getFreePercentage();
    
    if (freePercentage <= recordingSettings.storageSettings.criticalThreshold) {
      return { 
        color: 'red', 
        status: 'Critical', 
        action: recordingSettings.storageSettings.autoStopOnLowSpace ? 'Auto-stop enabled' : 'Manual intervention required'
      };
    } else if (freePercentage <= recordingSettings.storageSettings.warningThreshold) {
      return { 
        color: 'yellow', 
        status: 'Warning',
        action: 'Monitor closely'
      };
    } else {
      return { 
        color: 'green', 
        status: 'Good',
        action: 'Sufficient space available'
      };
    }
  };

  const handleThresholdChange = (type: 'warning' | 'critical', value: number) => {
    updateAdvancedControlsSettings({
      recording: {
        ...recordingSettings,
        storageSettings: {
          ...recordingSettings.storageSettings,
          [`${type}Threshold`]: value
        }
      }
    });
  };

  const handleAutoStopToggle = () => {
    updateAdvancedControlsSettings({
      recording: {
        ...recordingSettings,
        storageSettings: {
          ...recordingSettings.storageSettings,
          autoStopOnLowSpace: !recordingSettings.storageSettings.autoStopOnLowSpace
        }
      }
    });
  };

  const handleNotificationsToggle = () => {
    updateAdvancedControlsSettings({
      recording: {
        ...recordingSettings,
        storageSettings: {
          ...recordingSettings.storageSettings,
          enableNotifications: !recordingSettings.storageSettings.enableNotifications
        }
      }
    });
  };

  const storageStatus = getStorageStatus();
  const usagePercentage = getUsagePercentage();
  const freePercentage = getFreePercentage();

  if (!storageInfo) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400">Loading storage information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white">Storage Monitor</h3>
        <p className="text-sm text-gray-400">
          Monitor disk space for recording output directory
        </p>
      </div>

      {/* Storage Overview */}
      <div className="space-y-4">
        <div className="p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-md font-medium text-white">Storage Status</h4>
              <p className="text-sm text-gray-400 font-mono">
                {storageInfo.recordingPath}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              storageStatus.color === 'green' ? 'bg-green-900 text-green-300 border border-green-600' :
              storageStatus.color === 'yellow' ? 'bg-yellow-900 text-yellow-300 border border-yellow-600' :
              'bg-red-900 text-red-300 border border-red-600'
            }`}>
              {storageStatus.status}
            </div>
          </div>

          {/* Storage Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Used: {formatBytes(storageInfo.usedSpace)}</span>
              <span className="text-gray-400">Free: {formatBytes(storageInfo.freeSpace)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  storageStatus.color === 'green' ? 'bg-green-600' :
                  storageStatus.color === 'yellow' ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 GB</span>
              <span>{formatBytes(storageInfo.totalSpace)}</span>
            </div>
          </div>

          {/* Action Message */}
          <div className="mt-3 text-sm text-gray-300">
            {storageStatus.action}
          </div>
        </div>

        {/* Active Recordings Impact */}
        {activeRecordings.length > 0 && (
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-blue-300 font-medium">
                {activeRecordings.length} Active Recording{activeRecordings.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-sm text-blue-200">
              Estimated space usage: ~{recordingSettings.quality.bitrate * activeRecordings.length / 8 * 3600 / 1024 / 1024} MB/hour
            </div>
          </div>
        )}
      </div>

      {/* Storage Settings */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-200">Storage Thresholds</h4>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-white">Warning Threshold</span>
              <span className="text-yellow-400 font-medium">
                {recordingSettings.storageSettings.warningThreshold}% free
              </span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={recordingSettings.storageSettings.warningThreshold}
              onChange={(e) => handleThresholdChange('warning', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-yellow"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5%</span>
              <span>50%</span>
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-white">Critical Threshold</span>
              <span className="text-red-400 font-medium">
                {recordingSettings.storageSettings.criticalThreshold}% free
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={recordingSettings.storageSettings.criticalThreshold}
              onChange={(e) => handleThresholdChange('critical', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-red"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>20%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Automated Actions */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-200">Automated Actions</h4>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={recordingSettings.storageSettings.autoStopOnLowSpace}
              onChange={handleAutoStopToggle}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <div className="flex-1">
              <div className="text-white">Auto-stop Recording on Critical Threshold</div>
              <div className="text-sm text-gray-400">
                Automatically stop all recordings when storage reaches critical level
              </div>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={recordingSettings.storageSettings.enableNotifications}
              onChange={handleNotificationsToggle}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <div className="flex-1">
              <div className="text-white">Storage Notifications</div>
              <div className="text-sm text-gray-400">
                Show system notifications when storage thresholds are reached
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Manual Actions */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-200">Manual Actions</h4>
        <div className="flex space-x-2">
          <button
            onClick={() => window.electronAPI?.invoke('storage:openRecordingFolder', recordingSettings.outputPath)}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Open Recording Folder
          </button>
          <button
            onClick={() => window.electronAPI?.invoke('storage:cleanup', recordingSettings.outputPath)}
            className="flex-1 px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg transition-colors"
          >
            Cleanup Old Recordings
          </button>
        </div>
      </div>
    </div>
  );
};