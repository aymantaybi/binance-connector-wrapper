const Account = require('./account');

class Locals {

    constructor() {
        this.spot = new Account();
        this.margin = new Account();
        this.exchangeInfo = null;
        this.apiPermissions = null;
    }

}

module.exports = Locals;