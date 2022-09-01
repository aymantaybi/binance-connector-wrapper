const events = require('events');

class UserData {

    constructor(client) {

        this.client = client;

        this.eventEmitter = new events.EventEmitter();

        this.callbacks = {
            open: () => this.eventEmitter.emit("open"),
            close: () => this.eventEmitter.emit("close"),
            message: (data) => {
                let json = JSON.parse(data);
                let message = formatEvent(json);
                message && this.eventEmitter.emit(message.eventType, message);
            }
        };

    }

    async open(createListenKeyFunctionName, renewListenKeyFunctionName) {

        let { data: { listenKey } } = await this.client[createListenKeyFunctionName]();

        console.log(`Listen key created ${listenKey}`);

        this.wsRef = this.client.userData(listenKey, this.callbacks);

        this.intervalId = setInterval(() => {
            this.client[renewListenKeyFunctionName](listenKey).catch((error) => {
                console.log(error);
                this.close();
                this.open(createListenKeyFunctionName, renewListenKeyFunctionName);
            });
        }, 30 * 60 * 1000);

    };

    close() {
        clearInterval(this.intervalId);
        this.client.unsubscribe(this.wsRef);
    }

    on(eventName, listener) {
        this.eventEmitter.on(eventName, listener);
    }

    off(eventName, listener) {
        this.eventEmitter.off(eventName, listener);
    }

}

function formatEvent(data) {

    var event = {
        "executionReport": (message) => ({
            eventType: message.e,
            eventTime: message.E,
            symbol: message.s,
            newClientOrderId: message.c,
            originalClientOrderId: message.C,
            side: message.S,
            orderType: message.o,
            timeInForce: message.f,
            quantity: message.q,
            price: message.p,
            executionType: message.x,
            stopPrice: message.P,
            icebergQuantity: message.F,
            orderStatus: message.X,
            orderRejectReason: message.r,
            orderId: message.i,
            orderTime: message.T,
            lastTradeQuantity: message.l,
            totalTradeQuantity: message.z,
            priceLastTrade: message.L,
            commission: message.n,
            commissionAsset: message.N,
            tradeId: message.t,
            isOrderWorking: message.w,
            isBuyerMaker: message.m,
            creationTime: message.O,
            totalQuoteTradeQuantity: message.Z,
            orderListId: message.g,
            quoteOrderQuantity: message.Q,
            lastQuoteTransacted: message.Y
        }),
        "outboundAccountPosition": (message) => ({
            eventType: message.e,
            eventTime: message.E,
            lastAccountUpdate: message.u,
            balances: message.B.map(balance => ({
                asset: balance.a,
                free: balance.f,
                locked: balance.l
            })),
        }),
        "balanceUpdate": (message) => ({
            eventType: message.e,
            eventTime: message.E,
            asset: message.a,
            balanceDelta: message.d,
            clearTime: message.T,
        })
    }

    return event[data.e] ? event[data.e](data) : null;
}

module.exports = UserData;