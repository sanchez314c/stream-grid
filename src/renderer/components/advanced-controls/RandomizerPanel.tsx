import React from 'react';
import { useStreamGridStore } from '../../store';
import { RandomizerInterval } from '../../../shared/types/settings';

export const RandomizerPanel: React.FC = () => {
  const {
    advancedControls,
    startRandomizer,
    stopRandomizer
  } = useStreamGridStore();

  const isActive = advancedControls.randomizerActive;
  const currentInterval = advancedControls.randomizerInterval;

  const intervalOptions: { value: RandomizerInterval; label: string; description: string }[] = [
    { value: 1, label: '1 Second', description: 'Ultra-fast cycling for testing' },
    { value: 15, label: '15 Seconds', description: 'Quick preview intervals' },
    { value: 30, label: '30 Seconds', description: 'Standard monitoring intervals' }
  ];

  const handleIntervalChange = (interval: RandomizerInterval) => {
    startRandomizer(interval);
  };

  const toggleRandomizer = () => {
    if (isActive) {
      stopRandomizer();
    } else {
      startRandomizer(currentInterval);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Stream Randomizer</h3>
          <p className="text-sm text-gray-400">
            Automatically cycle through saved streams at set intervals
          </p>
        </div>
        <button
          onClick={toggleRandomizer}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isActive
              ? 'bg-blue-600'
              : 'bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isActive ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Interval Selection */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-200">Randomization Interval</h4>
        <div className="grid grid-cols-1 gap-2">
          {intervalOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                currentInterval === option.value
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <input
                type="radio"
                name="interval"
                value={option.value}
                checked={currentInterval === option.value}
                onChange={() => handleIntervalChange(option.value)}
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


      {/* Status Display */}
      {isActive && (
        <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-blue-300 font-medium">
              Randomizer Active
            </span>
          </div>
          <div className="text-sm text-blue-200 mt-1">
            Cycling every {currentInterval} seconds
          </div>
        </div>
      )}

      {/* Manual Controls */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-200">Manual Controls</h4>
        <div className="flex space-x-2">
          <button
            onClick={() => window.api?.system?.openExternal && window.api.system.openExternal('randomize-now')}
            disabled={!isActive}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            Randomize Now
          </button>
          <button
            onClick={() => window.api?.system?.openExternal && window.api.system.openExternal('randomize-single-tile')}
            disabled={!isActive}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            Randomize Selected
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Manual controls work independently of the automatic interval timer
        </p>
      </div>
    </div>
  );
};