import * as cheerio from "cheerio";

async function html(html) {
  const $ = cheerio.load(html);

  try {
    const sourceLinks = {
      images: [],
      scripts: [],
      stylesheets: [],
      links: [],
      videos: [],
    };

    // Get image sources
    $("img").each((i, element) => {
      const src = $(element).attr("src");
      if (src) sourceLinks.images.push(src);
    });

    // Get script sources
    $("script").each((i, element) => {
      const src = $(element).attr("src");
      if (src) sourceLinks.scripts.push(src);
    });

    // Get stylesheet sources
    $('link[rel="stylesheet"]').each((i, element) => {
      const href = $(element).attr("href");
      if (href) sourceLinks.stylesheets.push(href);
    });

    // Get hyperlinks
    $("a").each((i, element) => {
      const href = $(element).attr("href");
      if (href) sourceLinks.links.push(href);
    });

    // Get video sources
    $("video source").each((i, element) => {
      const src = $(element).attr("src");
      if (src) sourceLinks.videos.push(src);
    });

    return sourceLinks;
  } catch (error) {
    console.error(`Error parsing data`, error.message);
    throw error;
  }
}

const scrapData = {
  html,
};
export default scrapData;
