// Test streams for development and demonstration
export const TEST_STREAMS = [
  {
    name: 'Big Buck Bunny (HLS)',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    description: 'Test HLS stream - animated short film',
    type: 'hls'
  },
  {
    name: 'Tears of Steel (HLS)', 
    url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    description: 'Test HLS stream - Blender Foundation movie',
    type: 'hls'
  },
  {
    name: 'Sintel (HLS)',
    url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    description: 'Test HLS stream - Blender animated film',
    type: 'hls'
  },
  {
    name: 'Live Test Stream (HLS)',
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    description: 'Live HLS test stream',
    type: 'hls'
  }
];

export const RTMP_TRANSCODING_INFO = `
RTMP streams cannot be played directly in web browsers.
You need to transcode them to HLS format first.

Options:
1. Use an HLS stream URL (ends with .m3u8)
2. Set up a transcoding server:
   - nginx with nginx-rtmp-module
   - FFmpeg with HLS output
   - Wowza Streaming Engine
   - AWS MediaLive
   
For testing, try one of our demo HLS streams above.
`;