export default async function handler(req, res) {
  const { GITHUB_TOKEN, GIST_ID } = process.env;
  const GIST_API = `https://api.github.com/gists/${GIST_ID}`;
  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  };

  if (req.method === "GET") {
    const r = await fetch(GIST_API, { headers });
    const data = await r.json();
    const content = data.files["history.json"]?.content || "[]";
    return res.status(200).json(JSON.parse(content));
  }

  if (req.method === "POST") {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "url required" });

    const r = await fetch(GIST_API, { headers });
    const data = await r.json();
    const current = JSON.parse(data.files["history.json"]?.content || "[]");

    if (!current.includes(url)) current.unshift(url);

    const update = await fetch(GIST_API, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        files: { "history.json": { content: JSON.stringify(current, null, 2) } },
      }),
    });

    if (!update.ok) return res.status(500).json({ error: "gist update failed" });
    return res.status(200).json(current);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end();
}