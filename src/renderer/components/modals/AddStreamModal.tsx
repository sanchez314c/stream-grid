import React, { useState } from 'react';
import { useStreamGridStore } from '../../store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TEST_STREAMS } from '@shared/constants/test-streams';

interface AddStreamModalProps {
  onClose: () => void;
}

const AddStreamModal: React.FC<AddStreamModalProps> = ({ onClose }) => {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(5);
  const [reconnectDelay, setReconnectDelay] = useState(3000);
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);
  const [lowLatency, setLowLatency] = useState(false);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  
  const { addStream } = useStreamGridStore();
  const queryClient = useQueryClient();
  
  const addStreamMutation = useMutation({
    mutationFn: async () => {
      const stream = await window.api.stream.add(url, label);
      return stream;
    },
    onSuccess: (stream) => {
      addStream(stream);
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to add stream');
    }
  });
  
  const handleTestConnection = async () => {
    if (!url) {
      setError('Please enter a stream URL');
      return;
    }
    
    setIsValidating(true);
    setError('');
    
    try {
      const result = await window.api.stream.validate(url);
      if (result.valid) {
        setError('');
        alert('Connection successful! Stream is valid.');
      } else {
        setError(result.error || 'Invalid stream URL');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate stream');
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !label) {
      setError('Please fill in all required fields');
      return;
    }
    
    addStreamMutation.mutate();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bg-secondary rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add New Stream</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bg-tertiary rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stream URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onPaste={(e) => {
                  e.stopPropagation();
                  // Let the default paste behavior work
                }}
                placeholder="https://example.com/stream.m3u8"
                className="input"
                required
                autoComplete="off"
                spellCheck={false}
              />
              <div className="mt-2 text-xs text-gray-400">
                ⚠️ Note: RTMP streams require transcoding. Use HLS (.m3u8) streams for direct playback.
              </div>
              
              {/* Test Streams Helper */}
              <div className="mt-3 p-3 bg-bg-primary rounded">
                <div className="text-xs font-medium mb-2">Quick Test Streams:</div>
                <div className="space-y-1">
                  {TEST_STREAMS.slice(0, 2).map((stream) => (
                    <button
                      key={stream.url}
                      type="button"
                      onClick={() => {
                        setUrl(stream.url);
                        setLabel(stream.name);
                      }}
                      className="w-full text-left text-xs p-2 hover:bg-bg-secondary rounded transition-colors"
                    >
                      <div className="font-medium text-primary">{stream.name}</div>
                      <div className="text-gray-500 truncate">{stream.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onPaste={(e) => {
                  e.stopPropagation();
                  // Let the default paste behavior work
                }}
                placeholder="Camera 1 - Main Stage"
                className="input"
                required
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="saveToLibrary"
                checked={saveToLibrary}
                onChange={(e) => setSaveToLibrary(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="saveToLibrary" className="text-sm">
                Save to library
              </label>
            </div>
            
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm text-primary hover:text-primary-light"
              >
                <span>Advanced Options</span>
                <svg 
                  className={`w-4 h-4 ml-1 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showAdvanced && (
                <div className="mt-3 p-3 bg-bg-primary rounded space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Reconnect Attempts</label>
                      <input
                        type="number"
                        value={reconnectAttempts}
                        onChange={(e) => setReconnectAttempts(Number(e.target.value))}
                        min="0"
                        max="10"
                        className="input text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium mb-1">Reconnect Delay (ms)</label>
                      <input
                        type="number"
                        value={reconnectDelay}
                        onChange={(e) => setReconnectDelay(Number(e.target.value))}
                        min="1000"
                        max="60000"
                        step="1000"
                        className="input text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hardwareAcceleration"
                        checked={hardwareAcceleration}
                        onChange={(e) => setHardwareAcceleration(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="hardwareAcceleration" className="text-sm">
                        Hardware Acceleration
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="lowLatency"
                        checked={lowLatency}
                        onChange={(e) => setLowLatency(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="lowLatency" className="text-sm">
                        Low Latency Mode
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {error && (
              <div className="p-3 bg-error bg-opacity-10 border border-error rounded text-error text-sm">
                {error}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isValidating || !url}
              className="btn btn-secondary"
            >
              {isValidating ? 'Testing...' : 'Test Connection'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={addStreamMutation.isPending}
              className="btn btn-primary"
            >
              {addStreamMutation.isPending ? 'Adding...' : 'Add Stream'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStreamModal;