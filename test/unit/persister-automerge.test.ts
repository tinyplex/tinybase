/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ChannelId,
  DocHandle,
  NetworkAdapter,
  PeerId,
  Repo,
} from 'automerge-repo';
import {Persister, Store, createStore} from 'tinybase/debug';
import {createAutomergePersister} from 'tinybase/debug/persister-automerge';
import {pause} from './common';

const adaptors: Set<TestNetworkAdapter> = new Set();

type NetworkEvent = {
  senderId: PeerId;
  targetId?: PeerId;
  type: string;
  channelId?: ChannelId;
  message?: any;
  broadcast?: boolean;
};

class TestNetworkAdapter extends NetworkAdapter {
  connect(peerId: PeerId) {
    this.peerId = peerId;
    adaptors.add(this);
  }

  sendEvent(event: NetworkEvent) {
    adaptors.forEach((adaptor) => adaptor.receiveEvent(event));
  }

  receiveEvent({
    senderId,
    targetId,
    type,
    channelId,
    message,
    broadcast,
  }: NetworkEvent) {
    if (targetId && targetId !== this.peerId && !broadcast) {
      return;
    }
    switch (type) {
      case 'arrive':
        this.sendEvent({
          senderId: this.peerId!,
          targetId: senderId,
          type: 'welcome',
        });
        this.announceConnection(channelId!, senderId);
        break;
      case 'welcome':
        this.announceConnection(channelId!, senderId);
        break;
      case 'message':
        this.emit('message', {
          senderId,
          targetId: targetId!,
          channelId: channelId!,
          message: new Uint8Array(message),
          broadcast: broadcast!,
        });
        break;
      default:
        throw new Error('unhandled message from network');
    }
  }

  announceConnection(channelId: ChannelId, peerId: PeerId) {
    this.emit('peer-candidate', {peerId, channelId});
  }

  sendMessage(
    peerId: PeerId,
    channelId: ChannelId,
    uint8message: Uint8Array,
    broadcast: boolean,
  ) {
    const message = uint8message.buffer.slice(
      uint8message.byteOffset,
      uint8message.byteOffset + uint8message.byteLength,
    );
    this.sendEvent({
      senderId: this.peerId!,
      targetId: peerId,
      type: 'message',
      channelId,
      message,
      broadcast,
    });
  }

  join(joinChannelId: ChannelId) {
    this.sendEvent({
      senderId: this.peerId!,
      channelId: joinChannelId,
      type: 'arrive',
      broadcast: true,
    });
  }

  leave() {
    //
  }
}

let repo1: Repo;
let docHandler1: DocHandle<any>;
let store1: Store;
let persister1: Persister;

beforeEach(async () => {
  adaptors.clear();
  repo1 = new Repo({network: [new TestNetworkAdapter()]});
  docHandler1 = repo1.create();
  store1 = createStore();
  persister1 = createAutomergePersister(store1, docHandler1);
});

test('custom name', async () => {
  const docHandler = repo1.create();
  const persister = createAutomergePersister(store1, docHandler, 'test');
  await persister.save();
  expect(docHandler.doc).toEqual({test: {t: {}, v: {}}});
});

describe('Save to empty doc', () => {
  test('nothing', async () => {
    await persister1.save();
    expect(docHandler1.doc).toEqual({tinybase: {t: {}, v: {}}});
  });

  test('tables', async () => {
    store1.setTables({t1: {r1: {c1: 1}}});
    await persister1.save();
    expect(docHandler1.doc).toEqual({
      tinybase: {t: {t1: {r1: {c1: 1}}}, v: {}},
    });
  });

  test('values', async () => {
    store1.setValues({v1: 1});
    await persister1.save();
    expect(docHandler1.doc).toEqual({tinybase: {t: {}, v: {v1: 1}}});
  });

  test('both', async () => {
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister1.save();
    expect(docHandler1.doc).toEqual({
      tinybase: {t: {t1: {r1: {c1: 1}}}, v: {v1: 1}},
    });
  });
});

describe('Load from doc', () => {
  test('nothing', async () => {
    await persister1.load();
    expect(store1.getContent()).toEqual([{}, {}]);
  });

  test('defaulted', async () => {
    await persister1.load({t1: {r1: {c1: 1}}}, {v1: 1});
    expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('broken', async () => {
    docHandler1.change((doc: any) => (doc['tinybase'] = {t: 1}));
    await persister1.load();
    expect(store1.getContent()).toEqual([{}, {}]);
  });

  test('slightly broken, can default', async () => {
    docHandler1.change((doc: any) => (doc['tinybase'] = {t: 1}));
    await persister1.load({t1: {r1: {c1: 1}}}, {v1: 1});
    expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('tables', async () => {
    docHandler1.change(
      (doc: any) => (doc['tinybase'] = {t: {t1: {r1: {c1: 1}}}, v: {}}),
    );
    await persister1.load();
    expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {}]);
  });

  test('values', async () => {
    docHandler1.change((doc: any) => (doc['tinybase'] = {t: {}, v: {v1: 1}}));
    await persister1.load();
    expect(store1.getContent()).toEqual([{}, {v1: 1}]);
  });

  test('both', async () => {
    docHandler1.change(
      (doc: any) => (doc['tinybase'] = {t: {t1: {r1: {c1: 1}}}, v: {v1: 1}}),
    );
    await persister1.load();
    expect(store1.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });
});

describe('Two stores, one doc', () => {
  let store2: Store;
  let persister2: Persister;
  beforeEach(() => {
    store2 = createStore();
    persister2 = createAutomergePersister(store2, docHandler1);
  });

  test('manual', async () => {
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister1.save();
    await persister2.load();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoSave1', async () => {
    await persister1.startAutoSave();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister2.load();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoLoad2', async () => {
    await persister2.startAutoLoad();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister1.save();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoSave1 & autoLoad2', async () => {
    await persister1.startAutoSave();
    await persister2.startAutoLoad();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoSave1 & autoLoad2, complex transactions', async () => {
    await persister1.startAutoSave();
    await persister2.startAutoLoad();
    store1
      .setTables({t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}})
      .setValues({v1: 1, v2: 2});
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delCell('t1', 'r1', 'c2');
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delRow('t1', 'r2');
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delTable('t2');
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1, v2: 2}]);
    store1.delValue('v2');
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    store1.setCell('t1', 'r1', 'c1', 2);
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 1}]);
    store1.setValue('v1', 2);
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
  });
});

describe('Two stores, two docs', () => {
  let docHandler2: DocHandle<any>;
  let store2: Store;
  let persister2: Persister;

  const syncDocs = async () => {
    await pause();
    await docHandler1.value();
    await docHandler2.value();
  };

  beforeEach(async () => {
    const repo2 = new Repo({network: [new TestNetworkAdapter()]});
    docHandler2 = repo2.find(docHandler1.documentId);
    await syncDocs();
    store2 = createStore();
    persister2 = createAutomergePersister(store2, docHandler2);
    await persister2.save();
    await syncDocs();
  });

  test('manual', async () => {
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister1.save();
    await syncDocs();
    await persister2.load();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoSave1', async () => {
    await persister1.startAutoSave();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await syncDocs();
    await persister2.load();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoLoad2', async () => {
    await persister2.startAutoLoad();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await persister1.save();
    await syncDocs();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('autoSave1 & autoLoad2', async () => {
    await persister1.startAutoSave();
    await persister2.startAutoLoad();
    store1.setTables({t1: {r1: {c1: 1}}}).setValues({v1: 1});
    await syncDocs();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
  });

  test('Full synchronization, complex transactions', async () => {
    await persister1.startAutoSave();
    await persister1.startAutoLoad();
    await persister2.startAutoSave();
    await persister2.startAutoLoad();
    await syncDocs();
    await store1.setTables({
      t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}},
      t2: {r1: {c1: 1}},
    });
    await store2.setValues({v1: 1, v2: 2});
    await syncDocs();
    expect(store1.getContent()).toEqual([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1, c2: 2}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delCell('t1', 'r1', 'c2');
    await syncDocs();
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1}, r2: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delRow('t1', 'r2');
    await syncDocs();
    expect(store2.getContent()).toEqual([
      {t1: {r1: {c1: 1}}, t2: {r1: {c1: 1}}},
      {v1: 1, v2: 2},
    ]);
    store1.delTable('t2');
    await syncDocs();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1, v2: 2}]);
    store1.delValue('v2');
    await syncDocs();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 1}}}, {v1: 1}]);
    store1.setCell('t1', 'r1', 'c1', 2);
    await syncDocs();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 1}]);
    store1.setValue('v1', 2);
    await syncDocs();
    expect(store2.getContent()).toEqual([{t1: {r1: {c1: 2}}}, {v1: 2}]);
  });
});
