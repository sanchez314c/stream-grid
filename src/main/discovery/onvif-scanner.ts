import * as dgram from 'dgram';
import { parseString } from 'xml2js';
import { DiscoveredCamera, CameraProtocol, CameraCapabilities } from '../../shared/types/discovery';

interface ONVIFDevice {
  address: string;
  port: number;
  scopes: string[];
  xaddrs: string[];
}

export class ONVIFScanner {
  private readonly MULTICAST_ADDRESS = '239.255.255.250';
  private readonly MULTICAST_PORT = 3702;
  private readonly DISCOVERY_TIMEOUT = 5000;

  async discover(): Promise<DiscoveredCamera[]> {
    return new Promise((resolve, reject) => {
      const devices = new Map<string, ONVIFDevice>();
      const socket = dgram.createSocket('udp4');
      
      const probeMessage = this.createProbeMessage();
      
      socket.bind(() => {
        socket.setBroadcast(true);
        socket.setMulticastTTL(128);
        
        // Send discovery probe
        socket.send(probeMessage, this.MULTICAST_PORT, this.MULTICAST_ADDRESS, (err) => {
          if (err) {
            socket.close();
            reject(err);
            return;
          }
        });
      });

      socket.on('message', (msg, rinfo) => {
        try {
          const message = msg.toString();
          if (message.includes('ProbeMatches')) {
            this.parseProbeResponse(message, rinfo.address).then(device => {
              if (device) {
                devices.set(`${device.address}:${device.port}`, device);
              }
            }).catch(console.error);
          }
        } catch (error) {
          console.error('Error parsing ONVIF response:', error);
        }
      });

      socket.on('error', (err) => {
        console.error('ONVIF discovery socket error:', err);
        socket.close();
        reject(err);
      });

      // Stop discovery after timeout
      setTimeout(async () => {
        socket.close();
        
        // Convert discovered devices to camera objects
        const cameras: DiscoveredCamera[] = [];
        for (const device of devices.values()) {
          try {
            const camera = await this.deviceToCamera(device);
            if (camera) {
              cameras.push(camera);
            }
          } catch (error) {
            console.error('Error converting ONVIF device to camera:', error);
          }
        }
        
        resolve(cameras);
      }, this.DISCOVERY_TIMEOUT);
    });
  }

  private createProbeMessage(): Buffer {
    const messageId = this.generateUUID();
    const probe = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope 
  xmlns:soap="http://www.w3.org/2003/05/soap-envelope" 
  xmlns:wsa="http://www.w3.org/2005/08/addressing" 
  xmlns:wsdd="http://docs.oasis-open.org/ws-dd/ns/discovery/2009/01">
  <soap:Header>
    <wsa:Action>http://docs.oasis-open.org/ws-dd/ns/discovery/2009/01/Probe</wsa:Action>
    <wsa:MessageID>uuid:${messageId}</wsa:MessageID>
    <wsa:ReplyTo>
      <wsa:Address>http://www.w3.org/2005/08/addressing/anonymous</wsa:Address>
    </wsa:ReplyTo>
    <wsa:To>urn:docs-oasis-open-org:ws-dd:ns:discovery:2009:01</wsa:To>
  </soap:Header>
  <soap:Body>
    <wsdd:Probe>
      <wsdd:Types>tds:Device</wsdd:Types>
    </wsdd:Probe>
  </soap:Body>
</soap:Envelope>`;
    
    return Buffer.from(probe);
  }

  private async parseProbeResponse(response: string, sourceAddress: string): Promise<ONVIFDevice | null> {
    return new Promise((resolve) => {
      parseString(response, (err, result) => {
        if (err) {
          resolve(null);
          return;
        }

        try {
          const envelope = result?.['soap:Envelope'] || result?.Envelope;
          if (!envelope) {
            resolve(null);
            return;
          }

          const body = envelope['soap:Body']?.[0] || envelope.Body?.[0];
          const probeMatches = body?.ProbeMatches?.[0] || body?.['wsdd:ProbeMatches']?.[0];
          
          if (!probeMatches || !probeMatches.ProbeMatch) {
            resolve(null);
            return;
          }

          const match = probeMatches.ProbeMatch[0];
          const xaddrs = match.XAddrs?.[0]?.split(' ') || [];
          const scopes = match.Scopes?.[0]?.split(' ') || [];

          // Extract port from XAddrs
          let port = 80;
          if (xaddrs.length > 0) {
            const urlMatch = xaddrs[0].match(/:(\d+)/);
            if (urlMatch) {
              port = parseInt(urlMatch[1]);
            }
          }

          resolve({
            address: sourceAddress,
            port,
            scopes,
            xaddrs
          });
        } catch (error) {
          console.error('Error parsing ONVIF probe response:', error);
          resolve(null);
        }
      });
    });
  }

  private async deviceToCamera(device: ONVIFDevice): Promise<DiscoveredCamera | null> {
    try {
      // Extract device info from scopes
      let manufacturer = '';
      let model = '';
      let name = '';

      for (const scope of device.scopes) {
        const lowerScope = scope.toLowerCase();
        
        if (lowerScope.includes('hardware/')) {
          const parts = scope.split('/');
          const hwIndex = parts.findIndex(p => p.toLowerCase() === 'hardware');
          if (hwIndex >= 0 && hwIndex < parts.length - 1) {
            manufacturer = parts[hwIndex + 1];
          }
        }
        
        if (lowerScope.includes('name/')) {
          const parts = scope.split('/');
          const nameIndex = parts.findIndex(p => p.toLowerCase() === 'name');
          if (nameIndex >= 0 && nameIndex < parts.length - 1) {
            name = decodeURIComponent(parts[nameIndex + 1]);
          }
        }
        
        if (lowerScope.includes('type/')) {
          const parts = scope.split('/');
          const typeIndex = parts.findIndex(p => p.toLowerCase() === 'type');
          if (typeIndex >= 0 && typeIndex < parts.length - 1) {
            model = parts[typeIndex + 1];
          }
        }
      }

      // Try to get stream URL from device
      const streamUrl = await this.getStreamUrl(device);
      
      const capabilities: CameraCapabilities = {
        videoFormats: ['H.264', 'H.265'],
        audioSupport: true,
        panTiltZoom: true,
        nightVision: false,
        motionDetection: true,
        maxResolution: '1080p'
      };

      return {
        id: `${device.address}:${device.port}`,
        ip: device.address,
        port: device.port,
        protocol: CameraProtocol.ONVIF,
        manufacturer: manufacturer || 'Unknown',
        model: model || undefined,
        name: name || undefined,
        streamUrl: streamUrl || `rtsp://${device.address}:554/stream1`,
        capabilities
      };
    } catch (error) {
      console.error('Error creating camera from ONVIF device:', error);
      return null;
    }
  }

  private async getStreamUrl(device: ONVIFDevice): Promise<string | null> {
    // This would require implementing full ONVIF GetStreamUri request
    // For now, we'll return a common RTSP URL format
    
    // Check if device has RTSP capability from xaddrs
    for (const xaddr of device.xaddrs) {
      if (xaddr.includes(':554')) {
        return `rtsp://${device.address}:554/onvif1`;
      }
    }
    
    // Default RTSP stream
    return `rtsp://${device.address}:554/stream1`;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}