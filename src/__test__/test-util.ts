import { Configuration } from "@/components/config";
import type {
  ModelSpec,
  NodeSpec,
  NodeLayout,
  ViewSpec,
} from "@/components/node/node-type";
import { DomUtil } from "@/service/dom";
import { EventBus } from "@/service/event-bus";
import { CanvasUI, NodeUI } from "..";

const randInt = (limit?: number) => {
  return Math.floor(Math.random() * (limit || 100));
};
const structNode = (
  node: Partial<NodeSpec>,
  option?: { layout?: NodeLayout; pos?: { x: number; y: number } }
) => {
  const pos = option?.pos;
  if (!node.view) {
    node.view = {
      x: pos?.x || randInt(),
      y: pos?.y || randInt(),
      layout: option?.layout || { type: "X-AXIS" },
    };
  }
  const { subs } = node;
  if (subs) {
    subs.forEach((sub) => structNode(sub, undefined));
  }
};
export const casting = {
  mockNode: (model: ModelSpec, config: Configuration, view?: ViewSpec) => {
    view = view || { x: 0, y: 0 };
    return NodeUI.build({ model, view: view }, config);
  },
  widthNode: (
    node: Partial<NodeSpec>,
    option?: { layout?: NodeLayout; pos?: { x: number; y: number } }
  ): NodeSpec => {
    structNode(node, option);
    return node as NodeSpec;
  },
  withModel: (model: ModelSpec, x?: number, y?: number): NodeSpec => {
    if (x === undefined) {
      x = Math.random() * 100;
    }
    if (y === undefined) {
      y = Math.random() * 100;
    }
    return { model, view: { x, y } };
  },
};

export const mockConfig = {
  create: () => {
    const config = Configuration.parse(
      {
        el: "#app",
        ui: { width: "400px" },
      },
      new DomUtil(),
      new EventBus()
    );
    // FIXME 이거 좀 이상하다... 앙방향 바인딩을 해소해야 함
    config.getCanvas = () => new CanvasUI(config);
    return config;
  },
};
export const text = {
  sliceBetween: (text: string, { s, e }: { s: string; e: string }) => {
    const p = text.indexOf(s);
    if (p < 0) {
      return undefined;
    }
    let q = text.indexOf(e, p + s.length);
    q = q < 0 ? text.length : q;
    return text.substring(p + s.length, q);
  },
};
