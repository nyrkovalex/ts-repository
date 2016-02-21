'use strict';
var chai = require('chai');
var sinon = require('sinon');
var helpers_1 = require('./helpers');
var repos = require('../src/repos');
let expect = chai.expect;
class SampleEntity {
    constructor(name) {
        this.name = name;
    }
}
class SampleIdFactory {
    constructor() {
        this._currentId = 1;
    }
    createId() {
        return new repos.Id((this._currentId++).toString());
    }
}
describe('IdFactory', () => {
    let seedProvider = {
        next: sinon.spy(() => {
            return 1;
        })
    };
    let factory = new repos.RadixIdFactory(seedProvider);
    it('should use provided seed for id generation', () => {
        factory.createId();
        expect(seedProvider.next).to.be.called;
    });
    it('should generate id using constant radix', () => {
        let id = factory.createId();
        expect(parseInt(id.toString(), factory.radix())).to.equal(1);
    });
});
describe('MemoryRepository', () => {
    let idFactory, memRepo;
    let capacity = 2;
    beforeEach(() => {
        idFactory = new SampleIdFactory();
        memRepo = new repos.MemoryRepository(idFactory, capacity);
    });
    it('should have no entries by default', helpers_1.promised(() => memRepo.count()
        .then(count => expect(count).to.equal(0))));
    it('should have one entry', helpers_1.promised(() => memRepo.create(new SampleEntity('dude'))
        .then(() => memRepo.count())
        .then(count => expect(count).to.equal(1))));
    it('should create id for entity', helpers_1.promised(() => memRepo.create(new SampleEntity('dude'))
        .then(id => expect(id.toString()).to.equal('1'))));
    it('should retrieve entity by id', helpers_1.promised(() => {
        let entity = new SampleEntity('dude');
        return memRepo.create(entity)
            .then(id => memRepo.read(id))
            .then(result => expect(result).to.equal(entity));
    }));
    it('should update entity by id', helpers_1.promised(() => {
        let dude = new SampleEntity('dude');
        let walter = new SampleEntity('walter');
        return memRepo.create(dude)
            .then(id => memRepo.update(id, walter)
            .then(() => memRepo.read(id)))
            .then(result => expect(result).to.equal(walter));
    }));
    it('should delete entity by id', helpers_1.promised(() => {
        let dude = new SampleEntity('dude');
        return memRepo.create(dude)
            .then(id => memRepo.delete(id))
            .then(() => memRepo.count())
            .then(count => expect(count).to.equal(0));
    }));
    it('should return all entities', helpers_1.promised(() => {
        let first = new SampleEntity('1');
        let second = new SampleEntity('2');
        return memRepo.create(first)
            .then(() => memRepo.create(second)
            .then(() => memRepo.all())
            .then(entities => expect(entities).to.eql({
            '1': first,
            '2': second
        })));
    }));
    it('should maintain capacity', helpers_1.broken(() => memRepo.create(new SampleEntity('1'))
        .then(() => memRepo.create(new SampleEntity('2')))
        .then(() => memRepo.create(new SampleEntity('3'))), new repos.CapacityExceeddedError(capacity)));
    it('should reject update for unknown id', helpers_1.broken(() => memRepo.update(new repos.Id('404'), { name: 'donny' }), new repos.UpdateError(new repos.Id('404'))));
    it('should reject read for unknown id', helpers_1.broken(() => memRepo.read(new repos.Id('404')), new repos.ReadError(new repos.Id('404'))));
    it('should reject delete for unknown id', helpers_1.broken(() => memRepo.delete(new repos.Id('404')), new repos.DeleteError(new repos.Id('404'))));
});
