import type { ModelSpec, NodeSpec, ViewSpec } from "./node/node-type";
import { dom, clone } from "../service";
import { EventBus } from "../service/event-bus";
import { Point } from "../service/geom";
import { InitParam, SnapToEntitySetting, UISetting } from "../setting";
import type { CanvasUI } from "./canvas-ui";
import { type NodeUI } from "./node/node-ui";
import { NodeRenderingContext } from "./node/node-rendering-context";
import { MindWired } from "./mind-wired";
const DEFAULT_UI_SETTING: UISetting = {
  width: 600,
  height: 600,
  scale: 1.0,
  clazz: {
    node: "active-node",
    edge: "active-edge",
    schema: (schemaName: string): string => schemaName,
    level: (level: number): string => `level-${level}`,
    folded: "folded",
  },
  offset: new Point(0, 0),
  snap: {
    limit: 4,
    width: 0.4,
    dash: [6, 2],
    color: { horizontal: "orange", vertical: "#2bc490" },
  },
  selection: {
    padding: 5,
    "background-color": "#b3ddff6b",
    "border-radius": "4px",
  },
  useDefaultIcon: true,
};
class Configuration {
  el: HTMLElement;
  ui: UISetting;
  ebus: EventBus;
  mindWired?: () => MindWired;
  model: ModelSpec;
  view: ViewSpec;
  subs: NodeSpec[];
  getCanvas: () => CanvasUI;
  getNodeRenderer: () => NodeRenderingContext;
  constructor({ el, ui }: { el: HTMLElement; ui: UISetting }) {
    this.el = el;
    this.ui = ui;
    this.ebus = new EventBus();
  }
  get width() {
    return this.ui.width;
  }
  get height() {
    return this.ui.height;
  }
  get scale() {
    return this.ui.scale;
  }
  get snapEnabled() {
    return (this.ui.snap as SnapToEntitySetting).enabled;
  }
  get snapSetting() {
    return this.ui.snap as SnapToEntitySetting;
  }
  getOffset() {
    const offset = this.ui.offset;
    return offset.clone();
  }
  setOffset(offset: Point) {
    this.ui.offset = offset.clone();
  }
  relativeOffset(offset: Point) {
    const baseOffset = this.ui.offset;
    return baseOffset.sum(offset); // { x: baseOffset.x + offset.x, y: baseOffset.y + offset.y };
  }
  activeClassName(type: string) {
    const className = this.ui.clazz[type];
    if (!className) {
      throw new Error(`[MINDWIRED][ERROR] no classname of type : "${type}"`);
    }
    return className;
  }
  nodeLevelClassName(node: NodeUI): string {
    const { level } = this.ui.clazz;
    let className: string = undefined;
    if (typeof level === "string") {
      className = level;
    } else if (typeof level === "function") {
      className = level(node.level(), node.spec);
    } else {
      className = `level-${node.level()}`;
    }
    return className;
  }
  foldedNodeClassName(): string {
    return this.ui.clazz.folded || "folded";
  }
  listen(eventName: string, callback: Function) {
    this.ebus.on(eventName, callback);
    return this;
  }
  off(eventName: string, callback: Function) {
    this.ebus.off(eventName, callback);
  }
  emit(eventName: string, args?: any, emitForClient?: boolean) {
    this.ebus.emit(eventName, args, !!emitForClient);
    return this;
  }
  static parse(param: InitParam) {
    const ui: UISetting = clone.mergeLeaf(
      param.ui || ({} as UISetting),
      clone.deepCopy(DEFAULT_UI_SETTING)
    ) as UISetting;

    normalizeOffset(ui);
    normalizeSnap(ui);

    const el =
      typeof param.el === "string"
        ? (document.querySelector(param.el as string) as HTMLElement)
        : param.el;
    return new Configuration({ el, ui });
  }
}
const normalizeOffset = (ui: UISetting) => {
  const { offset } = ui;
  if (!(offset instanceof Point)) {
    ui.offset = new Point(ui.offset.x, ui.offset.y);
  }
};
const normalizeSnap = (ui: UISetting) => {
  const { snap } = ui;
  const defaultSnap = DEFAULT_UI_SETTING.snap as SnapToEntitySetting;
  if (snap === false) {
    ui.snap = clone.deepCopy(defaultSnap) as SnapToEntitySetting;
    ui.snap.enabled = false;
  } else {
    if (dom.valid.string(snap.color)) {
      const color = snap.color as string;
      snap.color = {
        horizontal: color.trim(),
        vertical: color.trim(),
      };
    }
    snap.limit = snap.limit || defaultSnap.limit;
    snap.width = snap.width || defaultSnap.width;
    if (snap.dash !== false) {
      snap.dash = snap.dash || defaultSnap.dash;
    }
    snap.enabled = true;
  }
};
// Configuration
export default Configuration;
