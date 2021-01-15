"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProvisionedThroughput {
    constructor(data) {
        this.readCapacityUnits = (data === null || data === void 0 ? void 0 : data.readCapacityUnits) || 5;
        this.writeCapacityUnits = (data === null || data === void 0 ? void 0 : data.writeCapacityUnits) || 5;
    }
    getProvisionedThroughput() {
        return {
            ReadCapacityUnits: this.readCapacityUnits,
            WriteCapacityUnits: this.writeCapacityUnits
        };
    }
}
class Column {
    constructor(data) {
        this.name = (data === null || data === void 0 ? void 0 : data.name) || "";
        this.type = (data === null || data === void 0 ? void 0 : data.type) || "";
        this.index = (data === null || data === void 0 ? void 0 : data.index) || false;
        this.hash = (data === null || data === void 0 ? void 0 : data.hash) || false;
        this.range = (data === null || data === void 0 ? void 0 : data.range) || false;
    }
    getKeySchemaElement() {
        return {
            AttributeName: this.name,
            KeyType: this.hash ? "HASH" : "RANGE"
        };
    }
    getAttributeDefinition() {
        return {
            AttributeName: this.name,
            AttributeType: this.type
        };
    }
}
class Projection {
    constructor(data) {
        this.type = (data === null || data === void 0 ? void 0 : data.type) || "";
        this.nonKeys = (data === null || data === void 0 ? void 0 : data.nonKeys) || [];
    }
    getProjection() {
        return this.type === "INCLUDE" ? {
            ProjectionType: this.type,
            NonKeyAttributes: this.nonKeys
        } : {
            ProjectionType: this.type
        };
    }
}
class LocalIndex {
    constructor(data) {
        this.name = (data === null || data === void 0 ? void 0 : data.name) || "";
        this.projection = new Projection((data === null || data === void 0 ? void 0 : data.projection) || {});
        this.keys = [];
        if ((data === null || data === void 0 ? void 0 : data.keys) && Array.isArray(data === null || data === void 0 ? void 0 : data.keys)) {
            for (const column of data === null || data === void 0 ? void 0 : data.keys) {
                this.keys.push(new Column(column));
            }
        }
    }
}
class GlobalIndex extends LocalIndex {
    constructor(data) {
        super(data);
        this.provisionedThroughput = new ProvisionedThroughput((data === null || data === void 0 ? void 0 : data.provisionedThroughput) || {});
    }
}
class Schema {
    constructor(data) {
        this.globalIndexes = [];
        this.localIndexes = [];
        this.table = (data === null || data === void 0 ? void 0 : data.table) || "";
        this.dropIfExists = (data === null || data === void 0 ? void 0 : data.dropIfExists) || false;
        this.provisionedThroughput = new ProvisionedThroughput((data === null || data === void 0 ? void 0 : data.provisionedThroughput) || {});
        this.columns = [];
        if ((data === null || data === void 0 ? void 0 : data.columns) && Array.isArray(data === null || data === void 0 ? void 0 : data.columns)) {
            for (const column of data === null || data === void 0 ? void 0 : data.columns) {
                this.columns.push(new Column(column));
            }
        }
        if ((data === null || data === void 0 ? void 0 : data.globalIndexes) && Array.isArray(data === null || data === void 0 ? void 0 : data.globalIndexes)) {
            for (const index of data === null || data === void 0 ? void 0 : data.globalIndexes) {
                this.globalIndexes.push(new GlobalIndex(index));
            }
        }
        if ((data === null || data === void 0 ? void 0 : data.localIndexes) && Array.isArray(data === null || data === void 0 ? void 0 : data.localIndexes)) {
            for (const index of data === null || data === void 0 ? void 0 : data.globalIndexes) {
                this.localIndexes.push(new LocalIndex(index));
            }
        }
        this.items = (data === null || data === void 0 ? void 0 : data.items) || [];
    }
}
exports.default = Schema;
