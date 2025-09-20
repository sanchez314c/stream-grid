import React, { useState } from 'react';
import { AppSettings } from '@shared/types/settings';

interface KeyboardShortcutsPanelProps {
  settings: AppSettings;
  onSettingsChange: (updates: Partial<AppSettings>) => void;
}

const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({
  settings,
  onSettingsChange,
}) => {
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string>('');

  const shortcuts = settings.advanced.advancedControls.keyboard.shortcuts;

  const shortcutDescriptions = {
    randomizeGrid: {
      name: 'Randomize Grid',
      description: 'Randomly changes which streams appear in which grid positions',
      category: 'Stream Control',
    },
    reloadStreams: {
      name: 'Reload Streams',
      description: 'Refreshes all current streams',
      category: 'Stream Control',
    },
    pausePlayback: {
      name: 'Pause Playback',
      description: 'Pauses/resumes playback for all streams',
      category: 'Playback Control',
    },
    stopStreams: {
      name: 'Stop Streams',
      description: 'Stops all streams (does not remove them)',
      category: 'Playback Control',
    },
    toggleRecording: {
      name: 'Toggle Recording',
      description: 'Start/stop recording on focused stream tile',
      category: 'Recording',
    },
    cycleVFX: {
      name: 'Cycle VFX Filters',
      description: 'Cycle through VFX filters on focused stream tile',
      category: 'Effects',
    },
  };

  const formatKeyDisplay = (key: string): string => {
    const keyMap: Record<string, string> = {
      'ArrowRight': '→',
      'ArrowLeft': '←',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'Space': 'Spacebar',
      'KeyR': 'R',
      'KeyF': 'F',
      'Escape': 'Esc',
      'Tab': 'Tab',
    };
    
    return keyMap[key] || key;
  };

  const handleKeyCapture = (e: React.KeyboardEvent, shortcutKey: string) => {
    e.preventDefault();
    const capturedKey = e.code;
    
    // Validate key
    if (isValidKey(capturedKey)) {
      updateShortcut(shortcutKey, capturedKey);
      setEditingShortcut(null);
      setNewKey('');
    }
  };

  const isValidKey = (key: string): boolean => {
    // Allow arrow keys, letters, numbers, space, function keys
    const validKeys = /^(Arrow|Key|Digit|Space|F\d+|Tab|Escape)/.test(key);
    return validKeys;
  };

  const updateShortcut = (shortcutKey: string, newKeyValue: string) => {
    onSettingsChange({
      advanced: {
        ...settings.advanced,
        advancedControls: {
          ...settings.advanced.advancedControls,
          keyboard: {
            ...settings.advanced.advancedControls.keyboard,
            shortcuts: {
              ...shortcuts,
              [shortcutKey]: newKeyValue,
            },
          },
        },
      },
    });
  };

  const toggleKeyboardControls = () => {
    const newEnabled = !settings.advanced.advancedControls.keyboard.enabled;
    onSettingsChange({
      advanced: {
        ...settings.advanced,
        advancedControls: {
          ...settings.advanced.advancedControls,
          keyboard: {
            ...settings.advanced.advancedControls.keyboard,
            enabled: newEnabled,
          },
        },
      },
    });
  };

  const resetToDefaults = () => {
    onSettingsChange({
      advanced: {
        ...settings.advanced,
        advancedControls: {
          ...settings.advanced.advancedControls,
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
        },
      },
    });
  };

  const groupedShortcuts = Object.entries(shortcutDescriptions).reduce((groups, [key, info]) => {
    if (!groups[info.category]) {
      groups[info.category] = [];
    }
    groups[info.category].push([key, info]);
    return groups;
  }, {} as Record<string, Array<[string, any]>>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-md font-medium mb-2">Keyboard Shortcuts</h4>
          <p className="text-sm text-text-muted">
            Customize keyboard shortcuts for quick control when StreamGRID has focus.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={resetToDefaults}
            className="btn btn-secondary text-sm"
          >
            Reset to Defaults
          </button>
          
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.advanced.advancedControls.keyboard.enabled}
                onChange={toggleKeyboardControls}
                className="sr-only"
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${
                settings.advanced.advancedControls.keyboard.enabled 
                  ? 'bg-primary' 
                  : 'bg-bg-tertiary'
              }`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                settings.advanced.advancedControls.keyboard.enabled 
                  ? 'translate-x-4' 
                  : 'translate-x-0'
              }`}></div>
            </div>
            <span className="ml-2 text-sm">
              {settings.advanced.advancedControls.keyboard.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>
      </div>

      {/* Shortcuts Configuration */}
      {settings.advanced.advancedControls.keyboard.enabled && (
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="space-y-3">
              <h5 className="text-sm font-medium text-primary">{category}</h5>
              
              <div className="space-y-2">
                {categoryShortcuts.map(([shortcutKey, info]) => (
                  <div
                    key={shortcutKey}
                    className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="font-medium text-sm">{info.name}</div>
                        {editingShortcut === shortcutKey ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-text-muted">Press new key:</span>
                            <div
                              className="px-3 py-1 bg-primary text-white text-sm rounded border-2 border-primary animate-pulse"
                              onKeyDown={(e) => handleKeyCapture(e, shortcutKey)}
                              tabIndex={0}
                              autoFocus
                            >
                              Listening...
                            </div>
                          </div>
                        ) : (
                          <div
                            className="px-3 py-1 bg-bg-tertiary text-text-primary text-sm rounded border hover:border-primary cursor-pointer transition-colors"
                            onClick={() => setEditingShortcut(shortcutKey)}
                          >
                            {formatKeyDisplay(shortcuts[shortcutKey as keyof typeof shortcuts])}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-1">{info.description}</p>
                    </div>
                    
                    {editingShortcut === shortcutKey && (
                      <button
                        onClick={() => {
                          setEditingShortcut(null);
                          setNewKey('');
                        }}
                        className="ml-3 text-text-muted hover:text-text-primary"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Usage Instructions */}
          <div className="border-t border-border pt-6">
            <h5 className="text-sm font-medium mb-3">Usage Instructions</h5>
            <div className="space-y-2 text-sm text-text-muted">
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-text-muted rounded-full mt-2"></div>
                <span>Keyboard shortcuts only work when StreamGRID window has focus</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-text-muted rounded-full mt-2"></div>
                <span>Click on any key binding to change it - press the new key you want to use</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-text-muted rounded-full mt-2"></div>
                <span>Recording and VFX shortcuts work on the currently focused stream tile</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-text-muted rounded-full mt-2"></div>
                <span>Stream control shortcuts affect all streams in the current window</span>
              </div>
            </div>
          </div>

          {/* Quick Test */}
          <div className="border-t border-border pt-6">
            <h5 className="text-sm font-medium mb-3">Test Shortcuts</h5>
            <div className="bg-bg-secondary p-4 rounded-lg">
              <p className="text-sm text-text-muted mb-3">
                Click here and press any configured shortcut to test:
              </p>
              <div
                className="w-full h-16 bg-bg-tertiary rounded border-2 border-dashed border-border flex items-center justify-center text-text-muted cursor-pointer hover:border-primary transition-colors"
                tabIndex={0}
                onKeyDown={(e) => {
                  e.preventDefault();
                  const pressedKey = e.code;
                  const matchedShortcut = Object.entries(shortcuts).find(([_, key]) => key === pressedKey);
                  if (matchedShortcut) {
                    // Show feedback
                    alert(`Shortcut detected: ${shortcutDescriptions[matchedShortcut[0] as keyof typeof shortcutDescriptions].name}`);
                  }
                }}
              >
                Press a shortcut key to test
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disabled State */}
      {!settings.advanced.advancedControls.keyboard.enabled && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h6 className="font-medium mb-2">Keyboard Shortcuts Disabled</h6>
          <p className="text-sm text-text-muted mb-4">
            Enable keyboard shortcuts to quickly control streams and features.
          </p>
          <button
            onClick={toggleKeyboardControls}
            className="btn btn-primary btn-sm"
          >
            Enable Shortcuts
          </button>
        </div>
      )}
    </div>
  );
};

export default KeyboardShortcutsPanel;