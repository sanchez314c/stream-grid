import sqlite3 from 'sqlite3';
import { app } from 'electron';
import path from 'path';
import { Stream, StreamStatus, StreamMetadata, StreamStatistics } from '../../shared/types/stream';
import { Layout, LayoutType } from '../../shared/types/layout';
import { v4 as uuidv4 } from 'uuid';

let db: sqlite3.Database;

export async function setupDatabase(): Promise<void> {
  const dbPath = path.join(app.getPath('userData'), 'streams.db');
  
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      createTables().then(resolve).catch(reject);
    });
  });
}

async function createTables(): Promise<void> {
  const queries = [
    `CREATE TABLE IF NOT EXISTS streams (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      label TEXT NOT NULL,
      status TEXT DEFAULT 'disconnected',
      metadata TEXT,
      settings TEXT,
      statistics TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS layouts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      grid TEXT NOT NULL,
      streams TEXT,
      isActive INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];
  
  for (const query of queries) {
    await runQuery(query);
  }
}

function runQuery(query: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function getAll<T>(query: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

function getOne<T>(query: string, params: any[] = []): Promise<T | null> {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | null);
    });
  });
}

// Stream operations
export async function addStream(url: string, label: string): Promise<Stream> {
  const id = uuidv4();
  const stream: Stream = {
    id,
    url,
    label,
    status: StreamStatus.DISCONNECTED,
    metadata: {
      width: 0,
      height: 0,
      fps: 0,
      bitrate: 0,
      codec: '',
      audioCodec: '',
      audioChannels: 0,
      audioSampleRate: 0
    } as StreamMetadata,
    settings: {
      volume: 50,
      muted: false,
      priority: 1,
      reconnectAttempts: 5,
      reconnectDelay: 3000,
      hardwareAcceleration: true,
      audioOutput: 'default'
    },
    statistics: {
      packetsReceived: 0,
      packetsLost: 0,
      bytesReceived: 0,
      currentBitrate: 0,
      averageBitrate: 0,
      currentFps: 0,
      averageFps: 0,
      droppedFrames: 0,
      latency: 0,
      connectionTime: 0,
      lastError: null
    } as StreamStatistics,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await runQuery(
    `INSERT INTO streams (id, url, label, metadata, settings, statistics) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, url, label, JSON.stringify(stream.metadata), JSON.stringify(stream.settings), JSON.stringify(stream.statistics)]
  );
  
  return stream;
}

export async function updateStream(id: string, updates: Partial<Stream>): Promise<void> {
  const fields = [];
  const values = [];
  
  if (updates.url !== undefined) {
    fields.push('url = ?');
    values.push(updates.url);
  }
  if (updates.label !== undefined) {
    fields.push('label = ?');
    values.push(updates.label);
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.metadata !== undefined) {
    fields.push('metadata = ?');
    values.push(JSON.stringify(updates.metadata));
  }
  if (updates.settings !== undefined) {
    fields.push('settings = ?');
    values.push(JSON.stringify(updates.settings));
  }
  if (updates.statistics !== undefined) {
    fields.push('statistics = ?');
    values.push(JSON.stringify(updates.statistics));
  }
  
  fields.push('updatedAt = CURRENT_TIMESTAMP');
  values.push(id);
  
  await runQuery(
    `UPDATE streams SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteStream(id: string): Promise<void> {
  await runQuery('DELETE FROM streams WHERE id = ?', [id]);
}

export async function getAllStreams(): Promise<Stream[]> {
  const rows = await getAll<any>('SELECT * FROM streams');
  
  return rows.map(row => ({
    ...row,
    metadata: JSON.parse(row.metadata || '{}'),
    settings: JSON.parse(row.settings || '{}'),
    statistics: JSON.parse(row.statistics || '{}'),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  }));
}

export async function getStream(id: string): Promise<Stream | null> {
  const row = await getOne<any>('SELECT * FROM streams WHERE id = ?', [id]);
  
  if (!row) return null;
  
  return {
    ...row,
    metadata: JSON.parse(row.metadata || '{}'),
    settings: JSON.parse(row.settings || '{}'),
    statistics: JSON.parse(row.statistics || '{}'),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  };
}

export async function saveStream(stream: Stream): Promise<void> {
  const existing = await getStream(stream.id);
  
  if (existing) {
    await updateStream(stream.id, stream);
  } else {
    await runQuery(
      `INSERT INTO streams (id, url, label, status, metadata, settings, statistics) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        stream.id,
        stream.url,
        stream.label,
        stream.status,
        JSON.stringify(stream.metadata),
        JSON.stringify(stream.settings),
        JSON.stringify(stream.statistics)
      ]
    );
  }
}

// Layout operations
export async function addLayout(name: string, grid: any): Promise<Layout> {
  const id = uuidv4();
  const layout: Layout = {
    id,
    name,
    type: LayoutType.CUSTOM,
    grid,
    streams: [],
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await runQuery(
    `INSERT INTO layouts (id, name, type, grid, streams) VALUES (?, ?, ?, ?, ?)`,
    [id, name, layout.type, JSON.stringify(grid), JSON.stringify(layout.streams)]
  );
  
  return layout;
}

export async function updateLayout(id: string, updates: Partial<Layout>): Promise<void> {
  const fields = [];
  const values = [];
  
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.grid !== undefined) {
    fields.push('grid = ?');
    values.push(JSON.stringify(updates.grid));
  }
  if (updates.streams !== undefined) {
    fields.push('streams = ?');
    values.push(JSON.stringify(updates.streams));
  }
  if (updates.isActive !== undefined) {
    fields.push('isActive = ?');
    values.push(updates.isActive ? 1 : 0);
  }
  
  fields.push('updatedAt = CURRENT_TIMESTAMP');
  values.push(id);
  
  await runQuery(
    `UPDATE layouts SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteLayout(id: string): Promise<void> {
  await runQuery('DELETE FROM layouts WHERE id = ?', [id]);
}

export async function getAllLayouts(): Promise<Layout[]> {
  const rows = await getAll<any>('SELECT * FROM layouts');
  
  return rows.map(row => ({
    ...row,
    grid: JSON.parse(row.grid || '{}'),
    streams: JSON.parse(row.streams || '[]'),
    isActive: row.isActive === 1,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  }));
}

export async function setActiveLayout(id: string): Promise<void> {
  await runQuery('UPDATE layouts SET isActive = 0');
  await runQuery('UPDATE layouts SET isActive = 1 WHERE id = ?', [id]);
}