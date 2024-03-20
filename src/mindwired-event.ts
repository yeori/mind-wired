import type { NodeUI } from "./components/node";
import type { Point } from "./service/geom";

export type MindWiredEvent<T> = {
  name: string;
  desc: string;
  CLIENT?: MindWiredEvent<T>;
};

export type ViewportDragEventArg = {
  state: "drag" | "done";
  offset: Point;
};
export type ViewportDragEvent<T> = MindWiredEvent<T>;
/**
 * drag state of node
 */
export type NodeDragEventArg = {
  /**
   * unique node id
   */
  nodeId: string;
  /**
   * drag state
   *
   * * ready - before dragging(mouse pressed)
   * * drag - dragging state(mouse moving while pressed )
   * * done - dragging finished(mouse released)
   */
  state: "ready" | "drag" | "done";
  /**
   *
   * * children - all descendant nodes are affected except the dragged one
   * * all - all descendant nodes are affected including the dragged one
   */
  target: "children" | "all";
  /**
   * current node x-position relative to center of viewport
   */
  x: number;
  /**
   * current node y-position relative to center of viewport
   */
  y: number;
};
export type NodeDragEvent<T> = MindWiredEvent<T>;

export type DragBranch = {
  VIEWPORT: ViewportDragEvent<ViewportDragEventArg>;
  NODE: NodeDragEvent<NodeDragEventArg>;
};

export type NodeEventArg = {
  /**
   * affected nodes
   */
  nodes: NodeUI[];
  type: "select" | "click" | "create" | "update" | "delete" | "path";
};
export type NodeSelectArg = {
  nodes: NodeUI[];
  append: boolean;
  type: "select";
};
export type NodeEditingArg = {
  node: NodeUI;
  editing: boolean;
};
export type NodeFoldingArg = {
  node: NodeUI;
  folded: boolean;
};
export type NodeMoveArg = {
  node: NodeUI;
  prevParent: NodeUI;
};
export type NodeEvent<T> = MindWiredEvent<T> & {
  CLIENT: MindWiredEvent<T>;
};
export type NodeBranch = {
  /**
   * one more more nodes selected
   */
  SELECTED: NodeEvent<NodeSelectArg>;
  /**
   * a node created
   */
  CREATED: NodeEvent<NodeEventArg>;
  /**
   * node(s) deleted
   */
  DELETED: NodeEvent<NodeEventArg>;
  /**
   * node(s) updated
   */
  UPDATED: NodeEvent<NodeEventArg>;
  /**
   * a node clicked
   */
  CLICKED: NodeEvent<NodeEventArg>;
  /**
   * editing state of a node
   */
  EDITING: NodeEvent<NodeEditingArg>;
  /**
   * folding state of a node
   */
  FOLDED: NodeEvent<NodeFoldingArg>;
  /**
   * node's parent changed
   */
  MOVED: NodeEvent<NodeMoveArg>;
};

export type ViewportEventArg = {
  type: "click" | "resize";
};
export type ViewportEvent<T> = MindWiredEvent<T>;
export type ViewportBranch = {
  RESIZED: ViewportEvent<ViewportEventArg>;
  CLICKED: ViewportEvent<ViewportEventArg>;
};
export type EventRoot = {
  DRAG: DragBranch;
  // SELECTION: SelectionBranch;
  NODE: NodeBranch;
  VIEWPORT: ViewportBranch;
};

export const EVENT: EventRoot = {
  DRAG: {
    VIEWPORT: { name: "viewport.dragged", desc: "" },
    NODE: { name: "node.dragged", desc: "" },
  },
  NODE: {
    CREATED: {
      name: "node.created",
      desc: "new node created",
      CLIENT: {
        name: "node.created.client",
        desc: "client-side node creation event",
      },
    },
    DELETED: {
      name: "node.deleted",
      desc: "node has been deleted",
      CLIENT: {
        name: "node.deleted.client",
        desc: "client-side node deletion event",
      },
    },
    UPDATED: {
      name: "node.updated",
      desc: "content of node updated",
      CLIENT: {
        name: "node.updated.client",
        desc: "client-side node update event",
      },
    },
    SELECTED: {
      name: "node.selected",
      desc: "one or more nodes selected",
      CLIENT: {
        name: "node.selected.client",
        desc: "client-side node selection event",
      },
    },
    CLICKED: {
      name: "node.clicked",
      desc: "a node clicked(without dragging)",
      CLIENT: {
        name: "node.clicked.client",
        desc: "client-side node click event",
      },
    },
    EDITING: {
      name: "node.editing",
      desc: "node's editing state",
      CLIENT: {
        name: "node.editing.client",
        desc: "client-side node editing state",
      },
    },
    FOLDED: {
      name: "node.folded",
      desc: "node is folded or unfolded",
      CLIENT: {
        name: "node.folded.client",
        desc: "client-side node editing state",
      },
    },
    MOVED: {
      name: "node.moved",
      desc: "node is folded or unfolded",
      CLIENT: {
        name: "node.moved.client",
        desc: "client-side node editing state",
      },
    },
  },
  VIEWPORT: {
    RESIZED: {
      name: "viewport.resized",
      desc: "viewport size chaged",
    },
    CLICKED: {
      name: "viewport.clicked",
      desc: "viewport has been clicked",
    },
  },
};

const eventList = EVENT;
export { eventList };
