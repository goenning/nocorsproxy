import http from 'http';
import https from 'https';

export default function handler(req, res) {
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

  const proxyReq = (isHttps ? https : http).request({
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
