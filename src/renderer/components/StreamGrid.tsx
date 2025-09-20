import React from 'react';
import { useStreamGridStore } from '../store';
import StreamTile from './StreamTile';
import { PRESET_LAYOUTS } from '@shared/types/layout';

const StreamGrid: React.FC = () => {
  const { streams, activeLayoutId, showLabels } = useStreamGridStore();
  
  const currentLayout = PRESET_LAYOUTS[activeLayoutId || '2x2'];
  const streamArray = Array.from(streams instanceof Map ? streams.values() : []);
  
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${currentLayout.columns}, 1fr)`,
    gridTemplateRows: `repeat(${currentLayout.rows}, 1fr)`,
    gap: `${currentLayout.gaps}px`,
    padding: '8px'
  };
  
  const totalSlots = currentLayout.rows * currentLayout.columns;
  
  if (streamArray.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 mx-auto text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-text-secondary mb-2">No Streams Added</h2>
          <p className="text-text-muted mb-4">Add RTMP streams to start monitoring</p>
          <button
            onClick={() => {
              const event = new CustomEvent('open-add-stream');
              window.dispatchEvent(event);
            }}
            className="btn btn-primary"
          >
            Add Your First Stream
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-hidden">
      <div style={gridStyle} className="h-full">
        {Array.from({ length: totalSlots }).map((_, index) => {
          const stream = streamArray[index];
          return (
            <div key={index} className="relative bg-bg-secondary rounded-lg overflow-hidden">
              {stream ? (
                <StreamTile stream={stream} showLabel={showLabels} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-4">
                    <svg className="w-12 h-12 mx-auto text-text-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="text-text-muted text-sm">Empty Slot</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StreamGrid;