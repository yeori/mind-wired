import { EVENT } from "../service/event-bus";
import CanvasUI from "./canvas-ui";
import { EdgeUI } from "./edge";
import { NodeUI } from "./node/node-ui";
import layoutManager from "./layout";
import selection from "./selection";
import { NodeEditing } from "./editing";
import { INodeRenderer, RenderingDelegate, installNodeRenderer } from "./node";
import AlignmentUI from "./alignment/alignment-ui";
import { dom } from "../service";
import TreeDataSource from "./datasource/tree-ds";
import DragContext from "./drag-context";
import type Configuration from "./config";
import { type NodeRenderingContext } from "./node/node-rendering-context";
import { ModelSpec, NodeLayout, NodeSpec, ViewSpec } from "./node/node-type";
import { type NodeSelectionModel } from "./selection/node-selection-model";
import {
  DataSourceFactory,
  DatasourceOptionalParam,
  KeyExtractor,
} from "./datasource";

const exportTree = (config: Configuration, nodeUI: NodeUI): NodeSpec => {
  const v: ViewSpec = nodeUI.spec.view;
  const view: ViewSpec = {
    x: v.x,
    y: v.y,
    layout: undefined,
    folding: undefined,
  };
  if (nodeUI.isRoot()) {
    view.x = config.ui.offset.x;
    view.y = config.ui.offset.y;
  }
  if (v.layout) {
    view.layout = v.layout;
  }
  if (v.edge) {
    view.edge = v.edge;
  }
  const subs: NodeSpec[] = [];
  nodeUI.subs.forEach((childUI) => {
    subs.push(exportTree(config, childUI));
  });
  return {
    model: nodeUI.model,
    view,
    subs,
  };
};
const repaintTree = (mwd: MindWired, node: NodeUI, propagate = true) => {
  node.repaint();
  if (propagate) {
    node.subs.forEach((childNode: NodeUI) => {
      repaintTree(mwd, childNode);
    });
  }
  if (node.isFolded()) {
    mwd.config.emit(EVENT.NODE.FOLDED, {
      node: node,
      folded: true,
    });
  }
};
const updateLevelClass = (
  nodeUI: NodeUI,
  method: "add" | "remove",
  config: Configuration
) => {
  const className = config.nodeLevelClassName(nodeUI);
  dom.clazz[method](nodeUI.$bodyEl, className);
  nodeUI.subs.forEach((childUI) => updateLevelClass(childUI, method, config));
};
export class MindWired {
  config: Configuration;
  canvas: CanvasUI;
  nodeRenderingContext: NodeRenderingContext;
  nodeSelectionModel: NodeSelectionModel;
  nodeEditor: NodeEditing;
  alignmentUI: AlignmentUI;
  dragContext: DragContext;
  edgeUI: EdgeUI;
  rootUI: NodeUI;
  private _dsFactory: DataSourceFactory;
  /**
   *
   * @param {Configuration} config
   */
  constructor(config: Configuration) {
    this.config = config;
    config.mindWired = () => this;

    this.canvas = new CanvasUI(config);
    config.getCanvas = () => this.canvas;

    this.nodeRenderingContext = installNodeRenderer(this.canvas);
    config.getNodeRenderer = () => this.nodeRenderingContext;

    this.nodeSelectionModel = selection.createSelectionModel("node", config);
    this.nodeEditor = new NodeEditing(config);
    this.alignmentUI = new AlignmentUI(config);
    this.dragContext = new DragContext();
    this._dsFactory = new DataSourceFactory();

    this.config.listen(EVENT.DRAG.VIEWPORT, (e) => {
      this.config.setOffset(e.offset);
      // this.repaint();
      this.canvas.repaintNodeHolder();
      this.edgeUI.repaint();
      if (e.state === "DONE") {
        this.rootUI.setPos(e.offset.x, e.offset.y, false);
        try {
          this.config.emit(EVENT.NODE.UPDATED.CLIENT, {
            nodes: [this.rootUI],
            type: "pos",
          });
        } finally {
          this.rootUI.setPos(0, 0);
        }
      }
    });

    this.config
      .listen(EVENT.DRAG.NODE, (e) => {
        if (e.state === "READY") {
          const nodes = this.nodeSelectionModel.getNodes();
          /*
           * shift@click on nodes redirects dragging to their children
           */
          const dragTargets =
            e.target === "all" ? nodes : nodes.flatMap((node) => node.subs);
          // this.draggingNodes = capatureDragData(dragTargets);
          this.dragContext.prepareDnd(dragTargets);
          this.alignmentUI.turnOn(this.rootUI, dragTargets);
          this.canvas.updateSelection(nodes);
        } else if (e.state === "DRAG") {
          const acceleration = e.target === "all" ? 1 : 2.5;
          this.dragContext.eachCapture((dragging) => {
            const { node, dir, pos } = dragging;
            dir.capture();
            node.setPos(
              acceleration * e.x + pos.x,
              acceleration * e.y + pos.y,
              !this.config.snapEnabled
            );
          });
          this.alignmentUI.doAlign();
          this.dragContext.eachCapture((dragging) => {
            const { node, dir } = dragging;
            layoutManager.layout(node, { dir, layoutManager });
          });
          this.canvas.updateSelection(this.nodeSelectionModel.getNodes());
          this.edgeUI.repaint(!this.config.snapEnabled);
        } else if (e.state === "DONE") {
          this.alignmentUI.turnOff();
          this.edgeUI.repaint(true);
          const nodes = this.dragContext.getUpdatedNodes();
          if (nodes.length > 0) {
            this.config.emit(EVENT.NODE.UPDATED.CLIENT, {
              nodes,
              type: "pos",
            });
          }
          this.dragContext.clear();
        }
      })
      .listen(EVENT.NODE.EDITING, ({ editing, nodeUI }) => {
        // console.log("[edit]", nodeUI);
        if (editing) {
          this.nodeEditor.edit(nodeUI);
        } else {
          this.nodeEditor.close();
        }
      })
      .listen(EVENT.NODE.FOLDED, ({ node }) => {
        this.canvas.updateFoldingNodes(node);
      })
      .listen(EVENT.NODE.UPDATED, (nodes: NodeUI[]) => {
        nodes.forEach((node) => node.repaint());
        this.edgeUI.repaint();
        this.config.emit(EVENT.NODE.UPDATED.CLIENT, { nodes, type: "model" });
      });
  }
  /**
   *
   * @param dataSourceId unique id for datasource
   * @param keyExtractor provides unique id for each items in the datasource
   * @param param - used for mapping (data source, node renderer)
   * @returns
   */
  createDataSource<T, K>(
    dataSourceId: string,
    keyExtractor: KeyExtractor<T, K>,
    param?: DatasourceOptionalParam<T>
  ) {
    const ds = this._dsFactory.createDataSource(dataSourceId, keyExtractor);
    if (param) {
      const { renderer } = param;
      if (renderer) {
        this.nodeRenderingContext.registerCustomRender(renderer);
        this._dsFactory.bindMapping(ds, renderer.name);
      }
    }
    return ds;
  }
  isEditing() {
    return this.nodeEditor.isEditing();
  }
  nodes(elems: NodeSpec) {
    if (elems instanceof TreeDataSource) {
      const root = elems.build();
      this.rootUI = NodeUI.build(root, this.config);
    } else if (elems) {
      this.rootUI = NodeUI.build(elems, this.config);
    }
    this.edgeUI = new EdgeUI(this.config, this.rootUI, this.canvas);
    this.config.ui.offset.x = this.rootUI.spec.view.x;
    this.config.ui.offset.y = this.rootUI.spec.view.y;
    this.rootUI.spec.view.x = 0;
    this.rootUI.spec.view.y = 0;

    this.repaint();
    return this;
  }
  findNode(predicate) {
    return this.rootUI.find(predicate);
  }
  addNode(parentNode: NodeUI, nodeData: NodeSpec, option?) {
    const data: NodeSpec = {
      root: false,
      model: nodeData.model,
      view: nodeData.view,
    };
    if (!data.view) {
      data.view = {
        x: 100,
        y: 0,
      };
    }
    const nodeUI = new NodeUI(data, this.config, parentNode);
    this.canvas.regsiterNode(nodeUI);
    parentNode.addChild(nodeUI);
    if (option?.siblingNode) {
      const rect = dom.domRect(option.siblingNode.$bodyEl);
      layoutManager.setPosition(nodeUI, {
        baseNode: option.siblingNode,
        rect,
      });
    }
    nodeUI.repaint();
    // this.canvas.repaint(nodeUI);

    this.config.emit(EVENT.NODE.CREATED, { nodes: [nodeUI] }, true);
    if (option && (option.editing || option.select)) {
      this.config.emit(EVENT.NODE.SELECTED, { node: nodeUI });
    }
    if (option && option.editing) {
      this.nodeEditor.edit(nodeUI);
    }
  }
  moveNodes(parentNode: NodeUI, nodes: NodeUI[], trigger: boolean = false) {
    const childNodes = nodes.filter((node) => node.parent !== parentNode);
    childNodes.forEach((child) => {
      updateLevelClass(child, "remove", this.config);
      const prevParent = parentNode.addChild(child);
      updateLevelClass(child, "add", this.config);

      this.config.emit(EVENT.NODE.MOVED, { node: child, prevParent });
    });
    parentNode.setFolding(false);
    repaintTree(this, parentNode);
    this.canvas.updateSelection(nodes);
    if (trigger) {
      this.config.emit(EVENT.NODE.UPDATED.CLIENT, {
        nodes: childNodes,
        type: "path",
      });
    }
  }
  deleteNodes(nodes: NodeUI[]) {
    const updated = [];
    const deleted = [];
    nodes.forEach((node) => {
      const { parent, childNodes } = node;
      if (childNodes.length > 0) {
        // 1. move node.children to node.parent
        childNodes.forEach((child) => {
          // keep position
          child.setPos(child.x + node.x, child.y + node.y);
        });
        this.moveNodes(parent, childNodes);
        // child node can be in deleted nodes
        updated.push(...childNodes.filter((c) => !nodes.includes(c)));
      }
      // 2. delete node(which has no children)
      const deletedChild = node.parent.removeChild(node);
      if (deletedChild) {
        this.canvas.unregisterNode(deletedChild);
        this.config.emit(EVENT.NODE.DELETED, deletedChild);
        deleted.push(node);
      }
    });
    if (updated.length > 0) {
      this.config.emit(EVENT.NODE.UPDATED.CLIENT, {
        nodes: updated,
        type: "path",
      });
    }
    if (deleted.length > 0) {
      this.config.emit(EVENT.NODE.DELETED.CLIENT, { nodes: deleted });
    }
  }
  getSelectedNodes() {
    return this.nodeSelectionModel.getNodes();
  }
  setLayout(layoutSpec: NodeLayout, nodeUI: NodeUI) {
    const targetNode = nodeUI || this.rootUI;
    targetNode.spec.view.layout = layoutSpec;
    this.repaint();
  }
  setEdge(edgeSpec, nodeUI) {
    const targetNode = nodeUI || this.rootUI;
    targetNode.config.view.edge = edgeSpec;
    this.repaint(nodeUI);
  }
  setScale(scale) {
    this.config.ui.scale = scale;
    console.log(this.config.ui.scale);
    this.repaint();
  }
  repaint(nodeUI?: NodeUI) {
    nodeUI = nodeUI || this.rootUI;
    repaintTree(this, nodeUI);
    this.canvas.repaintNodeHolder();
    layoutManager.layout(nodeUI, { dir: null });
    this.edgeUI.repaint();

    this.canvas.clearNodeSelection();
    this.canvas.updateSelection(this.getSelectedNodes());
  }
  listen(event, callback) {
    this.config.ebus.listen(`${event}.client`, callback);
    return this;
  }
  getNodeRender(model: ModelSpec): INodeRenderer {
    let nodeRenderer = this.nodeRenderingContext.getRendererByModel(model);
    if (!nodeRenderer && model.provider) {
      const ds = this._dsFactory.findDataSourceByKey(model.provider.key);
      if (ds) {
        const renderName = this._dsFactory.getRendererName(ds.id);
        nodeRenderer = this.nodeRenderingContext.getRenderer(renderName);
      }
    }
    return nodeRenderer;
  }
  translateModel(model: ModelSpec) {
    if (model.provider) {
      const { key } = model.provider;
      const ds = this._dsFactory.findDataSourceByKey(key);
      const userData = ds.getData(key);
      const renderName = this._dsFactory.getRendererName(ds.id);
      const nodeRenderer = this.nodeRenderingContext.getRenderer(
        renderName
      ) as RenderingDelegate<any>;
      const { delegate } = nodeRenderer;
      const { text, iconBadge, thumbnail } = delegate;
      let m: ModelSpec;
      if (text) {
        m = { type: "text", text: text(userData) };
      } else if (iconBadge) {
        m = { type: "icon-badge", "icon-badge": iconBadge(userData) };
      } else if (thumbnail) {
        m = { type: "thumbnail", thumbnail: thumbnail(userData) };
      }
      return m;
    } else {
      return model;
    }
  }
  export() {
    const nodeSpec = exportTree(this.config, this.rootUI);
    return Promise.resolve(JSON.stringify(nodeSpec));
  }
}
