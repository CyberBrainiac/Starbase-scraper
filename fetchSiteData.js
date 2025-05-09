import puppeteer from "puppeteer";

export default async function fetchData(url, method = "GET", postData) {
  console.log(`Fetching data from ${url} using ${method}...`);

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

    await page.goto(url, { waitUntil: "networkidle2" });
    const content = await page.content();
    return content;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  } finally {
    await browser.close();
  }
}
