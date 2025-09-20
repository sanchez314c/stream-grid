import { app, BrowserWindow } from 'electron';
import { setupDatabase } from './database/database';
import { setupIpcHandlers } from './ipc/handlers';
import { createMainWindow } from './window';
import { initializeLogger } from './logger';
import { loadSettings, saveSettings } from './settings';

// Enable hardware acceleration for video decoding
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-hardware-overlays', 'single-fullscreen');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,VaapiVideoEncoder,CanvasOopRasterization');
app.commandLine.appendSwitch('disable-features', 'UseChromeOSDirectVideoDecoder');
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('enable-accelerated-mjpeg-decode');
app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');
app.commandLine.appendSwitch('num-raster-threads', '4');

// macOS Metal specific optimizations for AMD Radeon
if (process.platform === 'darwin') {
  app.commandLine.appendSwitch('use-angle', 'metal');
  app.commandLine.appendSwitch('enable-features', 'Metal,MetalShaderCache,VaapiVideoDecoder,UseChromeOSDirectVideoDecoder');
  app.commandLine.appendSwitch('use-metal', '1');
  app.commandLine.appendSwitch('enable-accelerated-video-decode');
  app.commandLine.appendSwitch('enable-gpu-memory-buffer-video-frames');
  app.commandLine.appendSwitch('enable-zero-copy-video-rendering');
  
  // FORCE AMD Radeon RX 580 hardware acceleration
  app.commandLine.appendSwitch('enable-accelerated-mjpeg-decode');
  app.commandLine.appendSwitch('enable-accelerated-vpx-decode');
  app.commandLine.appendSwitch('enable-hardware-overlays');
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('force-gpu-mem-available-mb', '8192'); // RX 580 has 8GB VRAM
  app.commandLine.appendSwitch('max-gles-version', '3');
  app.commandLine.appendSwitch('use-gl', 'angle');
  
  // CRITICAL: MediaSource and MSE optimizations
  app.commandLine.appendSwitch('enable-features', 'MediaSource,MediaSourceExperimental,MSEBufferByteStreamSplitting');
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
}

let mainWindow: BrowserWindow | null = null;

async function initializeApp() {
  initializeLogger();
  
  const settings = await loadSettings();
  
  await setupDatabase();
  
  setupIpcHandlers();
  
  mainWindow = await createMainWindow(settings);
  
  if (settings.general.checkUpdates) {
    // Check for updates implementation would go here
  }
}

app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initializeApp();
  }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.on('before-quit', async () => {
  await saveSettings();
  
  if (mainWindow) {
    mainWindow.removeAllListeners();
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});