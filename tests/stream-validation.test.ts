import { describe, it, expect } from 'vitest';
import { validateRTMPUrl } from '../main/ipc/rtmp-validator';

describe('RTMP URL Validation', () => {
  it('should validate correct RTMP URLs', async () => {
    const result = await validateRTMPUrl('rtmp://example.com/live/stream1');
    expect(result.valid).toBe(true);
    expect(result.metadata).toBeDefined();
  });

  it('should reject invalid protocols', async () => {
    const result = await validateRTMPUrl('http://example.com/stream');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('URL must use RTMP or RTMPS protocol');
  });

  it('should reject URLs without hostname', async () => {
    const result = await validateRTMPUrl('rtmp:///stream');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('URL must include a hostname');
  });

  it('should reject URLs without stream path', async () => {
    const result = await validateRTMPUrl('rtmp://example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('URL must include a stream path/key');
  });

  it('should handle malformed URLs', async () => {
    const result = await validateRTMPUrl('not-a-url');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid URL format');
  });

  it('should accept RTMPS protocol', async () => {
    const result = await validateRTMPUrl('rtmps://secure.example.com/live/stream');
    expect(result.valid).toBe(true);
  });
});