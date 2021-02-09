const puppeteer = require("puppeteer");
const readline = require("readline");

async function scrape(item, realm) {
  const itemID = item;
  const realmID = realm;
  const auctionsURL = "https://oribos.exchange";
  const itemURL = "https://www.wowhead.com/item=" + itemID;

  try {
    // Start of try block

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Avoiding puppeteer being detected as a robotic agent
    page.setUserAgent(
      "ozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4403.0 Safari/537.36"
    );

    // Hitting the item URL with the obtained itemID to scrape itemName
    await page.goto(itemURL, { waitUntil: "load" });

    // Making sure the item name element exists
    await page.waitForSelector("#main-contents > div > h1.heading-size-1");

    // Scraping the item name and storing it in itemName to be used later
    var itemElement = await page.$("#main-contents > div > h1.heading-size-1");
    var itemName = await (
      await itemElement.getProperty("innerText")
    ).jsonValue();

    itemName = itemName.toString();

    // Hitting the auctions page URL
    await page.goto(auctionsURL, { waitUntil: "load" });

    // Making sure the search button loaded
    await page.waitForSelector("body > div.main > div.search-bar > button");
    // Capturing the search button elementHandle
    const searchButton = await page.$(
      "body > div.main > div.search-bar > button"
    );

    // Making sure the search bar loaded
    await page.waitForSelector(
      "body > div.main > div.search-bar > div.text-container > input[type=text]"
    );
    // Capturing the search bar elementHandle
    const searchBar = await page.$(
      "body > div.main > div.search-bar > div.text-container > input[type=text]"
    );

    // Making sure the realms options are loaded
    await page.click("select");
    await page.waitForTimeout(3000);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Selecting the realm based on realmID input
    await page.select("select", realmID);

    // Focus on the search box to type
    await page.focus(
      "body > div.main > div.search-bar > div.text-container > input[type=text]"
    );

    // Type the item name in search box
    await page.keyboard.type(itemName);

    // click search to list the auctions for that item in the specified realm
    await searchButton.click();

    await page.waitForSelector(
      "body > div.main > div.main-result > div.search-result > div.search-result-border.search-result-target > table > tbody > tr > td.price"
    );

    const rows = await page.$$(
      "body > div.main > div.main-result > div.search-result > div.search-result-border.search-result-target > table > tbody > tr"
    );

    console.log("Current auctions in the realm for the item: \n");

    const message = await page.$$(
      "body > div.main > div.main-result > div.search-result > div.search-result-border.search-result-target > table > tbody > tr"
    );

    if (rows.length == 0) {
      console.log("No items found");
    } else {
      for (const row of rows) {
        const gold = await row.$eval("span.gold", (span) => span.innerText);
        const silver = await row.$eval(
          "span.silver",
          (span) => span.innerText || 0
        );
        const name = await row.$eval("span.q1", (span) => span.innerText);
        const quantity = await row.$eval(
          "td.quantity",
          (cell) => cell.innerText
        );

        console.log(
          `Name: ${name}` + " | ",
          `Gold: ${gold}` + " | ",
          `Silver: ${silver}` + " | ",
          `Quantity: ${quantity}`
        );
      }
    }

    console.log("\nEnd of Scraping.");

    // End of try block
  } catch (e) {
    if (e.name === "TimeoutError")
      console.log("My error: ", "Invalid item ID or realm ID");
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
      console.log(`Scraping auctions of item ${itemID} in realm ${realmID}...`);
      rl.close();
      scrape(itemID, realmID);
    });
  });
})();
