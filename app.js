 const request = require("request");
const cheerio = require("cheerio");
const url = "https://oribos.exchange";

request(url, function (error, response, body) {
  if (!error) {
    const $ = cheerio.load(body);
    const data = $.html();
    console.log(data);
  } else {
    console.log("We’ve encountered an error: " + error);
  }
});
 