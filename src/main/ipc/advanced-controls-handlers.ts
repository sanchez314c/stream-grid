import { ipcMain } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { app } from 'electron';
import { 
  RecordingQuality, 
  StreamRecordingState, 
  VFXFilter 
} from '../../shared/types/settings';

interface DetailedRecordingQuality {
  preset?: string;
  crf?: number;
  bitrate: number;
  width: number;
  height: number;
  fps?: number;
  useHardwareAcceleration?: boolean;
}

interface ActiveRecording {
  streamId: string;
  process: ChildProcess;
  outputPath: string;
  startTime: number;
  quality: DetailedRecordingQuality;
  isPaused: boolean;
}

class AdvancedControlsManager {
  private activeRecordings: Map<string, ActiveRecording> = new Map();
  private recordingBaseDir: string = '';

  constructor() {
    this.setupRecordingDirectory();
    this.registerIpcHandlers();
  }

  private getDetailedQuality(quality: RecordingQuality): DetailedRecordingQuality {
    switch (quality) {
      case 'high':
        return {
          preset: 'fast',
          crf: 18,
          bitrate: 8000,
          width: 1920,
          height: 1080,
          fps: 30,
          useHardwareAcceleration: true
        };
      case 'medium':
        return {
          preset: 'medium',
          crf: 23,
          bitrate: 4000,
          width: 1920,
          height: 1080,
          fps: 30,
          useHardwareAcceleration: true
        };
      case 'low':
        return {
          preset: 'fast',
          crf: 28,
          bitrate: 2000,
          width: 1280,
          height: 720,
          fps: 25,
          useHardwareAcceleration: false
        };
      case 'custom':
        return {
          preset: 'medium',
          crf: 23,
          bitrate: 4000,
          width: 1920,
          height: 1080,
          fps: 30,
          useHardwareAcceleration: true
        };
      default:
        return {
          preset: 'medium',
          crf: 23,
          bitrate: 4000,
          width: 1920,
          height: 1080,
          fps: 30,
          useHardwareAcceleration: true
        };
    }
  }

