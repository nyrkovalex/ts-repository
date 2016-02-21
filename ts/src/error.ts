'use strict';

export abstract class AbstractError extends Error {
  constructor(msg: string) {
    super();
    this.message = msg;
    this.name = this.constructor.name;
  }
}