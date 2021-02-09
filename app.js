const request = require("request");
const cheerio = require("cheerio");
const url = "https://oribos.exchange";
const puppeteer = require("puppeteer");
const readline = require("readline");

async function scrape(item, realm) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Avoiding puppeteer being detected as a robotic agent
    page.setUserAgent(
      "ozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4403.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "load" });

    // Making sure the search bar loaded (from which we will click a button)
    await page.waitForSelector(".search-bar");

    //Making sure the realms options are loaded
    await page.click("select");
    await page.waitFor(3000);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Collecting realm objects in a realms const variable
    const realms = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          "body > div.main > div.search-bar > select > option"
        )
      ).map((realm) => {
        var realmObj = {};
        realmObj.label = realm.label;
        realmObj.value = realm.value;
        return realmObj;
      });
    });

    const search = await page.$("body > div.main > div.search-bar > button");
    const tableSelector =
      "body > div.main > div.main-result > div.search-result > div.search-result-border.search-result-target > table";

    await Promise.all([
      search.click(),
      page.waitForSelector(
        "body > div.main > div.main-result > div.search-result > div.search-result-border.search-result-target > table"
      ),
    ]);

    // Collecting items IDs in const variable
    const ids = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          "body > div.main > div.main-result > div.search-result > div.search-result-border.search-result-target > table > tbody > tr > td.price > a"
        )
      ).map((item) => {
        item;
      });
    });

    console.log(ids[0]);

    // End of catch
  } catch (e) {
    console.log("My error: ", e);
  }
}

(async function main() {
  // Start Async main

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  var itemID;
  var realmID;

  rl.question("Enter item id: ", (item) => {
    itemID = item;
    rl.question("Enter realm id: ", (realm) => {
      realmID = realm;
      console.log(
        `Scraping auctions of item: ${itemID} in realm ${realmID}...`
      );
      rl.close();
      scrape(itemID, realmID);
    });
  });
})();
