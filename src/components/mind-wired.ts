import { EVENT, parseEvent } from "../service/event-bus";
import { CanvasUI } from "./canvas-ui";
import { EdgeUI } from "./edge";
import { NodeUI } from "./node/node-ui";
import { NodeLayoutContext } from "./layout";
import {
  NodeEditingContext,
  installDefaultEditors,
} from "./node/node-editing-context";
import { INodeRenderer } from "./node";
import { RenderingDelegate } from "./node/renderer/renderer-delegate";
import AlignmentUI from "./alignment/alignment-ui";
import TreeDataSource from "./datasource/tree-ds";
import { DragContext, type Capture } from "./drag-context";
import type Configuration from "./config";
import {
  installDefaultRenderers,
  NodeRenderingContext,
} from "./node/node-rendering-context";
import { ModelSpec, NodeLayout, NodeSpec, ViewSpec } from "./node/node-type";
import { NodeSelectionModel } from "./selection";
import {
  DataSourceFactory,
  DatasourceOptionalParam,
  KeyExtractor,
} from "./datasource";
import { IEdgeRenderer } from "./edge/edge-renderer-type";
import type {
  NodeDragEvent,
  NodeDragEventArg,
  NodeEditingArg,
  NodeEvent,
  NodeEventArg,
  NodeFoldingArg,
  ViewportDragEvent,
  ViewportDragEventArg,
  ViewportEvent,
} from "../mindwired-event";

