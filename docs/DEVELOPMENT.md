# StreamGRID Development Guide

## Overview

This guide covers setting up a development environment, understanding the codebase architecture, and contributing to StreamGRID development.

## Development Environment Setup

### Prerequisites

#### System Requirements
- **Node.js**: Version 20.x or higher
- **npm**: Version 9.x or higher  
- **Git**: Latest stable version
- **IDE**: VS Code (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - Auto Rename Tag
  - Bracket Pair Colorizer

#### Platform-Specific Requirements

**macOS:**
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required packages
brew install node git
```

**Windows:**
```batch
# Install Chocolatey (if not already installed)
powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"

# Install required packages
choco install nodejs git vscode
```

**Linux (Ubuntu/Debian):**
```bash
# Update package list
sudo apt update

# Install required packages
sudo apt install -y nodejs npm git build-essential

# Install VS Code (optional)
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install -y code
```

### Repository Setup

#### Clone and Install
```bash
# Clone the repository
git clone https://github.com/spacewelder314/streamgrid.git
cd streamgrid

# Install dependencies
npm install

# Rebuild native dependencies (required for sqlite3)
npm run rebuild
```

#### Environment Configuration
```bash
# Create environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**.env Configuration:**
```bash
# Development settings
NODE_ENV=development
DEBUG=streamgrid:*

# Build settings
VITE_PORT=5173
ELECTRON_IS_DEV=true

# Optional: Custom paths
STREAMGRID_CONFIG_DIR=./dev-config
STREAMGRID_LOG_LEVEL=debug
```

## Project Structure

### Directory Layout
```
streamgrid/
├── src/                    # Source code
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Application entry point
│   │   ├── window.ts      # Window management
│   │   ├── settings.ts    # Settings persistence
│   │   ├── logger.ts      # Logging configuration
│   │   ├── database/      # SQLite operations
│   │   ├── discovery/     # Network discovery
│   │   ├── ipc/          # IPC handlers
│   │   └── monitoring/   # Performance monitoring
│   ├── renderer/          # React frontend
│   │   ├── App.tsx       # Root component
│   │   ├── components/    # UI components
│   │   ├── store/        # State management
│   │   ├── styles/       # CSS/Tailwind
│   │   └── main.tsx      # React entry
│   ├── preload/           # Preload scripts
│   │   └── index.ts      # Context bridge
│   └── shared/           # Shared types
│       └── types/         # TypeScript definitions
├── tests/                # Test files
├── docs/                 # Documentation
├── scripts/              # Build scripts
├── build/                # Build configuration
└── dist/                 # Build output
```

### Key Files Overview

#### Main Process Files
- **`src/main/index.ts`**: Application lifecycle, GPU acceleration setup
- **`src/main/window.ts`**: BrowserWindow creation and management
- **`src/main/database/database.ts`**: SQLite operations and migrations
- **`src/main/ipc/handlers.ts`**: Core IPC communication handlers
- **`src/main/settings.ts`**: Electron Store configuration management

#### Renderer Process Files
- **`src/renderer/App.tsx`**: React root with query client and modals
- **`src/renderer/components/StreamGrid.tsx`**: Main grid layout component
- **`src/renderer/components/StreamTile.tsx`**: Individual stream display
- **`src/renderer/store/index.ts`**: Zustand state management

#### Shared Files
- **`src/shared/types/stream.ts`**: Stream interfaces and validation
- **`src/shared/types/settings.ts`**: Application settings types
- **`src/shared/types/ipc.ts`**: IPC channel definitions

## Development Workflow

### Running the Application

#### Development Mode
```bash
# Start development server with hot reload
npm run dev

# Or start components separately
npm run dev:vite    # Start Vite dev server only
npm run electron     # Start Electron only
```

#### Build and Run
```bash
# Build application
npm run build

# Run built application
npm start
```

### Code Quality Tools

#### Type Checking
```bash
# TypeScript type checking
npm run type-check

# Watch mode for type checking
npm run type-check:watch
```

#### Linting
```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check for unused exports
npm run lint:unused-exports
```

#### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/renderer/components/__tests__/StreamGrid.test.tsx
```

### Build Process

#### Development Build
```bash
# Build main and renderer processes
npm run build

# Build main process only
npm run build:main

# Build renderer process only
npm run build:renderer
```

#### Production Build
```bash
# Build for current platform
npm run dist

# Build for specific platforms
npm run dist:mac
npm run dist:win
npm run dist:linux

# Build for all platforms
npm run dist:all
```

## Architecture Overview

### Electron Multi-Process Architecture

#### Main Process
- **Purpose**: Application lifecycle, system integration
- **Access**: Full Node.js API, file system, native modules
- **Responsibilities**:
  - Window creation and management
  - Database operations
  - System integration (notifications, menus)
  - IPC communication with renderer

#### Renderer Process  
- **Purpose**: User interface rendering
- **Access**: Browser APIs, limited Node.js via preload
- **Responsibilities**:
  - React component rendering
  - User interaction handling
  - Stream display management
  - State management

#### Preload Scripts
- **Purpose**: Secure bridge between main and renderer
- **Access**: Selective Node.js API exposure
- **Responsibilities**:
  - Context bridge implementation
  - Type-safe IPC interfaces
  - Security boundary enforcement

### State Management

#### Zustand Store Structure
```typescript
interface AppState {
  // Stream state
  streams: StreamState[];
  activeStreamId: string | null;
  
  // Layout state
  layout: GridLayout;
  gridDimensions: { rows: number; cols: number };
  
  // UI state
  isAddModalOpen: boolean;
  isSettingsModalOpen: boolean;
  notifications: Notification[];
  
  // Settings state
  settings: AppSettings;
  
  // Actions
  addStream: (stream: StreamConfig) => void;
  removeStream: (id: string) => void;
  updateStream: (id: string, updates: Partial<StreamConfig>) => void;
  setLayout: (layout: GridLayout) => void;
  // ... more actions
}
```

#### React Query Integration
```typescript
// Server state management
const useStreams = () => {
  return useQuery({
    queryKey: ['streams'],
    queryFn: () => window.electronAPI.getStreamLibrary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutations
const useAddStream = () => {
  return useMutation({
    mutationFn: (stream: StreamConfig) => 
      window.electronAPI.addStream(stream),
    onSuccess: () => {
      queryClient.invalidateQueries(['streams']);
    },
  });
};
```

### IPC Communication

#### Channel Naming Convention
```typescript
// Format: category:action
const IPC_CHANNELS = {
  // Stream management
  'stream:add': 'Add new stream',
  'stream:remove': 'Remove stream',
  'stream:update': 'Update stream configuration',
  'stream:validate': 'Validate stream URL',
  
  // Settings
  'settings:load': 'Load application settings',
  'settings:save': 'Save application settings',
  'settings:reset': 'Reset to defaults',
  
  // Database
  'db:getStreams': 'Get saved streams',
  'db:saveStream': 'Save stream to library',
  'db:deleteStream': 'Delete saved stream',
} as const;
```

#### Type-Safe IPC Implementation
```typescript
// Main process handler
ipcMain.handle('stream:add', async (event, config: StreamConfig) => {
  try {
    const streamId = await streamManager.addStream(config);
    return { success: true, data: streamId };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Renderer process usage
const addStream = async (config: StreamConfig) => {
  const result = await window.electronAPI.addStream(config);
  if (result.success) {
    // Handle success
  } else {
    // Handle error
  }
};
```

## Component Development

### React Component Patterns

#### Functional Components with Hooks
```typescript
interface StreamTileProps {
  stream: Stream;
  onVolumeChange?: (volume: number) => void;
  onRemove?: () => void;
}

const StreamTile: React.FC<StreamTileProps> = ({ 
  stream, 
  onVolumeChange, 
  onRemove 
}) => {
  const [volume, setVolume] = useState(stream.volume);
  const [isConnected, setIsConnected] = useState(false);
  
  // Effect for stream connection
  useEffect(() => {
    const handleStreamStatus = (status: StreamStatus) => {
      setIsConnected(status === 'connected');
    };
    
    window.electronAPI.onStreamStatus(stream.id, handleStreamStatus);
    
    return () => {
      window.electronAPI.offStreamStatus(stream.id, handleStreamStatus);
    };
  }, [stream.id]);
  
  return (
    <div className="stream-tile">
      {/* Component JSX */}
    </div>
  );
};
```

#### Custom Hooks
```typescript
// Custom hook for stream management
export const useStreamManager = () => {
  const { streams, addStream, removeStream } = useStreamStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddStream = useCallback(async (config: StreamConfig) => {
    setIsLoading(true);
    try {
      await window.electronAPI.addStream(config);
      addStream(config);
    } catch (error) {
      console.error('Failed to add stream:', error);
    } finally {
      setIsLoading(false);
    }
  }, [addStream]);
  
  return {
    streams,
    isLoading,
    addStream: handleAddStream,
    removeStream,
  };
};
```

### Styling with Tailwind CSS

#### Component Styling
```typescript
// Using Tailwind classes
const StreamTile = ({ stream }: StreamTileProps) => (
  <div className="
    relative 
    bg-gray-900 
    border border-gray-700 
    rounded-lg 
    overflow-hidden
    hover:border-blue-500 
    transition-colors
    duration-200
  ">
    <div className="aspect-video bg-black">
      {/* Video player */}
    </div>
    <div className="
      absolute 
      bottom-0 
      left-0 
      right-0 
      bg-gradient-to-t 
      from-black/80 
      to-transparent
      p-2
    ">
      <h3 className="text-white text-sm font-medium truncate">
        {stream.label}
      </h3>
    </div>
  </div>
);
```

#### Responsive Design
```typescript
// Responsive grid layout
const StreamGrid = ({ streams, layout }: StreamGridProps) => {
  const gridClasses = useMemo(() => {
    const baseClasses = "grid gap-2 p-4";
    
    switch (layout) {
      case '1x1':
        return `${baseClasses} grid-cols-1`;
      case '2x2':
        return `${baseClasses} grid-cols-1 md:grid-cols-2`;
      case '3x3':
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
      case '4x4':
        return `${baseClasses} grid-cols-2 md:grid-cols-3 lg:grid-cols-4`;
      default:
        return `${baseClasses} grid-cols-2`;
    }
  }, [layout]);
  
  return (
    <div className={gridClasses}>
      {streams.map(stream => (
        <StreamTile key={stream.id} stream={stream} />
      ))}
    </div>
  );
};
```

## Database Development

### SQLite Schema Design

#### Stream Library Table
```sql
CREATE TABLE IF NOT EXISTS streams (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  label TEXT NOT NULL,
  category TEXT,
  description TEXT,
  metadata TEXT, -- JSON string
  tags TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_streams_category ON streams(category);
CREATE INDEX IF NOT EXISTS idx_streams_created ON streams(created_at);
```

#### Settings Table
```sql
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL, -- JSON string
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Database Operations
```typescript
// Database connection and setup
class Database {
  private db: Database;
  
  constructor() {
    this.db = new Database(path.join(app.getPath('userData'), 'streams.db'));
    this.initialize();
  }
  
  private initialize() {
    // Create tables
    this.db.exec(CREATE_TABLES_SQL);
    
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
    
    // Performance optimizations
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
  }
  
  // Stream operations
  async getStreams(): Promise<SavedStream[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM streams 
      ORDER BY created_at DESC
    `);
    
    return stmt.all() as SavedStream[];
  }
  
  async saveStream(stream: Omit<SavedStream, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO streams (id, url, label, category, description, metadata, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      stream.url,
      stream.label,
      stream.category,
      stream.description,
      JSON.stringify(stream.metadata),
      JSON.stringify(stream.tags)
    );
    
    return id;
  }
}
```

## Testing

### Unit Testing with Vitest

#### Component Testing
```typescript
// StreamTile.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { StreamTile } from '../StreamTile';
import { mockStream } from '../../../__mocks__/stream';

describe('StreamTile', () => {
  it('renders stream label', () => {
    render(<StreamTile stream={mockStream} />);
    
    expect(screen.getByText(mockStream.label)).toBeInTheDocument();
  });
  
  it('calls onRemove when remove button clicked', () => {
    const onRemove = vi.fn();
    render(<StreamTile stream={mockStream} onRemove={onRemove} />);
    
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    
    expect(onRemove).toHaveBeenCalledWith(mockStream.id);
  });
  
  it('displays connection status', () => {
    render(<StreamTile stream={mockStream} />);
    
    expect(screen.getByTestId('connection-status')).toBeInTheDocument();
  });
});
```

#### Hook Testing
```typescript
// useStreamManager.test.ts
import { renderHook, act } from '@testing-library/react';
import { useStreamManager } from '../useStreamManager';
import { wrapper } from '../../../__mocks__/test-wrapper';

describe('useStreamManager', () => {
  it('adds stream successfully', async () => {
    const { result } = renderHook(() => useStreamManager(), { wrapper });
    
    const mockConfig = { url: 'rtmp://test.com/stream', label: 'Test Stream' };
    
    await act(async () => {
      await result.current.addStream(mockConfig);
    });
    
    expect(result.current.streams).toContainEqual(
      expect.objectContaining(mockConfig)
    );
  });
});
```

### Integration Testing

#### IPC Testing
```typescript
// ipc/handlers.test.ts
import { ipcMain } from 'electron';
import { setupIpcHandlers } from '../handlers';

describe('IPC Handlers', () => {
  beforeEach(() => {
    setupIpcHandlers();
  });
  
  it('handles stream:add correctly', async () => {
    const mockConfig = { url: 'rtmp://test.com/stream', label: 'Test' };
    
    const result = await ipcMain.invoke('stream:add', mockConfig);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
  
  it('validates stream URLs', async () => {
    const invalidConfig = { url: 'invalid-url', label: 'Test' };
    
    const result = await ipcMain.invoke('stream:add', invalidConfig);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid URL');
  });
});
```

## Debugging

### Main Process Debugging
```bash
# Debug main process with Chrome DevTools
npm run dev:main

# Or with VS Code launch configuration
{
  "type": "node",
  "request": "launch",
  "name": "Debug Main Process",
  "cwd": "${workspaceFolder}",
  "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
  "windows": {
    "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
  },
  "args": [".", "--remote-debugging-port=9222"],
  "outputCapture": "std"
}
```

### Renderer Process Debugging
```bash
# Debug renderer with Chrome DevTools
# In running app: Cmd+Opt+I (macOS) or Ctrl+Shift+I (Windows/Linux)

# Or in development: Open browser to http://localhost:5173
```

### Logging Configuration
```typescript
// Enhanced logging for development
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});
```

## Performance Optimization

### React Performance
```typescript
// Memoize expensive components
const StreamGrid = React.memo(({ streams, layout }: StreamGridProps) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.layout === nextProps.layout && 
         prevProps.streams.length === nextProps.streams.length;
});

// Use useMemo for expensive calculations
const processedStreams = useMemo(() => {
  return streams.map(stream => ({
    ...stream,
    thumbnailUrl: generateThumbnailUrl(stream.url)
  }));
}, [streams]);

// Use useCallback for stable references
const handleStreamSelect = useCallback((streamId: string) => {
  setSelectedStreamId(streamId);
}, []);
```

### Bundle Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          electron: ['electron'],
          database: ['sqlite3'],
          media: ['hls.js']
        }
      }
    },
    minify: 'terser',
    sourcemap: true
  },
  optimizeDeps: {
    exclude: ['sqlite3']
  }
});
```

## Contributing Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **Components**: Functional with hooks
- **Files**: kebab-case naming
- **Imports**: Absolute paths with aliases
- **Exports**: Named exports preferred

### Commit Convention
```bash
# Format: type(scope): description
feat(stream): add RTMP validation
fix(ui): resolve stream tile overlap
docs(api): update IPC documentation
test(stream): add unit tests for stream manager
```

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Ensure all checks pass:
   - `npm run type-check`
   - `npm run lint`
   - `npm test`
4. Update documentation
5. Submit pull request with description

This development guide should help you get started with StreamGRID development. For additional information, refer to the API documentation and architecture guides.