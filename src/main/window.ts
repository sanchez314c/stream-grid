import { BrowserWindow, screen, Menu, app } from 'electron';
import path from 'path';
import { AppSettings } from '../shared/types/settings';

export async function createMainWindow(settings: AppSettings): Promise<BrowserWindow> {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  const mainWindow = new BrowserWindow({
    width: Math.min(1600, width * 0.9),
    height: Math.min(900, height * 0.9),
    minWidth: 800,
    minHeight: 600,
    center: true,
    frame: settings.display.windowMode !== 'frameless',
    titleBarStyle: settings.display.windowMode === 'frameless' ? 'hidden' : 'default',
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      sandbox: true
    }
  });
  
  if (settings.display.alwaysOnTop) {
    mainWindow.setAlwaysOnTop(true);
  }
  
  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // From dist/main/ we need to go to dist/renderer/index.html
    const htmlPath = path.join(__dirname, '../renderer/index.html');
    mainWindow.loadFile(htmlPath);
    // DevTools closed in production - only accessible via menu (Cmd+Shift+I)
  }
  
  mainWindow.on('close', (event) => {
    if (settings.general.minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
  
  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('window:fullscreen', true);
  });
  
  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('window:fullscreen', false);
  });
  
  // Set up context menu for input fields
  mainWindow.webContents.on('context-menu', (_event, params) => {
    const { isEditable } = params;
    
    if (isEditable) {
      const contextMenu = Menu.buildFromTemplate([
        { role: 'undo', enabled: params.editFlags.canUndo },
        { role: 'redo', enabled: params.editFlags.canRedo },
        { type: 'separator' },
        { role: 'cut', enabled: params.editFlags.canCut },
        { role: 'copy', enabled: params.editFlags.canCopy },
        { role: 'paste', enabled: params.editFlags.canPaste },
        { type: 'separator' },
        { role: 'selectAll', enabled: params.editFlags.canSelectAll }
      ]);
      contextMenu.popup();
    }
  });
  
  createApplicationMenu(mainWindow, settings);
  
  return mainWindow;
}

function createApplicationMenu(window: BrowserWindow, settings: AppSettings) {
  const template: any = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'Add Stream',
          accelerator: 'CmdOrCtrl+N',
          click: () => window.webContents.send('menu:add-stream')
        },
        {
          label: 'Import Layout',
          accelerator: 'CmdOrCtrl+O',
          click: () => window.webContents.send('menu:import-layout')
        },
        {
          label: 'Export Layout',
          accelerator: 'CmdOrCtrl+S',
          click: () => window.webContents.send('menu:export-layout')
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => window.webContents.send('menu:settings')
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Fullscreen',
          accelerator: 'F11',
          click: () => window.setFullScreen(!window.isFullScreen())
        },
        {
          label: 'Toggle Frameless',
          accelerator: 'CmdOrCtrl+F',
          click: () => window.webContents.send('menu:toggle-frameless')
        },
        { type: 'separator' },
        {
          label: 'Show Statistics',
          type: 'checkbox',
          checked: settings.display.showStatistics,
          click: () => window.webContents.send('menu:toggle-statistics')
        },
        {
          label: 'Show Labels',
          type: 'checkbox',
          checked: settings.display.showLabels,
          click: () => window.webContents.send('menu:toggle-labels')
        },
        { type: 'separator' },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => window.reload()
        },
        {
          label: 'Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => window.webContents.toggleDevTools()
        }
      ]
    },
    {
      label: 'Layout',
      submenu: [
        {
          label: '1x1',
          accelerator: '1',
          click: () => window.webContents.send('menu:layout', '1x1')
        },
        {
          label: '2x1',
          accelerator: '2',
          click: () => window.webContents.send('menu:layout', '2x1')
        },
        {
          label: '3x1',
          accelerator: '3',
          click: () => window.webContents.send('menu:layout', '3x1')
        },
        {
          label: '2x2',
          accelerator: '4',
          click: () => window.webContents.send('menu:layout', '2x2')
        },
        {
          label: '3x3',
          accelerator: '9',
          click: () => window.webContents.send('menu:layout', '3x3')
        },
        {
          label: '4x4',
          accelerator: '0',
          click: () => window.webContents.send('menu:layout', '4x4')
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}