// @ts-ignore
export default async function handler(req, res) {
  const { GITHUB_TOKEN, GIST_ID } = process.env;
  const GIST_API = `https://api.github.com/gists/${GIST_ID}`;
  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  };

  const readGist = async () => {
    const r = await fetch(GIST_API, { headers });
    const data = await r.json();
    const content = data.files["history.json"]?.content || "[]";
    return JSON.parse(content);
  };

  // @ts-ignore
  const writeGist = async (records) => {
    const update = await fetch(GIST_API, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        files: { "history.json": { content: JSON.stringify(records, null, 2) } },
      }),
    });
    return update.ok;
  };

  if (req.method === "GET") {
    return res.status(200).json(await readGist());
  }

  if (req.method === "POST") {
    const { url, segments, reorder } = req.body;
    if (!url) return res.status(400).json({ error: "url required" });

    const records = await readGist();
    // @ts-ignore
    const idx = records.findIndex((r) => r.url === url);

    if (idx === -1) {
      records.unshift({ url, segments: segments || [] });
    } else if (reorder) {
      const [existing] = records.splice(idx, 1);
      records.unshift({
        url,
        segments: segments !== undefined ? segments : existing.segments || [],
      });
    } else {
      records[idx] = {
        url,
        segments: segments !== undefined ? segments : records[idx].segments || [],
      };
    }

    const ok = await writeGist(records);
    if (!ok) return res.status(500).json({ error: "gist update failed" });
    return res.status(200).json(records);
  }

  if (req.method === "DELETE") {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "url required" });

    const records = await readGist();
    // @ts-ignore
    const updated = records.filter((r) => r.url !== url);

    const ok = await writeGist(updated);
    if (!ok) return res.status(500).json({ error: "gist update failed" });
    return res.status(200).json(updated);
  }

  res.setHeader("Allow", ["GET", "POST", "DELETE"]);
  res.status(405).end();
}