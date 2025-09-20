import React, { useState } from 'react';
import { useStreamGridStore } from '../../store';
import { AdvancedControlsProfile } from '../../../shared/types/settings';

export const WindowManagementPanel: React.FC = () => {
  const {
    settings,
    advancedControls,
    updateAdvancedControlsSettings,
    setActiveProfile,
    createCustomProfile,
    deleteCustomProfile,
    applyProfileToWindow,
    applyProfileToAllWindows
  } = useStore();

  const [showNewProfileModal, setShowNewProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedBaseProfile, setSelectedBaseProfile] = useState<string>('Clean');

  const windowSettings = settings.advanced.advancedControls.windowManagement;
  const availableProfiles = settings.advanced.advancedControls.profiles;
  const currentProfile = advancedControls.activeProfile;
  const windowProfiles = advancedControls.windowProfiles;

  const builtInProfiles = ['Clean', 'Broadcast', 'Creative', 'Monitoring'];

  const handleNewWindowBehaviorChange = (behavior: 'inherit' | 'clean' | 'prompt') => {
    updateAdvancedControlsSettings({
      windowManagement: {
        ...windowSettings,
        newWindowBehavior: behavior
      }
    });
  };

  const handleSyncAcrossWindowsToggle = () => {
    updateAdvancedControlsSettings({
      windowManagement: {
        ...windowSettings,
        syncAcrossWindows: !windowSettings.syncAcrossWindows
      }
    });
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return;

    const baseProfile = availableProfiles[selectedBaseProfile];
    if (!baseProfile) return;

    createCustomProfile(newProfileName.trim(), baseProfile);
    setShowNewProfileModal(false);
    setNewProfileName('');
  };

  const handleDeleteProfile = (profileName: string) => {
    if (builtInProfiles.includes(profileName)) return;
    
    if (confirm(`Delete custom profile "${profileName}"? This action cannot be undone.`)) {
      deleteCustomProfile(profileName);
    }
  };

  const getCurrentWindowId = (): string => {
    // In a real implementation, this would get the actual window ID
    return 'main-window';
  };

  const getProfileForWindow = (windowId: string): string => {
    return windowProfiles.get(windowId) || currentProfile;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white">Window Management</h3>
        <p className="text-sm text-gray-400">
          Manage Advanced Controls settings across multiple windows
        </p>
      </div>

      {/* Current Window Profile */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-200">Current Window Profile</h4>
        <div className="p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-white font-medium">{currentProfile}</div>
              <div className="text-sm text-gray-400">Active in this window</div>
            </div>
            <div className="flex space-x-2">
              <select
                value={currentProfile}
                onChange={(e) => setActiveProfile(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded"
              >
                {Object.keys(availableProfiles).map((profileName) => (
                  <option key={profileName} value={profileName}>
                    {profileName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex space-x-2 text-sm">
            <button
              onClick={() => applyProfileToAllWindows(currentProfile)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Apply to All Windows
            </button>
            <button
              onClick={() => applyProfileToWindow(getCurrentWindowId(), currentProfile)}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
            >
              Apply to This Window Only
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Window Settings */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-200">Multi-Window Behavior</h4>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={windowSettings.syncAcrossWindows}
            onChange={handleSyncAcrossWindowsToggle}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <div className="flex-1">
            <div className="text-white">Sync Settings Across Windows</div>
            <div className="text-sm text-gray-400">
              Changes to Advanced Controls settings apply to all open windows
            </div>
          </div>
        </label>

        <div className="space-y-3">
          <div className="text-white">New Window Behavior</div>
          <div className="space-y-2">
            {[
              { 
                value: 'inherit', 
                label: 'Inherit Current Profile',
                description: 'New windows use the same profile as the current window'
              },
              { 
                value: 'clean', 
                label: 'Always Use Clean Profile',
                description: 'New windows always start with the Clean profile'
              },
              { 
                value: 'prompt', 
                label: 'Prompt for Profile',
                description: 'Ask which profile to use when opening new windows'
              }
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  windowSettings.newWindowBehavior === option.value
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="newWindowBehavior"
                  value={option.value}
                  checked={windowSettings.newWindowBehavior === option.value}
                  onChange={() => handleNewWindowBehaviorChange(option.value as any)}
                  className="h-4 w-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-sm text-gray-400">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-200">Profile Management</h4>
          <button
            onClick={() => setShowNewProfileModal(true)}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
          >
            Create Custom Profile
          </button>
        </div>

        <div className="space-y-2">
          {Object.entries(availableProfiles).map(([profileName, profile]) => (
            <div
              key={profileName}
              className="flex items-center justify-between p-3 bg-gray-800/50 border border-gray-600 rounded-lg"
            >
              <div>
                <div className="text-white font-medium flex items-center space-x-2">
                  <span>{profileName}</span>
                  {builtInProfiles.includes(profileName) && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      Built-in
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  Keyboard: {profile.keyboard.enabled ? 'On' : 'Off'} | 
                  Recording: {profile.recording.enabled ? 'On' : 'Off'} | 
                  VFX: {profile.vfxFilters.enabled ? 'On' : 'Off'} | 
                  Randomizer: {profile.randomizer.enabled ? 'On' : 'Off'}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveProfile(profileName)}
                  disabled={currentProfile === profileName}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded transition-colors"
                >
                  {currentProfile === profileName ? 'Active' : 'Activate'}
                </button>
                {!builtInProfiles.includes(profileName) && (
                  <button
                    onClick={() => handleDeleteProfile(profileName)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Profile Modal */}
      {showNewProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-medium text-white mb-4">Create Custom Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded focus:border-blue-500 focus:outline-none"
                  placeholder="Enter profile name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Base Profile
                </label>
                <select
                  value={selectedBaseProfile}
                  onChange={(e) => setSelectedBaseProfile(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded focus:border-blue-500 focus:outline-none"
                >
                  {Object.keys(availableProfiles).map((profileName) => (
                    <option key={profileName} value={profileName}>
                      {profileName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewProfileModal(false);
                  setNewProfileName('');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProfile}
                disabled={!newProfileName.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
              >
                Create Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};