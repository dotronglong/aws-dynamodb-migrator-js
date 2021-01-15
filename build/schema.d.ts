import AWS from "aws-sdk";
declare class ProvisionedThroughput {
    readonly readCapacityUnits: number;
    readonly writeCapacityUnits: number;
    constructor(data?: any);
    getProvisionedThroughput(): AWS.DynamoDB.ProvisionedThroughput;
}
declare class Column {
    readonly name: string;
    readonly type: string;
    readonly index: boolean;
    readonly hash: boolean;
    readonly range: boolean;
    constructor(data?: any);
    getKeySchemaElement(): AWS.DynamoDB.KeySchemaElement;
    getAttributeDefinition(): AWS.DynamoDB.AttributeDefinition;
}
declare class Projection {
    readonly type: string;
    readonly nonKeys: string[];
    constructor(data?: any);
    getProjection(): AWS.DynamoDB.Projection;
}
declare class LocalIndex {
    readonly name: string;
    readonly projection: Projection;
    readonly keys: Column[];
    constructor(data?: any);
}
declare class GlobalIndex extends LocalIndex {
    readonly provisionedThroughput: ProvisionedThroughput;
    constructor(data?: any);
}
export default class Schema {
    readonly table: string;
    readonly dropIfExists: boolean;
    readonly provisionedThroughput: ProvisionedThroughput;
    readonly columns: Column[];
    readonly globalIndexes: GlobalIndex[];
    readonly localIndexes: LocalIndex[];
    readonly items: any[];
    constructor(data?: any);
}
export {};
