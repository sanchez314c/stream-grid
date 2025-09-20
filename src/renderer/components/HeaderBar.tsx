import React from 'react';
import { useStreamGridStore } from '../store';
import { PRESET_LAYOUTS } from '@shared/types/layout';

interface HeaderBarProps {
  onAddStream: () => void;
  onSettings: () => void;
  onDiscoverCameras: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ onAddStream, onSettings, onDiscoverCameras }) => {
  const { activeLayoutId, showStatistics, setActiveLayout } = useStreamGridStore();
  
  const layoutOptions = Object.keys(PRESET_LAYOUTS);
  const currentLayout = activeLayoutId || '2x2';
  
  const handleLayoutChange = (layoutId: string) => {
    setActiveLayout(layoutId);
  };
  
  return (
    <div className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between relative z-10">
      <div className="flex items-center space-x-4">
        <div className="text-xl font-bold text-blue-500">StreamGRID</div>
        
        <button
          onClick={onAddStream}
          className="btn btn-primary text-sm"
        >
          Add Stream
        </button>
        
        <button
          onClick={onDiscoverCameras}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Discover Cameras</span>
        </button>
        
        <select
          value={currentLayout}
          onChange={(e) => handleLayoutChange(e.target.value)}
          className="px-3 py-1.5 bg-bg-tertiary text-text-primary rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {layoutOptions.map(layout => (
            <option key={layout} value={layout}>
              Layout: {layout}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center space-x-3">
        <button
          onClick={() => useStreamGridStore.getState().toggleStatistics()}
          className={`px-3 py-1.5 rounded-md text-sm ${
            showStatistics 
              ? 'bg-primary text-white' 
              : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
          }`}
        >
          Stats
        </button>
        
        <button
          onClick={onSettings}
          className="p-2 hover:bg-bg-tertiary rounded-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HeaderBar;