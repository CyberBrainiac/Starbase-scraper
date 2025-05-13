/**
 * Extracts font files from a webpage
 * @param page - Puppeteer Page object
 * @param fontUrls - Array of font URLs to retrieve
 * @returns Promise resolving to array of font objects with data and URL
 */
const getFonts = async (page, fontUrls) => {
  const uniqueFontUrls = [...new Set(fontUrls)];

  const fontPromises = uniqueFontUrls.map(async (url) => {
    const response = await page.evaluate(async (fontUrl) => {
      try {
        const res = await fetch(fontUrl);
        if (!res.ok) return null;

        const blob = await res.blob();
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error(`Failed to fetch font: ${fontUrl}`, error);
        return null;
      }
    }, url);

    return {
      font: response,
      link: url,
      format: url.split(".").pop().toLowerCase(),
    };
  });

  const fonts = await Promise.all(fontPromises);
  return fonts.filter((font) => font.font !== null);
};

export default getFonts;
