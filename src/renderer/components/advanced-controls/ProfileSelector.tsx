import React, { useState } from 'react';
import { AppSettings, BUILTIN_ADVANCED_PROFILES, AdvancedControlsProfile } from '@shared/types/settings';

interface ProfileSelectorProps {
  settings: AppSettings;
  onSettingsChange: (updates: Partial<AppSettings>) => void;
  onProfileChange: (profileName: string, windowId?: string) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  settings,
  onSettingsChange,
  onProfileChange,
}) => {
  const [selectedProfile, setSelectedProfile] = useState(
    settings.advanced.advancedControls.profiles.activeProfile
  );
  const [showCustomProfileDialog, setShowCustomProfileDialog] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const allProfiles = {
    ...BUILTIN_ADVANCED_PROFILES,
    ...settings.advanced.advancedControls.profiles.customProfiles,
  };

  const activeProfile = allProfiles[selectedProfile];

  const handleProfileSelect = (profileName: string) => {
    setSelectedProfile(profileName);
    onProfileChange(profileName);
  };

  const handleApplyTo = (scope: 'this' | 'all' | 'new') => {
    switch (scope) {
      case 'this':
        onProfileChange(selectedProfile);
        break;
      case 'all':
        // Apply to all windows - would need window management
        onProfileChange(selectedProfile);
        break;
      case 'new':
        // Set as default for new windows
        onSettingsChange({
          advanced: {
            ...settings.advanced,
            advancedControls: {
              ...settings.advanced.advancedControls,
              windowManagement: {
                ...settings.advanced.advancedControls.windowManagement,
                inheritProfileForNewWindows: true,
              },
            },
          },
        });
        break;
    }
  };

  const createCustomProfile = () => {
    if (!newProfileName.trim()) return;
    
    const customProfile: AdvancedControlsProfile = {
      id: newProfileName.toLowerCase().replace(/\s+/g, '_'),
      name: newProfileName,
      description: 'Custom user profile',
      settings: {
        keyboard: true,
        recording: false,
        vfxFilters: false,
        randomizer: false,
        indicators: true,
        storageMonitoring: false,
      },
    };

    onSettingsChange({
      advanced: {
        ...settings.advanced,
        advancedControls: {
          ...settings.advanced.advancedControls,
          profiles: {
            ...settings.advanced.advancedControls.profiles,
            customProfiles: {
              ...settings.advanced.advancedControls.profiles.customProfiles,
              [customProfile.id]: customProfile,
            },
          },
        },
      },
    });

    setNewProfileName('');
    setShowCustomProfileDialog(false);
    handleProfileSelect(customProfile.id);
  };

  return (
    <div className="space-y-6">
      {/* Profile Selection */}
      <div>
        <h4 className="text-md font-medium mb-4">Advanced Controls Profiles</h4>
        <p className="text-sm text-text-muted mb-6">
          Profiles provide pre-configured feature sets for different use cases.
          You can also create custom profiles tailored to your workflow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.entries(allProfiles).map(([key, profile]) => (
            <div
              key={key}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedProfile === key
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleProfileSelect(key)}
            >
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-medium">{profile.name}</h5>
                {selectedProfile === key && (
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-text-muted mb-3">{profile.description}</p>
              
              {/* Feature indicators */}
              <div className="flex flex-wrap gap-1">
                {Object.entries(profile.settings).map(([feature, enabled]) => (
                  <span
                    key={feature}
                    className={`px-2 py-1 text-xs rounded-full ${
                      enabled
                        ? 'bg-success/20 text-success'
                        : 'bg-bg-tertiary text-text-muted'
                    }`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Profile Creation */}
        <div className="border-t border-border pt-6">
          {!showCustomProfileDialog ? (
            <button
              onClick={() => setShowCustomProfileDialog(true)}
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Custom Profile</span>
            </button>
          ) : (
            <div className="bg-bg-secondary p-4 rounded-lg">
              <h5 className="font-medium mb-3">Create Custom Profile</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Profile Name</label>
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="My Custom Profile"
                    className="input w-full"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={createCustomProfile}
                    disabled={!newProfileName.trim()}
                    className="btn btn-primary"
                  >
                    Create Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomProfileDialog(false);
                      setNewProfileName('');
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Details */}
      {activeProfile && (
        <div className="border-t border-border pt-6">
          <h4 className="text-md font-medium mb-4">Profile Details: {activeProfile.name}</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(activeProfile.settings).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-success' : 'bg-text-muted'}`}></div>
                <span className="text-sm capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
            ))}
          </div>

          {/* Apply Profile */}
          <div className="bg-bg-secondary p-4 rounded-lg">
            <h5 className="font-medium mb-3">Apply Profile</h5>
            <p className="text-sm text-text-muted mb-4">
              Choose how to apply this profile to your StreamGRID windows.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleApplyTo('this')}
                className="btn btn-primary"
              >
                Apply to This Window
              </button>
              <button
                onClick={() => handleApplyTo('all')}
                className="btn btn-secondary"
              >
                Apply to All Windows
              </button>
              <button
                onClick={() => handleApplyTo('new')}
                className="btn btn-secondary"
              >
                Set as Default for New Windows
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Window Status */}
      <div className="border-t border-border pt-6">
        <h4 className="text-md font-medium mb-4">Window Status</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-sm">Current Window</span>
            </div>
            <div className="text-sm text-text-muted">
              {activeProfile?.name} Profile
            </div>
          </div>
          
          {/* Additional windows would be listed here */}
          <div className="text-xs text-text-muted p-2">
            Other windows will appear here when multiple StreamGRID instances are open.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelector;