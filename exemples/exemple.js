require("dotenv").config({ path: "../.env" });

const Connector = require("../src");

const { apiKey, apiSecret } = process.env;

const binanceClient = new Connector(apiKey, apiSecret);

(async () => {

    await binanceClient.connect();

    console.log(binanceClient.locals.exchangeInfo);

    binanceClient.locals.margin.openOrders()

    await binanceClient.streamMarginUserData();

    binanceClient.bookTickerWS('SLPETH', {
        open: () => console.log('bookTicker open !'),
        close: () => console.log('bookTicker closed !'),
        message: (data) => {

            let json = JSON.parse(data);
            let { u: updateId, s: symbol, b: bidPrice, B: bidQuantity, a: askPrice, A: askQuantity } = json;
            let bookTicker = { updateId, symbol, bidPrice, bidQuantity, askPrice, askQuantity };

            console.log(bookTicker);
        }
    });

    binanceClient.marginUserData().on("executionReport", (data) => {
        console.log(binanceClient.locals.margin.openOrders('SLPETH'));
    });

    binanceClient.marginUserData().on("outboundAccountPosition", () => {
        console.log(binanceClient.locals.margin.balance('SLP'));
    });

})();