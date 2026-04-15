const express = require("express");
const cors = require("cors");
const { XMLParser } = require("fast-xml-parser");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const NITTER_INSTANCES = [
  "https://nitter.poast.org",
  "https://nitter.privacydev.net",
  "https://nitter.lunar.icu",
  "https://nitter.rawbit.ninja",
];

const FINANCE_ACCOUNTS = [
  "unusual_whales",
  "FinancialTimes",
  "Forbes",
  "WSJ",
  "business",
  "RayDalio",
  "chamath",
  "naval",
  "BehindTheMktss",
];

const WEALTH_KEYWORDS = [
  "wealth","millionaire","billionaire","invest","stock","crypto","bitcoin",
  "income","passive","financial","money","rich","market","economy","fund",
  "asset","portfolio","savings","retire","profit","revenue","growth","hedge",
  "fed","rate","inflation","recession","dividend","compound","equity",
];

function scoreText(text) {
  const lower = text.toLowerCase();
  return WEALTH_KEYWORDS.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0);
}

async function fetchNitter(account) {
  for (const instance of NITTER_INSTANCES) {
    try {
      const url = `${instance}/${account}/rss`;
      const res = await fetch(url, {
        signal: AbortSignal.timeout(6000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; WealthIntel/1.0)" },
      });
      if (!res.ok) continue;
      const xml = await res.text();

      const parser = new XMLParser({ ignoreAttributes: false });
      const result = parser.parse(xml);
      const items = result?.rss?.channel?.item || [];
      const itemArray = Array.isArray(items) ? items : [items];

      const tweets = itemArray.map((item) => ({
        id: item.link || "",
        title: item.title || "",
        description: (item.description || "").replace(/<[^>]*>/g, "").slice(0, 200),
        link: item.link || "",
        pubDate: item.pubDate || "",
        source: `@${account}`,
        platform: "x",
        score: scoreText((item.title || "") + " " + (item.description || "")),
      })).filter((t) => t.title && t.score > 0);

      if (tweets.length > 0) return tweets;
    } catch {
      continue;
    }
  }
  return [];
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/x-feed", async (req, res) => {
  try {
    const results = await Promise.allSettled(
      FINANCE_ACCOUNTS.map((account) => fetchNitter(account))
    );

    const all = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .sort((a, b) => b.score - a.score || new Date(b.pubDate) - new Date(a.pubDate));

    const unique = all.filter(
      (t, i, arr) => arr.findIndex((x) => x.title === t.title) === i
    );

    res.json({ success: true, count: unique.length, items: unique.slice(0, 40), timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/api/x-feed/:account", async (req, res) => {
  try {
    const tweets = await fetchNitter(req.params.account);
    res.json({ success: true, count: tweets.length, items: tweets });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Wealth Intel proxy running on port ${PORT}`);
});
