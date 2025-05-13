/**
 * Change absolute links to relative links
 * @param {Array<{link: string, script: string}>} scripts - Parsed scripts
 * @returns {Array<{link: string, script: string}>} Array of mutated scripts objects with data and URL
 */

export default function replaceAbsoluteUrls(scripts) {
  const proxyPath = process.env.PROXY_PATH || "/proxy";
  const urlRegex = /(https:\/\/[^\s"'<>()[\]{}$]+)/g;

  let mutatedScripts = [];
  for (const { link, script } of scripts) {
    const content = script.replace(urlRegex, (match) => {
      const domainPath = match.replace(/^https?:\/\//, "");
      console.log(`${proxyPath}/${domainPath}`);

      return `${proxyPath}/${domainPath}`;
    });
    mutatedScripts.push({ link, script: content });
  }
  return mutatedScripts;
}
