import { AbstractError } from './error';
export declare type IdMap<T> = {
    [id: string]: T;
};
export declare class Id {
    private _value;
    constructor(_value: string);
    toString(): string;
}
export interface IdSeedProvider {
    next(): number;
}
export interface IdFactory {
    createId(): Id;
}
export declare class RadixIdFactory {
    private _seedProvider;
    constructor(_seedProvider: IdSeedProvider);
    createId(): Id;
    radix(): number;
}
export interface Repository<T> {
    create(entity: T): Promise<Id>;
    read(id: Id): Promise<T>;
    update(id: Id, entity: T): Promise<void>;
    delete(id: Id): Promise<void>;
    count(): Promise<number>;
    all(): Promise<IdMap<T>>;
}
export declare abstract class IdError extends AbstractError {
    constructor(id: Id, name: string);
}
export declare class UpdateError extends IdError {
    constructor(id: Id);
}
export declare class ReadError extends IdError {
    constructor(id: Id);
}
export declare class DeleteError extends IdError {
    constructor(id: Id);
}
export declare class CreateError extends AbstractError {
}
export declare class CapacityExceeddedError extends CreateError {
    constructor(capacity: number);
}
export declare class MemoryRepository<T> implements Repository<T> {
    private _idFactory;
    private _capacity;
    private _cache;
    constructor(_idFactory: IdFactory, _capacity: number);
    create(entity: T): Promise<Id>;
    private unknownId(id);
    read(id: Id): Promise<T>;
    update(id: Id, entity: T): Promise<void>;
    delete(id: Id): Promise<void>;
    count(): Promise<number>;
    all(): Promise<IdMap<T>>;
}
