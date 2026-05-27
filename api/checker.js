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

    // OPEN LOGIN
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

    // WAIT
    await page.waitForTimeout(7000);

    // CHECK PAGE
    const currentHtml = await page.content();

    // GOOGLE BLOCK
    if (
      currentHtml.includes("Verify it's you") ||
      currentHtml.includes("Try again later") ||
      currentHtml.includes("challenge") ||
      currentHtml.includes("not a secure browser") ||
      currentHtml.includes("Couldn't sign you in")
    ) {

      await browser.close();

      return res.json({
        success: true,
        email,
        result: "GOOGLE_BLOCKED_AUTOMATION"
      });
    }

    // PASSWORD FIELD
    const passwordVisible =
      await page.locator(
        'input[type="password"]'
      ).count();

    if (passwordVisible === 0) {

      await browser.close();

      return res.json({
        success: true,
        email,
        result: "PASSWORD_FIELD_NOT_FOUND"
      });
    }

    // INPUT PASSWORD
    await page.fill(
      'input[type="password"]',
      password
    );

    await page.click("#passwordNext");

    // WAIT LOGIN
    await page.waitForTimeout(10000);

    // OPEN PREMIUM
    await page.goto(
      "https://www.youtube.com/premium",
      {
        waitUntil: "domcontentloaded"
      }
    );

    await page.waitForTimeout(5000);

    const html = await page.content();

    let result = "UNKNOWN";

    // TRIAL
    if (
      html.includes("Try it free") ||
      html.includes("free trial") ||
      html.includes("1 month free")
    ) {

      result = "TRIAL_AVAILABLE";

    }

    // PREMIUM ACTIVE
    else if (
      html.includes("Manage membership")
    ) {

      result = "ALREADY_PREMIUM";

    }

    // NOT ELIGIBLE
    else if (
      html.includes("Not eligible")
    ) {

      result = "NOT_ELIGIBLE";

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
