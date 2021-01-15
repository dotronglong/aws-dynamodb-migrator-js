import AWS from "aws-sdk";

class ProvisionedThroughput {
  readonly readCapacityUnits: number;
  readonly writeCapacityUnits: number;

  constructor(data?: any) {
    this.readCapacityUnits = data?.readCapacityUnits || 5;
    this.writeCapacityUnits = data?.writeCapacityUnits || 5;
  }

  getProvisionedThroughput(): AWS.DynamoDB.ProvisionedThroughput {
    return {
      ReadCapacityUnits: this.readCapacityUnits,
      WriteCapacityUnits: this.writeCapacityUnits
    }
  }
}

class Column {
  readonly name: string;
  readonly type: string;
  readonly index: boolean;
  readonly hash: boolean;
  readonly range: boolean;

  constructor(data?: any) {
    this.name = data?.name || "";
    this.type = data?.type || "";
    this.index = data?.index || false;
    this.hash = data?.hash || false;
    this.range = data?.range || false;
  }
  
  getKeySchemaElement(): AWS.DynamoDB.KeySchemaElement {
    return {
      AttributeName: this.name,
      KeyType: this.hash ? "HASH" : "RANGE"
    };
  }

  getAttributeDefinition(): AWS.DynamoDB.AttributeDefinition {
    return {
      AttributeName: this.name,
      AttributeType: this.type
    };
  }
}

class Projection {
  readonly type: string;
  readonly nonKeys: string[];

  constructor(data?: any) {
    this.type = data?.type || "";
    this.nonKeys = data?.nonKeys || [];
  }

  getProjection(): AWS.DynamoDB.Projection {
    return this.type === "INCLUDE" ? {
      ProjectionType: this.type,
      NonKeyAttributes: this.nonKeys
    } : {
      ProjectionType: this.type
    }
  }
}

class LocalIndex {
  readonly name: string;
  readonly projection: Projection;
  readonly keys: Column[];

  constructor(data?: any) {
    this.name = data?.name || "";
    this.projection = new Projection(data?.projection || {});
    this.keys = [];
    if (data?.keys && Array.isArray(data?.keys)) {
      for (const column of data?.keys) {
        this.keys.push(new Column(column));
      }
    }
  }
}

class GlobalIndex extends LocalIndex {
  readonly provisionedThroughput: ProvisionedThroughput;

  constructor(data?: any) {
    super(data);
    this.provisionedThroughput = new ProvisionedThroughput(data?.provisionedThroughput || {});
  }
}

export default class Schema {
  readonly table: string;
  readonly dropIfExists: boolean;
  readonly provisionedThroughput: ProvisionedThroughput;
  readonly columns: Column[];
  readonly globalIndexes: GlobalIndex[] = [];
  readonly localIndexes: LocalIndex[] = [];
  readonly items: any[];

  constructor(data?: any) {
    this.table = data?.table || "";
    this.dropIfExists = data?.dropIfExists || false;
    this.provisionedThroughput = new ProvisionedThroughput(data?.provisionedThroughput || {});
    this.columns = [];
    if (data?.columns && Array.isArray(data?.columns)) {
      for (const column of data?.columns) {
        this.columns.push(new Column(column));
      }
    }
    if (data?.globalIndexes && Array.isArray(data?.globalIndexes)) {
      for (const index of data?.globalIndexes) {
        this.globalIndexes.push(new GlobalIndex(index));
      }
    }
    if (data?.localIndexes && Array.isArray(data?.localIndexes)) {
      for (const index of data?.globalIndexes) {
        this.localIndexes.push(new LocalIndex(index));
      }
    }
    this.items = data?.items || [];
  }
}