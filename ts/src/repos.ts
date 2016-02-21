'use strict';

import {AbstractError} from './error';

export type IdMap<T> = { [id: string]: T };

const ID_RADIX = 36;

export class Id {
  constructor(private _value: string) { }
  toString(): string {
    return this._value;
  }
}

export interface IdSeedProvider {
  next(): number;
}

export interface IdFactory {
  createId(): Id;
}

export class RadixIdFactory {
  constructor(private _seedProvider: IdSeedProvider) { }

  createId(): Id {
    let seed = this._seedProvider.next();
    let id = new Id(seed.toString(ID_RADIX));
    return id;
  }

  radix(): number {
    return ID_RADIX;
  }
}



export interface Repository<T> {
  create(entity: T): Promise<Id>;
  read(id: Id): Promise<T>;
  update(id: Id, entity: T): Promise<void>;
  delete(id: Id): Promise<void>;
  count(): Promise<number>;
  all(): Promise<IdMap<T>>;
}

export abstract class IdError extends AbstractError {
  constructor(id: Id, name: string) {
    super(`Entity with id ${id.toString()} does not exist`);
  }
}

export class UpdateError extends IdError {
  constructor(id: Id) { super(id, 'UpdateError'); }
}

export class ReadError extends IdError {
  constructor(id: Id) { super(id, 'ReadError'); }
}

export class DeleteError extends IdError {
  constructor(id: Id) { super(id, 'DeleteError'); }
}

export class CreateError extends AbstractError { }

export class CapacityExceeddedError extends CreateError {
  constructor(capacity: number) {
    super(`Cannot create entity. Reached repository capacity of ${capacity}`);
  }
}

export class MemoryRepository<T> implements Repository<T> {
  private _cache: IdMap<T> = {};

  constructor(
    private _idFactory: IdFactory,
    private _capacity: number) { }

  create(entity: T): Promise<Id> {
    if (Object.keys(this._cache).length >= this._capacity) {
      return Promise.reject<Id>(new CapacityExceeddedError(this._capacity));
    }
    let id = this._idFactory.createId();
    this._cache[id.toString()] = entity;
    return Promise.resolve(id);
  }

  private unknownId(id: Id): boolean {
    return !(id.toString() in this._cache);
  }

  read(id: Id): Promise<T> {
    if (this.unknownId(id)) {
      return Promise.reject<T>(new ReadError(id));
    }
    return Promise.resolve(this._cache[id.toString()]);
  }

  update(id: Id, entity: T): Promise<void> {
    if (this.unknownId(id)) {
      return Promise.reject(new UpdateError(id));
    }
    this._cache[id.toString()] = entity;
    return Promise.resolve(null);
  }

  delete(id: Id): Promise<void> {
    if (this.unknownId(id)) {
      return Promise.reject(new DeleteError(id));
    }
    delete this._cache[id.toString()];
    return Promise.resolve(null);
  }

  count(): Promise<number> {
    return Promise.resolve(Object.keys(this._cache).length);
  }

  all(): Promise<IdMap<T>> {
    return Promise.resolve(this._cache);
  }
}