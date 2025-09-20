# StreamGRID Streaming Guide

## Quick Start

StreamGRID supports **HLS streams** (.m3u8 files) for direct browser playback. RTMP streams require server-side transcoding to HLS format.

## Supported Stream Types

### ✅ Working Stream Formats
- **HLS Streams** - URLs ending in `.m3u8`
- **HTTP Video Files** - Direct MP4/WebM files over HTTP/HTTPS

### ⚠️ Requires Transcoding
- **RTMP/RTMPS Streams** - Cannot play directly, needs server-side conversion to HLS

## Test Streams

Use these working HLS streams to test the application:

1. **Big Buck Bunny**
   - URL: `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`
   - Type: HLS Test Stream
   
2. **Tears of Steel**  
   - URL: `https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8`
   - Type: HLS Movie Stream

3. **Sintel**
   - URL: `https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8`
   - Type: HLS Animated Film

## How to Add a Stream

1. Click "Add Stream" button
2. Enter an HLS stream URL (must end with `.m3u8`)
3. Give it a label (e.g., "Test Stream 1")
4. Click "Add Stream"

The app provides quick test stream buttons in the Add Stream dialog for easy testing.

## RTMP to HLS Transcoding

If you have RTMP streams, you need to transcode them to HLS first:

### Option 1: nginx-rtmp-module
```nginx
application live {
    live on;
    hls on;
    hls_path /tmp/hls;
    hls_fragment 3;
    hls_playlist_length 60;
}
```

### Option 2: FFmpeg
```bash
ffmpeg -i rtmp://source/live/stream \
  -c:v libx264 -c:a aac \
  -f hls -hls_time 6 -hls_list_size 10 \
  output.m3u8
```

### Option 3: Cloud Services
- AWS MediaLive
- Wowza Streaming Cloud
- Mux Video
- Cloudflare Stream

## Troubleshooting

### Stream Won't Play
1. **Check URL Format** - Must be HTTPS and end with `.m3u8`
2. **CORS Issues** - Stream server must allow cross-origin requests
3. **Network** - Ensure firewall allows HTTPS traffic
4. **Console** - Check browser console for specific errors

### Performance Issues
- Limit to 4-6 simultaneous streams for optimal performance
- Enable hardware acceleration in settings
- Close unused streams to free resources

### Error Messages

- **"RTMP streams require transcoding"** - Use an HLS URL instead
- **"HLS not supported"** - Update your browser
- **"Failed to load stream"** - Check network connection and URL validity
- **"CORS policy blocked"** - Stream server doesn't allow browser access

## Best Practices

1. **Use HTTPS streams** when possible for better security
2. **Test with known working streams** first (use the test streams above)
3. **Monitor CPU/memory usage** with multiple streams
4. **Close unused streams** to conserve resources
5. **Use appropriate grid layouts** based on stream count

## Stream URL Examples

### ✅ Correct URLs
```
https://example.com/live/stream.m3u8
https://cdn.example.com/hls/channel1.m3u8
https://streaming.server.com/live/camera1/index.m3u8
```

### ❌ Won't Work Directly
```
rtmp://example.com/live/stream
rtmps://example.com:443/live/stream
rtsp://192.168.1.100/stream1
```

## Need Help?

1. Try the test streams first to verify the app is working
2. Check browser console (F12) for detailed error messages
3. Ensure your stream is HLS format (.m3u8)
4. Verify network connectivity to the stream server