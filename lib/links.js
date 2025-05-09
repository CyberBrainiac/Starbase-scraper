import path from "path";

/**
 * @param {Array<string>} links - Array of links
 * @param {string} baseUrl - The base URL of the page
 * @returns {Array<string>} - Array of absolute links
 */
function toAbsolute(links, baseUrl) {
  // Convert relative URLs to absolute URLs

  const absoluteUrls = links.map((link) => {
    if (link.startsWith("http://") || link.startsWith("https://")) {
      return link;
    } else if (link.startsWith("//")) {
      // Protocol-relative URL
      return `https:${link}`;
    } else if (link.startsWith("/")) {
      // Root-relative URL
      const url = new URL(baseUrl);
      return `${url.protocol}//${url.host}${link}`;
    } else {
      // Relative URL
      return new URL(link, baseUrl).href;
    }
  });
  return absoluteUrls;
}

/**
 * @param {string} link - Array of links
 * @param {string} baseUrl - The base URL of the page
 * @returns {{path: string, name: string}} - Array with path and name link properties
 */
function getPathAndName(link, baseUrl) {
  const protocolStrIndxEnd = link.indexOf("//") + 2;
  const domenIndexEnd = link.indexOf("/", protocolStrIndxEnd);
  const fileNameIndex = link.lastIndexOf("/");
  const filePath = link.slice(domenIndexEnd, fileNameIndex);
  const filePathAbsolute = path.join(baseUrl, filePath);
  const fileName = link.slice(fileNameIndex + 1);

  return { path: filePathAbsolute, name: fileName };
}

const links = {
  toAbsolute,
  getPathAndName,
};
export default links;
