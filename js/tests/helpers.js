'use strict';
var chai = require('chai');
let expect = chai.expect;
function promised(itFunc) {
    return (done) => itFunc(done)
        .then(() => done())
        .catch(done);
}
exports.promised = promised;
function broken(itFunc, expectedErr) {
    return promised(done => itFunc(done)
        .then(() => done(new Error(`Expected to fail with ${expectedErr}`)))
        .catch(err => {
        if (err && err.name === expectedErr.name) {
            expect(err).to.eql(expectedErr);
            return;
        }
        return Promise.reject(err);
    }));
}
exports.broken = broken;
