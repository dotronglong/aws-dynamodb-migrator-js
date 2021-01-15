"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const schema_1 = __importDefault(require("./schema"));
const chalk = require('chalk');
const aws_sdk_1 = __importDefault(require("aws-sdk"));
class Migrator {
    constructor() {
        this.db = new aws_sdk_1.default.DynamoDB();
        this.dc = new aws_sdk_1.default.DynamoDB.DocumentClient();
    }
    migrate(path) {
        const paths = path.split(",");
        const tasks = [];
        for (const dir of paths) {
            const path = dir.trim();
            const files = fs_1.default.readdirSync(path);
            for (const file of files) {
                tasks.push(this.execute(`${path}/${file}`));
            }
        }
        Promise.all(tasks);
    }
    execute(file) {
        return new Promise(async (resolve, reject) => {
            try {
                const content = fs_1.default.readFileSync(file, { encoding: "utf8" });
                const schema = new schema_1.default(JSON.parse(content));
                if (schema.dropIfExists) {
                    await this.delete(schema);
                }
                await this.create(schema);
                const count = await this.seed(schema);
                console.log(`Table ${chalk.blue(schema.table)} :: ${chalk.green("OK")} (${chalk.yellow(count + "/" + schema.items.length)})`);
                resolve();
            }
            catch (e) {
                console.log(`File ${chalk.blue(this.getBasePath(file))} :: ${chalk.red(e.message)}`);
                resolve();
            }
        });
    }
    delete(schema) {
        return new Promise((resolve, reject) => {
            this.db.deleteTable({
                TableName: schema.table
            }, (err) => {
                if (err && err.code !== "ResourceNotFoundException") {
                    reject(new Error(`Table ${chalk.blue(schema.table)} :: FAIL. Cause: ${err.message}`));
                }
                else {
                    resolve();
                }
            });
        });
    }
    create(schema) {
        return new Promise((resolve, reject) => {
            const input = {
                TableName: schema.table,
                ProvisionedThroughput: schema.provisionedThroughput.getProvisionedThroughput(),
                AttributeDefinitions: [],
                KeySchema: []
            };
            for (const column of schema.columns) {
                if (column.index) {
                    input.AttributeDefinitions.push(column.getAttributeDefinition());
                }
                if (column.hash || column.range) {
                    input.KeySchema.push(column.getKeySchemaElement());
                }
            }
            if (schema.globalIndexes.length > 0) {
                input.GlobalSecondaryIndexes = [];
                for (const index of schema.globalIndexes) {
                    input.GlobalSecondaryIndexes.push({
                        IndexName: index.name,
                        Projection: index.projection.getProjection(),
                        ProvisionedThroughput: index.provisionedThroughput.getProvisionedThroughput(),
                        KeySchema: index.keys.map(v => v.getKeySchemaElement())
                    });
                }
            }
            if (schema.localIndexes.length > 0) {
                input.LocalSecondaryIndexes = [];
                for (const index of schema.localIndexes) {
                    input.LocalSecondaryIndexes.push({
                        IndexName: index.name,
                        Projection: index.projection.getProjection(),
                        KeySchema: index.keys.map(v => v.getKeySchemaElement())
                    });
                }
            }
            this.db.createTable(input, (err) => {
                if (err) {
                    reject(new Error(`Table ${chalk.blue(schema.table)} :: FAIL. Cause: ${err.message}`));
                }
                else {
                    resolve();
                }
            });
        });
    }
    seed(schema) {
        return new Promise((resolve) => {
            const tasks = [];
            let count = 0;
            for (const item of schema.items) {
                tasks.push(this.dc.put({
                    TableName: schema.table,
                    Item: item
                }).promise().then(() => count++).catch(() => { }));
            }
            Promise.all(tasks).then(() => resolve(count));
        });
    }
    getBasePath(file, depth = 2) {
        let parts = [];
        if (os_1.default.platform() === "win32") {
            parts = file.split("\\");
        }
        else {
            parts = file.split("/");
        }
        if (parts.length === 0) {
            return file;
        }
        if (parts.length === 1) {
            return parts[0];
        }
        let base = "";
        if (parts.length < depth) {
            depth = parts.length;
        }
        do {
            base = base === "" ? parts[parts.length - depth] : `${base}/${parts[parts.length - depth]}`;
        } while (--depth > 0);
        return base;
    }
}
exports.default = Migrator;
