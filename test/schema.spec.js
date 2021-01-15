const assert = require("assert");
const fs = require("fs");
const Schema = require("../build/schema").default;

describe("Schema", function() {
  it("should parse schema correctly", function() {
    const schema = new Schema(JSON.parse(fs.readFileSync(__dirname + "/../fixtures/schema.json")));
    assert.equal(schema.table, "Pet");
    assert.equal(schema.provisionedThroughput.readCapacityUnits, 15);
    assert.equal(schema.provisionedThroughput.writeCapacityUnits, 10);
    assert.equal(schema.columns[0].name, "id");
    assert.equal(schema.columns[0].type, "S");
    assert.equal(schema.columns[0].index, true);
    assert.equal(schema.columns[0].hash, true);
    assert.equal(schema.columns[1].name, "name");
    assert.equal(schema.columns[1].type, "S");
    assert.equal(schema.globalIndexes[0].name, "gb_idx_type");
    assert.equal(schema.globalIndexes[0].provisionedThroughput.readCapacityUnits, 5);
    assert.equal(schema.globalIndexes[0].provisionedThroughput.writeCapacityUnits, 5);
    assert.equal(schema.globalIndexes[0].projection.type, "ALL");
    assert.equal(schema.globalIndexes[0].projection.nonKeys.length, 0);
    assert.equal(schema.globalIndexes[0].keys[0].name, "type");
    assert.equal(schema.globalIndexes[0].keys[0].hash, true);
    assert.equal(schema.items[0].id, "10001");
    assert.equal(schema.items[0].name, "Kitty");
  });
});