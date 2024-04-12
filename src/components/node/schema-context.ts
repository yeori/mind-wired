import { MindWiredStore } from "../../service/store/mind-wired-store";
import type { Configuration } from "../config";
import type { ModelSpec, SchemaSpec } from "./node-type";
import { Writable, writable } from "svelte/store";
import { SchemaEventArg } from "../../mindwired-event";

export type EventRef = {
  detail: SchemaEventArg;
};
export type SchemaOperationParam = {
  overwriteIfExist?: boolean;
  skipEvent?: boolean;
};
const DEFAULT_SCHEMA_PARAM: SchemaOperationParam = {
  overwriteIfExist: false,
  skipEvent: false,
};
export class SchemaContext extends MindWiredStore<EventRef> {
  protected store: Writable<EventRef>;
  private _eventRef: EventRef = { detail: undefined };
  constructor(
    private _config: Configuration,
    private readonly _map = new Map<string, SchemaSpec>()
  ) {
    super();
    this.store = writable(this._eventRef);
  }
  private get canvas() {
    return this._config.getCanvas();
  }
  private _notify(event: SchemaEventArg) {
    this._eventRef.detail = event;
    this.update();
    this._eventRef.detail = undefined;
  }
  findSchema(predicate: (schema: SchemaSpec) => boolean) {
    return this.getSchemas().find(predicate);
  }
  /**
   * create or update schema.
   * @param schema
   * @param param
   */
  addSchema(
    schema: SchemaSpec,
    param: SchemaOperationParam = DEFAULT_SCHEMA_PARAM
  ) {
    const existing = this._map.has(schema.name);
    if (existing && !param.overwriteIfExist) {
      throw new Error(`schema [${schema.name}] exists.`);
    }
    this._map.set(schema.name, schema);
    this._registerSchema(schema);
    if (!param.skipEvent) {
      this._notify({
        type: existing ? "update" : "create",
        schemas: [schema],
      });
    }
  }
  private _registerSchema(schemaSpec: SchemaSpec) {
    this.canvas.drawSchema(schemaSpec);
  }
  getSchemas(): SchemaSpec[] {
    return [...this._map.values()];
  }
  removeSchema(
    schemaSpec: SchemaSpec | string,
    param: SchemaOperationParam = DEFAULT_SCHEMA_PARAM
  ) {
    const name = typeof schemaSpec === "string" ? schemaSpec : schemaSpec.name;
    const schema = this._map.get(name);
    if (schema) {
      this.canvas.removeSchema(schema.name);
      this._map.delete(schema.name);
      if (!param.skipEvent) {
        this._notify({ type: "delete", schemas: [schema] });
      }
    }
  }
  dispose() {
    for (const schema of this._map.values()) {
      this.removeSchema(schema, { skipEvent: true });
    }
  }
}

export class SchemaUtil {
  static has(model: ModelSpec, spec: SchemaSpec) {
    const { schema } = model;
    if (!schema) {
      return false;
    }
    const names = schema.split(" ").filter((tk) => tk.length > 0);
    return names.includes(spec.name);
  }
  static toSchema(prop: SchemaSpec | string, ctx: SchemaContext) {
    return typeof prop === "string"
      ? ctx.findSchema((spec) => spec.name === prop)
      : prop;
  }
}