const exportTree = (config: Configuration, nodeUI: NodeUI): NodeSpec => {
  const v: ViewSpec = nodeUI.spec.view;
  const view: ViewSpec = {
    x: v.x,
    y: v.y,
    layout: undefined,
    folding: undefined,
  };
  // 1.2345... => 1.2
  const root = nodeUI.isRoot();
  let x = root ? config.ui.offset.x : v.x;
  let y = root ? config.ui.offset.y : v.y;
  view.x = Math.floor(10 * x) / 10;
  view.y = Math.floor(10 * y) / 10;

  if (v.layout) {
    view.layout = v.layout;
  }
  if (v.edge) {
    view.edge = v.edge;
  }
  if (v.folding) {
    view.folding = true;
  }
  const subs: NodeSpec[] = [];
  nodeUI.subs.forEach((childUI) => {
    subs.push(exportTree(config, childUI));
  });
  return {
    model: nodeUI.model,
    view,
    subs: subs.length > 0 ? subs : undefined,
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
  config.dom.clazz[method](nodeUI.$bodyEl, className);
  nodeUI.subs.forEach((childUI) => updateLevelClass(childUI, method, config));
};
export class MindWired {
  config: Configuration;
  canvas: CanvasUI;
  nodeRenderingContext: NodeRenderingContext;
  nodeSelectionModel: NodeSelectionModel;
  nodeLayoutContext: NodeLayoutContext;
  nodeEditingContext: NodeEditingContext;
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

    this._dsFactory = new DataSourceFactory();
    config.getNodeRenderer = () => this.nodeRenderingContext;

    this.nodeSelectionModel = new NodeSelectionModel(config);
    this.nodeLayoutContext = new NodeLayoutContext(config);

    this.nodeRenderingContext = new NodeRenderingContext(
      this.canvas,
      this._dsFactory
    );
    installDefaultRenderers(this.nodeRenderingContext);

    this.nodeEditingContext = new NodeEditingContext(
      this.canvas,
      this._dsFactory
    );
    installDefaultEditors(this.nodeEditingContext);

    this.alignmentUI = new AlignmentUI(config);
    this.dragContext = new DragContext();
    this.edgeUI = new EdgeUI(config, this.canvas);

    this.config
      .listen(EVENT.DRAG.VIEWPORT, (e: ViewportDragEventArg) => {
        this.config.setOffset(e.offset);
        this.canvas.repaintNodeHolder();
        this.edgeUI.repaint();
        if (e.state === "done") {
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
      })
      .listen(EVENT.DRAG.NODE, (e: NodeDragEventArg) => {
        if (e.state === "ready") {
          const nodes = this.nodeSelectionModel.getNodes();
          /*
           * shift@click on nodes redirects dragging to their children
           */
          const dragTargets =
            e.target === "all" ? nodes : nodes.flatMap((node) => node.subs);
          // this.draggingNodes = capatureDragData(dragTargets);
          this.dragContext.prepareCaptures(dragTargets);
          this.alignmentUI.turnOn(this.rootUI, dragTargets);
          this.canvas.updateSelection(nodes);
        } else if (e.state === "drag") {
          const acceleration = e.target === "all" ? 1 : 2.5;
          this.dragContext.eachCapture((capture: Capture) => {
            const { node, dir, pos } = capture;
            dir.capture();
            node.setPos(
              acceleration * e.x + pos.x,
              acceleration * e.y + pos.y,
              !this.config.snapEnabled
            );
          });
          this.alignmentUI.doAlign();
          this.dragContext.eachCapture((capture: Capture) => {
            const { node, dir } = capture;
            this.nodeLayoutContext.layout(node, {
              dir,
            });
          });
          this.canvas.updateSelection(this.nodeSelectionModel.getNodes());
          this.edgeUI.repaint(!this.config.snapEnabled);
        } else if (e.state === "done") {
          this.alignmentUI.turnOff();
          this.edgeUI.repaint(true);
          const nodes = this.dragContext.getUpdatedNodes();
          if (nodes.length > 0) {
            this.config.emit(EVENT.NODE.UPDATED.CLIENT, {
              nodes,
              type: "pos",
            });
          } else {
            const nodes = this.nodeSelectionModel.getNodes();
            this.config.emit(EVENT.NODE.CLICKED.CLIENT, {
              nodes,
              type: "click",
            });
          }
          this.dragContext.clear();
        }
      })
      .listen(EVENT.NODE.EDITING, ({ editing, node }: NodeEditingArg) => {
        // console.log("[edit]", nodeUI);
        if (editing) {
          this.nodeEditingContext.edit(node);
        } else {
          this.nodeEditingContext.close();
        }
      })
      .listen(EVENT.NODE.FOLDED, ({ node }: NodeFoldingArg) => {
        this.canvas.updateFoldingNodes(node);
      })
      .listen(EVENT.NODE.UPDATED, ({ nodes }: NodeEventArg) => {
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
      const { renderer, editor } = param;
      if (renderer) {
        this.nodeRenderingContext.registerCustomRender(renderer);
        this._dsFactory.bindRendererMapping(ds, renderer.name);
      }
      if (editor) {
        this.nodeEditingContext.registerCustomEditor(editor);
        this._dsFactory.bindEditorMapping(ds, editor.name);
      }
    }
    return ds;
  }
  isEditing() {
    return this.nodeEditingContext.isEditing();
  }
  private _dispose() {
    this.nodeRenderingContext.dispose();
    this.nodeEditingContext.dispose();
    this._dsFactory.clear();
    this.edgeUI.dispose();
    this.alignmentUI.turnOff();
    this.dragContext.clear();
    this.canvas.unregisterNodeTree(this.rootUI);
  }
  nodes(elems: NodeSpec) {
    if (this.rootUI) {
      this._dispose();
    }
    if (elems instanceof TreeDataSource) {
      const root = elems.build();
      this.rootUI = NodeUI.build(root, this.config);
    } else if (elems) {
      this.rootUI = NodeUI.build(elems, this.config);
    }
    this.edgeUI.setRootNode(this.rootUI);
    this.config.ui.offset.x = this.rootUI.spec.view.x;
    this.config.ui.offset.y = this.rootUI.spec.view.y;
    this.rootUI.spec.view.x = 0;
    this.rootUI.spec.view.y = 0;

    this.repaint();
    return this;
  }
  findNode(predicate: (node: NodeUI) => boolean) {
    return this.rootUI.find(predicate);
  }
  addNode(
    parentNode: NodeUI,
    nodeData: NodeSpec,
    option?: { siblingNode: NodeUI }
  ) {
    const data: NodeSpec = {
      root: false,
      model: nodeData.model,
      view: nodeData.view,
    };
    if (!data.view) {
      data.view = {
        x: 0,
        y: 0,
      };
    }
    const lastChild = parentNode.lastChild();
    const nodeUI = new NodeUI(data, this.config, parentNode);
    this.canvas.regsiterNode(nodeUI);
    parentNode.addChild(nodeUI);
    nodeUI.repaint();

    this.nodeLayoutContext.setPosition(nodeUI, {
      baseNode: lastChild,
      offset: 60,
    });

    this.edgeUI.addEdge(nodeUI.parent, nodeUI);
    this.config.emit(EVENT.NODE.CREATED.CLIENT, {
      nodes: [nodeUI],
      type: "create",
    });
    return nodeUI;
    // FIXME 노드 생성 후 곧바로 편집 모드 전환하려는 코드인데 현재는 작동하지 않음.
    // if (option && (option.editing || option.select)) {
    //   this.config.emit(EVENT.NODE.SELECTED, {
    //     node: nodeUI,
    //     append: false,
    //   });
    // }
    // if (option && option.editing) {
    //   this.nodeEditingContext.edit(nodeUI);
    // }
  }
  /**
   *
   * @param parentNode new parent of the given nodes
   * @param nodes nodes whoses parent is changed
   * @param trigger if true, send event 'node.updated'
   */
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
    const updated: NodeUI[] = [];
    const deleted: NodeUI[] = [];
    nodes.forEach((node) => {
      /**
       * delete [N1]
       * ```
       *  parent
       *   +- N0
       *   +- N1 (delete)
       *       +- C0 +- ...
       *       +- C1 +- ...
       * ```
       * ```
       *  parent
       *   +- N0
       *   +- C0 +- ...
       *   +- C1 +- ...
       * ```
       */
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
      this.edgeUI.deleteEdges(deleted);
      this.config.emit(EVENT.NODE.DELETED.CLIENT, {
        nodes: deleted,
        type: "delete",
      });
    }
  }
  getNodeSelectionModel() {
    return this.nodeSelectionModel;
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
  setScale(scale: number) {
    this.config.ui.scale = scale;
    console.log(this.config.ui.scale);
    this.repaint();
  }
  repaint(nodeUI?: NodeUI) {
    nodeUI = nodeUI || this.rootUI;
    repaintTree(this, nodeUI);
    this.canvas.repaintNodeHolder();
    this.nodeLayoutContext.layout(nodeUI, { dir: undefined });
    this.edgeUI.repaint();

    this.canvas.clearNodeSelection();
    this.canvas.updateSelection(this.getSelectedNodes());
  }
  listen<A = any>(eventName: string, callback: (arg: A) => void) {
    const event = parseEvent(`${eventName}.client`);
    this.config.ebus.listen(event, callback);
    return this;
  }
  listenStrict<A>(
    event:
      | NodeEvent<A>
      | ViewportEvent<A>
      | ViewportDragEvent<A>
      | NodeDragEvent<A>,
    callback: (arg: A) => void
  ) {
    const e = event.CLIENT || event;
    this.config.ebus.listen(e, callback);
    return this;
  }
  getNodeRender(model: ModelSpec): INodeRenderer {
    return this.nodeRenderingContext.getRendererByModel(model);
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

      const { text, iconBadge, thumbnail } = nodeRenderer.delegate;
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
  registerEdgeRenderer(renderer: IEdgeRenderer) {
    this.edgeUI.addEdgeRenderer(renderer);
  }
}
