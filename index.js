const axios = require('axios');
const cheerio = require('cheerio');

async function fetchData() {
  try {
    // Make HTTP request to a website
    const response = await axios.get('https://example.com');
    
    // Load HTML content into cheerio
    const $ = cheerio.load(response.data);
    
    // Extract page title
    const pageTitle = $('title').text();
    console.log('Page Title:', pageTitle);
    
    // Extract all paragraph texts
    const paragraphs = [];
    $('p').each((index, element) => {
      paragraphs.push($(element).text());
    });
    console.log('Paragraphs:', paragraphs);
    
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Run the function
fetchData();