/**
 * Stream URL validation module
 * Validates and parses various streaming protocols (RTMP, HLS, etc.)
 */

import { URL } from 'url';
import { ValidationResult } from '../../shared/types/stream';

export type StreamProtocol = 'rtmp' | 'rtmps' | 'hls' | 'http' | 'https';

/**
 * Detects the stream protocol from a URL
 * @param url The URL to analyze
 * @returns The detected protocol or null
 */
function detectStreamProtocol(url: string): StreamProtocol | null {
  try {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol.toLowerCase().replace(':', '');
    
    // Check for HLS streams (m3u8 files)
    if ((protocol === 'http' || protocol === 'https') && 
        (url.includes('.m3u8') || url.includes('/playlist.m3u8'))) {
      return 'hls';
    }
    
    // Check for RTMP/RTMPS
    if (protocol === 'rtmp' || protocol === 'rtmps') {
      return protocol as StreamProtocol;
    }
    
    // Default to HTTP/HTTPS for other streams
    if (protocol === 'http' || protocol === 'https') {
      return protocol as StreamProtocol;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Validates a stream URL (supports RTMP, HLS, and HTTP streams)
 * @param url The URL to validate
 * @returns ValidationResult with success status and any errors
 */
export function validateStreamUrl(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string' };
  }

  try {
    const parsedUrl = new URL(url);
    const protocol = detectStreamProtocol(url);
    
    if (!protocol) {
      return { valid: false, error: 'Unsupported streaming protocol' };
    }
    
    // Check if host is present
    if (!parsedUrl.hostname) {
      return { valid: false, error: 'URL must include a hostname' };
    }
    
    // Protocol-specific validation
    switch (protocol) {
      case 'rtmp':
      case 'rtmps':
        // Check if path is present (stream key/name)
        if (!parsedUrl.pathname || parsedUrl.pathname === '/') {
          return { valid: false, error: 'RTMP URL must include a stream path/key' };
        }
        break;
        
      case 'hls':
        // Check for .m3u8 extension
        if (!url.includes('.m3u8')) {
          return { valid: false, error: 'HLS URL must point to an .m3u8 playlist file' };
        }
        break;
        
      case 'http':
      case 'https':
        // Allow any HTTP/HTTPS stream
        break;
    }
    
    // Validate port if specified
    if (parsedUrl.port) {
      const port = parseInt(parsedUrl.port, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        return { valid: false, error: 'Invalid port number' };
      }
    }
    
    // Return success with metadata
    return { 
      valid: true,
      metadata: {
        protocol,
        codec: protocol === 'hls' ? 'H.264/HLS' : 'H.264',
        audioCodec: 'AAC'
      }
    };
  } catch (error) {
    // Invalid URL format
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use validateStreamUrl instead
 */
export function validateRTMPUrl(url: string): ValidationResult {
  return validateStreamUrl(url);
}

/**
 * Parses a stream URL and extracts components
 * @param url The stream URL to parse
 * @returns Parsed URL components or null if invalid
 */
export function parseStreamUrl(url: string): {
  protocol: string;
  hostname: string;
  port: number;
  pathname: string;
  streamKey?: string;
  app?: string;
  type: 'rtmp' | 'hls' | 'http';
} | null {
  const validation = validateStreamUrl(url);
  if (!validation.valid) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const protocol = detectStreamProtocol(url);
    
    if (!protocol) {
      return null;
    }
    
    const baseResult = {
      protocol: parsedUrl.protocol.replace(':', ''),
      hostname: parsedUrl.hostname,
      pathname: parsedUrl.pathname,
    };
    
    // Handle different stream types
    if (protocol === 'rtmp' || protocol === 'rtmps') {
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      const app = pathParts[0] || '';
      const streamKey = pathParts.slice(1).join('/') || '';
      
      return {
        ...baseResult,
        port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : (protocol === 'rtmps' ? 443 : 1935),
        type: 'rtmp',
        app,
        streamKey,
      };
    } else if (protocol === 'hls') {
      return {
        ...baseResult,
        port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : (parsedUrl.protocol === 'https:' ? 443 : 80),
        type: 'hls',
      };
    } else {
      return {
        ...baseResult,
        port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : (parsedUrl.protocol === 'https:' ? 443 : 80),
        type: 'http',
      };
    }
  } catch (error) {
    return null;
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use parseStreamUrl instead
 */
export function parseRTMPUrl(url: string): any {
  return parseStreamUrl(url);
}

/**
 * Tests connection to a stream server
 * @param url The stream URL to test
 * @returns Promise that resolves to true if connection successful
 */
export async function testStreamConnection(url: string): Promise<boolean> {
  const validation = validateStreamUrl(url);
  if (!validation.valid) {
    return false;
  }

  const parsed = parseStreamUrl(url);
  if (!parsed) {
    return false;
  }

  // For HLS streams, we could make a HEAD request to verify the playlist exists
  if (parsed.type === 'hls') {
    try {
      // In a real implementation, make an HTTP request to verify the m3u8 file exists
      console.log(`Testing HLS stream: ${url}`);
      // TODO: Implement actual HTTP HEAD request
      return true;
    } catch {
      return false;
    }
  }
  
  // For RTMP streams, keep existing logic
  if (parsed.type === 'rtmp') {
    console.log(`Testing RTMP connection to ${parsed.hostname}:${parsed.port}/${parsed.app}/${parsed.streamKey}`);
  }
  
  // Simulate async operation for now
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 100);
  });
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use testStreamConnection instead
 */
export async function testRTMPConnection(url: string): Promise<boolean> {
  return testStreamConnection(url);
}

/**
 * Normalizes a stream URL to a standard format
 * @param url The stream URL to normalize
 * @returns Normalized URL or null if invalid
 */
export function normalizeStreamUrl(url: string): string | null {
  const parsed = parseStreamUrl(url);
  if (!parsed) {
    return null;
  }

  // For HLS and HTTP streams, return as-is
  if (parsed.type === 'hls' || parsed.type === 'http') {
    return url;
  }
  
  // For RTMP, normalize the format
  const { protocol, hostname, port, app, streamKey } = parsed;
  const defaultPort = protocol === 'rtmps' ? 443 : 1935;
  const portString = port !== defaultPort ? `:${port}` : '';
  
  return `${protocol}://${hostname}${portString}/${app}/${streamKey}`;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use normalizeStreamUrl instead
 */
export function normalizeRTMPUrl(url: string): string | null {
  return normalizeStreamUrl(url);
}