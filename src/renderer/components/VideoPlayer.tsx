import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stream, StreamStatus } from '@shared/types/stream';
import { useStreamGridStore } from '../store';

// Dynamic import HLS.js to ensure it loads
let Hls: any = null;

interface VideoPlayerProps {
  stream: Stream;
  volume: number;
  isMuted: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, volume, isMuted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateStream, bufferSize, activeStreams, streamConnectionCount, incrementStreamCount, decrementStreamCount, accelerationMode, setHardwareVerificationStatus } = useStreamGridStore();
  
  const loadHlsAndPlay = useCallback(async () => {
      if (!videoRef.current || !stream.url) return;
      
      // INCREMENT: Track this connection attempt
      incrementStreamCount();
      
      const video = videoRef.current;
      
      // Clean up any existing HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      // Set initial volume and mute state
      video.volume = volume / 100;
      video.muted = isMuted;
      
      // Detect stream type
      const isHLS = stream.url.includes('.m3u8');
      const isDirectHTTP = stream.url.startsWith('http') && !isHLS;
      
      // GPU/CPU decode path selection based on settings
      const forceCpuDecoding = accelerationMode === 'cpu';
      const forceGpuDecoding = accelerationMode === 'gpu';
      
      // CONFIGURABLE: Control decode path based on user selection
      const forceNativePlayback = forceCpuDecoding; // Use native (software) decoding for CPU mode
      
      // Update stream status to connecting
      updateStream(stream.id, { status: StreamStatus.CONNECTING });
      setIsLoading(true);
      setError(null);
      
      // FIXED: Increment stream connection counter
      incrementStreamCount();
      
      if (isHLS && !forceNativePlayback) {
        console.log('HLS stream detected:', stream.url);
        
        // Dynamically import HLS.js
        try {
          if (!Hls) {
            const HlsModule = await import('hls.js');
            Hls = HlsModule.default;
            console.log('HLS.js loaded successfully, version:', Hls.version);
          }
          
          if (Hls.isSupported()) {
            console.log('HLS is supported, creating instance...');
            
            // FIXED: Use centralized stream counter from store instead of DOM query  
            const activeConnections = streamConnectionCount;
            console.log(`Loading stream ${stream.id}, total active connections: ${activeConnections}`);
            
            // HLS.js configuration based on acceleration mode
            const hlsConfig: any = {
              debug: false, // Disable debug for performance
              enableWorker: !forceCpuDecoding, // Disable worker for CPU mode
              lowLatencyMode: true, // Enable for live streams
              
              // DYNAMIC BUFFER: User adjustable 1-30 seconds
              backBufferLength: Math.max(1, bufferSize / 2), // Keep half buffer behind
              maxBufferLength: bufferSize, // User-configured buffer size
              maxMaxBufferLength: bufferSize + 5, // Buffer + 5 seconds max
              maxBufferSize: bufferSize * 1.2 * 1000 * 1000, // ~1.2MB per second of buffer
              maxBufferHole: 0.02, // Tighter tolerance for holes
              highBufferWatchdogPeriod: 0.3, // Check more frequently
              
              // LATENCY OPTIMIZATION
              liveSyncDurationCount: 1, // Stay very close to live edge
              liveMaxLatencyDurationCount: 2, // Reduced from 3 - drop latency faster
              liveDurationInfinity: false,
              liveBackBufferLength: 0, // Don't keep old segments
              
              // PERFORMANCE OPTIMIZATION - Adjusted based on mode
              nudgeOffset: 0.02, // Reduced for faster recovery
              nudgeMaxRetry: 2, // Reduced retry attempts
              maxFragLookUpTolerance: 0.05, // Tighter fragment lookup
              
              // HARDWARE ACCELERATION CONTROL
              preferManagedMediaSource: forceGpuDecoding, // Force GPU/CPU based on setting
              enableSoftwareDecoding: forceCpuDecoding, // Force software decode for CPU mode
              
              // QUALITY MANAGEMENT
              testBandwidth: false, // Disable bandwidth testing for faster start
              startLevel: 0, // Start with lowest quality for faster loading
              capLevelToPlayerSize: true, // Match video resolution to player size
              capLevelOnFPSDrop: true, // Aggressively drop quality on FPS drops
              autoStartLoad: true,
              startPosition: -1,
              progressive: false,
              
              // FIXED: Aggressive timeouts for 9+ concurrent streams
              fragLoadingTimeOut: 5000, // 5 seconds for fragment loading
              manifestLoadingTimeOut: 3000, // 3 seconds for manifest timeout  
              levelLoadingTimeOut: 3000, // 3 seconds for level timeout
              xhrSetup: (xhr: XMLHttpRequest) => {
                xhr.timeout = 5000; // 5 seconds for network requests
              },
              
              // AGGRESSIVE CONCURRENCY LIMITS FOR 9+ STREAMS
              fragLoadingMaxRetry: activeConnections > 6 ? 1 : 2, // Only 1 retry for 7+ streams
              manifestLoadingMaxRetry: 1, // Minimal retries for manifest
              levelLoadingMaxRetry: 1, // Minimal retries for levels
              maxLoadingDelay: activeConnections * 1000, // Increase delay based on stream count
              
              // FIXED: Correct connection limits for concurrent streaming
              maxConnections: 1, // Single connection per stream
              maxConnectionsPerHost: 6, // Allow up to 6 connections per host for multiple streams
              
              // STREAM PRIORITY MANAGEMENT (lower for multiple streams)
              startFragPrefetch: false, // Disable prefetching to reduce network load
              abrEwmaFastLive: 2.0, // Faster adaptation for live streams
              abrEwmaSlowLive: 8.0, // More conservative for stability
            };
            
            // CPU/GPU mode logging
            console.log(`[${stream.id}] Decode Mode: ${accelerationMode.toUpperCase()}`);
            if (forceCpuDecoding) {
              console.log(`[${stream.id}] FORCING SOFTWARE DECODING - CPU Mode Active`);
            } else {
              console.log(`[${stream.id}] Hardware acceleration enabled - GPU Mode Active`);
            }
            
            const hls = new Hls(hlsConfig);
            hlsRef.current = hls;
            
            // Set hardware verification status based on mode
            if (accelerationMode === 'cpu') {
              setHardwareVerificationStatus('inactive');
            } else {
              setHardwareVerificationStatus('verifying');
            }
            
            // Attach HLS to video element
            hls.loadSource(stream.url);
            hls.attachMedia(video);
            
            // Handle HLS events
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log('HLS manifest parsed, starting playback');
              video.play().then(() => {
                console.log('Playback started successfully');
                setIsLoading(false);
                updateStream(stream.id, { status: StreamStatus.CONNECTED });
                
                // Update verification status on successful playback
                if (accelerationMode === 'gpu') {
                  setHardwareVerificationStatus('active');
                }
              }).catch(err => {
                console.error('Failed to start playback:', err);
                setError('Failed to start playback - try clicking play');
                setHardwareVerificationStatus('failed');
              });
            });
            
            hls.on(Hls.Events.LEVEL_LOADED, (_event: any, data: any) => {
              const level = hls.levels[data.level];
              if (level) {
                console.log('Level loaded:', level);
                updateStream(stream.id, {
                  metadata: {
                    ...stream.metadata,
                    width: level.width,
                    height: level.height,
                    bitrate: level.bitrate,
                    codec: level.codecs || 'H.264',
                    audioCodec: 'AAC',
                    protocol: accelerationMode === 'cpu' ? 'hls-software' : 'hls-hardware'
                  }
                });
              }
            });
            
            hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
              console.error('HLS Error Details:', {
                type: data.type,
                details: data.details,
                fatal: data.fatal,
                url: data.url,
                reason: data.reason,
                response: data.response
              });
              
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error('Fatal network error, trying to recover');
                    setError(`Network error: ${data.details} - retrying...`);
                    // More aggressive recovery for network errors
                    setTimeout(() => {
                      console.log('Reloading source after network error');
                      hls.loadSource(stream.url);
                      hls.attachMedia(video);
                    }, 2000);
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error('Fatal media error, trying to recover');
                    setError(`Media error: ${data.details} - retrying...`);
                    hls.recoverMediaError();
                    break;
                  default:
                    console.error('Fatal error:', data.type, data.details);
                    setError(`Playback error: ${data.details || data.type}`);
                    hls.destroy();
                    updateStream(stream.id, { 
                      status: StreamStatus.ERROR,
                      statistics: {
                        ...stream.statistics,
                        lastError: `HLS Error: ${data.details || data.type}`
                      }
                    });
                    break;
                }
              } else {
                // Log non-fatal errors for debugging
                console.warn('Non-fatal HLS error:', data.type, data.details);
              }
            });
            
            hls.on(Hls.Events.FRAG_LOADED, (_event: any, data: any) => {
              const stats = (data as any).stats;
              if (stats) {
                updateStream(stream.id, {
                  statistics: {
                    ...stream.statistics,
                    bytesReceived: stats.total,
                    currentBitrate: Math.round(stats.bwEstimate || 0),
                  }
                });
              }
            });
            
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            console.log('Using native HLS support');
            video.src = stream.url;
            video.play().then(() => {
              setIsLoading(false);
              updateStream(stream.id, { status: StreamStatus.CONNECTED });
            }).catch(err => {
              console.error('Failed to start native HLS playback:', err);
              setError('Failed to start playback');
            });
          } else {
            // Fallback to native HLS attempt
            console.log('HLS.js not supported, trying native HLS');
            video.src = stream.url;
            video.play().then(() => {
              setIsLoading(false);
              updateStream(stream.id, { status: StreamStatus.CONNECTED });
            }).catch(err => {
              console.error('Failed to start native HLS playback:', err);
              setError('HLS playback not supported');
            });
          }
        } catch (err) {
          console.error('Failed to load HLS.js:', err);
          setError('Failed to load video player');
        }
      } else if (isHLS && forceNativePlayback) {
        // NATIVE HLS: For CPU mode or software decoding
        console.log(`Using NATIVE HLS (${accelerationMode.toUpperCase()} mode):`, stream.url);
        video.src = stream.url;
        
        // Set attributes for native playback
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('playsinline', 'true');
        
        // Force software decoding attributes for CPU mode
        if (forceCpuDecoding) {
          video.setAttribute('x-webkit-accelerated-compositing', 'false');
          console.log(`[${stream.id}] Forcing software decode via native HLS`);
        }
        
        video.play().then(() => {
          console.log('Native HLS playback started successfully');
          setIsLoading(false);
          updateStream(stream.id, { 
            status: StreamStatus.CONNECTED,
            metadata: {
              ...stream.metadata,
              protocol: accelerationMode === 'cpu' ? 'native-hls-software' : 'native-hls-hardware'
            }
          });
          
          // Set verification status
          if (accelerationMode === 'cpu') {
            setHardwareVerificationStatus('inactive');
          }
        }).catch(err => {
          console.error('Failed to start native HLS playback:', err);
          setError('Native HLS playback failed - check stream URL');
          setHardwareVerificationStatus('failed');
          updateStream(stream.id, { 
            status: StreamStatus.ERROR,
            statistics: {
              ...stream.statistics,
              lastError: `Native HLS Error: ${err.message}`
            }
          });
        });
      } else if (isDirectHTTP) {
        // Direct HTTP video stream
        console.log('Direct HTTP stream:', stream.url);
        video.src = stream.url;
        video.play().then(() => {
          setIsLoading(false);
          updateStream(stream.id, { status: StreamStatus.CONNECTED });
        }).catch(err => {
          console.error('Failed to start HTTP stream playback:', err);
          setError('Failed to start playback');
        });
      } else if (stream.url.startsWith('rtmp')) {
        // RTMP streams need special handling
        setError('RTMP streams require transcoding. Please use an HLS stream URL (.m3u8) instead.');
        console.warn(`
RTMP streams cannot be played directly in browsers. You need:
1. An HLS stream URL (ends with .m3u8)
2. Or use a transcoding service

Try these test streams:
- https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
- https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8
        `);
        updateStream(stream.id, { 
          status: StreamStatus.ERROR,
          statistics: {
            ...stream.statistics,
            lastError: 'RTMP requires transcoding to HLS'
          }
        });
      } else {
        setError('Unsupported stream protocol');
        updateStream(stream.id, { 
          status: StreamStatus.ERROR,
          statistics: {
            ...stream.statistics,
            lastError: 'Unsupported protocol'
          }
        });
      }
      
      // Handle video events
      const handleCanPlay = () => {
        console.log('Video can play');
        setIsLoading(false);
        if (!hlsRef.current) {
          updateStream(stream.id, { status: StreamStatus.CONNECTED });
        }
      };
      
      const handleError = (e: Event) => {
        const videoError = video.error;
        const errorMessage = videoError ? 
          `Video Error: ${videoError.message || 'Unknown error'}` : 
          'Failed to load stream';
        
        console.error('Video error:', errorMessage, e);
        setError(errorMessage);
        setIsLoading(false);
        
        updateStream(stream.id, { 
          status: StreamStatus.ERROR,
          statistics: {
            ...stream.statistics,
            lastError: errorMessage
          }
        });
      };
      
      const handleLoadedMetadata = () => {
        console.log('Video metadata loaded');
        if (video.videoWidth && video.videoHeight && !isHLS) {
          updateStream(stream.id, {
            metadata: {
              ...stream.metadata,
              width: video.videoWidth,
              height: video.videoHeight,
              protocol: isDirectHTTP ? 'http' : stream.metadata?.protocol
            }
          });
        }
      };
      
      const handleWaiting = () => {
        console.log('Video buffering...');
        setIsLoading(true);
      };
      
      const handlePlaying = () => {
        console.log('Video playing');
        setIsLoading(false);
        setError(null);
      };
      
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('playing', handlePlaying);
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('playing', handlePlaying);
      };
  }, [stream.url, stream.id, updateStream, bufferSize]); // FIXED: Removed streamConnectionCount and incrementStreamCount to prevent infinite loop

  useEffect(() => {
    loadHlsAndPlay();
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      // FIXED: Decrement stream connection counter on cleanup
      decrementStreamCount();
    };
  }, [loadHlsAndPlay]); // FIXED: Removed decrementStreamCount dependency to prevent loop
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);
  
  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
        controls={false}
        crossOrigin="anonymous"
        // Hardware acceleration and performance attributes
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        x-webkit-airplay="deny"
        // Hardware acceleration control based on mode
        webkit-playsinline="true"
        playsinline="true"
        style={{ 
          willChange: accelerationMode === 'gpu' ? 'transform' : 'auto',
          // GPU layer control based on acceleration mode
          transform: accelerationMode === 'gpu' ? 'translateZ(0)' : 'none',
          backfaceVisibility: accelerationMode === 'gpu' ? 'hidden' : 'visible',
          perspective: accelerationMode === 'gpu' ? 1000 : 'none'
        }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Connecting to stream...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-red-500 text-center p-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">{error}</p>
            <p className="text-xs mt-1 text-gray-400">{stream.url}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;