import fs from "fs";
import os from "os";
import Schema from "./schema";
const chalk = require('chalk');
import AWS from "aws-sdk";

export default class Migrator {
  private db: AWS.DynamoDB;
  private dc: AWS.DynamoDB.DocumentClient;

  constructor() {
    this.db = new AWS.DynamoDB();
    this.dc = new AWS.DynamoDB.DocumentClient();
  }

  /**
   * Scan & start migration
   * @param path path to location to be scanned, 
   *             multiple paths are allowed and
   *             separate by comma
   */
  migrate(path: string) {
    const paths = path.split(",");
    const tasks = [];
    for (const dir of paths) {
      const path = dir.trim();
      const files = fs.readdirSync(path);
      for (const file of files) {
        tasks.push(this.execute(`${path}/${file}`));
      }
    }
    Promise.all(tasks);
  }

  private execute(file: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const content = fs.readFileSync(file, { encoding: "utf8" });
        const schema = new Schema(JSON.parse(content));
        if (schema.dropIfExists) {
          await this.delete(schema);
        }
        await this.create(schema);
        const count = await this.seed(schema);
        console.log(`Table ${chalk.blue(schema.table)} :: ${chalk.green("OK")} (${chalk.yellow(count + "/" + schema.items.length)})`);
        resolve();
      } catch (e) {
        console.log(`File ${chalk.blue(this.getBasePath(file))} :: ${chalk.red(e.message)}`);
        resolve();
      }
    });
  }

  /**
   * Delete table
   * @param schema an object holds table's schema
   */
  private delete(schema: Schema): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.db.deleteTable({
        TableName: schema.table
      }, (err) => {
        if (err && err.code !== "ResourceNotFoundException") {
          reject(new Error(`Table ${chalk.blue(schema.table)} :: FAIL. Cause: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Create table
   * @param schema an object holds table's schema
   */
  private create(schema: Schema): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const input: AWS.DynamoDB.Types.CreateTableInput = {
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
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Seed table
   * @param schema an object holds table's schema
   */
  private seed(schema: Schema): Promise<number> {
    return new Promise<number>((resolve) => {
      const tasks = [];
      let count = 0;
      for (const item of schema.items) {
        tasks.push(this.dc.put({
          TableName: schema.table,
          Item: item
        }).promise().then(() => count++).catch(() => {}));
      }
      Promise.all(tasks).then(() => resolve(count));
    });
  }

  /**
   * Get base path by depth
   * 
   * Example: file /root/dir_a/dir_b/file.json 
   *          with depth 2 will return dir_b/file.json
   *
   * @param file path to file
   * @param depth max depths
   */
  private getBasePath(file: string, depth: number = 2): string {
    let parts: string[] = [];
    if (os.platform() === "win32") {
      parts = file.split("\\");
    } else {
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