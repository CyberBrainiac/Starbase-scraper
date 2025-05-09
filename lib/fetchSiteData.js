import puppeteer from "puppeteer";
import links from "./links.js";
import scrapData from "./scrapData.js";

export default async function fetchData(targetUrl, method = "GET", postData) {
  console.log(`Fetching HTML from ${targetUrl} using ${method}...`);

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  try {
    await page.goto(targetUrl, { waitUntil: "networkidle2" });
    const html = await page.content();
    let imagesUrl = [];
    let fonts = [];

    //Parse HTML
    const sourcesHtmlLinks = await scrapData.html(html);
    console.log(sourcesHtmlLinks);

    const absoluteStyleUrls = links.toAbsolute(
      sourcesHtmlLinks.stylesheets,
      targetUrl
    );

    //Fetch Styles
    console.log(`Fetch CSS from ${sourcesHtmlLinks.stylesheets.toString()}`);
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

    //Parse images from CSS
    console.log(`Parse Imagies from CSS`);
    const stylesheetImgPromises = stylesheets.map(({ stylesheet, link }) => {
      return scrapData.css(stylesheet);
    });

    const stylesheetImgUrls = await Promise.all(stylesheetImgPromises);

    imagesUrl = sourcesHtmlLinks.images; //put html images to varable
    stylesheetImgUrls.forEach(
      (stylesheetImgUrl) =>
        (imagesUrl = imagesUrl.concat(stylesheetImgUrl.images))
    ); //put css images to varable

    const absoluteImageUrls = links.toAbsolute(imagesUrl, targetUrl);

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

    //Fetch Scripts
    console.log(`Fetch Scripts`);

    return { html, stylesheets, images };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  } finally {
    await browser.close();
  }
}
