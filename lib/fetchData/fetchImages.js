/**
 * Extracts font files from a webpage
 * @param page - Puppeteer Page object
 * @param {Array<string>} absoluteImageUrls - Array of image URLs to retrieve
 * @returns Promise resolving to array of images objects with data and URL
 */

export default async function getImages(page, absoluteImageUrls) {
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

  return await Promise.all(imagePromises);
}
