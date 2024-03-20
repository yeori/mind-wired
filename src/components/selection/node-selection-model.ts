import { type ModelSpec } from "../node/node-type";
import { EVENT } from "../../service/event-bus";
import Configuration from "../config";
import { MindWired } from "../mind-wired";
import { type NodeUI } from "../node/node-ui";
import { NodeSelectArg } from "../../mindwired-event";
const clearSelection = (nodeMap: Map<string, NodeUI>) => {
  const nodes = [...nodeMap.values()];
  nodes.forEach((node) => {
    node.setSelected(false);
  });
  nodeMap.clear();
  return nodes;
};
const skipStateForInsert = (nodes: NodeUI[]) => {
  if (nodes.length !== 1) {
    return true;
  }
  if (nodes[0].isEditingState()) {
    return true;
  }
  return false;
};

const skipStateForDelete = (nodes: NodeUI[]) => {
  if (nodes.length === 0) {
    return true;
  }
  // root node cannot be deleted
  const rootNode = nodes.find((node) => node.isRoot());
  return !!rootNode;
};
const appendNode = (
  model: NodeSelectionModel,
  parent: NodeUI,
  sibling: NodeUI
) => {
  const mwd: MindWired = model.config.mindWired();
  mwd.addNode(
    parent,
    {
      model: { text: "TITLE" } as ModelSpec,
      view: undefined,
    },
    { siblingNode: sibling }
  );
};
const deleteNodes = (selectionModel, nodesToDel) => {
  const mwd = selectionModel.config.mindWired();
  mwd.deleteNodes(nodesToDel);
};
const notifySelection = (model: NodeSelectionModel, append: boolean) => {
  const { config } = model;
  const nodes = model.getNodes();
  setTimeout(() =>
    config.emit(EVENT.NODE.SELECTED.CLIENT, {
      nodes,
      append,
      type: "select",
    })
  );
};
export class NodeSelectionModel {
  config: Configuration;
  /**
   * selected nodes<uid, NodeUI>
   *
   * @template key - uid of node
   * @template value - NodeUI instance
   */
  nodeMap: Map<string, NodeUI>;
  constructor(config: Configuration) {
    this.config = config;
    this.nodeMap = new Map(); // [uid:strng, NodeUI]

    const canvasUI = this.config.getCanvas();
    this.config.listen(
      EVENT.NODE.SELECTED,
      ({ nodes, append }: NodeSelectArg) => {
        this.selectNodes(nodes, append, true);
      }
    );
    this.config.listen(EVENT.VIEWPORT.CLICKED, () => {
      this.clearSelection();
    });

    const { dom } = this.config;
    dom.event.keyup(canvasUI.$viewport, (e) => {
      if (this.isEmpty()) {
        return;
      }
      const { code } = e as KeyboardEvent;
      const [nodeUI] = [...this.nodeMap.values()];
      const editing = nodeUI.isEditingState();
      if ("Space" === code && !editing) {
        e.stopPropagation();
        canvasUI.clearNodeSelection();
        this.config.emit(EVENT.NODE.EDITING, { editing: true, node: nodeUI });
      } else if ("Escape" === code) {
        this.config.emit(EVENT.NODE.EDITING, { editing: false, node: nodeUI });
      }
    });
    dom.event.keydown(
      canvasUI.$viewport,
      (e) => {
        const nodes = this.getNodes();
        if (skipStateForInsert(nodes)) {
          return;
        }
        e.stopPropagation();
        e.stopImmediatePropagation();
        appendNode(this, nodes[0].parent, nodes[0]);
      },
      "enter"
    );
    dom.event.keydown(
      canvasUI.$viewport,
      (e) => {
        const nodes = this.getNodes();
        if (skipStateForInsert(nodes)) {
          return;
        }
        e.stopPropagation();
        e.stopImmediatePropagation();
        appendNode(this, nodes[0], nodes[0].lastChild());
      },
      "shift@enter"
    );

    dom.event.keydown(
      canvasUI.$viewport,
      (e) => {
        const nodes = this.getNodes();
        if (skipStateForDelete(nodes)) {
          return;
        }
        e.stopPropagation();
        e.stopImmediatePropagation();
        deleteNodes(this, nodes);
        clearSelection(this.nodeMap);
        notifySelection(this, false);
      },
      "delete"
    );
  }
  /**
   * set the state of nodes 'selected'
   * @param nodes nodes to select
   * @param append if true, keep current selection state, otherwise reset selection state with the nodes
   * @returns
   */
  selectNodes(
    nodes: NodeUI[],
    append: boolean,
    propagateEvent: boolean = false
  ) {
    const nodesToSelect: NodeUI[] = nodes.filter(
      (node) => !this.nodeMap.has(node.uid)
    );
    if (nodesToSelect.length === 0) {
      return nodesToSelect;
    }
    if (!append) {
      clearSelection(this.nodeMap);
    }
    nodesToSelect.forEach((node) => {
      this.nodeMap.set(node.uid, node);
      node.setSelected(true);
    });
    if (propagateEvent) {
      notifySelection(this, append);
    }
    return nodesToSelect;
  }
  isEmpty() {
    return this.nodeMap.size === 0;
  }
  getNodes() {
    return [...this.nodeMap.values()];
  }
  clearSelection() {
    const nodes = clearSelection(this.nodeMap);
    if (nodes.length > 0) {
      this.config.getCanvas().clearNodeSelection();
      notifySelection(this, false);
    }
    return nodes;
  }
}
