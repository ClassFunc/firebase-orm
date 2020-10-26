import { _getDocumentReference } from './Repository';
export { PrimaryColumn, Column, OneToMany, OneToOne, ManyToOne, CreateDateColumn, UpdateDateColumn, FirebaseEntity, NestedFirebaseEntity, ArrayReference, AfterLoad, BeforeSave, AfterSave, ColumOption, RelationOption, DateOption, ClassType } from './Entity';
export { TransactionManager, Repository, Fetcher, FetchOption, getRepository, runTransaction, addDBToPool, use, getCurrentDB } from './Repository';
export { FirebaseEntitySerializer, FirebaseEntityDeserializer } from './Serializer';
export { RecordNotFoundError } from './Error';
export declare const PureReference: typeof _getDocumentReference;
