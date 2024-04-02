import type Configuration from "../config";
import type { SchemaSpec } from "./node-type";

export class SchemaContext {
  constructor(
    private _config: Configuration,
    private readonly _map = new Map<string, SchemaSpec>()
  ) {}
  private get canvas() {
    return this._config.getCanvas();
  }
  addSchema(schemaSpec: SchemaSpec, overwriteIfExist: boolean = false) {
    if (this._map.has(schemaSpec.name) && !overwriteIfExist) {
      throw new Error(`schema [${schemaSpec.name}] exists.`);
    }
    this._map.set(schemaSpec.name, schemaSpec);
    this._registerSchema(schemaSpec);
  }
  private _registerSchema(schemaSpec: SchemaSpec) {
    this.canvas.drawSchema(schemaSpec);
  }
  getSchemas(): SchemaSpec[] {
    return [...this._map.values()];
  }
  removeSchema(schema: SchemaSpec) {
    const existing = this._map.get(schema.name);
    if (existing) {
      this.canvas.removeSchema(existing.name);
    }
  }
  dispose() {
    for (const schema of this._map.values()) {
      this.removeSchema(schema);
    }
  }
}
