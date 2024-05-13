import { ClassType, EntityMetaData } from './Entity';
import { ReferenceWrap, FirestoreReference, QueryPartialEntity } from './EntityBuilder';
import { Firestore, CollectionReference, DocumentReference, Transaction, DocumentChangeType } from './type-mapper';
export type FetchOption = {
    relations: string[];
};
export type OnsnapShotResult<T> = {
    type: DocumentChangeType;
    id: string;
    item?: T;
};
export declare class Fetcher<T> {
    private meta;
    private ref;
    constructor(meta: EntityMetaData, ref: FirestoreReference<T>);
    fetchOne(options?: FetchOption): Promise<T | null>;
    fetchOneOrFail(options?: FetchOption): Promise<T>;
    fetchAll(options?: FetchOption): Promise<T[]>;
    onSnapShot(callback: (result: OnsnapShotResult<T>) => Promise<void>, options?: FetchOption): () => void;
}
export declare function addDBToPool(name: string, db: Firestore): void;
export declare function use(name: string): void;
export declare function takeDBFromPool(name: string): FirebaseFirestore.Firestore;
export declare function getCurrentDB(): Firestore;
export type ParentIDMapper = (Entity: Function) => string;
export declare class Repository<T extends {
    id: string;
}> {
    private Entity;
    private transaction?;
    private parentIdMapper?;
    db?: FirebaseFirestore.Firestore | undefined;
    constructor(Entity: ClassType<T>, transaction?: FirebaseFirestore.Transaction | undefined, parentIdMapper?: ParentIDMapper | undefined, db?: FirebaseFirestore.Firestore | undefined);
    setTransaction(transaction: Transaction): void;
    prepareFetcher(condition: (db: CollectionReference) => ReferenceWrap): Fetcher<T>;
    fetchOneById(id: string, options?: FetchOption): Promise<T | null>;
    fetchOneByIdOrFail(id: string, options?: FetchOption): Promise<T>;
    fetchAll(options?: FetchOption): Promise<T[]>;
    onSnapShot(callback: (result: OnsnapShotResult<T>) => Promise<void>, options?: FetchOption): () => void;
    save(resource: T): Promise<T>;
    update(resource: T, params: QueryPartialEntity<T>): Promise<T>;
    delete(resourceOrId: string | T): Promise<void>;
    private collectionReference;
}
export declare function makeNestedCollectionReference(meta: EntityMetaData, parentIdMapper: ParentIDMapper, _db?: Firestore): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
export declare function getRepository<T extends {
    id: string;
}>(Entity: new () => T, params?: {
    parentIdMapper: ParentIDMapper;
}, db?: Firestore): Repository<T>;
export declare class TransactionManager {
    private transaction;
    constructor(transaction: Transaction);
    getRepository<T extends {
        id: string;
    }>(Entity: new () => T, params?: {
        parentIdMapper: ParentIDMapper;
    }, db?: Firestore): Repository<T>;
}
export declare function runTransaction<T>(callback: (manager: TransactionManager) => Promise<T>): Promise<T>;
export declare function _getDocumentReference<T>(item: T): DocumentReference | undefined;
