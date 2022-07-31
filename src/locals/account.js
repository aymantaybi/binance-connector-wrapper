class Account {

    constructor() {
        this.orders = [];
        this.updateTime = 0;
        this.balances = [];
    }

    openOrders(symbol) {
        let status = ["NEW", "PARTIALLY_FILLED"];
        let openOrders = this.orders.filter(order => status.includes(order.status));
        if (!symbol) return openOrders;
        return openOrders.filter(openOrder => openOrder.symbol == symbol);
    }

    balance(asset) {
        return this.balances.find(balance => balance.asset == asset);
    }

}

module.exports = Account;