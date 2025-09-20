import React, { useState } from 'react';
import { AppSettings, VFXFilter } from '@shared/types/settings';

interface VFXFiltersPanelProps {
  settings: AppSettings;
  onSettingsChange: (updates: Partial<AppSettings>) => void;
}

const VFXFiltersPanel: React.FC<VFXFiltersPanelProps> = ({
  settings,
  onSettingsChange,
}) => {
  const [previewFilter, setPreviewFilter] = useState<string | null>(null);

  const vfxSettings = settings.advanced.advancedControls.vfxFilters;

  const updateVFXSetting = (key: string, value: any) => {
    onSettingsChange({
      advanced: {
        ...settings.advanced,
        advancedControls: {
          ...settings.advanced.advancedControls,
          vfxFilters: {
            ...vfxSettings,
            [key]: value,
          },
        },
      },
    });
  };

  const updateFilter = (filterId: string, updates: Partial<VFXFilter>) => {
    const updatedFilters = vfxSettings.availableFilters.map(filter =>
      filter.id === filterId ? { ...filter, ...updates } : filter
    );
    
    updateVFXSetting('availableFilters', updatedFilters);
  };

  const toggleVFX = () => {
    updateVFXSetting('enabled', !vfxSettings.enabled);
  };

  const addCustomFilter = () => {
    const newFilter: VFXFilter = {
      id: `custom_${Date.now()}`,
      name: 'Custom Filter',
      type: 'custom',
      intensity: 50,
      enabled: false,
    };

    updateVFXSetting('availableFilters', [...vfxSettings.availableFilters, newFilter]);
  };

  const removeFilter = (filterId: string) => {
    const updatedFilters = vfxSettings.availableFilters.filter(filter => filter.id !== filterId);
    updateVFXSetting('availableFilters', updatedFilters);
  };

  const getFilterCSS = (filter: VFXFilter): React.CSSProperties => {
    const intensity = filter.intensity / 100;
    
    switch (filter.type) {
      case 'vhs':
        return {
          filter: `contrast(${1 + intensity * 0.3}) saturate(${1 + intensity * 0.5}) hue-rotate(${intensity * 10}deg)`,
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`,
        };
      case 'grain':
        return {
          filter: `contrast(${1 + intensity * 0.1}) brightness(${1 - intensity * 0.1})`,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${intensity}' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${intensity * 0.3}'/%3E%3C/svg%3E")`,
        };
      case 'interference':
        return {
          filter: `brightness(${1 + intensity * 0.2}) contrast(${1 - intensity * 0.1})`,
          background: `repeating-linear-gradient(90deg, transparent, transparent ${Math.random() * 20 + 10}px, rgba(255,255,255,0.1) ${Math.random() * 5 + 2}px)`,
        };
      default:
        return {};
    }
  };

  const filterDescriptions = {
    vhs: {
      icon: '📼',
      description: 'Retro VHS tape aesthetic with color distortion and scanlines',
      cssProperty: 'contrast, saturate, hue-rotate, background',
    },
    grain: {
      icon: '🎞️',
      description: 'Film grain texture overlay for cinematic feel',
      cssProperty: 'contrast, brightness, background',
    },
    interference: {
      icon: '📺',
      description: 'Static interference and glitch effects',
      cssProperty: 'brightness, contrast, background',
    },
    custom: {
      icon: '🎨',
      description: 'Custom user-defined filter effects',
      cssProperty: 'user-defined',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-md font-medium mb-2">VFX Filters</h4>
          <p className="text-sm text-text-muted">
            Apply real-time visual effects to individual stream tiles. 
            Effects are applied during playback and captured in recordings.
          </p>
        </div>
        
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={vfxSettings.enabled}
              onChange={toggleVFX}
              className="sr-only"
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${
              vfxSettings.enabled ? 'bg-primary' : 'bg-bg-tertiary'
            }`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
              vfxSettings.enabled ? 'translate-x-4' : 'translate-x-0'
            }`}></div>
          </div>
          <span className="ml-2 text-sm">
            {vfxSettings.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      </div>

      {vfxSettings.enabled && (
        <div className="space-y-6">
          {/* Available Filters */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-sm font-medium text-primary">Available Filters</h5>
              <button
                onClick={addCustomFilter}
                className="btn btn-secondary btn-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Custom Filter
              </button>
            </div>

            <div className="space-y-4">
              {vfxSettings.availableFilters.map((filter) => (
                <div key={filter.id} className="bg-bg-secondary rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {filterDescriptions[filter.type]?.icon || '🎨'}
                      </span>
                      <div>
                        {filter.type === 'custom' ? (
                          <input
                            type="text"
                            value={filter.name}
                            onChange={(e) => updateFilter(filter.id, { name: e.target.value })}
                            className="input input-sm bg-transparent border-transparent hover:border-border focus:border-primary"
                          />
                        ) : (
                          <h6 className="font-medium">{filter.name}</h6>
                        )}
                        <p className="text-xs text-text-muted">
                          {filterDescriptions[filter.type]?.description || 'Custom filter effect'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Preview Toggle */}
                      <button
                        onClick={() => setPreviewFilter(previewFilter === filter.id ? null : filter.id)}
                        className={`p-2 rounded transition-colors ${
                          previewFilter === filter.id 
                            ? 'bg-primary text-white' 
                            : 'bg-bg-tertiary hover:bg-bg-primary'
                        }`}
                        title="Preview filter"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {/* Enable Toggle */}
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filter.enabled}
                          onChange={(e) => updateFilter(filter.id, { enabled: e.target.checked })}
                          className="sr-only"
                        />
                        <div className={`block w-8 h-5 rounded-full transition-colors ${
                          filter.enabled ? 'bg-primary' : 'bg-bg-tertiary'
                        }`}>
                          <div className={`dot absolute w-3 h-3 bg-white rounded-full transition-transform ${
                            filter.enabled ? 'translate-x-3' : 'translate-x-0.5'
                          }`} style={{ marginTop: '4px' }}></div>
                        </div>
                      </label>

                      {/* Remove Custom Filter */}
                      {filter.type === 'custom' && (
                        <button
                          onClick={() => removeFilter(filter.id)}
                          className="p-2 text-text-muted hover:text-error transition-colors"
                          title="Remove filter"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Intensity Control */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Intensity: {filter.intensity}%
                      </label>
                      <span className="text-xs text-text-muted">
                        {filterDescriptions[filter.type]?.cssProperty || 'CSS properties'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filter.intensity}
                      onChange={(e) => updateFilter(filter.id, { intensity: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* Preview */}
                  {previewFilter === filter.id && (
                    <div className="mt-4 p-3 bg-bg-tertiary rounded border-2 border-dashed border-border">
                      <div
                        className="w-full h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center text-white font-medium"
                        style={getFilterCSS(filter)}
                      >
                        Filter Preview
                      </div>
                      <p className="text-xs text-text-muted mt-2 text-center">
                        This shows how the filter will look on stream tiles
                      </p>
                    </div>
                  )}

                  {/* Custom Filter Settings */}
                  {filter.type === 'custom' && (
                    <div className="mt-4 p-3 bg-bg-primary rounded border">
                      <h6 className="text-sm font-medium mb-2">Custom CSS Properties</h6>
                      <p className="text-xs text-text-muted mb-2">
                        Define custom CSS filter properties (advanced users only)
                      </p>
                      <textarea
                        className="input w-full h-20 text-xs font-mono"
                        placeholder="filter: blur(2px) brightness(1.2);&#10;background: rgba(255,0,0,0.1);"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Filter Presets */}
          <div className="border-t border-border pt-6">
            <h5 className="text-sm font-medium mb-4 text-primary">Filter Presets</h5>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Classic VHS', filters: ['vhs'] },
                { name: 'Film Noir', filters: ['grain'] },
                { name: 'Glitch TV', filters: ['interference'] },
                { name: 'Retro Mix', filters: ['vhs', 'grain'] },
                { name: 'Static Storm', filters: ['interference', 'grain'] },
                { name: 'Full Vintage', filters: ['vhs', 'grain', 'interference'] },
                { name: 'Subtle Film', filters: [] }, // Would apply light versions
                { name: 'Heavy Distortion', filters: [] }, // Would apply intense versions
              ].map((preset, index) => (
                <button
                  key={index}
                  className="p-3 bg-bg-secondary hover:bg-bg-tertiary rounded-lg text-left transition-colors"
                  onClick={() => {
                    // Apply preset logic would go here
                    console.log('Apply preset:', preset.name);
                  }}
                >
                  <div className="text-sm font-medium">{preset.name}</div>
                  <div className="text-xs text-text-muted mt-1">
                    {preset.filters.length ? preset.filters.join(', ') : 'Custom mix'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="border-t border-border pt-6">
            <h5 className="text-sm font-medium mb-3">How VFX Filters Work</h5>
            <div className="space-y-2 text-sm text-text-muted">
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-text-muted rounded-full mt-2"></div>
                <span>Filters are applied individually to each stream tile</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-text-muted rounded-full mt-2"></div>
                <span>Use the keyboard shortcut (F) to cycle through enabled filters on focused tile</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-text-muted rounded-full mt-2"></div>
                <span>Real-time preview shows effects immediately on video playback</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-text-muted rounded-full mt-2"></div>
                <span>Recordings will capture the filtered video output</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-text-muted rounded-full mt-2"></div>
                <span>Filters use CSS effects for optimal performance</span>
              </div>
            </div>
          </div>

          {/* Performance Notice */}
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-warning mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h6 className="text-sm font-medium text-warning">Performance Impact</h6>
                <p className="text-xs text-warning/80 mt-1">
                  Applying multiple intensive filters to many streams simultaneously may impact performance. 
                  Monitor CPU usage and disable filters if playback becomes choppy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disabled State */}
      {!vfxSettings.enabled && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M9 8h6" />
            </svg>
          </div>
          <h6 className="font-medium mb-2">VFX Filters Disabled</h6>
          <p className="text-sm text-text-muted mb-4 max-w-md mx-auto">
            Enable VFX Filters to apply real-time visual effects like VHS distortion, 
            film grain, and interference to your stream tiles.
          </p>
          <button
            onClick={toggleVFX}
            className="btn btn-primary btn-sm"
          >
            Enable VFX Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default VFXFiltersPanel;