class Updater {

    static updateOrders(orders, order) {

        let orderIndex = orders.findIndex(oldOrder => String(oldOrder.orderId) == String(order.orderId));

        let oldOrder = orders[orderIndex];

        let newOrder = oldOrder ? { ...oldOrder, ...order } : order;

        if (oldOrder) {
            if (Number(newOrder.updateTime) > Number(oldOrder.updateTime)) {
                orders[orderIndex] = newOrder;
            }
        } else {
            orders.push(newOrder);
        }

        return orders;
    }

    static updateBalances(balances, data) {

        for (var newBalance of data.balances) {
            var index = balances.findIndex(balance => balance.asset == newBalance.asset);
            if (index != -1) {
                balances[index] = newBalance;
            } else {
                balances.push(newBalance);
            };
        };

        return balances;
    };

}

module.exports = Updater;