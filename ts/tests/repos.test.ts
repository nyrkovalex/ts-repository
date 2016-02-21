'use strict';

import * as chai from 'chai';
import * as sinon from 'sinon';
import {promised, broken} from './helpers';
import * as repos from '../src/repos';

let expect = chai.expect;


class SampleEntity {
  constructor(public name: string) { }
}

class SampleIdFactory implements repos.IdFactory {
  private _currentId = 1;
  createId(): repos.Id {
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
  let idFactory: repos.IdFactory, memRepo: repos.Repository<SampleEntity>;
  let capacity = 2;

  beforeEach(() => {
    idFactory = new SampleIdFactory();
    memRepo = new repos.MemoryRepository<SampleEntity>(idFactory, capacity);
  });

  it('should have no entries by default', promised(() =>
    memRepo.count()
      .then(count => expect(count).to.equal(0))));

  it('should have one entry', promised(() =>
    memRepo.create(new SampleEntity('dude'))
      .then(() => memRepo.count())
      .then(count => expect(count).to.equal(1))));

  it('should create id for entity', promised(() =>
    memRepo.create(new SampleEntity('dude'))
      .then(id => expect(id.toString()).to.equal('1'))));

  it('should retrieve entity by id', promised(() => {
    let entity = new SampleEntity('dude');
    return memRepo.create(entity)
      .then(id => memRepo.read(id))
      .then(result => expect(result).to.equal(entity));
  }));

  it('should update entity by id', promised(() => {
    let dude = new SampleEntity('dude');
    let walter = new SampleEntity('walter');
    return memRepo.create(dude)
      .then(id => memRepo.update(id, walter)
        .then(() => memRepo.read(id)))
      .then(result => expect(result).to.equal(walter));
  }));

  it('should delete entity by id', promised(() => {
    let dude = new SampleEntity('dude');
    return memRepo.create(dude)
      .then(id => memRepo.delete(id))
      .then(() => memRepo.count())
      .then(count => expect(count).to.equal(0));
  }));

  it('should return all entities', promised(() => {
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

  it('should maintain capacity', broken(() =>
    memRepo.create(new SampleEntity('1'))
      .then(() => memRepo.create(new SampleEntity('2')))
      .then(() => memRepo.create(new SampleEntity('3'))),
    new repos.CapacityExceeddedError(capacity)));

  it('should reject update for unknown id', broken(() =>
    memRepo.update(new repos.Id('404'), { name: 'donny' }),
    new repos.UpdateError(new repos.Id('404'))));

  it('should reject read for unknown id', broken(() =>
    memRepo.read(new repos.Id('404')),
    new repos.ReadError(new repos.Id('404'))));

  it('should reject delete for unknown id', broken(() =>
    memRepo.delete(new repos.Id('404')),
    new repos.DeleteError(new repos.Id('404'))));
});