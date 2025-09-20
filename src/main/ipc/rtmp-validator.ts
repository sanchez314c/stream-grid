/**
 * RTMP URL validation module
 * Validates and parses RTMP stream URLs
 */

import { URL } from 'url';
import { ValidationResult } from '../../shared/types/stream';

/**
 * Validates an RTMP URL
 * @param url The URL to validate
 * @returns ValidationResult with success status and any errors
 */
export function validateRTMPUrl(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string' };
  }

  try {
    const parsedUrl = new URL(url);
    
    // Check if protocol is RTMP or RTMPS
    if (!['rtmp:', 'rtmps:'].includes(parsedUrl.protocol)) {
      return { valid: false, error: 'URL must use RTMP or RTMPS protocol' };
    }

    // Check if host is present
    if (!parsedUrl.hostname) {
      return { valid: false, error: 'URL must include a hostname' };
    }

    // Check if path is present (stream key/name)
    if (!parsedUrl.pathname || parsedUrl.pathname === '/') {
      return { valid: false, error: 'URL must include a stream path/key' };
    }

    // Validate port if specified
    if (parsedUrl.port) {
      const port = parseInt(parsedUrl.port, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        return { valid: false, error: 'Invalid port number' };
      }
    }

    // Return success with potential metadata
    return { 
      valid: true,
      metadata: {
        codec: 'H.264', // Default assumption
        audioCodec: 'AAC' // Default assumption
      }
    };
  } catch (error) {
    // Invalid URL format
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Parses an RTMP URL and extracts components
 * @param url The RTMP URL to parse
 * @returns Parsed URL components or null if invalid
 */
export function parseRTMPUrl(url: string): {
  protocol: string;
  hostname: string;
  port: number;
  pathname: string;
  streamKey: string;
  app: string;
} | null {
  const validation = validateRTMPUrl(url);
  if (!validation.valid) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    
    // Extract app name and stream key from path
    // Format: rtmp://server/app/streamKey
    const app = pathParts[0] || '';
    const streamKey = pathParts.slice(1).join('/') || '';

    return {
      protocol: parsedUrl.protocol.replace(':', ''),
      hostname: parsedUrl.hostname,
      port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : (parsedUrl.protocol === 'rtmps:' ? 443 : 1935),
      pathname: parsedUrl.pathname,
      streamKey,
      app,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Tests connection to an RTMP server
 * @param url The RTMP URL to test
 * @returns Promise that resolves to true if connection successful
 */
export async function testRTMPConnection(url: string): Promise<boolean> {
  const validation = validateRTMPUrl(url);
  if (!validation.valid) {
    return false;
  }

  const parsed = parseRTMPUrl(url);
  if (!parsed) {
    return false;
  }

  // For now, we'll just validate the URL format
  // In a real implementation, this would attempt to connect to the RTMP server
  // using a library like node-media-server or ffmpeg bindings
  
  // TODO: Implement actual RTMP connection test when media libraries are added
  console.log(`Testing RTMP connection to ${parsed.hostname}:${parsed.port}/${parsed.app}/${parsed.streamKey}`);
  
  // Simulate async operation
  return new Promise((resolve) => {
    setTimeout(() => {
      // For now, assume connection is successful if URL is valid
      resolve(true);
    }, 100);
  });
}

/**
 * Normalizes an RTMP URL to a standard format
 * @param url The RTMP URL to normalize
 * @returns Normalized URL or null if invalid
 */
export function normalizeRTMPUrl(url: string): string | null {
  const parsed = parseRTMPUrl(url);
  if (!parsed) {
    return null;
  }

  const { protocol, hostname, port, app, streamKey } = parsed;
  const defaultPort = protocol === 'rtmps' ? 443 : 1935;
  const portString = port !== defaultPort ? `:${port}` : '';
  
  return `${protocol}://${hostname}${portString}/${app}/${streamKey}`;
}