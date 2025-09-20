import React, { useState, useEffect, useRef } from 'react';
import { useStreamGridStore } from '../../store';
import { 
  DiscoveredCamera, 
  DiscoveryProgress, 
  DiscoveryResult,
  DiscoveryPhase,
  CameraProtocol 
} from '@shared/types/discovery';

interface CameraDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CameraDiscoveryModal: React.FC<CameraDiscoveryModalProps> = ({ isOpen, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState<DiscoveryProgress | null>(null);
  const [discoveredCameras, setDiscoveredCameras] = useState<DiscoveredCamera[]>([]);
  const [selectedCameras, setSelectedCameras] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const { addStream } = useStreamGridStore();

  useEffect(() => {
    if (!isOpen) return;

    // Listen for discovery events
    const handleProgress = (_event: any, sessionId: string, progressData: DiscoveryProgress) => {
      if (sessionId === sessionIdRef.current) {
        setProgress(progressData);
      }
    };

    const handleCompleted = (_event: any, sessionId: string, result: DiscoveryResult) => {
      if (sessionId === sessionIdRef.current) {
        setIsScanning(false);
        setDiscoveredCameras(result.cameras);
        if (result.cameras.length === 0) {
          setError('No streamable devices found on local network');
        }
      }
    };

    const handleError = (_event: any, sessionId: string, errorData: any) => {
      if (sessionId === sessionIdRef.current) {
        setIsScanning(false);
        setError(errorData?.message || 'Discovery failed');
      }
    };

    window.api.on('discovery:progress', handleProgress);
    window.api.on('discovery:completed', handleCompleted);
    window.api.on('discovery:error', handleError);

    return () => {
      window.api.removeAllListeners('discovery:progress');
      window.api.removeAllListeners('discovery:completed');
      window.api.removeAllListeners('discovery:error');
    };
  }, [isOpen]);

  const startDiscovery = async () => {
    setIsScanning(true);
    setError(null);
    setDiscoveredCameras([]);
    setSelectedCameras(new Set());
    setProgress(null);

    try {
      const sessionId = await window.api.discovery.start({
        maxConcurrentScans: 25,
        portScanTimeout: 3000,
        deepScan: true
      });
      sessionIdRef.current = sessionId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start discovery');
      setIsScanning(false);
    }
  };

  const stopDiscovery = async () => {
    if (sessionIdRef.current) {
      try {
        await window.api.discovery.stop(sessionIdRef.current);
        setIsScanning(false);
      } catch (err) {
        console.error('Failed to stop discovery:', err);
      }
    }
  };

  const toggleCameraSelection = (cameraId: string) => {
    const newSelected = new Set(selectedCameras);
    if (newSelected.has(cameraId)) {
      newSelected.delete(cameraId);
    } else {
      newSelected.add(cameraId);
    }
    setSelectedCameras(newSelected);
  };

  const addSelectedCameras = () => {
    selectedCameras.forEach(cameraId => {
      const camera = discoveredCameras.find(c => c.id === cameraId);
      if (camera) {
        const label = camera.name || `${camera.manufacturer || 'Camera'} (${camera.ip})`;
        addStream({
          id: crypto.randomUUID(),
          url: camera.streamUrl,
          label,
          status: 'disconnected' as any,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });
    onClose();
  };

  const getPhaseMessage = (phase: DiscoveryPhase): string => {
    switch (phase) {
      case DiscoveryPhase.INITIALIZING:
        return 'Initializing network scan...';
      case DiscoveryPhase.SCANNING_NETWORK:
        return 'Scanning local network for devices...';
      case DiscoveryPhase.PROBING_PORTS:
        return 'Probing camera ports...';
      case DiscoveryPhase.TESTING_RTSP:
        return 'Testing RTSP connections...';
      case DiscoveryPhase.TESTING_HTTP:
        return 'Testing HTTP camera interfaces...';
      case DiscoveryPhase.ONVIF_DISCOVERY:
        return 'Discovering ONVIF devices...';
      case DiscoveryPhase.VALIDATING_STREAMS:
        return 'Validating camera streams...';
      case DiscoveryPhase.COMPLETED:
        return 'Discovery completed!';
      case DiscoveryPhase.ERROR:
        return 'Discovery encountered an error';
      default:
        return 'Scanning...';
    }
  };

  const getProtocolColor = (protocol: CameraProtocol): string => {
    switch (protocol) {
      case CameraProtocol.RTSP:
        return 'bg-blue-500';
      case CameraProtocol.HTTP:
        return 'bg-green-500';
      case CameraProtocol.ONVIF:
        return 'bg-purple-500';
      case CameraProtocol.MJPEG:
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Discover Network Cameras
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Discovery Controls */}
        <div className="mb-6">
          {!isScanning && discoveredCameras.length === 0 && !error ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                Click "Start Discovery" to scan your local network for cameras
              </div>
              <button
                onClick={startDiscovery}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                🔍 Start Discovery
              </button>
            </div>
          ) : null}

          {/* Scanning Progress */}
          {isScanning && (
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {/* Blinking LED Indicator */}
                  <div className="flex items-center mr-4">
                    <div className={`w-3 h-3 rounded-full mr-2 ${isScanning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-green-400 font-medium">SCANNING</span>
                  </div>
                  <div className="text-white">
                    {progress ? getPhaseMessage(progress.phase) : 'Starting...'}
                  </div>
                </div>
                <button
                  onClick={stopDiscovery}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm transition-colors"
                >
                  Stop
                </button>
              </div>

              {progress && (
                <>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>

                  {/* Progress Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-gray-400">Progress</div>
                      <div className="text-white font-medium">{progress.progress}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">IPs Scanned</div>
                      <div className="text-white font-medium">{progress.scannedIPs}/{progress.totalIPs}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Found</div>
                      <div className="text-green-400 font-medium">{progress.foundCameras}</div>
                    </div>
                    {progress.currentIP && (
                      <div className="text-center">
                        <div className="text-gray-400">Current IP</div>
                        <div className="text-white font-medium text-xs">{progress.currentIP}</div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && !isScanning && (
            <div className="bg-red-900 border border-red-600 rounded-lg p-4 text-center">
              <div className="text-red-300 text-lg mb-2">⚠️ {error}</div>
              <button
                onClick={startDiscovery}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Discovered Cameras */}
        {discoveredCameras.length > 0 && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">
                Found {discoveredCameras.length} Camera{discoveredCameras.length !== 1 ? 's' : ''}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedCameras(new Set(discoveredCameras.map(c => c.id)))}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedCameras(new Set())}
                  className="text-gray-400 hover:text-gray-300 text-sm"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Camera List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {discoveredCameras.map((camera) => (
                <div
                  key={camera.id}
                  className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedCameras.has(camera.id) ? 'ring-2 ring-blue-500 bg-gray-600' : 'hover:bg-gray-650'
                  }`}
                  onClick={() => toggleCameraSelection(camera.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedCameras.has(camera.id)}
                          onChange={() => toggleCameraSelection(camera.id)}
                          className="rounded"
                        />
                        <h4 className="font-medium text-white">
                          {camera.name || `Camera ${camera.ip}`}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs text-white ${getProtocolColor(camera.protocol)}`}>
                          {camera.protocol.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>📍 {camera.ip}:{camera.port}</div>
                        {camera.manufacturer && (
                          <div>🏢 {camera.manufacturer} {camera.model && `- ${camera.model}`}</div>
                        )}
                        <div className="font-mono text-xs bg-gray-800 p-1 rounded">
                          {camera.streamUrl}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addSelectedCameras}
                disabled={selectedCameras.size === 0}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              >
                Add {selectedCameras.size > 0 ? `${selectedCameras.size} ` : ''}Camera{selectedCameras.size !== 1 ? 's' : ''} to Grid
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraDiscoveryModal;