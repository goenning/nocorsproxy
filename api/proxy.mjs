import http from 'http';
import https from 'https';

export const runtime = 'nodejs';

export default function handler(req, res) {
  const origin = req.headers.origin || req.headers.referer || "";
  const isAllowed = 
    origin.includes('localhost') || 
    origin.includes('127.0.0.1') || 
    origin.includes('seogets.com') ||
    origin.includes('chrome-extension://pejnpfcinnpmlbicfekhhcmolijdchdi') || 
    origin.includes('chrome-extension://hinjpjakcljiacadiaigbipnnhhhpgmm')
  
  if (!isAllowed) {
    res.status(403).send("Forbidden");
    return;
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const targetUrl = req.query.url;
  const isHttps = targetUrl.startsWith('https:');

  if (!targetUrl) {
    res.status(400).send("NOPE!");
    return;
  }

  const proxyReq = (isHttps ? https : http).request(targetUrl, {
    method: "GET",
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(502);
    res.end('Bad gateway');
  });

  req.pipe(proxyReq, { end: true });
}
