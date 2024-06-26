import 'reflect-metadata';
export declare type ClassType<T> = {
    new (...args: any[]): T;
};
export type ColumOption = {
    name: string;
};
export type RelationOption = {
    name: string;
};
export type DateOption = {
    name: string;
};
export interface ColumnSetting {
    propertyKey: string;
    columnType?: Function;
    option?: {
        name?: string;
    };
}
export type JoinOption = {
    relationColumn?: string;
    joinColumnName?: string;
};
export interface JoinColumnSetting {
    propertyKey: string;
    option?: JoinOption;
}
export declare class _PrimaryColumnSetting implements ColumnSetting {
    propertyKey: string;
    constructor(propertyKey: string);
}
export declare class _ColumnSetting implements ColumnSetting {
    propertyKey: string;
    columnType: Function;
    option?: ColumOption | undefined;
    constructor(propertyKey: string, columnType: Function, option?: ColumOption | undefined);
}
export declare class _OneToManySetting<T> implements JoinColumnSetting {
    propertyKey: string;
    getEntity: () => ClassType<T>;
    option?: JoinOption | undefined;
    constructor(propertyKey: string, getEntity: () => ClassType<T>, option?: JoinOption | undefined);
}
export declare class _OneToOneSetting<T> implements JoinColumnSetting {
    propertyKey: string;
    getEntity: () => ClassType<T>;
    option?: JoinOption | undefined;
    constructor(propertyKey: string, getEntity: () => ClassType<T>, option?: JoinOption | undefined);
}
export declare class _ManyToOneSetting<T> implements JoinColumnSetting {
    propertyKey: string;
    getEntity: () => ClassType<T>;
    option?: JoinOption | undefined;
    constructor(propertyKey: string, getEntity: () => ClassType<T>, option?: JoinOption | undefined);
}
export declare class _ArrayReference<T> implements JoinColumnSetting {
    propertyKey: string;
    getEntity: () => ClassType<T>;
    option?: JoinOption | undefined;
    constructor(propertyKey: string, getEntity: () => ClassType<T>, option?: JoinOption | undefined);
}
export declare class _CreateDateColumnSetting<T> implements ColumnSetting {
    propertyKey: string;
    constructor(propertyKey: string);
}
export declare class _UpdateDateColumnSetting<T> implements ColumnSetting {
    propertyKey: string;
    constructor(propertyKey: string);
}
export type HookTiming = 'afterLoad' | 'beforeSave' | 'afterSave';
export declare class _HookFunction {
    timing: HookTiming;
    functionName: string;
    constructor(timing: HookTiming, functionName: string);
}
export type EntityMetaInfo = {
    tableName: string;
    Entity: Function;
    parentEntityGetters?: (() => Function)[];
};
export declare function callHook(meta: EntityMetaData, resource: any, timing: HookTiming): void;
export type EntityColumnInfo = {
    columns: (ColumnSetting | JoinColumnSetting)[];
};
export type EntityMetaData = EntityMetaInfo & EntityColumnInfo & {
    hooks: _HookFunction[];
};
export declare function findMeta(Entity: Function): EntityMetaData;
export declare function findMetaFromTableName(tableName: string): EntityMetaData | null;
export declare function PrimaryColumn(): (target: any, propertyKey: string) => void;
export declare function Column(options?: ColumOption): (target: any, propertyKey: string) => void;
export declare function OneToMany<T>(getEntity: () => ClassType<T>, options?: JoinOption): (target: any, propertyKey: string) => void;
export declare function OneToOne<T>(getEntity: () => ClassType<T>, options?: JoinOption): (target: any, propertyKey: string) => void;
export declare function ManyToOne<T>(getEntity: () => ClassType<T>, options?: JoinOption): (target: any, propertyKey: string) => void;
export declare function ArrayReference<T>(getEntity: () => ClassType<T>, options?: JoinOption): (target: any, propertyKey: string) => void;
export declare function CreateDateColumn<T>(options?: DateOption): (target: any, propertyKey: string) => void;
export declare function UpdateDateColumn<T>(options?: DateOption): (target: any, propertyKey: string) => void;
export declare function BeforeSave<T>(options?: DateOption): (target: any, propertyKey: string) => void;
export declare function AfterSave<T>(options?: DateOption): (target: any, propertyKey: string) => void;
export declare function AfterLoad<T>(options?: DateOption): (target: any, propertyKey: string) => void;
export declare function FirebaseEntity(tableName: string): (constructor: Function) => void;
export declare function NestedFirebaseEntity(tableName: string, ...parentEntityGetters: (() => Function)[]): (constructor: Function) => void;
