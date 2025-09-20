// IPC Type Definitions for secure type-safe communication

import { Stream, ValidationResult } from './stream';
import { Layout } from './layout';
import { AppSettings } from './settings';
import { DiscoveryAPI } from './discovery';

export interface StreamAPI {
  getAll: () => Promise<Stream[]>;
  add: (stream: Stream) => Promise<Stream>;
  update: (id: string, updates: Partial<Stream>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  delete: (id: string) => Promise<void>;
  validate: (url: string) => Promise<ValidationResult>;
}

export interface LayoutAPI {
  getAll: () => Promise<Layout[]>;
  create: (layout: Layout) => Promise<void>;
  update: (id: string, updates: Partial<Layout>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  setActive: (id: string) => Promise<void>;
}

export interface SettingsAPI {
  load: () => Promise<AppSettings>;
  get: () => Promise<AppSettings>;
  save: (settings: AppSettings) => Promise<void>;
  update: (path: string, value: unknown) => Promise<void>;
}

export interface WindowAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  setAlwaysOnTop: (alwaysOnTop: boolean) => void;
}

export interface SystemInfo {
  platform: string;
  version: string;
  cpuUsage: number;
  memoryUsage: number;
}

export interface SystemAPI {
  getPlatform: () => string;
  getVersion: () => string;
  getInfo: () => Promise<SystemInfo>;
  openExternal: (url: string) => Promise<void>;
  showItemInFolder: (path: string) => void;
}

export interface MonitoringAPI {
  startBandwidth: () => Promise<string>;
  stopBandwidth: () => Promise<string>;
  getBandwidthMetrics: () => Promise<any[]>;
  startGPU: () => Promise<string>;
  stopGPU: () => Promise<string>;
  getGPUInfo: () => Promise<any>;
}

export interface ElectronAPI {
  stream: StreamAPI;
  layout: LayoutAPI;
  settings: SettingsAPI;
  window: WindowAPI;
  system: SystemAPI;
  discovery: DiscoveryAPI;
  monitoring: MonitoringAPI;
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeAllListeners: (channel: string) => void;
}

// Augment the Window interface with proper typing
declare global {
  interface Window {
    api: ElectronAPI;
  }
}