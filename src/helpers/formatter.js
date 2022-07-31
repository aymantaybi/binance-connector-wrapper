
class Formatter {

    static formatMarginOrder(order) {
        return {
            clientOrderId: order.clientOrderId,
            cummulativeQuoteQty: order.cummulativeQuoteQty,
            executedQty: order.executedQty,
            isIsolated: order.isIsolated,
            orderId: order.orderId,
            origQty: order.origQty,
            price: order.price,
            side: order.side,
            status: order.status,
            symbol: order.symbol,
            timeInForce: order.timeInForce,
            type: order.type
        };
    };

    static formatNewMarginOrder(order) {
        return {
            ...this.formatMarginOrder(order),
            icebergQty: order.icebergQty || '0.00000000',
            isWorking: true,
            stopPrice: order.stopPrice || '0.00000000',
            time: order.transactTime,
            updateTime: order.transactTime
        };
    };

    static formatCanceledMarginOrder(order) {
        return this.formatMarginOrder(order);
    };

    static formatOrderExecutionReport(data) {
        return {
            symbol: data.symbol,
            orderId: data.orderId,
            clientOrderId: data.originalClientOrderId != '' ? data.originalClientOrderId : data.newClientOrderId,
            price: data.price,
            origQty: data.quantity,
            executedQty: data.totalTradeQuantity,
            cummulativeQuoteQty: data.totalQuoteTradeQuantity,
            status: data.orderStatus,
            timeInForce: data.timeInForce,
            type: data.orderType,
            side: data.side,
            stopPrice: data.stopPrice,
            icebergQty: data.icebergQuantity,
            time: data.creationTime,
            updateTime: data.eventTime,
            isWorking: data.isOrderWorking
        };
    };

    static formatMarginOrderExecutionReport(data) {
        return {
            ...this.formatOrderExecutionReport(data),
            isIsolated: false
        };
    };

}

module.exports = Formatter;