const IP_HEADERS = [
  'FWD',
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
  // const headers = request.headers;
  for (const header of IP_HEADERS) {
    const value = request.header(header);
    if (value) {
      const parts = value.split(/\s*,\s*/g);
      if (!!parts[0]) {
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

const extendTimeoutMiddleware = (req, res, next) => {
  const space = ' ';
  let isFinished = false;
  let isDataSent = false;

  // Only extend the timeout for API requests
  if (!req.url.includes('/api')) {
    next();
    return;
  }

  res.once('finish', () => {
    isFinished = true;
  });

  res.once('end', () => {
    isFinished = true;
  });

  res.once('close', () => {
    isFinished = true;
  });

  res.on('data', (data) => {
    // Look for something other than our blank space to indicate that real
    // data is now being sent back to the client.
    if (data !== space) {
      isDataSent = true;
    }
  });

  const waitAndSend = () => {
    setTimeout(() => {
      // If the response hasn't finished and hasn't sent any data back....
      if (!isFinished && !isDataSent) {
        // Need to write the status code/headers if they haven't been sent yet.
        if (!res.headersSent) {
          res.writeHead(202);
        }

        res.write(space);

        // Wait another 15 seconds
        waitAndSend();
      }
    }, 15000);
  };

  waitAndSend();
  next();
};

module.exports = {
  getRequestIpAddress,
  extendTimeoutMiddleware,
};