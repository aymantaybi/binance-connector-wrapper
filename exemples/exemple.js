require("dotenv").config({ path: "../.env" });

const Connector = require("../src");

const { apiKey, apiSecret } = process.env;

const client = new Connector(apiKey, apiSecret);

const formatter = require('../src/helpers/formatter');

(async () => {

    await client.connect();

    console.log(client.locals.exchangeInfo)

    await client.streamMarginUserData();

    client.marginUserData().on("executionReport", (data) => {
        console.log(client.locals.margin.openOrders('SLPETH'));
    });

    client.marginUserData().on("outboundAccountPosition", () => {
        console.log(client.locals.margin.balance('SLP'));
    });

    client.marginUserData().on("open", async () => {

        let symbol = 'SLPETH';
        let side = 'SELL';
        let type = 'LIMIT';

        let options = {
            quantity: '2000',
            price: '0.00000268',
            timeInForce: 'GTC'
        };

        var order = await client.newMarginOrder(symbol, side, type, options);

        //console.log(order);

    });

})();