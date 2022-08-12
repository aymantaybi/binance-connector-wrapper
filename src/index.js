const { Spot } = require('@binance/connector');

const modules = require('@binance/connector/src/modules');

const APIBase = require('@binance/connector/src/APIBase');

const UserData = require('./userData');

const Locals = require('./locals');

const { formatter, updater } = require('./helpers');

class Connector {

    constructor(apiKey, apiSecret) {

        this.client = new Spot(apiKey, apiSecret);
        this.client.reconnectDelay = 0;

        this.locals = new Locals();

        this.userDataStream = {
            spot: null,
            margin: null,
            isolatedMargin: null
        };

        for (let moduleName of Object.keys(modules)) {

            let methodsName = Object.getOwnPropertyNames(modules[moduleName](APIBase).prototype);

            for (let methodName of methodsName) {
                this[methodName] = this.createCustomMethod(methodName);
            }
        }
    }

    createCustomMethod(methodName) {

        if (methodName == 'newMarginOrder') {
            return async (...args) => {
                try {
                    let response = await this.client[methodName](...args);
                    let { data } = response;
                    let order = formatter.formatNewMarginOrder(data);
                    this.locals.margin.orders = updater.updateOrders(this.locals.margin.orders, order);
                    return data;
                } catch (error) {
                    console.log(error.message);
                }
            }
        }

        if (methodName == 'cancelMarginOrder') {
            return async (...args) => {
                try {
                    let response = await this.client[methodName](...args);
                    let { data } = response;
                    let order = formatter.formatCanceledMarginOrder(data);
                    this.locals.margin.orders = updater.updateOrders(this.locals.margin.orders, order);
                    return data;
                } catch (error) {
                    console.log(error.message);
                }
            }
        }

        return async (...args) => {
            let response = await this.client[methodName](...args);
            let { data } = response;
            return data;
        }
    }

    async connect() {

        let [{ data: apiPermissions }, { data: exchangeInfo }] = await Promise.all([
            this.client.apiPermissions(),
            this.client.exchangeInfo()
        ]);

        [this.locals.apiPermissions, this.locals.exchangeInfo] = [apiPermissions, exchangeInfo];
    };

    async streamUserData(createListenKeyFunctionName, renewListenKeyFunctionName) {
        let userData = new UserData(this.client);
        await userData.open(createListenKeyFunctionName, renewListenKeyFunctionName);
        return userData;
    };

    spotUserData() {
        return this.userDataStream.spot;
    };

    marginUserData() {
        return this.userDataStream.margin;
    };

    /* async streamSpotUserData() {
        let response = await this.client.account();
        let data = response;
        let { data: { balances, updateTime } } = data;
        if (!this.locals.spot.updateTime || !this.locals.spot.balances.length) {
            this.locals.spot.updateTime = updateTime;
            this.locals.spot.balances = balances;
        }
        this.userDataStream.spot = await this.streamUserData("createListenKey", "renewListenKey");
        this.userDataStream.spot.on("executionReport", (data) => {
            this.locals.spot.orders = this.updateSpotOrders(this.locals.spot.orders, data);
        });
        this.userDataStream.spot.on("outboundAccountPosition", (data) => {
            if (data.lastAccountUpdate < this.locals.spot.updateTime) return;
            this.locals.spot.updateTime = data.lastAccountUpdate;
            this.locals.spot.balances = this.updateBalances(this.locals.spot.balances, data);
        });
        return this.spotUserData();
    } */

    async streamMarginUserData() {

        let [{ data: { userAssets } }, { data: openOrders }] = await Promise.all([
            this.client.marginAccount(),
            this.client.marginOpenOrders()
        ]);

        this.locals.margin.orders = openOrders;

        if (!this.locals.margin.updateTime || !this.locals.margin.balances.length) {
            this.locals.margin.updateTime = Date.now();
            this.locals.margin.balances = userAssets.map(userAsset => ({ asset: userAsset.asset, free: userAsset.free, locked: userAsset.locked }));
        }
        this.userDataStream.margin = await this.streamUserData("createMarginListenKey", "renewMarginListenKey");
        this.userDataStream.margin.on("executionReport", (data) => {
            let order = formatter.formatMarginOrderExecutionReport(data);
            this.locals.margin.orders = updater.updateOrders(this.locals.margin.orders, order);
        });
        this.userDataStream.margin.on("outboundAccountPosition", (data) => {
            if (data.lastAccountUpdate < this.locals.margin.updateTime) return;
            this.locals.margin.updateTime = data.lastAccountUpdate;
            this.locals.margin.balances = updater.updateBalances(this.locals.margin.balances, data);
        });

        return this.marginUserData();
    };
}

module.exports = Connector;