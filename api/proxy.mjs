export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const url = req.query.url;

  if (!url) {
    res.status(400).send("NOPE!");
    return;
  }

  try {
    const response = await fetch(url);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.status(response.status);
    response.body.pipeTo(
      new WritableStream({
        write(chunk) {
          res.write(Buffer.from(chunk));
        },
        close() {
          res.end();
        },
      })
    );
  } catch (err) {
    res.status(500).send(err.message);
  }
}
