import { ipcMain } from 'electron';
import { Stream, ValidationResult } from '../../shared/types/stream';
import { Layout } from '../../shared/types/layout';
import * as db from '../database/database';
import { validateStreamUrl } from './stream-validator';
import { getSettings, updateSettings } from '../settings';
import { discoveryService } from '../discovery/discovery-service';
import { DiscoveryOptions } from '../../shared/types/discovery';
import { v4 as uuidv4 } from 'uuid';
import { bandwidthMonitor } from '../monitoring/bandwidth-monitor';
import { gpuMonitor } from '../monitoring/gpu-monitor';
import { hardwareVerifier } from '../monitoring/hardware-verifier';
import { advancedControlsManager } from './advanced-controls-handlers';

// Initialize Advanced Controls handlers - this import statement automatically
// registers all the Advanced Controls IPC handlers when the module is loaded
void advancedControlsManager;

export function setupIpcHandlers() {
  // Stream handlers
  ipcMain.handle('stream:add', async (_event, url: string, label: string): Promise<Stream> => {
    const validation = await validateStreamUrl(url);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    return await db.addStream(url, label);
  });
  
  ipcMain.handle('stream:update', async (_event, streamId: string, updates: Partial<Stream>): Promise<void> => {
    await db.updateStream(streamId, updates);
  });
  
  ipcMain.handle('stream:delete', async (_event, streamId: string): Promise<void> => {
    await db.deleteStream(streamId);
  });
  
  ipcMain.handle('stream:getAll', async (): Promise<Stream[]> => {
    return await db.getAllStreams();
  });
  
  ipcMain.handle('stream:get', async (_event, streamId: string): Promise<Stream | null> => {
    return await db.getStream(streamId);
  });
  
  ipcMain.handle('stream:save', async (_event, stream: Stream): Promise<void> => {
    await db.saveStream(stream);
  });
  
  ipcMain.handle('stream:validate', async (_event, url: string): Promise<ValidationResult> => {
    return await validateStreamUrl(url);
  });
  
  // Layout handlers
  ipcMain.handle('layout:create', async (_event, name: string, grid: any): Promise<Layout> => {
    return await db.addLayout(name, grid);
  });
  
  ipcMain.handle('layout:update', async (_event, layoutId: string, updates: Partial<Layout>): Promise<void> => {
    await db.updateLayout(layoutId, updates);
  });
  
  ipcMain.handle('layout:delete', async (_event, layoutId: string): Promise<void> => {
    await db.deleteLayout(layoutId);
  });
  
  ipcMain.handle('layout:getAll', async (): Promise<Layout[]> => {
    return await db.getAllLayouts();
  });
  
  ipcMain.handle('layout:setActive', async (_event, layoutId: string): Promise<void> => {
    await db.setActiveLayout(layoutId);
  });
  
  // Settings handlers
  ipcMain.handle('settings:get', async () => {
    return await getSettings();
  });
  
  ipcMain.handle('settings:update', async (_event, path: string, value: any) => {
    await updateSettings(path, value);
  });
  
  // System info handlers
  ipcMain.handle('system:getInfo', async () => {
    const cpuUsage = process.cpuUsage();
    const memoryUsage = process.memoryUsage();
    
    return {
      cpuUsage: cpuUsage.user / 1000000, // Convert to seconds
      memoryUsage: memoryUsage.heapUsed / 1024 / 1024, // Convert to MB
      platform: process.platform,
      version: process.versions.electron
    };
  });

  // Performance monitoring handlers
  ipcMain.handle('monitoring:startBandwidth', async () => {
    await bandwidthMonitor.startMonitoring();
    return 'Bandwidth monitoring started';
  });

  ipcMain.handle('monitoring:stopBandwidth', async () => {
    bandwidthMonitor.stopMonitoring();
    return 'Bandwidth monitoring stopped';
  });

  ipcMain.handle('monitoring:getBandwidthMetrics', async () => {
    return await bandwidthMonitor.getCurrentMetrics();
  });

  ipcMain.handle('monitoring:startGPU', async () => {
    await gpuMonitor.startMonitoring();
    return 'GPU monitoring started';
  });

  ipcMain.handle('monitoring:stopGPU', async () => {
    gpuMonitor.stopMonitoring();
    return 'GPU monitoring stopped';
  });

  ipcMain.handle('monitoring:getGPUInfo', async () => {
    return gpuMonitor.getGPUInfo();
  });

  // Hardware verification handlers
  ipcMain.handle('hardware:verify', async () => {
    return hardwareVerifier.verifyHardwareAcceleration();
  });

  ipcMain.handle('hardware:getVerification', async () => {
    return hardwareVerifier.getLastVerification();
  });

  ipcMain.handle('hardware:getVideoToolboxInfo', async () => {
    return hardwareVerifier.getVideoToolboxInfo();
  });

  ipcMain.handle('hardware:startContinuousVerification', async (_event, intervalMs?: number) => {
    hardwareVerifier.startContinuousVerification(intervalMs || 5000);
    return 'Hardware verification monitoring started';
  });

  ipcMain.handle('hardware:stopContinuousVerification', async () => {
    hardwareVerifier.stopContinuousVerification();
    return 'Hardware verification monitoring stopped';
  });

  // GPU performance verification
  ipcMain.handle('monitoring:getHardwareVerification', async () => {
    return gpuMonitor.getHardwareVerification();
  });

  ipcMain.handle('monitoring:performHardwareVerification', async () => {
    return gpuMonitor.performHardwareVerification();
  });

  // Forward monitoring events to renderer
  bandwidthMonitor.on('metrics', (metrics) => {
    const webContents = require('electron').webContents.getAllWebContents();
    webContents.forEach((wc: any) => {
      if (!wc.isDestroyed()) {
        wc.send('monitoring:bandwidth', metrics);
      }
    });
  });

  gpuMonitor.on('metrics', (metrics) => {
    const webContents = require('electron').webContents.getAllWebContents();
    webContents.forEach((wc: any) => {
      if (!wc.isDestroyed()) {
        wc.send('monitoring:gpu', metrics);
      }
    });
  });

  // Forward hardware verification events to renderer
  hardwareVerifier.on('verification-complete', (verification) => {
    const webContents = require('electron').webContents.getAllWebContents();
    webContents.forEach((wc: any) => {
      if (!wc.isDestroyed()) {
        wc.send('hardware:verification-complete', verification);
      }
    });
  });

  hardwareVerifier.on('verification-error', (error) => {
    const webContents = require('electron').webContents.getAllWebContents();
    webContents.forEach((wc: any) => {
      if (!wc.isDestroyed()) {
        wc.send('hardware:verification-error', error);
      }
    });
  });

  // Discovery handlers
  ipcMain.handle('discovery:start', async (_event, options?: Partial<DiscoveryOptions>): Promise<string> => {
    const sessionId = uuidv4();
    await discoveryService.startDiscovery(sessionId, options);
    return sessionId;
  });

  ipcMain.handle('discovery:stop', async (_event, sessionId: string): Promise<void> => {
    await discoveryService.stopDiscovery(sessionId);
  });

  ipcMain.handle('discovery:getProgress', async (_event, sessionId: string) => {
    return discoveryService.getProgress(sessionId);
  });

  ipcMain.handle('discovery:getResults', async (_event, sessionId: string) => {
    return discoveryService.getResults(sessionId);
  });

  // Forward discovery events to renderer
  discoveryService.on('discovery:progress', (sessionId, progress) => {
    // Send to all windows - in a real app you might want to track which window started the discovery
    const webContents = require('electron').webContents.getAllWebContents();
    webContents.forEach((wc: any) => {
      if (!wc.isDestroyed()) {
        wc.send('discovery:progress', sessionId, progress);
      }
    });
  });

  discoveryService.on('discovery:completed', (sessionId, result) => {
    const webContents = require('electron').webContents.getAllWebContents();
    webContents.forEach((wc: any) => {
      if (!wc.isDestroyed()) {
        wc.send('discovery:completed', sessionId, result);
      }
    });
  });

  discoveryService.on('discovery:error', (sessionId, error) => {
    const webContents = require('electron').webContents.getAllWebContents();
    webContents.forEach((wc: any) => {
      if (!wc.isDestroyed()) {
        wc.send('discovery:error', sessionId, error);
      }
    });
  });
}