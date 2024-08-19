const shortid = require("shortid");
const URL = require("../models/url");
async function handleGenerateNewShortURL(req, res) {
  const body = req.body;

  if (!body.url) return res.status(400).json({ error: "URL is required" });

  const shortID = shortid.generate();
  try {
    await URL.create({
      shortId: shortID,
      redirectURL: body.url,
      visitHistory: [],
      createdBy: req.user._id,
    });
  } catch (err) {
    console.error("Error creating URL:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }

  return res.render("home", {
    id: shortID,
  });
}

async function handleGetAnalytics(req, res) {
  const shortid = req.params.shortid;
  const urlDocument = await URL.findOne({ shortId: shortid });
  return res.json({
    totalClicks: urlDocument.visitHistory.length,
    analytics: urlDocument.visitHistory,
  });
}

module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
};
