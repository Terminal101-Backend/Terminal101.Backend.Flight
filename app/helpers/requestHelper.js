const IP_HEADERS = [
  'fwd',
  'Forwarded',
  'Forwarded-For',
  'X-Forwarded',
  'X-Forwarded-For',     // may contain multiple IP addresses in the format: 'client IP, proxy 1 IP, proxy 2 IP' - we use first one
  'X-Client-IP',
  'X-Real-IP',           // Nginx proxy, FastCGI
  'X-Cluster-Client-IP', // Rackspace LB, Riverbed Stingray
  'Proxy-Client-IP',
  'CF-Connecting-IP',    // Cloudflare
  'Fastly-Client-Ip',    // Fastly CDN and Firebase hosting header when forwared to a cloud function
  'True-Client-Ip',      // Akamai and Cloudflare
  'WL-Proxy-Client-IP',
  'HTTP_X_FORWARDED_FOR',
  'HTTP_X_FORWARDED',
  'HTTP_X_CLUSTER_CLIENT_IP',
  'HTTP_CLIENT_IP',
  'HTTP_FORWARDED_FOR',
  'HTTP_FORWARDED',
  'HTTP_VIA',
  'REMOTE_ADDR'

  // you can add more matching headers here ...
];

const getRequestIpAddress = request => {
  const headers = request.headers;
  for (const header of IP_HEADERS) {
    const value = headers[header];
    if (value) {
      const parts = value.split(/\s*,\s*/g);
      if (!!part[0]) {
        return parts[0];
      }
    }
  }
  const client = request.connection ?? request.socket ?? request.info;
  if (!!client && !!client.remoteAddress) {
    return client.remoteAddress;
  }
  return null;
};

module.exports = {
  getRequestIpAddress
};