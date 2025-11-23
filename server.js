import express from "express";
import dotenv from "dotenv";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

dotenv.config();
puppeteer.use(StealthPlugin());

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root test
app.get("/", (req, res) => {
  res.send("Backend Running 👍");
});

// DM sender
app.post("/submit", async (req, res) => {
  const message =
    req.body.message ||
    "🎉 Congratulations bro! She accepted 😭🔥\n\nSent automatically ❤️";

  const IG_USER = process.env.INSTAGRAM_USERNAME;
  const IG_PASS = process.env.INSTAGRAM_PASSWORD;
  const TARGET = process.env.TARGET_USER;

  if (!IG_USER || !IG_PASS || !TARGET) {
    return res.status(400).json({ ok: false, error: "Env variables missing" });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu"
      ],
      defaultViewport: { width: 1200, height: 900 }
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Login
    await page.goto("https://www.instagram.com/accounts/login/", {
      waitUntil: "networkidle2"
    });

    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', IG_USER, { delay: 80 });
    await page.type('input[name="password"]', IG_PASS, { delay: 80 });

    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    // "Not Now" popups skip
    try {
      await page.waitForTimeout(2000);
      const notNowButtons = await page.$x("//button[contains(text(),'Not Now')]");
      if (notNowButtons.length) await notNowButtons[0].click();
    } catch {}

    // Go to DM compose page
    const dmURL = `https://www.instagram.com/direct/new/?username=${TARGET}`;
    await page.goto(dmURL, { waitUntil: "networkidle2" });

    await page.waitForSelector("textarea");
    await page.type("textarea", message, { delay: 50 });

    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(2500);
    await browser.close();

    return res.json({ ok: true, sent: true });
  } catch (err) {
    console.error("DM Error:", err);
    if (browser) try { await browser.close(); } catch {}
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
