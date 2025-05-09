import puppeteer from "puppeteer";
import links from "./links.js";
import scrapData from "./scrapData.js";
import axios from "axios";
import getFonts from "./fetchFonts.js";

export default async function fetchData(targetUrl, method = "GET") {
  console.log(`Fetching HTML from ${targetUrl} using ${method}...`);

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  try {
    await page.goto(targetUrl, { waitUntil: "networkidle2" });
    const html = await page.content();
    let imageUrls = [];
    let fontUrls = [];

    //Parse HTML
    const sourcesHtmlLinks = await scrapData.html(html);

    //Convert relative links to absolute
    for (const key in sourcesHtmlLinks) {
      if (Object.prototype.hasOwnProperty.call(sourcesHtmlLinks, key)) {
        const value = sourcesHtmlLinks[key];
        sourcesHtmlLinks[key] = links.toAbsolute(value, targetUrl);
      }
    }
    console.log(sourcesHtmlLinks);

    //Fetch Styles
    // console.log(`Fetch CSS from ${sourcesHtmlLinks.stylesheets.toString()}`);
    const stylesPromises = sourcesHtmlLinks.stylesheets.map(async (url) => {
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

    //Parse images from CSS
    console.log(`Parse Imagies from CSS`);
    const stylesheetImgPromises = stylesheets.map(({ stylesheet, link }) => {
      return scrapData.css(stylesheet);
    });

    const stylesheetImgUrls = await Promise.all(stylesheetImgPromises);

    imageUrls = sourcesHtmlLinks.images; //store html images
    stylesheetImgUrls.forEach((stylesheetImgUrl) => {
      imageUrls = imageUrls.concat(stylesheetImgUrl.images);
      fontUrls = fontUrls.concat(stylesheetImgUrl.fonts);
    }); //put css images to varable

    const absoluteImageUrls = links.toAbsolute(imageUrls, targetUrl);
    const absoluteFontUrls = links.toAbsolute(fontUrls, targetUrl);

    //Fetch Fonts
    console.log(`Fetch Fonts`);
    const fonts = await getFonts(page, absoluteFontUrls);

    //Fetch Images
    console.log(`Fetch Images`);
    const imagePromises = absoluteImageUrls.map(async (url) => {
      const response = await page.evaluate(async (imageUrl) => {
        const res = await fetch(imageUrl);
        if (!res.ok) return null;

        const blob = await res.blob();
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob); //convert to base64-encoded data URL for Serialization. Now i can return data back to Puppeteer script
        });
      }, url);

      return {
        image: response,
        link: url,
      };
    });

    const images = await Promise.all(imagePromises);

    //Download scripts directly from the network tab
    console.log(`Capturing network requests for scripts...`);
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

      // Check if this is a script response
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

    // Refresh the page to capture scripts
    await page.reload({ waitUntil: "networkidle0" });

    // Disable request interception
    await page.setRequestInterception(false);

    // Combine all script data
    const scripts = [...scriptContents.entries()].map(([url, content]) => ({
      link: url,
      script: content,
    }));

    return { html, stylesheets, images, scripts, fonts };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  } finally {
    await browser.close();
  }
}
