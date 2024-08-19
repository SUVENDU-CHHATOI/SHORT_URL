const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { connectToMongoDB } = require("./connect");

const URL = require("./models/url");
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRoute");
const userRoute = require('./routes/user');
const { restrictToLoggedinUserOnly, checkAuth, checkForAuthentication, restrictTo } = require("./middlewares/auth");

const app = express();
const PORT = 8001;

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
dotenv.config();
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication);

console.log('process.env.MONGODB', process.env.MONGODB)
connectToMongoDB(process.env.MONGODB ?? "mongodb://localhost:27017/short-url")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

app.get("/test", async (req, res) => {
  const allUrls = await URL.find({});

  // return res.end(`
  //     <html>
  //     <head></head>
  //     <body>
  //     <ol>
  //     ${allUrls.map(
  //       (url) =>
  //         `<li>${url.shortId} - ${url.redirectURL} - ${url.visitHistory.length}</li>`
  //     )}
  //     </ol>
  //     </body>
  //     </html>
  //   `);

  return res.render("home", { urls: allUrls });
});

// app.use("/url",restrictToLoggedinUserOnly, urlRoute);
app.use("/url", restrictTo(['NORMAL', 'ADMIN']), urlRoute);
app.use('/user', userRoute);
app.use("/",  staticRoute);
// app.use("/", checkAuth, staticRoute);

app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  console.log("inside ulr/shortId", shortId);
  const urlDocumentWithAboveShortId = await URL.findOneAndUpdate(
    {
      shortId,
    },
    { $push: { visitHistory: { timestamp: Date.now() } } },
    { new: true } // This ensures the updated document is returned
  );
  console.log("urlDocumentWithAboveShortId", urlDocumentWithAboveShortId);
  if (!urlDocumentWithAboveShortId) {
    return res.status(404).json({ error: "Short URL not found" });
  }
  res.redirect(urlDocumentWithAboveShortId.redirectURL);
});

app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));
