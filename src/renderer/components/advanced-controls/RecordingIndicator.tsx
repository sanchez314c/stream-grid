import React, { useState, useEffect } from 'react';
import { StreamRecordingState } from '../../../shared/types/settings';

interface RecordingIndicatorProps {
  streamId: string;
  recordingState: StreamRecordingState;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  streamId,
  recordingState,
  position = 'top-right',
  size = 'medium',
  className = ''
}) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [blinkVisible, setBlinkVisible] = useState<boolean>(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (recordingState.isRecording && recordingState.startTime) {
      // Update elapsed time every second
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - recordingState.startTime!) / 1000);
        setElapsedTime(elapsed);
      }, 1000);

      // Calculate initial elapsed time
      const now = Date.now();
      const elapsed = Math.floor((now - recordingState.startTime) / 1000);
      setElapsedTime(elapsed);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [recordingState.isRecording, recordingState.startTime]);

  useEffect(() => {
    let blinkInterval: NodeJS.Timeout;
    
    if (recordingState.isRecording) {
      // Blinking red dot effect
      blinkInterval = setInterval(() => {
        setBlinkVisible(prev => !prev);
      }, 800); // Blink every 800ms
    } else {
      setBlinkVisible(true);
    }

    return () => {
      if (blinkInterval) {
        clearInterval(blinkInterval);
      }
    };
  }, [recordingState.isRecording]);

  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getPositionClasses = (): string => {
    const positions = {
      'top-left': 'top-2 left-2',
      'top-right': 'top-2 right-2',
      'bottom-left': 'bottom-2 left-2',
      'bottom-right': 'bottom-2 right-2'
    };
    return positions[position];
  };

  const getSizeClasses = (): { container: string; text: string; dot: string } => {
    const sizes = {
      small: {
        container: 'text-xs px-2 py-1',
        text: 'text-xs',
        dot: 'w-2 h-2'
      },
      medium: {
        container: 'text-sm px-3 py-1.5',
        text: 'text-sm',
        dot: 'w-3 h-3'
      },
      large: {
        container: 'text-base px-4 py-2',
        text: 'text-base',
        dot: 'w-4 h-4'
      }
    };
    return sizes[size];
  };

  if (!recordingState.isRecording && recordingState.status !== 'error') {
    return null;
  }

  const sizeClasses = getSizeClasses();
  const positionClasses = getPositionClasses();

  return (
    <div className={`absolute z-10 ${positionClasses} ${className}`}>
      {recordingState.status === 'error' ? (
        // Error indicator
        <div className={`bg-red-600/90 text-white rounded-lg flex items-center space-x-2 backdrop-blur-sm ${sizeClasses.container}`}>
          <div className={`bg-red-400 rounded-full ${sizeClasses.dot}`}></div>
          <span className={`font-semibold ${sizeClasses.text}`}>REC ERROR</span>
        </div>
      ) : recordingState.isRecording ? (
        // Recording indicator
        <div className={`bg-red-600/90 text-white rounded-lg flex items-center space-x-2 backdrop-blur-sm ${sizeClasses.container}`}>
          {/* Blinking red dot */}
          <div 
            className={`bg-red-300 rounded-full transition-opacity duration-150 ${sizeClasses.dot}`}
            style={{ opacity: blinkVisible ? 1 : 0.3 }}
          ></div>
          
          {/* REC text */}
          <span className={`font-bold ${sizeClasses.text}`}>REC</span>
          
          {/* Elapsed time */}
          <span className={`font-mono ${sizeClasses.text}`}>
            {formatElapsedTime(elapsedTime)}
          </span>
          
          {/* File size (if available) */}
          {recordingState.fileSize && recordingState.fileSize > 0 && (
            <span className={`font-mono opacity-75 ${sizeClasses.text}`}>
              {formatFileSize(recordingState.fileSize)}
            </span>
          )}
        </div>
      ) : null}
      
      {/* Recording controls overlay (appears on hover) */}
      {recordingState.isRecording && (
        <div className="group">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-full mt-1 right-0 min-w-max">
            <div className="bg-gray-800/95 text-white rounded-lg p-2 backdrop-blur-sm border border-gray-600">
              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => window.electronAPI?.invoke('advanced-controls:pause-recording', streamId)}
                  className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white font-medium transition-colors"
                  title="Pause Recording"
                >
                  ⏸
                </button>
                <button
                  onClick={() => window.electronAPI?.invoke('advanced-controls:stop-recording', streamId)}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white font-medium transition-colors"
                  title="Stop Recording"
                >
                  ⏹
                </button>
              </div>
              
              {/* Recording details */}
              <div className="mt-2 text-xs text-gray-300 space-y-1">
                <div>Output: {recordingState.outputFile || 'N/A'}</div>
                <div>Duration: {formatElapsedTime(elapsedTime)}</div>
                <div>Status: {recordingState.status.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};