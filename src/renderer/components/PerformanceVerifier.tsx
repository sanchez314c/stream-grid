import React, { useEffect, useState } from 'react';
import { useStreamGridStore } from '../store';

interface HardwareVerificationResult {
  videoToolboxAvailable: boolean;
  hardwareDecodeActive: boolean;
  activeDecoderType: 'hardware' | 'software' | 'unknown';
  gpuAccelerationActive: boolean;
  verificationDetails: string[];
  timestamp: number;
}

interface GPUMetrics {
  utilization: number;
  memoryUsed: number;
  vendor: string;
  model: string;
  hardwareDecodingActive: boolean;
  accelerationMode: 'hardware' | 'software' | 'unknown';
  videoToolboxActive?: boolean;
  hardwareVerification?: HardwareVerificationResult;
}

const PerformanceVerifier: React.FC = () => {
  const { 
    accelerationMode, 
    setHardwareVerificationStatus, 
    streams 
  } = useStreamGridStore();

  const [verification, setVerification] = useState<HardwareVerificationResult | null>(null);
  const [gpuMetrics, setGpuMetrics] = useState<GPUMetrics | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [verificationLog, setVerificationLog] = useState<string[]>([]);

  useEffect(() => {
    // Start hardware verification monitoring when component mounts
    const startVerification = async () => {
      try {
        await window.api.monitoring.startGPU();
        await (window.api as any).hardware?.startContinuousVerification?.(3000);
        
        // Perform initial verification
        const initialVerification = await (window.api as any).hardware?.verify?.();
        if (initialVerification) {
          setVerification(initialVerification);
          updateVerificationStatus(initialVerification);
        }
      } catch (error) {
        console.error('Failed to start hardware verification:', error);
        addToLog(`Failed to start verification: ${error}`);
      }
    };

    startVerification();

    // Listen for verification events
    const handleVerificationComplete = (_event: any, result: HardwareVerificationResult) => {
      setVerification(result);
      updateVerificationStatus(result);
      addToLog(`Verification complete: ${result.activeDecoderType} mode detected`);
    };

    const handleVerificationError = (_event: any, error: any) => {
      console.error('Hardware verification error:', error);
      addToLog(`Verification error: ${error}`);
      setHardwareVerificationStatus('failed');
    };

    const handleGpuMetrics = (_event: any, metrics: GPUMetrics) => {
      setGpuMetrics(metrics);
      
      // Update verification status based on GPU metrics and hardware verification
      if (metrics.hardwareVerification) {
        updateVerificationStatus(metrics.hardwareVerification);
      }
      
      // Log significant changes
      if (metrics.accelerationMode !== 'unknown') {
        const expectedMode = accelerationMode === 'gpu' ? 'hardware' : 'software';
        if (metrics.accelerationMode !== expectedMode) {
          addToLog(`Warning: Expected ${expectedMode} mode but detected ${metrics.accelerationMode}`);
        }
      }
    };

    const handleSystemInfo = (_event: any, info: any) => {
      setSystemMetrics(info);
    };

    // Set up event listeners
    window.api?.on('hardware:verification-complete', handleVerificationComplete);
    window.api?.on('hardware:verification-error', handleVerificationError);
    window.api?.on('monitoring:gpu', handleGpuMetrics);
    
    // System info polling
    const systemInfoInterval = setInterval(async () => {
      try {
        const info = await window.api.system.getInfo();
        setSystemMetrics(info);
      } catch (error) {
        console.error('Failed to get system info:', error);
      }
    }, 2000);

    return () => {
      window.api?.removeAllListeners('hardware:verification-complete');
      window.api?.removeAllListeners('hardware:verification-error');
      window.api?.removeAllListeners('monitoring:gpu');
      clearInterval(systemInfoInterval);
      
      // Stop monitoring
      window.api?.monitoring?.stopGPU?.().catch(console.error);
      (window.api as any).hardware?.stopContinuousVerification?.().catch(console.error);
    };
  }, []);

  useEffect(() => {
    // Perform verification when acceleration mode changes
    const verifyOnModeChange = async () => {
      try {
        addToLog(`Acceleration mode changed to: ${accelerationMode.toUpperCase()}`);
        setHardwareVerificationStatus('verifying');
        
        const result = await (window.api as any).hardware?.verify?.();
        if (result) {
          setVerification(result);
          updateVerificationStatus(result);
        }
      } catch (error) {
        console.error('Failed to verify on mode change:', error);
        addToLog(`Verification failed: ${error}`);
        setHardwareVerificationStatus('failed');
      }
    };

    verifyOnModeChange();
  }, [accelerationMode]);

  const updateVerificationStatus = (result: HardwareVerificationResult) => {
    if (accelerationMode === 'cpu') {
      setHardwareVerificationStatus('inactive');
    } else {
      // GPU mode - check if hardware is actually active
      if (result.hardwareDecodeActive && result.gpuAccelerationActive) {
        setHardwareVerificationStatus('active');
      } else if (result.videoToolboxAvailable && !result.hardwareDecodeActive) {
        setHardwareVerificationStatus('inactive');
        addToLog('VideoToolbox available but not active - check stream playback');
      } else {
        setHardwareVerificationStatus('failed');
        addToLog('Hardware acceleration verification failed');
      }
    }
  };

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setVerificationLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]); // Keep last 20 entries
  };

  // Performance correlation analysis
  const getPerformanceAnalysis = () => {
    if (!systemMetrics || !gpuMetrics) return null;

    const cpuUsage = systemMetrics.cpuUsage || 0;
    const gpuUtilization = gpuMetrics.utilization || 0;
    const activeStreamCount = Array.from(streams instanceof Map ? streams.values() : [])
      .filter(s => s.status === 'connected').length;

    let analysis = '';
    let status: 'good' | 'warning' | 'error' = 'good';

    if (accelerationMode === 'gpu') {
      if (gpuUtilization > 5 && cpuUsage < 50) {
        analysis = 'GPU acceleration working optimally';
        status = 'good';
      } else if (cpuUsage > 60 && gpuUtilization < 5) {
        analysis = 'High CPU usage suggests software decoding';
        status = 'warning';
      } else if (activeStreamCount > 0) {
        analysis = 'GPU acceleration status unclear';
        status = 'warning';
      }
    } else {
      if (cpuUsage > 40 && gpuUtilization < 10) {
        analysis = 'Software decoding working as expected';
        status = 'good';
      } else if (cpuUsage > 80) {
        analysis = 'Very high CPU usage - consider reducing streams';
        status = 'warning';
      }
    }

    return { analysis, status, cpuUsage, gpuUtilization };
  };

  const performanceAnalysis = getPerformanceAnalysis();

  return (
    <div className="performance-verifier" style={{ display: 'none' }}>
      {/* This component runs in the background for verification */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg max-w-md text-xs z-50">
          <h4 className="font-bold mb-2">Hardware Verification Debug</h4>
          
          <div className="space-y-2">
            <div>
              <strong>Mode:</strong> {accelerationMode.toUpperCase()}
            </div>
            
            {verification && (
              <div>
                <strong>VideoToolbox:</strong> {verification.videoToolboxAvailable ? '✓' : '✗'}<br/>
                <strong>HW Decode:</strong> {verification.hardwareDecodeActive ? '✓' : '✗'}<br/>
                <strong>GPU Active:</strong> {verification.gpuAccelerationActive ? '✓' : '✗'}<br/>
                <strong>Decoder:</strong> {verification.activeDecoderType}
              </div>
            )}
            
            {performanceAnalysis && (
              <div>
                <strong>CPU:</strong> {performanceAnalysis.cpuUsage.toFixed(1)}%<br/>
                <strong>GPU:</strong> {performanceAnalysis.gpuUtilization.toFixed(1)}%<br/>
                <div className={`font-bold ${
                  performanceAnalysis.status === 'good' ? 'text-green-400' : 
                  performanceAnalysis.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {performanceAnalysis.analysis}
                </div>
              </div>
            )}
            
            {verificationLog.length > 0 && (
              <div>
                <strong>Log:</strong>
                <div className="mt-1 text-xs text-gray-300 max-h-20 overflow-y-auto">
                  {verificationLog.slice(0, 3).map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceVerifier;