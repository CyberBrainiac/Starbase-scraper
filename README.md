# starbase-scraper

A Node.js web scraping tool that uses Puppeteer, Cheerio to parse and extract data from websites.

## Features

- Headless browser automation with Puppeteer
- HTML parsing with Cheerio
  
## Installation

```bash
git clone https://github.com/your-username/starbase-scraper.git
cd starbase-scraper
npm install
```

## Start the scraper

```bash
npm start
```

## Serve parsed output using PROXY
```bash
git clone https://github.com/CyberBrainiac/Starbase-proxy.git
cd starbase-proxy
npm install
```
- copy "parsed-site" folder from starbase-scraper to root of starbase-proxy directory
- starbase-proxy using command ``` npm run start ```
- open browser url: http://localhost:3001/
  
## Dependencies
- cheerio
- dotenv
- puppeteer
- http-server (dev)
