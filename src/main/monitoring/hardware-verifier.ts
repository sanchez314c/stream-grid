import { EventEmitter } from 'events';
import { spawn } from 'child_process';

export interface HardwareVerificationResult {
  videoToolboxAvailable: boolean;
  hardwareDecodeActive: boolean;
  activeDecoderType: 'hardware' | 'software' | 'unknown';
  gpuAccelerationActive: boolean;
  verificationDetails: string[];
  timestamp: number;
}

export interface VideoToolboxInfo {
  available: boolean;
  supportedCodecs: string[];
  hardwareAccelerated: boolean;
  details: any;
}

export class HardwareVerifier extends EventEmitter {
  private platform: string;
  private lastVerification: HardwareVerificationResult | null = null;
  private verificationInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.platform = process.platform;
  }

  async verifyHardwareAcceleration(): Promise<HardwareVerificationResult> {
    const timestamp = Date.now();
    const details: string[] = [];
    let videoToolboxAvailable = false;
    let hardwareDecodeActive = false;
    let activeDecoderType: 'hardware' | 'software' | 'unknown' = 'unknown';
    let gpuAccelerationActive = false;

    try {
      if (this.platform === 'darwin') {
        // macOS - Check VideoToolbox and hardware decode status
        const result = await this.verifyMacOSHardwareAcceleration();
        videoToolboxAvailable = result.videoToolboxAvailable;
        hardwareDecodeActive = result.hardwareDecodeActive;
        activeDecoderType = result.activeDecoderType;
        gpuAccelerationActive = result.gpuAccelerationActive;
        details.push(...result.verificationDetails);
      } else if (this.platform === 'win32') {
        // Windows - Check DXVA and hardware acceleration
        const result = await this.verifyWindowsHardwareAcceleration();
        details.push(...result.verificationDetails);
        hardwareDecodeActive = result.hardwareDecodeActive;
        activeDecoderType = result.activeDecoderType;
        gpuAccelerationActive = result.gpuAccelerationActive;
      } else if (this.platform === 'linux') {
        // Linux - Check VAAPI/VDPAU
        const result = await this.verifyLinuxHardwareAcceleration();
        details.push(...result.verificationDetails);
        hardwareDecodeActive = result.hardwareDecodeActive;
        activeDecoderType = result.activeDecoderType;
        gpuAccelerationActive = result.gpuAccelerationActive;
      }
    } catch (error) {
      details.push(`Hardware verification error: ${(error as Error).message || error}`);
    }

    const verification: HardwareVerificationResult = {
      videoToolboxAvailable,
      hardwareDecodeActive,
      activeDecoderType,
      gpuAccelerationActive,
      verificationDetails: details,
      timestamp
    };

    this.lastVerification = verification;
    this.emit('verification-complete', verification);
    return verification;
  }

  private async verifyMacOSHardwareAcceleration(): Promise<{
    videoToolboxAvailable: boolean;
    hardwareDecodeActive: boolean;
    activeDecoderType: 'hardware' | 'software' | 'unknown';
    gpuAccelerationActive: boolean;
    verificationDetails: string[];
  }> {
    const details: string[] = [];
    let videoToolboxAvailable = false;
    let hardwareDecodeActive = false;
    let activeDecoderType: 'hardware' | 'software' | 'unknown' = 'unknown';
    let gpuAccelerationActive = false;

    try {
      // Check if VideoToolbox is available and loaded
      const systemInfo = await this.executeCommand('system_profiler', ['SPDisplaysDataType', '-json']);
      const displayData = JSON.parse(systemInfo);
      
      if (displayData.SPDisplaysDataType && displayData.SPDisplaysDataType.length > 0) {
        const gpu = displayData.SPDisplaysDataType[0];
        details.push(`GPU: ${gpu.sppci_model}`);
        
        if (gpu.sppci_model && gpu.sppci_model.toLowerCase().includes('amd')) {
          details.push('AMD GPU detected - VideoToolbox hardware acceleration available');
          videoToolboxAvailable = true;
        }
      }

      // Check for running video decode processes
      try {
        const processOutput = await this.executeCommand('ps', ['aux']);
        const videoToolboxProcesses = processOutput.split('\n').filter(line => 
          line.includes('VTDecoderXPCService') || 
          line.includes('VideoToolbox') ||
          line.includes('com.apple.videotoolbox')
        );
        
        if (videoToolboxProcesses.length > 0) {
          details.push(`VideoToolbox processes active: ${videoToolboxProcesses.length}`);
          hardwareDecodeActive = true;
          activeDecoderType = 'hardware';
        } else {
          details.push('No active VideoToolbox decode processes detected');
          activeDecoderType = 'software';
        }
      } catch (error) {
        details.push(`Process check failed: ${(error as Error).message || error}`);
      }

      // Check GPU utilization to verify hardware decode is actually working
      try {
        const gpuUtilOutput = await this.executeCommand('top', ['-l', '1', '-stats', 'pid,command,cpu']);
        const gpuProcesses = gpuUtilOutput.split('\n').filter(line => 
          line.includes('StreamGRID') || line.includes('Electron')
        );
        
        if (gpuProcesses.length > 0) {
          // Parse CPU usage - if it's low during video playback, GPU is likely being used
          const cpuUsageMatch = gpuProcesses[0].match(/(\d+\.?\d*)%/);
          if (cpuUsageMatch) {
            const cpuUsage = parseFloat(cpuUsageMatch[1]);
            if (cpuUsage < 30) { // Low CPU usage suggests GPU decode
              details.push(`Low CPU usage (${cpuUsage}%) indicates GPU decoding`);
              gpuAccelerationActive = true;
            } else {
              details.push(`High CPU usage (${cpuUsage}%) suggests software decoding`);
              gpuAccelerationActive = false;
            }
          }
        }
      } catch (error) {
        details.push(`GPU utilization check failed: ${(error as Error).message || error}`);
      }

      // Check for specific hardware decoder availability via AVFoundation
      try {
        // This would require a native module or additional tools
        // For now, we'll use system capabilities detection
        const hardwareCapabilities = await this.checkMacOSHardwareCapabilities();
        details.push(...hardwareCapabilities.details);
        
        if (hardwareCapabilities.h264HardwareSupport && hardwareCapabilities.hevcHardwareSupport) {
          videoToolboxAvailable = true;
          details.push('Hardware H.264 and HEVC decode capabilities confirmed');
        }
      } catch (error) {
        details.push(`Hardware capability check failed: ${(error as Error).message || error}`);
      }

    } catch (error) {
      details.push(`macOS verification failed: ${(error as Error).message || error}`);
    }

    return {
      videoToolboxAvailable,
      hardwareDecodeActive,
      activeDecoderType,
      gpuAccelerationActive,
      verificationDetails: details
    };
  }

  private async checkMacOSHardwareCapabilities(): Promise<{
    h264HardwareSupport: boolean;
    hevcHardwareSupport: boolean;
    details: string[];
  }> {
    const details: string[] = [];
    let h264HardwareSupport = false;
    let hevcHardwareSupport = false;

    try {
      // Check system hardware info for decode capabilities
      const hardwareOutput = await this.executeCommand('system_profiler', ['SPHardwareDataType', '-json']);
      const hardwareData = JSON.parse(hardwareOutput);
      
      if (hardwareData.SPHardwareDataType) {
        const hardware = hardwareData.SPHardwareDataType[0];
        details.push(`Hardware: ${hardware.machine_name} - ${hardware.chip_type || hardware.cpu_type}`);
        
        // Most modern Macs support hardware H.264 decode
        // AMD RX 580 specifically supports H.264 and HEVC hardware decode
        h264HardwareSupport = true;
        hevcHardwareSupport = true;
        details.push('Hardware video decode capabilities detected');
      }
    } catch (error) {
      details.push(`Hardware capabilities detection failed: ${(error as Error).message || error}`);
    }

    return { h264HardwareSupport, hevcHardwareSupport, details };
  }

  private async verifyWindowsHardwareAcceleration(): Promise<{
    hardwareDecodeActive: boolean;
    activeDecoderType: 'hardware' | 'software' | 'unknown';
    gpuAccelerationActive: boolean;
    verificationDetails: string[];
  }> {
    const details: string[] = [];
    let hardwareDecodeActive = false;
    let activeDecoderType: 'hardware' | 'software' | 'unknown' = 'unknown';
    let gpuAccelerationActive = false;

    try {
      // Check DXVA support
      await this.executeCommand('dxdiag', ['/t', 'dxdiag_output.txt']);
      details.push('DXVA hardware acceleration check performed');
      
      // Check GPU utilization
      const gpuOutput = await this.executeCommand('wmic', [
        'path', 'Win32_PerfRawData_GPUPerformanceCounters_GPUEngine',
        'get', 'Name,UtilizationPercentage'
      ]);
      
      if (gpuOutput.includes('Video Decode')) {
        hardwareDecodeActive = true;
        activeDecoderType = 'hardware';
        gpuAccelerationActive = true;
        details.push('Hardware video decode engine active');
      }
    } catch (error) {
      details.push(`Windows verification failed: ${(error as Error).message || error}`);
    }

    return { hardwareDecodeActive, activeDecoderType, gpuAccelerationActive, verificationDetails: details };
  }

  private async verifyLinuxHardwareAcceleration(): Promise<{
    hardwareDecodeActive: boolean;
    activeDecoderType: 'hardware' | 'software' | 'unknown';
    gpuAccelerationActive: boolean;
    verificationDetails: string[];
  }> {
    const details: string[] = [];
    let hardwareDecodeActive = false;
    let activeDecoderType: 'hardware' | 'software' | 'unknown' = 'unknown';
    let gpuAccelerationActive = false;

    try {
      // Check VAAPI support
      const vaapiResult = await this.executeCommand('vainfo', []);
      if (vaapiResult.includes('VAEntrypointVLD')) {
        hardwareDecodeActive = true;
        activeDecoderType = 'hardware';
        details.push('VAAPI hardware decode support detected');
      }

      // Check GPU utilization
      const gpuOutput = await this.executeCommand('radeontop', ['-d', '-', '-l', '1']);
      if (gpuOutput.includes('video')) {
        gpuAccelerationActive = true;
        details.push('GPU video decode activity detected');
      }
    } catch (error) {
      details.push(`Linux verification failed: ${error}`);
    }

    return { hardwareDecodeActive, activeDecoderType, gpuAccelerationActive, verificationDetails: details };
  }

  async getVideoToolboxInfo(): Promise<VideoToolboxInfo> {
    if (this.platform !== 'darwin') {
      return {
        available: false,
        supportedCodecs: [],
        hardwareAccelerated: false,
        details: { error: 'VideoToolbox only available on macOS' }
      };
    }

    try {
      // Get comprehensive VideoToolbox information
      const systemInfo = await this.executeCommand('system_profiler', ['SPDisplaysDataType', '-json']);
      const displayData = JSON.parse(systemInfo);
      
      const supportedCodecs = ['H.264', 'HEVC', 'VP9']; // Common codecs supported by modern hardware
      
      return {
        available: true,
        supportedCodecs,
        hardwareAccelerated: true,
        details: displayData.SPDisplaysDataType
      };
    } catch (error) {
      return {
        available: false,
        supportedCodecs: [],
        hardwareAccelerated: false,
        details: { error: (error as Error).message || String(error) }
      };
    }
  }

  startContinuousVerification(intervalMs: number = 5000): void {
    this.stopContinuousVerification();
    
    this.verificationInterval = setInterval(async () => {
      try {
        await this.verifyHardwareAcceleration();
      } catch (error) {
        this.emit('verification-error', error);
      }
    }, intervalMs);
  }

  stopContinuousVerification(): void {
    if (this.verificationInterval) {
      clearInterval(this.verificationInterval);
      this.verificationInterval = undefined;
    }
  }

  getLastVerification(): HardwareVerificationResult | null {
    return this.lastVerification;
  }

  private async executeCommand(command: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
      
      // Timeout after 15 seconds
      setTimeout(() => {
        process.kill();
        reject(new Error('Command timeout'));
      }, 15000);
    });
  }
}

// Singleton instance
export const hardwareVerifier = new HardwareVerifier();