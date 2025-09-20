import { ManufacturerPattern } from '../../shared/types/discovery';

export const MANUFACTURER_PATTERNS: ManufacturerPattern[] = [
  {
    manufacturer: 'Hikvision',
    patterns: {
      userAgent: [
        'HIKVISION',
        'DS-',
        'iVMS'
      ],
      serverHeader: [
        'HIKVISION-Webs',
        'App-webs/',
        'hikvision'
      ],
      htmlKeywords: [
        'hikvision',
        'HIKVISION',
        'iVMS-4200',
        'DS-',
        'Network Camera'
      ],
      defaultPorts: [80, 554, 8000, 8080],
      rtspPaths: [
        '/h264Preview_01_main',
        '/h264Preview_01_sub',
        '/ISAPI/Streaming/channels/101/httpPreview',
        '/Streaming/Channels/101',
        '/cam1/h264'
      ],
      httpPaths: [
        '/ISAPI/System/deviceInfo',
        '/doc/page/login.asp',
        '/onvif/device_service'
      ]
    }
  },
  {
    manufacturer: 'Dahua',
    patterns: {
      userAgent: [
        'Dahua',
        'DAHUA',
        'DH-'
      ],
      serverHeader: [
        'Dahua',
        'NetSurveillance WEB'
      ],
      htmlKeywords: [
        'dahua',
        'DAHUA',
        'DH-',
        'Net Surveillance'
      ],
      defaultPorts: [80, 554, 37777],
      rtspPaths: [
        '/cam/realmonitor?channel=1&subtype=0',
        '/cam/realmonitor?channel=1&subtype=1',
        '/h264Preview_01_main',
        '/live'
      ],
      httpPaths: [
        '/cgi-bin/magicBox.cgi?action=getSystemInfo',
        '/doc/script/CrossBrowser.js'
      ]
    }
  },
  {
    manufacturer: 'Axis',
    patterns: {
      userAgent: [
        'AXIS',
        'Linux/2.6 UPnP/1.0 Axis'
      ],
      serverHeader: [
        'lighttpd',
        'Axis'
      ],
      htmlKeywords: [
        'AXIS',
        'axis',
        'Live view  - AXIS'
      ],
      defaultPorts: [80, 554],
      rtspPaths: [
        '/axis-media/media.amp',
        '/mjpg/video.mjpg',
        '/axis-cgi/mjpg/video.cgi'
      ],
      httpPaths: [
        '/axis-cgi/com/ptz.cgi?info=1',
        '/axis-cgi/admin/param.cgi?action=list'
      ]
    }
  },
  {
    manufacturer: 'Foscam',
    patterns: {
      userAgent: [
        'Foscam',
        'FOSCAM'
      ],
      serverHeader: [
        'Foscam'
      ],
      htmlKeywords: [
        'foscam',
        'FOSCAM',
        'FI8910W',
        'FI9821W'
      ],
      defaultPorts: [80, 88, 554],
      rtspPaths: [
        '/videoMain',
        '/videoSub',
        '/live.sdp'
      ],
      httpPaths: [
        '/cgi-bin/CGIProxy.fcgi',
        '/get_status.cgi'
      ]
    }
  },
  {
    manufacturer: 'Ubiquiti',
    patterns: {
      userAgent: [
        'UniFi Video',
        'airCam'
      ],
      serverHeader: [
        'nginx/ubiquiti'
      ],
      htmlKeywords: [
        'UniFi Video',
        'Ubiquiti',
        'airCam'
      ],
      defaultPorts: [80, 554, 7080, 7443],
      rtspPaths: [
        '/s0',
        '/s1',
        '/live'
      ],
      httpPaths: [
        '/api/bootstrap',
        '/api/2.0/snapshot'
      ]
    }
  },
  {
    manufacturer: 'Vivotek',
    patterns: {
      userAgent: [
        'Vivotek',
        'VIVOTEK'
      ],
      serverHeader: [
        'Vivotek-Http',
        'boa/0.94.14rc21'
      ],
      htmlKeywords: [
        'VIVOTEK',
        'vivotek',
        'Network Camera'
      ],
      defaultPorts: [80, 554],
      rtspPaths: [
        '/live.sdp',
        '/live/ch1',
        '/live/ch2'
      ],
      httpPaths: [
        '/cgi-bin/viewer/video.jpg',
        '/form/info'
      ]
    }
  },
  {
    manufacturer: 'D-Link',
    patterns: {
      userAgent: [
        'D-Link',
        'DCS-'
      ],
      serverHeader: [
        'D-Link DCS'
      ],
      htmlKeywords: [
        'D-Link',
        'DCS-',
        'Internet Camera'
      ],
      defaultPorts: [80, 554],
      rtspPaths: [
        '/live1.sdp',
        '/live2.sdp',
        '/play1.sdp'
      ],
      httpPaths: [
        '/video.cgi',
        '/image.jpg'
      ]
    }
  },
  {
    manufacturer: 'TP-Link',
    patterns: {
      userAgent: [
        'TP-LINK',
        'Tapo'
      ],
      serverHeader: [
        'TP-LINK'
      ],
      htmlKeywords: [
        'TP-LINK',
        'Tapo',
        'Kasa Cam'
      ],
      defaultPorts: [80, 554, 8080],
      rtspPaths: [
        '/stream1',
        '/stream2',
        '/live.sdp'
      ],
      httpPaths: [
        '/cgi-bin/hi3510/param.cgi',
        '/snapshot.cgi'
      ]
    }
  },
  {
    manufacturer: 'Generic ONVIF',
    patterns: {
      userAgent: [
        'gSOAP'
      ],
      serverHeader: [
        'Linux/2.6 UPnP/1.0 IpCamera/1.0'
      ],
      htmlKeywords: [
        'onvif',
        'ONVIF',
        'IP Camera',
        'Network Camera'
      ],
      defaultPorts: [80, 554, 8080, 3702],
      rtspPaths: [
        '/onvif1',
        '/onvif2',
        '/MediaInput/h264',
        '/profile1/media.smp'
      ],
      httpPaths: [
        '/onvif/device_service',
        '/onvif/media_service',
        '/cgi-bin/hi3510/snap.cgi'
      ]
    }
  }
];

