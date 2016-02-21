'use strict';

import * as chai from 'chai';

let expect = chai.expect;

export function promised(itFunc: (done?: any) => Promise<any>) {
  return (done: any) => itFunc(done)
    .then(() => done())
    .catch(done);
}

export function broken(itFunc: (done?: any) => Promise<any>, expectedErr: Error) {
  return promised(done =>
    itFunc(done)
      .then(() => done(new Error(`Expected to fail with ${expectedErr}`)))
      .catch(err => {
        if (err && err.name === expectedErr.name) {
          expect(err).to.eql(expectedErr);
          return;
        }
        return Promise.reject(err);
      }));
}