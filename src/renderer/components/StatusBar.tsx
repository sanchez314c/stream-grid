import React, { useEffect, useState } from 'react';
import { useStreamGridStore } from '../store';
import { StreamStatus } from '@shared/types/stream';

const StatusBar: React.FC = () => {
  const { streams, showStatistics, performanceMetrics, bufferSize, setBufferSize, accelerationMode, hardwareVerificationStatus } = useStreamGridStore();
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [bandwidthMetrics, setBandwidthMetrics] = useState<any>(null);
  const [gpuMetrics, setGpuMetrics] = useState<any>(null);
  const [gpuInfo, setGpuInfo] = useState<any>(null);
  
  useEffect(() => {
    const updateSystemInfo = async () => {
      const info = await window.api.system.getInfo();
      setSystemInfo(info);
    };
    
    // Start monitoring
    const startMonitoring = async () => {
      try {
        await window.api.monitoring.startBandwidth();
        await window.api.monitoring.startGPU();
        const gpuInfoData = await window.api.monitoring.getGPUInfo();
        setGpuInfo(gpuInfoData);
      } catch (error) {
        console.error('Failed to start monitoring:', error);
      }
    };
    
    updateSystemInfo();
    startMonitoring();
    
    const interval = setInterval(updateSystemInfo, 2000);
    
    // Listen for monitoring events
    const handleBandwidthMetrics = (_event: any, metrics: any) => {
      setBandwidthMetrics(metrics);
    };
    
    const handleGpuMetrics = (_event: any, metrics: any) => {
      setGpuMetrics(metrics);
    };
    
    window.api.on('monitoring:bandwidth', handleBandwidthMetrics);
    window.api.on('monitoring:gpu', handleGpuMetrics);
    
    return () => {
      clearInterval(interval);
      window.api.removeAllListeners('monitoring:bandwidth');
      window.api.removeAllListeners('monitoring:gpu');
      
      // Stop monitoring when component unmounts
      window.api.monitoring.stopBandwidth().catch(console.error);
      window.api.monitoring.stopGPU().catch(console.error);
    };
  }, []);
  
  const connectedStreams = Array.from(streams instanceof Map ? streams.values() : []).filter(
    s => s.status === StreamStatus.CONNECTED
  ).length;
  
  const totalStreams = streams instanceof Map ? streams.size : 0;
  
  // LED indicator color and status
  const getLedStatus = () => {
    if (accelerationMode === 'cpu') {
      return { color: 'bg-red-500', status: 'CPU MODE', title: 'Software decoding active' };
    }
    
    switch (hardwareVerificationStatus) {
      case 'active':
        return { color: 'bg-green-500', status: 'GPU MODE', title: 'Hardware acceleration verified and active' };
      case 'verifying':
        return { color: 'bg-yellow-500', status: 'GPU MODE', title: 'Hardware acceleration verifying...' };
      case 'inactive':
        return { color: 'bg-red-500', status: 'CPU MODE', title: 'Hardware acceleration inactive' };
      case 'failed':
        return { color: 'bg-red-500', status: 'GPU FAILED', title: 'Hardware acceleration failed' };
      default:
        return { color: 'bg-gray-500', status: 'UNKNOWN', title: 'Acceleration status unknown' };
    }
  };

  const ledStatus = getLedStatus();

  if (!showStatistics) {
    // Always show LED indicator even when statistics are hidden
    return (
      <div className="bg-bg-secondary border-t border-border px-4 py-1">
        <div className="flex justify-end">
          <div className="flex items-center space-x-2" title={ledStatus.title}>
            <div className={`w-2 h-2 rounded-full ${ledStatus.color} animate-pulse`}></div>
            <span className="text-xs font-mono text-text-muted">{ledStatus.status}</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-bg-secondary border-t border-border px-4 py-2 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-text-muted">Connected:</span>
            <span className={`font-medium ${connectedStreams === totalStreams ? 'text-success' : 'text-warning'}`}>
              {connectedStreams}/{totalStreams}
            </span>
          </div>
          
          {systemInfo && (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-text-muted">CPU:</span>
                <span className="font-medium">
                  {Math.round(systemInfo.cpuUsage)}%
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-text-muted">Memory:</span>
                <span className="font-medium">
                  {(systemInfo.memoryUsage / 1024).toFixed(1)} GB
                </span>
              </div>
            </>
          )}

          {/* GPU Metrics */}
          {gpuMetrics && (
            <div className="flex items-center space-x-2">
              <span className="text-text-muted">GPU:</span>
              <span className={`font-medium ${gpuMetrics.utilization > 80 ? 'text-warning' : gpuMetrics.utilization > 5 ? 'text-success' : 'text-gray-400'}`}>
                {Math.round(gpuMetrics.utilization)}%
              </span>
              {gpuMetrics.memoryUsed > 0 && (
                <span className="text-xs text-text-muted">
                  ({Math.round(gpuMetrics.memoryUsed)}MB)
                </span>
              )}
            </div>
          )}

          {gpuInfo && !gpuMetrics && (
            <div className="flex items-center space-x-2">
              <span className="text-text-muted">GPU:</span>
              <span className="text-xs text-text-muted">
                {gpuInfo.vendor} {gpuInfo.model?.split(' ').slice(0, 2).join(' ')}
              </span>
            </div>
          )}

          {/* Bandwidth Metrics */}
          {bandwidthMetrics && (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-text-muted">↓</span>
                <span className={`font-medium ${bandwidthMetrics.downloadSpeedMbps > 50 ? 'text-warning' : 'text-success'}`}>
                  {bandwidthMetrics.downloadSpeedMbps.toFixed(1)} Mbps
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-text-muted">↑</span>
                <span className="font-medium">
                  {bandwidthMetrics.uploadSpeedMbps.toFixed(1)} Mbps
                </span>
              </div>
            </>
          )}
          
          {performanceMetrics.fps > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-text-muted">FPS:</span>
              <span className="font-medium">{performanceMetrics.fps}</span>
            </div>
          )}
          
          {performanceMetrics.droppedFrames > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-text-muted">Dropped:</span>
              <span className="font-medium text-warning">
                {performanceMetrics.droppedFrames}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Buffer Size Slider */}
          <div className="flex items-center space-x-2">
            <span className="text-text-muted text-xs">Buffer:</span>
            <input
              type="range"
              min="1"
              max="30"
              value={bufferSize}
              onChange={(e) => setBufferSize(parseInt(e.target.value))}
              className="w-16 h-1 bg-bg-tertiary rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((bufferSize - 1) / 29) * 100}%, #374151 ${((bufferSize - 1) / 29) * 100}%, #374151 100%)`
              }}
            />
            <span className="text-xs font-mono text-primary min-w-[24px]">{bufferSize}s</span>
          </div>
          
          {/* LED Status Indicator */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2" title={ledStatus.title}>
              <div className={`w-3 h-3 rounded-full ${ledStatus.color} animate-pulse`}></div>
              <span className="text-xs font-mono text-primary">{ledStatus.status}</span>
            </div>
            
            <div className="text-text-muted">
              StreamGRID v1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;