  private async setupRecordingDirectory() {
    this.recordingBaseDir = join(app.getPath('documents'), 'StreamGRID', 'recordings');
    try {
      await fs.mkdir(this.recordingBaseDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create recording directory:', error);
    }
  }

  private registerIpcHandlers() {
    // Recording handlers
    ipcMain.handle('advanced-controls:start-recording', this.handleStartRecording.bind(this));
    ipcMain.handle('advanced-controls:stop-recording', this.handleStopRecording.bind(this));
    ipcMain.handle('advanced-controls:pause-recording', this.handlePauseRecording.bind(this));
    ipcMain.handle('advanced-controls:get-recording-state', this.handleGetRecordingState.bind(this));

    // Randomizer handlers
    ipcMain.handle('advanced-controls:randomize-now', this.handleRandomizeNow.bind(this));
    ipcMain.handle('advanced-controls:randomize-single-tile', this.handleRandomizeSingleTile.bind(this));

    // VFX handlers
    ipcMain.handle('advanced-controls:apply-vfx-filter', this.handleApplyVFXFilter.bind(this));
    ipcMain.handle('advanced-controls:update-vfx-intensity', this.handleUpdateVFXIntensity.bind(this));

    // Storage monitoring
    ipcMain.handle('storage:getInfo', this.handleGetStorageInfo.bind(this));
    ipcMain.handle('storage:openRecordingFolder', this.handleOpenRecordingFolder.bind(this));
    ipcMain.handle('storage:cleanup', this.handleCleanupRecordings.bind(this));

    // Stream control handlers
    ipcMain.handle('advanced-controls:reload-streams', this.handleReloadStreams.bind(this));
    ipcMain.handle('advanced-controls:pause-streams', this.handlePauseStreams.bind(this));
    ipcMain.handle('advanced-controls:stop-streams', this.handleStopStreams.bind(this));
  }

  private async handleStartRecording(
    _event: Electron.IpcMainInvokeEvent,
    streamId: string,
    streamUrl: string,
    quality: RecordingQuality,
    outputPath?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Stop existing recording if any
      if (this.activeRecordings.has(streamId)) {
        await this.handleStopRecording(_event, streamId);
      }

      // Generate output filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `stream-${streamId}-${timestamp}.mp4`;
      const fullOutputPath = outputPath ? join(outputPath, filename) : join(this.recordingBaseDir, filename);

      // Ensure output directory exists
      await fs.mkdir(dirname(fullOutputPath), { recursive: true });

      // Build FFmpeg command
      const detailedQuality = this.getDetailedQuality(quality);
      const ffmpegArgs = this.buildFFmpegArgs(streamUrl, fullOutputPath, detailedQuality);

      // Start FFmpeg process
      const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
      
      const recording: ActiveRecording = {
        streamId,
        process: ffmpegProcess,
        outputPath: fullOutputPath,
        startTime: Date.now(),
        quality: detailedQuality,
        isPaused: false
      };

      this.activeRecordings.set(streamId, recording);

      // Handle process events
      ffmpegProcess.stdout?.on('data', (data) => {
        // Parse FFmpeg output for progress information
        this.parseFFmpegOutput(streamId, data.toString());
      });

      ffmpegProcess.stderr?.on('data', (data) => {
        // FFmpeg writes progress to stderr
        this.parseFFmpegOutput(streamId, data.toString());
      });

      ffmpegProcess.on('close', (code) => {
        this.activeRecordings.delete(streamId);
        _event.sender.send('recording:finished', streamId, code === 0);
      });

      ffmpegProcess.on('error', (error) => {
        console.error(`FFmpeg error for stream ${streamId}:`, error);
        this.activeRecordings.delete(streamId);
        _event.sender.send('recording:error', streamId, error.message);
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to start recording:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  private buildFFmpegArgs(inputUrl: string, outputPath: string, quality: DetailedRecordingQuality): string[] {
    const args = [
      '-i', inputUrl,
      '-c:v', 'libx264',
      '-preset', quality.preset || 'medium',
      '-crf', quality.crf?.toString() || '23',
      '-maxrate', `${quality.bitrate}k`,
      '-bufsize', `${quality.bitrate * 2}k`,
      '-s', `${quality.width}x${quality.height}`,
      '-r', quality.fps?.toString() || '30',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-f', 'mp4',
      '-movflags', '+faststart',
      '-avoid_negative_ts', 'make_zero',
      outputPath
    ];

    // Add hardware acceleration if requested
    if (quality.useHardwareAcceleration) {
      args.unshift('-hwaccel', 'auto');
      // Try to use hardware encoder
      const hwEncoders = ['h264_videotoolbox', 'h264_nvenc', 'h264_qsv'];
      for (const encoder of hwEncoders) {
        try {
          args[args.indexOf('-c:v') + 1] = encoder;
          break;
        } catch {
          continue;
        }
      }
    }

    return args;
  }

  private parseFFmpegOutput(streamId: string, output: string) {
    // Parse FFmpeg output for progress, file size, etc.
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('size=')) {
        const sizeMatch = line.match(/size=\s*(\d+)kB/);
        if (sizeMatch) {
          const sizeKB = parseInt(sizeMatch[1]);
          // Send progress update to renderer
          this.activeRecordings.get(streamId)?.process.emit('progress', {
            streamId,
            currentFileSize: sizeKB * 1024
          });
        }
      }
    }
  }

  private async handleStopRecording(
    _event: Electron.IpcMainInvokeEvent,
    streamId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const recording = this.activeRecordings.get(streamId);
      if (!recording) {
        return { success: false, error: 'No active recording found' };
      }

      // Send SIGTERM to FFmpeg process
      recording.process.kill('SIGTERM');
      
      // Wait for process to close gracefully
      await new Promise<void>((resolve) => {
        recording.process.on('close', () => resolve());
        // Force kill after 5 seconds if not closed
        setTimeout(() => {
          if (!recording.process.killed) {
            recording.process.kill('SIGKILL');
            resolve();
          }
        }, 5000);
      });

      this.activeRecordings.delete(streamId);
      return { success: true };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  private async handlePauseRecording(
    _event: Electron.IpcMainInvokeEvent,
    streamId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const recording = this.activeRecordings.get(streamId);
      if (!recording) {
        return { success: false, error: 'No active recording found' };
      }

      if (recording.isPaused) {
        // Resume recording (SIGCONT)
        recording.process.kill('SIGCONT');
        recording.isPaused = false;
      } else {
        // Pause recording (SIGSTOP)
        recording.process.kill('SIGSTOP');
        recording.isPaused = true;
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to pause/resume recording:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  private async handleGetRecordingState(
    _event: Electron.IpcMainInvokeEvent,
    streamId: string
  ): Promise<StreamRecordingState | null> {
    const recording = this.activeRecordings.get(streamId);
    if (!recording) {
      return null;
    }

    return {
      isRecording: true,
      startTime: new Date(recording.startTime),
      outputFile: recording.outputPath,
      processId: streamId,
      duration: Date.now() - recording.startTime,
      fileSize: 0, // This would be updated from FFmpeg output parsing
      status: recording.isPaused ? 'error' : 'recording', // Paused state maps to error for now
      errorMessage: recording.isPaused ? 'Recording paused' : undefined
    };
  }

  private async handleRandomizeNow(
    _event: Electron.IpcMainInvokeEvent
  ): Promise<void> {
    // Send randomize command to renderer
    _event.sender.send('advanced-controls:execute-randomize');
  }

  private async handleRandomizeSingleTile(
    _event: Electron.IpcMainInvokeEvent
  ): Promise<void> {
    // Send single tile randomize command to renderer
    _event.sender.send('advanced-controls:execute-randomize-single');
  }

  private async handleApplyVFXFilter(
    _event: Electron.IpcMainInvokeEvent,
    streamId: string,
    filters: VFXFilter[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // VFX filters are applied on the renderer side using CSS
      // This handler could be used for more complex video processing if needed
      _event.sender.send('advanced-controls:vfx-applied', streamId, filters);
      return { success: true };
    } catch (error) {
      console.error('Failed to apply VFX filter:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  private async handleUpdateVFXIntensity(
    _event: Electron.IpcMainInvokeEvent,
    streamId: string,
    filterIndex: number,
    intensity: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      _event.sender.send('advanced-controls:vfx-intensity-updated', streamId, filterIndex, intensity);
      return { success: true };
    } catch (error) {
      console.error('Failed to update VFX intensity:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  private async handleGetStorageInfo(
    _event: Electron.IpcMainInvokeEvent,
    path: string
  ): Promise<any> {
    try {
      // For now, return dummy data since statvfs is not available in Node.js fs promises
      // In a real implementation, we'd use a different approach or native module
      const stats = await fs.stat(path);
      // Note: stats is available for potential future use
      void stats; // Silence unused variable warning
      
      return {
        totalSpace: 1000000000, // 1GB dummy data
        freeSpace: 500000000,   // 500MB dummy free space
        usedSpace: 500000000,   // 500MB dummy used space
        recordingPath: path,
        isMonitoring: true
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        totalSpace: 0,
        freeSpace: 0,
        usedSpace: 0,
        recordingPath: path,
        isMonitoring: false
      };
    }
  }

  private async handleOpenRecordingFolder(
    _event: Electron.IpcMainInvokeEvent,
    path: string
  ): Promise<void> {
    const { shell } = require('electron');
    await shell.openPath(path);
  }

  private async handleCleanupRecordings(
    _event: Electron.IpcMainInvokeEvent,
    path: string
  ): Promise<void> {
    // Implement cleanup logic - remove old recordings based on settings
    console.log('Cleanup recordings in:', path);
    // This could delete files older than X days, or when total size exceeds threshold
  }

  private async handleReloadStreams(_event: Electron.IpcMainInvokeEvent): Promise<void> {
    _event.sender.send('advanced-controls:execute-reload-streams');
  }

  private async handlePauseStreams(_event: Electron.IpcMainInvokeEvent): Promise<void> {
    _event.sender.send('advanced-controls:execute-pause-streams');
  }

  private async handleStopStreams(_event: Electron.IpcMainInvokeEvent): Promise<void> {
    _event.sender.send('advanced-controls:execute-stop-streams');
  }
}

// Initialize the manager
export const advancedControlsManager = new AdvancedControlsManager();