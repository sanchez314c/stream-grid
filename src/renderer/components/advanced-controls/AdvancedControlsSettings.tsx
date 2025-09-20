import React, { useState } from 'react';
import { AppSettings } from '@shared/types/settings';
import { useStreamGridStore } from '../../store';

interface AdvancedControlsSettingsProps {
  settings: AppSettings;
  onSettingsChange: (updates: Partial<AppSettings>) => void;
}

const AdvancedControlsSettings: React.FC<AdvancedControlsSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const store = useStreamGridStore();

  const handleAdvancedControlsToggle = () => {
    const newEnabled = !settings.advanced.advancedControls.enabled;
    
    onSettingsChange({
      advanced: {
        ...settings.advanced,
        advancedControls: {
          ...settings.advanced.advancedControls,
          enabled: newEnabled,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium mb-2">Advanced Controls</h3>
          <p className="text-sm text-text-muted">
            Professional broadcast features with profile-based window management
          </p>
        </div>
        
        {/* Master Toggle */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.advanced.advancedControls.enabled}
                onChange={handleAdvancedControlsToggle}
                className="sr-only"
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${
                settings.advanced.advancedControls.enabled 
                  ? 'bg-primary' 
                  : 'bg-bg-tertiary'
              }`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                settings.advanced.advancedControls.enabled 
                  ? 'translate-x-6' 
                  : 'translate-x-0'
              }`}></div>
            </div>
            <span className="ml-3 font-medium">
              {settings.advanced.advancedControls.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>
      </div>

      {/* Status Indicator */}
      {settings.advanced.advancedControls.enabled && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm font-medium text-success">
              Advanced Controls Active
            </span>
          </div>
          <p className="text-xs text-success/80 mt-1">
            Professional features are now available
          </p>
        </div>
      )}

      {/* Feature Overview when enabled */}
      {settings.advanced.advancedControls.enabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-bg-tertiary rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center">
              <span className="mr-2">⌨️</span>
              Keyboard Shortcuts
            </h4>
            <p className="text-sm text-text-muted">
              Arrow keys for stream control, spacebar for pause/play
            </p>
          </div>
          
          <div className="bg-bg-tertiary rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center">
              <span className="mr-2">📹</span>
              Recording System
            </h4>
            <p className="text-sm text-text-muted">
              Per-tile FFmpeg recording with hardware acceleration
            </p>
          </div>
          
          <div className="bg-bg-tertiary rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center">
              <span className="mr-2">🎨</span>
              VFX Filters
            </h4>
            <p className="text-sm text-text-muted">
              Real-time effects: VHS, grain, static interference
            </p>
          </div>
          
          <div className="bg-bg-tertiary rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center">
              <span className="mr-2">🎲</span>
              Randomizer
            </h4>
            <p className="text-sm text-text-muted">
              Automatic stream cycling: 1s, 15s, 30s intervals
            </p>
          </div>
        </div>
      )}

      {/* Configuration Note */}
      {settings.advanced.advancedControls.enabled && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="font-medium text-blue-400 mb-2">Configuration</h4>
          <p className="text-sm text-text-muted">
            Advanced Controls feature panels will be implemented in future updates. 
            The core functionality is now integrated and ready for configuration.
          </p>
        </div>
      )}

      {/* Disabled State */}
      {!settings.advanced.advancedControls.enabled && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <h4 className="text-lg font-medium mb-2">Advanced Controls Disabled</h4>
          <p className="text-text-muted mb-4 max-w-md mx-auto">
            Enable Advanced Controls to access keyboard shortcuts, recording, VFX filters, 
            randomizer, and multi-window management features.
          </p>
          <button
            onClick={handleAdvancedControlsToggle}
            className="btn btn-primary"
          >
            Enable Advanced Controls
          </button>
        </div>
      )}
    </div>
  );
};

export { AdvancedControlsSettings };
export default AdvancedControlsSettings;