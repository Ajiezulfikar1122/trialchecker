const { chromium } = require("playwright");

module.exports = async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email dan password wajib diisi"
    });
  }

  let browser;

  try {

    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled"
      ]
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      viewport: {
        width: 1366,
        height: 768
      }
    });

    const page = await context.newPage();

    // BUKA LOGIN
    await page.goto(
      "https://accounts.google.com/signin/v2/identifier",
      {
        waitUntil: "domcontentloaded"
      }
    );

    // INPUT EMAIL
    await page.waitForSelector('input[type="email"]');

    await page.fill(
      'input[type="email"]',
      email
    );

    await page.click("#identifierNext");

    // TUNGGU HALAMAN PASSWORD
    await page.waitForTimeout(5000);

    // AMBIL PASSWORD FIELD YANG VISIBLE
    const passwordInput =
      page.locator('input[type="password"]:visible');

    await passwordInput.waitFor({
      timeout: 30000
    });

    await passwordInput.fill(password);

    // LOGIN
    await page.click("#passwordNext");

    // TUNGGU LOGIN
    await page.waitForTimeout(10000);

    // BUKA YOUTUBE PREMIUM
    await page.goto(
      "https://www.youtube.com/premium",
      {
        waitUntil: "domcontentloaded"
      }
    );

    await page.waitForTimeout(5000);

    const html = await page.content();

    let result = "UNKNOWN";

    // CEK TRIAL
    if (
      html.includes("Try it free") ||
      html.includes("free trial") ||
      html.includes("1 month free")
    ) {

      result = "TRIAL_AVAILABLE";

    }

    // SUDAH PREMIUM
    else if (
      html.includes("Manage membership")
    ) {

      result = "ALREADY_PREMIUM";

    }

    // TIDAK ELIGIBLE
    else if (
      html.includes("Not eligible")
    ) {

      result = "NOT_ELIGIBLE";

    }

    // CAPTCHA / VERIFY
    else if (
      html.includes("Verify it's you") ||
      html.includes("challenge") ||
      html.includes("captcha")
    ) {

      result = "GOOGLE_VERIFICATION_REQUIRED";

    }

    await browser.close();

    return res.json({
      success: true,
      email,
      result
    });

  } catch (err) {

    if (browser) {
      await browser.close();
    }

    return res.json({
      success: false,
      error: err.message
    });
  }

};
