'use strict';
class AbstractError extends Error {
    constructor(msg) {
        super();
        this.message = msg;
        this.name = this.constructor.name;
    }
}
exports.AbstractError = AbstractError;
