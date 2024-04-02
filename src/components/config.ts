import type { ModelSpec, NodeSpec, ViewSpec } from "./node/node-type";
import { clone } from "../service";
import { EventBus } from "../service/event-bus";
import { Point } from "../service/geom";
import type { MindWiredEvent } from "../mindwired-event";
import type { InitParam, SnapToEntitySetting, UISetting } from "../setting";
import type { CanvasUI } from "./canvas-ui";
import type { NodeUI } from "./node/node-ui";
import type { NodeRenderingContext } from "./node/node-rendering-context";
import type { MindWired } from "./mind-wired";
import type { DomUtil } from "../service/dom";

let nodeUuid = 100;
const DEFAULT_UI_SETTING: UISetting = {
  width: 600,
  height: 600,
  scale: 1.0,
  uuid: () => `uuid-${nodeUuid++}`,
  clazz: {
    node: "active-node",
    edge: "active-edge",
    schema: (schemaName: string): string => schemaName,
    level: (level: number): string => `level-${level}`,
    folded: "folded",
  },
  styleDef: {
    schema: {
      styleId: `#mwd-schema-@schema@mapId`,
      selector: `[data-mind-wired-viewport@mapId] .mwd-node.@schema > .mwd-body`,
    },
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
  readonly ebus: EventBus;
  dom: DomUtil;
  mindWired?: () => MindWired;
  model: ModelSpec;
  view: ViewSpec;
  subs: NodeSpec[];
  getCanvas: () => CanvasUI;
  getNodeRenderer: () => NodeRenderingContext;
  constructor({
    el,
    ui,
    dom,
    eventBus,
  }: {
    el: HTMLElement;
    ui: UISetting;
    dom: DomUtil;
    eventBus: EventBus;
  }) {
    this.el = el;
    this.ui = ui;
    this.dom = dom;
    this.ebus = eventBus || new EventBus();
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
  listen<A = any>(eventName: MindWiredEvent<A>, callback: (arg: A) => void) {
    this.ebus.on(eventName, callback);
    return this;
  }
  off<A = any>(event: MindWiredEvent<A>, callback: Function) {
    this.ebus.off(event.name, callback);
  }
  emit<A = any>(event: MindWiredEvent<A>, args?: A) {
    this.ebus.emit(event, args);
    return this;
  }
  static parse(param: InitParam, dom: DomUtil, eventBus?: EventBus) {
    const ui: UISetting = clone.mergeLeaf(
      param.ui || ({} as UISetting),
      clone.deepCopy(DEFAULT_UI_SETTING)
    ) as UISetting;

    normalizeOffset(ui);
    normalizeSnap(ui, dom);

    const el =
      typeof param.el === "string"
        ? (document.querySelector(param.el as string) as HTMLElement)
        : param.el;
    return new Configuration({ el, ui, dom, eventBus });
  }
}
const normalizeOffset = (ui: UISetting) => {
  const { offset } = ui;
  if (!(offset instanceof Point)) {
    ui.offset = new Point(ui.offset.x, ui.offset.y);
  }
};
const normalizeSnap = (ui: UISetting, dom: DomUtil) => {
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
    if (snap.enabled === undefined) {
      snap.enabled = true;
    }
  }
};
// Configuration
export default Configuration;
