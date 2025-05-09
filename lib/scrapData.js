import * as cheerio from "cheerio";
import postcss from "postcss";
import valueParser from "postcss-value-parser";

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

    // Get modulepreload script links
    $('link[rel="modulepreload"]').each((i, element) => {
      const href = $(element).attr("href");
      if (href) sourceLinks.scripts.push(href);
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

async function css(cssContent) {
  try {
    const sourceLinks = {
      images: [],
      fonts: [],
      imports: [],
    };

    // Parse CSS
    const result = await postcss([]).process(cssContent, { from: undefined });
    const root = result.root;

    // Process @import rules
    root.walkAtRules("import", (rule) => {
      const params = valueParser(rule.params);

      params.walk((node) => {
        if (node.type === "string" || node.type === "word") {
          sourceLinks.imports.push(node.value);
        }
      });
    });

    // Process url() functions in declarations
    root.walkDecls((decl) => {
      const parsed = valueParser(decl.value);

      parsed.walk((node) => {
        if (node.type === "function" && node.value === "url") {
          const url = node.nodes[0]?.value;
          if (url) {
            // Clean URL - remove quotes if present
            const cleanUrl = url.replace(/^['"]|['"]$/g, "");

            // Categorize URL based on property or file extension
            if (
              decl.prop.includes("background") ||
              /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(cleanUrl)
            ) {
              sourceLinks.images.push(cleanUrl);
            } else if (
              decl.prop.includes("font") ||
              /\.(woff|woff2|ttf|eot|otf)$/i.test(cleanUrl)
            ) {
              sourceLinks.fonts.push(cleanUrl);
            }
          }
        }
      });
    });

    // Process @font-face rules
    root.walkAtRules("font-face", (rule) => {
      rule.walkDecls("src", (decl) => {
        const parsed = valueParser(decl.value);

        parsed.walk((node) => {
          if (node.type === "function" && node.value === "url") {
            const url = node.nodes[0]?.value;
            if (url) {
              sourceLinks.fonts.push(url.replace(/^['"]|['"]$/g, ""));
            }
          }
        });
      });
    });

    return sourceLinks;
  } catch (error) {
    console.error(`Error parsing CSS data`, error.message);
    throw error;
  }
}

const scrapData = {
  html,
  css,
};
export default scrapData;
