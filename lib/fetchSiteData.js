import puppeteer from "puppeteer";
import links from "./links.js";
import scrapData from "./scrapData.js";

export default async function fetchData(targetUrl, method = "GET", postData) {
  console.log(`Fetching data from ${targetUrl} using ${method}...`);

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  try {
    if (method === "POST") {
      await page.setRequestInterception(true);
      page.once("request", (req) => {
        req.continue({
          method: "POST",
          postData: JSON.stringify(postData),
          headers: {
            ...req.headers(),
            "Content-Type": "application/json",
          },
        });
      });
    }

    await page.goto(targetUrl, { waitUntil: "networkidle2" });
    const html = await page.content();

    const sourcesHtmlLinks = await scrapData.html(html);

    //Get Styles
    const absoluteStyleUrls = links.toAbsolute(
      sourcesHtmlLinks.stylesheets,
      targetUrl
    );

    const stylesPromises = absoluteStyleUrls.map(async (url) => {
      const response = await page.evaluate(async (styleUrl) => {
        const res = await fetch(styleUrl);
        return res.ok ? await res.text() : null;
      }, url);

      return {
        stylesheet: response,
        link: url,
      };
    });

    const stylesheets = await Promise.all(stylesPromises);

    return { html, stylesheets };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  } finally {
    await browser.close();
  }
}
