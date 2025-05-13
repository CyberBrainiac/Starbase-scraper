import puppeteer from "puppeteer";
import links from "./links.js";
import scrapData from "./scrapData.js";
import getFonts from "./fetchData/fetchFonts.js";
import getStyles from "./fetchData/fetchStyles.js";
import getScripts from "./fetchData/fetchScripts.js";
import getImages from "./fetchData/fetchImages.js";
import replaceAbsoluteUrls from "./mutateScripts.js";

export default async function mainParseFunction(targetUrl, method = "GET") {
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
    const stylesheets = await getStyles(page, sourcesHtmlLinks.stylesheets);

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
    const images = await getImages(page, absoluteImageUrls);

    //Fetch Scripts
    const rawScripts = await getScripts(page);
    const scripts = replaceAbsoluteUrls(rawScripts);

    return { html, stylesheets, images, scripts, fonts };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  } finally {
    await browser.close();
  }
}
