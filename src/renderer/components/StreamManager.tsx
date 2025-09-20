import React, { useState, useEffect } from 'react';
import { Stream, StreamStatus } from '@shared/types/stream';
import { useStreamGridStore } from '../store';

interface StreamManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const StreamManager: React.FC<StreamManagerProps> = ({ isOpen, onClose }) => {
  const { streams, addStream, removeStream, updateStream } = useStreamGridStore();
  const [savedStreams, setSavedStreams] = useState<Array<{
    id: string;
    name: string;
    url: string;
    isOnline: boolean;
    lastChecked: Date;
  }>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newStreamName, setNewStreamName] = useState('');
  const [newStreamUrl, setNewStreamUrl] = useState('');
  const [checkingStatus, setCheckingStatus] = useState<Set<string>>(new Set());

  // Load saved streams from database
  useEffect(() => {
    loadSavedStreams();
    // Check status every 30 seconds
    const interval = setInterval(checkAllStreamStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSavedStreams = async () => {
    try {
      const streams = await window.api.stream.getAll();
      setSavedStreams(streams.map(s => ({
        id: s.id,
        name: s.label || s.url,
        url: s.url,
        isOnline: false,
        lastChecked: new Date()
      })));
      // Check status after loading
      setTimeout(() => checkAllStreamStatus(), 1000);
    } catch (error) {
      console.error('Failed to load saved streams:', error);
    }
  };

  const checkStreamStatus = async (streamId: string, url: string) => {
    setCheckingStatus(prev => new Set(prev).add(streamId));
    try {
      const result = await window.api.stream.validate(url);
      setSavedStreams(prev => prev.map(s => 
        s.id === streamId 
          ? { ...s, isOnline: result.valid, lastChecked: new Date() }
          : s
      ));
    } catch (error) {
      setSavedStreams(prev => prev.map(s => 
        s.id === streamId 
          ? { ...s, isOnline: false, lastChecked: new Date() }
          : s
      ));
    } finally {
      setCheckingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(streamId);
        return newSet;
      });
    }
  };

  const checkAllStreamStatus = () => {
    savedStreams.forEach(stream => {
      checkStreamStatus(stream.id, stream.url);
    });
  };

  const handleAddNewStream = async () => {
    if (!newStreamUrl.trim()) return;
    
    try {
      const validation = await window.api.stream.validate(newStreamUrl);
      if (!validation.valid) {
        alert(`Invalid stream URL: ${validation.error || 'Unknown error'}`);
        return;
      }

      const newStream: Stream = {
        id: Date.now().toString(),
        url: newStreamUrl,
        label: newStreamName || newStreamUrl,
        status: StreamStatus.DISCONNECTED,
        settings: {
          volume: 50,
          muted: true,
          priority: 1,
          reconnectAttempts: 5,
          reconnectDelay: 3000,
          hardwareAcceleration: true,
          audioOutput: 'default'
        },
        metadata: {},
        statistics: {
          packetsReceived: 0,
          packetsLost: 0,
          bytesReceived: 0,
          currentBitrate: 0,
          averageBitrate: 0,
          currentFps: 0,
          averageFps: 0,
          droppedFrames: 0,
          latency: 0,
          connectionTime: 0,
          lastError: null
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await window.api.stream.add(newStream);
      
      setSavedStreams(prev => [...prev, {
        id: newStream.id,
        name: newStream.label,
        url: newStream.url,
        isOnline: true,
        lastChecked: new Date()
      }]);
      
      setNewStreamName('');
      setNewStreamUrl('');
    } catch (error) {
      console.error('Failed to add stream:', error);
      alert('Failed to add stream');
    }
  };

  const handleAddToGrid = (stream: typeof savedStreams[0]) => {
    const newStream: Stream = {
      id: Date.now().toString(),
      url: stream.url,
      label: stream.name,
      status: StreamStatus.CONNECTING,
      settings: {
        volume: 50,
        muted: true,
        quality: 'auto',
        lowLatency: true,
        reconnect: true,
        reconnectDelay: 5000
      },
      metadata: {},
      statistics: {
        packetsReceived: 0,
        packetsLost: 0,
        bytesReceived: 0,
        currentBitrate: 0,
        averageBitrate: 0,
        fps: 0,
        resolution: '',
        codec: ''
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    addStream(newStream);
  };

  const handleEditName = (streamId: string, currentName: string) => {
    setEditingId(streamId);
    setEditingName(currentName);
  };

  const handleSaveEdit = async (streamId: string) => {
    if (!editingName.trim()) return;
    
    setSavedStreams(prev => prev.map(s => 
      s.id === streamId ? { ...s, name: editingName } : s
    ));
    
    // Update in database
    try {
      await window.api.stream.update(streamId, { label: editingName });
    } catch (error) {
      console.error('Failed to update stream name:', error);
    }
    
    setEditingId(null);
    setEditingName('');
  };

  const handleDeleteStream = async (streamId: string) => {
    if (!confirm('Are you sure you want to delete this saved stream?')) return;
    
    try {
      await window.api.stream.delete(streamId);
      setSavedStreams(prev => prev.filter(s => s.id !== streamId));
    } catch (error) {
      console.error('Failed to delete stream:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative h-full w-full bg-gray-900 flex flex-col overflow-hidden min-w-[500px]">
      {/* Header - only show close if onClose is meaningful */}
      {onClose ? (
        <div className="bg-bg-tertiary p-4 flex items-center justify-between border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Stream Manager</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bg-secondary rounded transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : null}

      {/* Add New Stream */}
      <div className="p-4 border-b border-border bg-bg-primary">
        <h3 className="text-sm font-medium text-text-secondary mb-3">Add New Stream</h3>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Stream Name (optional)"
            value={newStreamName}
            onChange={(e) => setNewStreamName(e.target.value)}
            className="w-full px-3 py-2 bg-bg-secondary text-text-primary rounded border border-border focus:border-primary focus:outline-none"
          />
          <input
            type="text"
            placeholder="Stream URL (RTMP or HLS)"
            value={newStreamUrl}
            onChange={(e) => setNewStreamUrl(e.target.value)}
            className="w-full px-3 py-2 bg-bg-secondary text-text-primary rounded border border-border focus:border-primary focus:outline-none"
          />
          <button
            onClick={handleAddNewStream}
            disabled={!newStreamUrl.trim()}
            className="w-full py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Stream
          </button>
        </div>
      </div>

      {/* Saved Streams List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-text-secondary">Saved Streams</h3>
          <button
            onClick={checkAllStreamStatus}
            className="text-xs text-primary hover:text-primary-dark transition-colors"
          >
            Refresh All
          </button>
        </div>
        
        <div className="space-y-2">
          {savedStreams.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">No saved streams yet</p>
          ) : (
            savedStreams.map(stream => (
              <div
                key={stream.id}
                className="bg-bg-tertiary rounded-lg p-3 border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center flex-1 min-w-0">
                    {/* Status Indicator */}
                    <div className="mr-2 flex-shrink-0">
                      {checkingStatus.has(stream.id) ? (
                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div
                          className={`w-3 h-3 rounded-full ${
                            stream.isOnline ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          title={stream.isOnline ? 'Online' : 'Offline'}
                        />
                      )}
                    </div>
                    
                    {/* Stream Name */}
                    {editingId === stream.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleSaveEdit(stream.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(stream.id)}
                        className="flex-1 px-2 py-1 bg-bg-secondary text-text-primary rounded border border-primary focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="flex-1 text-sm font-medium text-text-primary truncate cursor-pointer hover:text-primary"
                        onClick={() => handleEditName(stream.id, stream.name)}
                        title="Click to edit name"
                      >
                        {stream.name}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => checkStreamStatus(stream.id, stream.url)}
                      className="p-1 hover:bg-bg-secondary rounded transition-colors"
                      title="Check status"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteStream(stream.id)}
                      className="p-1 hover:bg-error hover:text-white rounded transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Stream URL - Wrapped for better visibility */}
                <div className="text-xs text-text-muted mb-2 break-all line-clamp-2" title={stream.url}>
                  {stream.url}
                </div>
                
                {/* Add to Grid Button */}
                <button
                  onClick={() => handleAddToGrid(stream)}
                  disabled={!stream.isOnline}
                  className="w-full py-1.5 bg-primary text-white text-sm rounded hover:bg-primary-dark disabled:bg-bg-secondary disabled:text-text-muted disabled:cursor-not-allowed transition-colors"
                >
                  {stream.isOnline ? 'Add to Grid' : 'Stream Offline'}
                </button>
                
                {/* Last Checked */}
                <div className="text-xs text-text-muted mt-1">
                  Last checked: {stream.lastChecked.toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamManager;