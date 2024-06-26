"use strict";
// ---------- WARN! DO NOT EDIT BY HAND. THIS FILE IS AUTOMATICALLY GENERATED BY firebase-orm. ---------- 
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getDocumentReference = exports.runTransaction = exports.TransactionManager = exports.getRepository = exports.makeNestedCollectionReference = exports.Repository = exports.getCurrentDB = exports.takeDBFromPool = exports.use = exports.addDBToPool = exports.Fetcher = void 0;
// ---------- WARN! DO NOT EDIT BY HAND. THIS FILE IS AUTOMATICALLY GENERATED BY firebase-orm. ---------- 
const Entity_1 = require("./Entity");
const EntityBuilder_1 = require("./EntityBuilder");
const Error_1 = require("./Error");
class Fetcher {
    constructor(meta, ref) {
        this.meta = meta;
        this.ref = ref;
    }
    fetchOne(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.ref.get();
            const unoboxed = result.unbox();
            if (!unoboxed || !unoboxed[0]) {
                return null;
            }
            const resource = (0, EntityBuilder_1.buildEntity)(this.meta, unoboxed[0], this.ref, options);
            (0, Entity_1.callHook)(this.meta, resource, 'afterLoad');
            return resource;
        });
    }
    fetchOneOrFail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.fetchOne(options);
            if (!item) {
                throw new Error_1.RecordNotFoundError(this.meta.Entity);
            }
            return item;
        });
    }
    fetchAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.ref.get();
            const docs = result.unbox();
            if (!docs) {
                return [];
            }
            const results = [];
            for (const data of docs) {
                const resource = yield (0, EntityBuilder_1.buildEntity)(this.meta, data, this.ref, options);
                (0, Entity_1.callHook)(this.meta, resource, 'afterLoad');
                results.push(resource);
            }
            return results;
        });
    }
    onSnapShot(callback, options) {
        const unsubscribe = this.ref.ref.onSnapshot((snapshot) => __awaiter(this, void 0, void 0, function* () {
            for (const change of snapshot.docChanges()) {
                const ref = new EntityBuilder_1.FirestoreReference(change.doc.ref);
                const result = yield ref.get();
                const unoboxed = result.unbox();
                if (!unoboxed || !unoboxed[0]) {
                    callback({
                        type: change.type,
                        id: ref.ref.id
                    });
                }
                else {
                    const resource = yield (0, EntityBuilder_1.buildEntity)(this.meta, unoboxed[0], ref, options);
                    (0, Entity_1.callHook)(this.meta, resource, 'afterLoad');
                    callback({
                        type: change.type,
                        id: ref.ref.id,
                        item: resource
                    });
                }
            }
        }));
        return unsubscribe;
    }
}
exports.Fetcher = Fetcher;
const dbPool = {};
let currentConnectionName = null;
function addDBToPool(name, db) {
    if (!currentConnectionName) {
        currentConnectionName = name;
    }
    dbPool[name] = db;
}
exports.addDBToPool = addDBToPool;
function use(name) {
    const keys = Object.keys(dbPool);
    if (!keys.includes(name)) {
        throw new Error(`Could not find db named: ${name}`);
    }
    currentConnectionName = name;
}
exports.use = use;
function takeDBFromPool(name) {
    return dbPool[name];
}
exports.takeDBFromPool = takeDBFromPool;
function getCurrentDB() {
    return dbPool[currentConnectionName];
}
exports.getCurrentDB = getCurrentDB;
function createSavingParams(meta, resource) {
    var _a, _b, _c, _d;
    const savingParams = {};
    for (const key in resource) {
        if (resource[key] === undefined) {
            continue;
        }
        const column = meta.columns.filter(x => key === x.propertyKey)[0];
        if (!column) {
            continue;
        }
        if (column instanceof Entity_1._ColumnSetting) {
            const keyInForestore = ((_a = column.option) === null || _a === void 0 ? void 0 : _a.name) || column.propertyKey;
            savingParams[keyInForestore] = resource[key];
        }
        else if (column instanceof Entity_1._ManyToOneSetting) {
            if (!((_b = column.option) === null || _b === void 0 ? void 0 : _b.joinColumnName)) {
                continue;
            }
            const joinColumnName = column.option.joinColumnName;
            const ref = _getDocumentReference(resource[key]);
            if (!ref) {
                throw new Error('document reference should not be empty');
            }
            savingParams[joinColumnName] = ref;
        }
        else if (column instanceof Entity_1._OneToOneSetting) {
            if (!((_c = column.option) === null || _c === void 0 ? void 0 : _c.joinColumnName)) {
                continue;
            }
            const joinColumnName = column.option.joinColumnName;
            const ref = _getDocumentReference(resource[key]);
            if (!ref) {
                throw new Error('document reference should not be empty');
            }
            savingParams[joinColumnName] = ref;
        }
        else if (column instanceof Entity_1._ArrayReference) {
            if (!((_d = column.option) === null || _d === void 0 ? void 0 : _d.joinColumnName)) {
                continue;
            }
            const joinColumnName = column.option.joinColumnName;
            const children = resource[key];
            if (!Array.isArray(children)) {
                throw new Error(`${key} is not an array`);
            }
            const refs = [];
            for (const child of children) {
                const ref = _getDocumentReference(child);
                if (!ref) {
                    throw new Error('document reference should not be empty');
                }
                refs.push(ref);
            }
            savingParams[joinColumnName] = refs;
        }
    }
    return savingParams;
}
function createUpdatingParams(meta, resource, paramsForUpdate) {
    const copied = Object.assign({}, resource);
    Object.assign(copied, paramsForUpdate);
    const savingParams = createSavingParams(meta, copied);
    const updatingParams = {};
    const savingKeys = Object.keys(paramsForUpdate);
    for (const key in savingParams) {
        if (!savingKeys.includes(key)) {
            continue;
        }
        updatingParams[key] = savingParams[key];
    }
    return updatingParams;
}
class Repository {
    constructor(Entity, transaction, parentIdMapper, db) {
        this.Entity = Entity;
        this.transaction = transaction;
        this.parentIdMapper = parentIdMapper;
        this.db = db;
    }
    setTransaction(transaction) {
        this.transaction = transaction;
    }
    prepareFetcher(condition) {
        const meta = (0, Entity_1.findMeta)(this.Entity);
        const colRef = this.collectionReference(meta);
        const ref = new EntityBuilder_1.FirestoreReference(condition(colRef), this.transaction);
        return new Fetcher(meta, ref);
    }
    fetchOneById(id, options) {
        return this.prepareFetcher(ref => ref.doc(id)).fetchOne(options);
    }
    fetchOneByIdOrFail(id, options) {
        return this.prepareFetcher(ref => ref.doc(id)).fetchOneOrFail(options);
    }
    fetchAll(options) {
        return this.prepareFetcher(ref => ref).fetchAll(options);
    }
    onSnapShot(callback, options) {
        return this.prepareFetcher(ref => ref).onSnapShot(callback, options);
    }
    save(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const documentReference = _getDocumentReference(resource);
            if (this.transaction && documentReference) {
                if (documentReference.id !== resource.id) {
                    throw new Error('The resource is broken.');
                }
                const Entity = resource.constructor;
                const meta = (0, Entity_1.findMeta)(Entity);
                (0, Entity_1.callHook)(meta, resource, 'beforeSave');
                const params = createSavingParams(meta, resource);
                yield this.transaction.set(documentReference, params);
                (0, Entity_1.callHook)(meta, resource, 'afterSave');
                return resource;
            }
            else {
                const meta = (0, Entity_1.findMeta)(this.Entity);
                let _ref;
                if (resource.id) {
                    _ref = this.collectionReference(meta).doc(resource.id);
                }
                else {
                    _ref = this.collectionReference(meta).doc();
                }
                const ref = new EntityBuilder_1.FirestoreReference(_ref, this.transaction);
                (0, Entity_1.callHook)(meta, resource, 'beforeSave');
                const savingParams = createSavingParams(meta, resource);
                yield ref.set(savingParams);
                if (!resource.id) {
                    resource.id = ref.ref.id;
                }
                resource[EntityBuilder_1.documentReferencePath] = _ref;
                (0, Entity_1.callHook)(meta, resource, 'afterSave');
                return resource;
            }
        });
    }
    update(resource, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const documentReference = _getDocumentReference(resource);
            if (!documentReference) {
                throw new Error('Can not update the resource due to non existed resource on firestore.');
            }
            if (documentReference.id !== resource.id) {
                throw new Error('The resource is broken.');
            }
            if (this.transaction && documentReference) {
                const Entity = resource.constructor;
                const meta = (0, Entity_1.findMeta)(Entity);
                (0, Entity_1.callHook)(meta, [resource, params], 'beforeSave');
                const updatingParams = createUpdatingParams(meta, resource, params);
                yield this.transaction.update(documentReference, updatingParams);
                Object.assign(resource, params);
                (0, Entity_1.callHook)(meta, resource, 'afterSave');
                return resource;
            }
            else {
                const meta = (0, Entity_1.findMeta)(this.Entity);
                const ref = new EntityBuilder_1.FirestoreReference(this.collectionReference(meta).doc(resource.id), this.transaction);
                const updatingParams = createUpdatingParams(meta, resource, params);
                (0, Entity_1.callHook)(meta, [resource, params], 'beforeSave');
                yield ref.update(updatingParams);
                Object.assign(resource, params);
                (0, Entity_1.callHook)(meta, resource, 'afterSave');
            }
            return resource;
        });
    }
    delete(resourceOrId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ref = _getDocumentReference(resourceOrId);
            if (ref) {
                if (this.transaction) {
                    yield this.transaction.delete(ref);
                }
                else {
                    yield ref.delete();
                }
            }
            else {
                const meta = (0, Entity_1.findMeta)(this.Entity);
                const ref = this.collectionReference(meta).doc(resourceOrId);
                if (this.transaction) {
                    yield this.transaction.delete(ref);
                }
                else {
                    yield ref.delete();
                }
            }
        });
    }
    collectionReference(meta) {
        if (this.parentIdMapper) {
            return makeNestedCollectionReference(meta, this.parentIdMapper, this.db);
        }
        else {
            if (this.db) {
                return this.db.collection(meta.tableName);
            }
            else {
                return getCurrentDB().collection(meta.tableName);
            }
        }
    }
}
exports.Repository = Repository;
function makeNestedCollectionReference(meta, parentIdMapper, _db) {
    let ref = null;
    for (const parentEntityGetter of meta.parentEntityGetters || []) {
        const parentMeta = (0, Entity_1.findMeta)(parentEntityGetter());
        const parentId = parentIdMapper(parentMeta.Entity);
        if (ref) {
            ref = ref.collection(parentMeta.tableName).doc(parentId);
        }
        else {
            const db = _db || getCurrentDB();
            ref = db.collection(parentMeta.tableName).doc(parentId);
        }
    }
    if (!ref) {
        throw new Error(`${this.Entity} is not NestedFirebaseEntity`);
    }
    return ref.collection(meta.tableName);
}
exports.makeNestedCollectionReference = makeNestedCollectionReference;
function getRepository(Entity, params, db) {
    if (params) {
        return new Repository(Entity, undefined, params.parentIdMapper, db);
    }
    return new Repository(Entity, undefined, undefined, db);
}
exports.getRepository = getRepository;
class TransactionManager {
    constructor(transaction) {
        this.transaction = transaction;
    }
    getRepository(Entity, params, db) {
        if (params) {
            return new Repository(Entity, this.transaction, params.parentIdMapper, db);
        }
        return new Repository(Entity, this.transaction, undefined, db);
    }
}
exports.TransactionManager = TransactionManager;
function runTransaction(callback) {
    return getCurrentDB().runTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
        const manager = new TransactionManager(transaction);
        return callback(manager);
    }));
}
exports.runTransaction = runTransaction;
function _getDocumentReference(item) {
    return item[EntityBuilder_1.documentReferencePath];
}
exports._getDocumentReference = _getDocumentReference;
//# sourceMappingURL=Repository.js.map