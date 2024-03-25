import { clone } from "@/service";
import type { MindWired } from "../mind-wired";

export type ExportType = "node" | "schema" | "ui";
export type ExportParam = {
  types: ExportType[];
};
export type ExportResponse = {
  [name in ExportType]?: any;
};
const DEFAULT_EXPORT_VALUE: ExportParam = {
  types: ["node", "schema", "ui"],
};
export class ExportContext {
  constructor(readonly mwd: MindWired) {}
  async export(
    param: ExportParam = DEFAULT_EXPORT_VALUE
  ): Promise<ExportResponse> {
    const res: ExportResponse = {};
    const set = new Set(param.types);
    if (set.has("node")) {
      res.node = clone.deepCopy(await this.mwd.export(false));
    }
    if (set.has("schema")) {
      const ctx = this.mwd.getSchemaContext();
      res.schema = clone.deepCopy(ctx.getSchemas());
    }
    if (set.has("ui")) {
      res.ui = clone.deepCopy(this.mwd.config.ui);
      delete res.ui.offset;
    }
    return Promise.resolve(res);
  }
}
