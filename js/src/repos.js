'use strict';
var error_1 = require('./error');
const ID_RADIX = 36;
class Id {
    constructor(_value) {
        this._value = _value;
    }
    toString() {
        return this._value;
    }
}
exports.Id = Id;
class RadixIdFactory {
    constructor(_seedProvider) {
        this._seedProvider = _seedProvider;
    }
    createId() {
        let seed = this._seedProvider.next();
        let id = new Id(seed.toString(ID_RADIX));
        return id;
    }
    radix() {
        return ID_RADIX;
    }
}
exports.RadixIdFactory = RadixIdFactory;
class IdError extends error_1.AbstractError {
    constructor(id, name) {
        super(`Entity with id ${id.toString()} does not exist`);
    }
}
exports.IdError = IdError;
class UpdateError extends IdError {
    constructor(id) {
        super(id, 'UpdateError');
    }
}
exports.UpdateError = UpdateError;
class ReadError extends IdError {
    constructor(id) {
        super(id, 'ReadError');
    }
}
exports.ReadError = ReadError;
class DeleteError extends IdError {
    constructor(id) {
        super(id, 'DeleteError');
    }
}
exports.DeleteError = DeleteError;
class CreateError extends error_1.AbstractError {
}
exports.CreateError = CreateError;
class CapacityExceeddedError extends CreateError {
    constructor(capacity) {
        super(`Cannot create entity. Reached repository capacity of ${capacity}`);
    }
}
exports.CapacityExceeddedError = CapacityExceeddedError;
class MemoryRepository {
    constructor(_idFactory, _capacity) {
        this._idFactory = _idFactory;
        this._capacity = _capacity;
        this._cache = {};
    }
    create(entity) {
        if (Object.keys(this._cache).length >= this._capacity) {
            return Promise.reject(new CapacityExceeddedError(this._capacity));
        }
        let id = this._idFactory.createId();
        this._cache[id.toString()] = entity;
        return Promise.resolve(id);
    }
    unknownId(id) {
        return !(id.toString() in this._cache);
    }
    read(id) {
        if (this.unknownId(id)) {
            return Promise.reject(new ReadError(id));
        }
        return Promise.resolve(this._cache[id.toString()]);
    }
    update(id, entity) {
        if (this.unknownId(id)) {
            return Promise.reject(new UpdateError(id));
        }
        this._cache[id.toString()] = entity;
        return Promise.resolve(null);
    }
    delete(id) {
        if (this.unknownId(id)) {
            return Promise.reject(new DeleteError(id));
        }
        delete this._cache[id.toString()];
        return Promise.resolve(null);
    }
    count() {
        return Promise.resolve(Object.keys(this._cache).length);
    }
    all() {
        return Promise.resolve(this._cache);
    }
}
exports.MemoryRepository = MemoryRepository;
