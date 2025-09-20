import React, { useMemo } from 'react';
import { TileVFXSettings } from '../../../shared/types/settings';

interface VFXOverlayProps {
  streamId: string;
  vfxState: TileVFXSettings | undefined;
  className?: string;
}

export const VFXOverlay: React.FC<VFXOverlayProps> = ({
  streamId,
  vfxState,
  className = ''
}) => {
  // Generate CSS filter string from VFX filters
  const filterString = useMemo(() => {
    if (!vfxState || !vfxState.activeFilters || vfxState.activeFilters.length === 0) {
      return 'none';
    }

    return vfxState.activeFilters
      .map(filter => {
        switch (filter.type) {
          case 'vhs':
            return [
              `contrast(${1 + (filter.intensity * 0.3)})`,
              `saturate(${1.2 + (filter.intensity * 0.5)})`,
              `hue-rotate(${filter.intensity * 10}deg)`,
              `sepia(${filter.intensity * 0.2})`
            ].join(' ');
          
          case 'grain':
            // CSS-based grain effect using opacity and blend modes
            return `contrast(${1 + (filter.intensity * 0.1)}) brightness(${0.95 + (filter.intensity * 0.1)})`;
          
          case 'interference':
            return [
              `contrast(${1 + (filter.intensity * 0.4)})`,
              `brightness(${0.9 + (filter.intensity * 0.2)})`,
              `hue-rotate(${Math.sin(Date.now() * 0.001) * filter.intensity * 20}deg)`
            ].join(' ');
          
          case 'custom':
            return '';
          
          default:
            return '';
        }
      })
      .filter(Boolean)
      .join(' ');
  }, [vfxState?.activeFilters]);

  // Generate overlay elements for special effects
  const overlayElements = useMemo(() => {
    if (!vfxState || !vfxState.activeFilters) return null;

    return vfxState.activeFilters.map((filter, index) => {
      switch (filter.type) {
        case 'grain':
          return (
            <div
              key={`grain-${index}`}
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;base64,${btoa(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                    <defs>
                      <filter id="grain">
                        <feTurbulence baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
                        <feColorMatrix type="saturate" values="0"/>
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="${filter.intensity * 0.3}" intercept="0"/>
                        </feComponentTransfer>
                        <feBlend mode="overlay"/>
                      </filter>
                    </defs>
                    <rect width="100%" height="100%" filter="url(#grain)"/>
                  </svg>
                `)}")`,
                backgroundRepeat: 'repeat',
                opacity: filter.intensity * 0.6,
                mixBlendMode: 'overlay'
              }}
            />
          );

        case 'interference':
          return (
            <div
              key={`interference-${index}`}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(
                  ${Math.sin(Date.now() * 0.002) * 180}deg,
                  transparent ${50 - filter.intensity * 20}%,
                  rgba(255,255,255,${filter.intensity * 0.1}) ${50}%,
                  transparent ${50 + filter.intensity * 20}%
                )`,
                animation: `vfx-interference-${streamId} ${2 + (1 - filter.intensity)}s linear infinite`
              }}
            />
          );

        case 'vhs':
          return (
            <div
              key={`vhs-${index}`}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  linear-gradient(
                    90deg,
                    transparent 0%,
                    rgba(255,0,255,${filter.intensity * 0.03}) 50%,
                    transparent 100%
                  ),
                  linear-gradient(
                    0deg,
                    transparent 0%,
                    rgba(0,255,255,${filter.intensity * 0.02}) 50%,
                    transparent 100%
                  )
                `,
                mixBlendMode: 'color-dodge'
              }}
            />
          );

        default:
          return null;
      }
    }).filter(Boolean);
  }, [vfxState?.activeFilters, streamId]);

  // Generate dynamic CSS animations
  const animationStyles = useMemo(() => {
    if (!vfxState || !vfxState.activeFilters) return null;

    const interferenceFilters = vfxState.activeFilters.filter(f => f.type === 'interference');
    if (interferenceFilters.length === 0) return null;

    const keyframes = interferenceFilters.map((filter) => `
      @keyframes vfx-interference-${streamId} {
        0% { transform: translateY(0px) scaleY(1); opacity: ${filter.intensity * 0.8}; }
        25% { transform: translateY(-2px) scaleY(0.98); opacity: ${filter.intensity * 0.6}; }
        50% { transform: translateY(1px) scaleY(1.02); opacity: ${filter.intensity * 0.9}; }
        75% { transform: translateY(-1px) scaleY(0.99); opacity: ${filter.intensity * 0.7}; }
        100% { transform: translateY(0px) scaleY(1); opacity: ${filter.intensity * 0.8}; }
      }
    `).join('\n');

    return (
      <style>
        {keyframes}
      </style>
    );
  }, [vfxState?.activeFilters, streamId]);

  if (!vfxState) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {animationStyles}
      
      {/* Main filter overlay */}
      <div
        className="absolute inset-0"
        style={{
          filter: filterString,
          mixBlendMode: 'normal'
        }}
      />
      
      {/* Special effect overlays */}
      {overlayElements}
      
      {/* VFX indicator */}
      {vfxState.activeFilters.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-purple-600/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
            <span className="font-medium">VFX</span>
            <span className="opacity-75">
              {vfxState.activeFilters.map(f => f.type.toUpperCase()).join('+')}
            </span>
          </div>
        </div>
      )}
      
      {/* Real-time intensity adjustment overlay (appears on hover) */}
      <div className="group absolute inset-0">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-2 left-2">
          <div className="bg-gray-800/95 text-white p-2 rounded border border-gray-600 backdrop-blur-sm">
            <div className="text-xs font-medium mb-2">VFX Controls</div>
            {vfxState.activeFilters.map((filter, index) => (
              <div key={index} className="flex items-center space-x-2 mb-1">
                <span className="text-xs capitalize w-16">{filter.type}:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={filter.intensity}
                  onChange={(e) => {
                    const newIntensity = parseInt(e.target.value);
                    window.electronAPI?.invoke('advanced-controls:update-vfx-intensity', 
                      streamId, filter.id, newIntensity);
                  }}
                  className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-sm"
                />
                <span className="text-xs w-8">{filter.intensity}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};