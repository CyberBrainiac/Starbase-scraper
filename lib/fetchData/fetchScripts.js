/**
 * Extracts font files from a webpage
 * @param page - Puppeteer Page object
 * @returns Promise resolving to array of images objects with data and URL
 */

export default async function getScripts(page) {
  //Download scripts directly from the network tab
  console.log(`Capturing requests from network tab`);
  const scriptUrls = new Set();
  const scriptContents = new Map();

  // Listen for script requests
  await page.setRequestInterception(true);

  // Listen for all requests
  page.on("request", (request) => {
    request.continue();

    // Store script URLs
    const url = request.url();
    if (
      url.endsWith(".js") ||
      url.includes("/assets/") ||
      request.resourceType() === "script"
    ) {
      scriptUrls.add(url);
    }
  });

  // Listen for responses
  page.on("response", async (response) => {
    const url = response.url();

    if (scriptUrls.has(url)) {
      try {
        const contentType = response.headers()["content-type"] || "";
        if (contentType.includes("javascript") || url.endsWith(".js")) {
          const content = await response.text();
          scriptContents.set(url, content);
        }
      } catch (error) {
        console.error(`Failed to get content for ${url}: ${error.message}`);
      }
    }
  });

  await page.reload({ waitUntil: "networkidle0" });
  await page.setRequestInterception(false);

  return [...scriptContents.entries()].map(([url, content]) => ({
    link: url,
    script: content,
  }));
}
