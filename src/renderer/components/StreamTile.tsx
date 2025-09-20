import { useState } from 'react';
import { Stream, StreamStatus } from '@shared/types/stream';
import { StreamRecordingState, TileVFXSettings } from '@shared/types/settings';
import { useStreamGridStore } from '../store';
import VideoPlayer from './VideoPlayer';
import { RecordingIndicator } from './advanced-controls/RecordingIndicator';
import { VFXOverlay } from './advanced-controls/VFXOverlay';

interface StreamTileProps {
  stream: Stream;
  showLabel: boolean;
}

const StreamTile: React.FC<StreamTileProps> = ({ stream, showLabel }) => {
  const { updateStream, removeStream, advancedControls } = useStreamGridStore();
  
  // Helper function to get recording state for this stream
  const getRecordingState = (): StreamRecordingState => {
    // Fix for Immer proxy issue with Maps
    const recordingStateMap = advancedControls.recordingState;
    const storeRecordingState = recordingStateMap instanceof Map 
      ? recordingStateMap.get(stream.id)
      : Array.from(recordingStateMap || []).find(([key]) => key === stream.id)?.[1];
      
    if (!storeRecordingState) {
      return {
        isRecording: false,
        startTime: null,
        outputFile: null,
        processId: null,
        duration: 0,
        fileSize: 0,
        status: 'idle'
      };
    }
    
    // Convert store state to settings format
    return {
      isRecording: storeRecordingState.isRecording,
      startTime: storeRecordingState.startTime,
      outputFile: storeRecordingState.outputFile,
      processId: storeRecordingState.processId,
      duration: storeRecordingState.duration,
      fileSize: storeRecordingState.fileSize,
      status: storeRecordingState.status,
      errorMessage: storeRecordingState.errorMessage
    };
  };
  
  // Helper function to get VFX state for this stream
  const getVFXState = (): TileVFXSettings | undefined => {
    // Fix for Immer proxy issue with Maps
    const vfxFiltersMap = advancedControls.vfxFilters;
    const storeVfxState = vfxFiltersMap instanceof Map 
      ? vfxFiltersMap.get(stream.id)
      : Array.from(vfxFiltersMap || []).find(([key]) => key === stream.id)?.[1];
    if (!storeVfxState || !advancedControls.enabled) {
      return undefined;
    }
    
    // Convert store state to settings format
    return {
      activeFilters: storeVfxState.activeFilters.filter(f => f.enabled),
      presetName: storeVfxState.presetName,
      customSettings: storeVfxState.customSettings
    };
  };
  const [volume, setVolume] = useState(stream.settings.volume);
  const [isMuted, setIsMuted] = useState(stream.settings.muted);
  
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    updateStream(stream.id, {
      settings: { ...stream.settings, volume: newVolume }
    });
  };
  
  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    updateStream(stream.id, {
      settings: { ...stream.settings, muted: newMuted }
    });
  };
  
  const handleRefresh = () => {
    updateStream(stream.id, { status: StreamStatus.RECONNECTING });
    // TODO: Implement actual stream refresh
  };
  
  const handleRemove = () => {
    if (confirm(`Remove stream "${stream.label}"?`)) {
      removeStream(stream.id);
      window.api.stream.delete(stream.id);
    }
  };
  
  const getStatusColor = () => {
    switch (stream.status) {
      case StreamStatus.CONNECTED:
        return 'stream-status-connected';
      case StreamStatus.CONNECTING:
      case StreamStatus.RECONNECTING:
        return 'stream-status-connecting';
      case StreamStatus.ERROR:
        return 'stream-status-error';
      default:
        return 'stream-status-disconnected';
    }
  };
  
  return (
    <div className="relative w-full h-full flex flex-col group bg-gray-900 border border-gray-800">
      {/* Top Control Bar - Always visible */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black via-black/80 to-transparent p-2 flex justify-between items-start">
        {/* Left side - Controls */}
        <div className="flex space-x-1">
          <button
            onClick={handleRefresh}
            className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-white transition-all"
            title="Refresh stream"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <button
            onClick={handleRemove}
            className="p-1.5 bg-gray-800 hover:bg-red-700 rounded text-white transition-all"
            title="Remove stream"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Right side - Status indicator */}
        <div className="flex items-center space-x-2">
          {showLabel && (
            <span className="text-xs text-white bg-black/50 px-2 py-1 rounded truncate max-w-[150px]">
              {stream.label}
            </span>
          )}
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
        </div>
      </div>
      
      {/* Video player area */}
      <div className="flex-1 relative bg-black">
        <VideoPlayer stream={stream} volume={volume} isMuted={isMuted} />
        
        {/* Recording Indicator Overlay */}
        <RecordingIndicator
          streamId={stream.id}
          recordingState={getRecordingState()}
          position="top-right"
          size="medium"
        />
        
        {/* VFX Overlay */}
        <VFXOverlay
          streamId={stream.id}
          vfxState={getVFXState()}
        />
        
        {/* Error overlay */}
        {stream.status === StreamStatus.ERROR && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-error mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-error">Connection Failed</p>
              <p className="text-text-muted text-sm mt-1">{stream.statistics.lastError || 'Unknown error'}</p>
              <button
                onClick={handleRefresh}
                className="mt-3 px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-dark"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {/* Connecting overlay */}
        {(stream.status === StreamStatus.CONNECTING || stream.status === StreamStatus.RECONNECTING) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-text-secondary">
                {stream.status === StreamStatus.RECONNECTING ? 'Reconnecting...' : 'Connecting...'}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls bar */}
      <div className="bg-bg-tertiary p-2">
        {showLabel && (
          <div className="text-sm text-text-primary mb-2 truncate">{stream.label}</div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Mute button */}
            <button
              onClick={handleMuteToggle}
              className="p-1 hover:bg-bg-secondary rounded transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
            
            {/* Volume slider */}
            {!isMuted && (
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-20 h-1 bg-bg-secondary rounded-lg appearance-none cursor-pointer"
              />
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className="p-1 hover:bg-bg-secondary rounded transition-colors"
              title="Refresh stream"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            {/* Remove button */}
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-error hover:text-white rounded transition-colors"
              title="Remove stream"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamTile;