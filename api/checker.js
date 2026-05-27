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
      args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto("https://accounts.google.com/signin");

    await page.fill('input[type="email"]', email);

    await page.click("#identifierNext");

    await page.waitForTimeout(3000);

    await page.fill('input[type="password"]', password);

    await page.click("#passwordNext");

    await page.waitForTimeout(8000);

    await page.goto("https://www.youtube.com/premium");

    await page.waitForTimeout(5000);

    const html = await page.content();

    let result = "UNKNOWN";

    if (
      html.includes("Try it free") ||
      html.includes("free trial") ||
      html.includes("1 month free")
    ) {

      result = "TRIAL_AVAILABLE";

    } else if (
      html.includes("Manage membership")
    ) {

      result = "ALREADY_PREMIUM";

    } else if (
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
