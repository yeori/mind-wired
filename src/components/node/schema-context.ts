import { SchemaSpec } from "./node-type";

export class SchemaContext {
  constructor(private readonly _map = new Map<string, SchemaSpec>()) {}
  addSchema(schemaSpec: SchemaSpec) {
    if (this._map.has(schemaSpec.name)) {
      throw new Error(`schema [${schemaSpec.name}] exists.`);
    }
    this._map.set(schemaSpec.name, schemaSpec);
  }
  getSchemas(): SchemaSpec[] {
    return [...this._map.values()];
  }
}
