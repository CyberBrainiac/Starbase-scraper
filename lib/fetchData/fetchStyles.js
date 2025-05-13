/**
 * Extracts font files from a webpage
 * @param page - Puppeteer Page object
 * @param {Array<string>} stylesheetLinks - Array of style URLs to retrieve
 * @returns Promise resolving to array of style objects with data and URL
 */

export default async function getStyles(page, stylesheetLinks) {
  const stylesPromises = stylesheetLinks.map(async (url) => {
    const response = await page.evaluate(async (styleUrl) => {
      const res = await fetch(styleUrl);
      return res.ok ? await res.text() : null;
    }, url);

    return {
      stylesheet: response,
      link: url,
    };
  });

  return await Promise.all(stylesPromises);
}
