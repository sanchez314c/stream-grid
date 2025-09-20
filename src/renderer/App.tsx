import { useEffect, useState } from 'react';
import { useStreamGridStore } from './store';
import HeaderBar from './components/HeaderBar';
import StreamGrid from './components/StreamGrid';
import StatusBar from './components/StatusBar';
import AddStreamModal from './components/modals/AddStreamModal';
import SettingsModal from './components/modals/SettingsModal';
import CameraDiscoveryModal from './components/modals/CameraDiscoveryModal';
import PerformanceVerifier from './components/PerformanceVerifier';
import { KeyboardHandler } from './components/advanced-controls/KeyboardHandler';
import { useQuery } from '@tanstack/react-query';
import type { ElectronAPI } from '@shared/types/ipc';

function App() {
  const [showAddStream, setShowAddStream] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  
  const { 
    loadStreams, 
    loadLayouts, 
    toggleFullscreen,
    toggleFrameless,
    toggleStatistics,
    toggleLabels
  } = useStreamGridStore();
  
  // Load initial data
  const { data: streams } = useQuery({
    queryKey: ['streams'],
    queryFn: async () => {
      try {
        if (window.api?.stream?.getAll) {
          return await window.api.stream.getAll();
        }
        return [];
      } catch (error) {
        console.warn('Failed to load streams:', error);
        return [];
      }
    }
  });
  
  const { data: layouts } = useQuery({
    queryKey: ['layouts'],
    queryFn: async () => {
      try {
        if (window.api?.layout?.getAll) {
          return await window.api.layout.getAll();
        }
        return [];
      } catch (error) {
        console.warn('Failed to load layouts:', error);
        return [];
      }
    }
  });
  
  useEffect(() => {
    if (streams) {
      loadStreams(streams);
    }
  }, [streams, loadStreams]);
  
  useEffect(() => {
    if (layouts) {
      loadLayouts(layouts);
    }
  }, [layouts, loadLayouts]);
  
  // Listen to menu events
  useEffect(() => {
    const handleAddStream = () => setShowAddStream(true);
    const handleSettings = () => setShowSettings(true);
    const handleLayout = (layoutKey: string) => {
      // Handle layout change
      console.log('Change layout to:', layoutKey);
    };
    const handleToggleFrameless = () => toggleFrameless();
    const handleToggleStatistics = () => toggleStatistics();
    const handleToggleLabels = () => toggleLabels();
    const handleFullscreen = (isFullscreen: boolean) => {
      if (isFullscreen !== useStreamGridStore.getState().isFullscreen) {
        toggleFullscreen();
      }
    };
    
    window.api.on('menu:add-stream', handleAddStream);
    window.api.on('menu:settings', handleSettings);
    window.api.on('menu:layout', handleLayout);
    window.api.on('menu:toggle-frameless', handleToggleFrameless);
    window.api.on('menu:toggle-statistics', handleToggleStatistics);
    window.api.on('menu:toggle-labels', handleToggleLabels);
    window.api.on('window:fullscreen', handleFullscreen);
    
    return () => {
      window.api.removeAllListeners('menu:add-stream');
      window.api.removeAllListeners('menu:settings');
      window.api.removeAllListeners('menu:layout');
      window.api.removeAllListeners('menu:toggle-frameless');
      window.api.removeAllListeners('menu:toggle-statistics');
      window.api.removeAllListeners('menu:toggle-labels');
      window.api.removeAllListeners('window:fullscreen');
    };
  }, []);
  
  return (
    <KeyboardHandler>
      <div className="flex flex-col h-screen bg-black">
      <HeaderBar 
        onAddStream={() => setShowAddStream(true)} 
        onSettings={() => setShowSettings(true)}
        onDiscoverCameras={() => setShowDiscovery(true)}
      />
      <StreamGrid />
      <StatusBar />
      
      {showAddStream && (
        <AddStreamModal onClose={() => setShowAddStream(false)} />
      )}
      
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
      
      {showDiscovery && (
        <CameraDiscoveryModal 
          isOpen={showDiscovery}
          onClose={() => setShowDiscovery(false)} 
        />
      )}
      
      {/* Performance verification runs in background */}
      <PerformanceVerifier />
      </div>
    </KeyboardHandler>
  );
}

export default App;