export function identifyManufacturer(
  userAgent?: string,
  serverHeader?: string,
  htmlContent?: string,
  port?: number
): string | null {
  for (const pattern of MANUFACTURER_PATTERNS) {
    let score = 0;
    let maxScore = 0;

    // Check user agent
    if (pattern.patterns.userAgent && userAgent) {
      maxScore++;
      for (const ua of pattern.patterns.userAgent) {
        if (userAgent.toLowerCase().includes(ua.toLowerCase())) {
          score++;
          break;
        }
      }
    }

    // Check server header
    if (pattern.patterns.serverHeader && serverHeader) {
      maxScore++;
      for (const server of pattern.patterns.serverHeader) {
        if (serverHeader.toLowerCase().includes(server.toLowerCase())) {
          score++;
          break;
        }
      }
    }

    // Check HTML content
    if (pattern.patterns.htmlKeywords && htmlContent) {
      maxScore++;
      for (const keyword of pattern.patterns.htmlKeywords) {
        if (htmlContent.toLowerCase().includes(keyword.toLowerCase())) {
          score++;
          break;
        }
      }
    }

    // Check default ports
    if (pattern.patterns.defaultPorts && port) {
      maxScore++;
      if (pattern.patterns.defaultPorts.includes(port)) {
        score++;
      }
    }

    // If we have a good match (50% or more criteria met)
    if (maxScore > 0 && score / maxScore >= 0.5) {
      return pattern.manufacturer;
    }
  }

  return null;
}

export function getStreamPaths(manufacturer: string): { rtsp: string[], http: string[] } {
  const pattern = MANUFACTURER_PATTERNS.find(p => 
    p.manufacturer.toLowerCase() === manufacturer.toLowerCase()
  );
  
  if (pattern) {
    return {
      rtsp: pattern.patterns.rtspPaths || [],
      http: pattern.patterns.httpPaths || []
    };
  }

  // Return generic paths if manufacturer not found
  return {
    rtsp: ['/stream1', '/live', '/h264Preview_01_main', '/cam/realmonitor?channel=1&subtype=0'],
    http: ['/video.cgi', '/snapshot.cgi', '/axis-cgi/mjpg/video.cgi', '/cgi-bin/hi3510/snap.cgi']
  };
}

export function getDefaultPorts(manufacturer: string): number[] {
  const pattern = MANUFACTURER_PATTERNS.find(p => 
    p.manufacturer.toLowerCase() === manufacturer.toLowerCase()
  );
  
  return pattern?.patterns.defaultPorts || [80, 554, 8080];
}