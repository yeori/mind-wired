import { clone } from "../../service";

const NO_OP = (_) => _;
const buildTree = (dataSource, dataSet, parentSet) => {
  const nodeConfigs = dataSet.toNodeConfigs(parentSet, dataSource);
  const childSets = dataSource.childSetOf(dataSet.name);
  childSets.forEach((childSet) => {
    buildTree(dataSource, childSet, dataSet);
  });
  return nodeConfigs;
};
/**
 * datasource for tree structure
 */
class DataSet {
  constructor(name, userDataList, parentType, callbacks) {
    this.name = name;
    this.userDataList = userDataList;
    this.parentType = parentType;
    this.callbacks = callbacks;
  }
  toNodeConfigs(parentSet, dataSource) {
    let relation = parentSet ? this.callbacks.relation : null;
    return this.userDataList.map((userData, index) => {
      const config = { userData, subs: [] };
      const { model } = this.callbacks;
      config.model =
        typeof model === "function" ? model(userData) : clone.deepCopy(model);

      if (relation) {
        const parent = relation(userData, parentSet.userDataList);
        const parentConfig = dataSource.$ref.get(parent);
        config.idx = parentConfig.subs.length;
        parentConfig.subs.push(config);
      }
      const { view } = this.callbacks;
      if (typeof view === "function") {
        config.view = view(userData, config.idx);
      } else if (typeof view === "object") {
        config.view = clone.deepCopy(view);
      } else {
        config.view = { x: 0, y: 0 };
      }
      // config.view =
      //   typeof view === "function"
      //     ? view(userData, config.idx)
      //     : { x: 0, y: 0 };
      // how to determine config.view = {x, y}
      // config.view = {x:0, y:0}
      dataSource.$ref.set(userData, config);
      return config;
    });
  }
}
export default class TreeDataSource {
  constructor() {
    this.dataSets = new Map();
    this.rootType = null;
    this.$ref = new Map(); // [{userData, nodeConfig}]
  }
  root(dataType, userData, option) {
    const dataList = [];
    if (!option) {
      option = userData;
      dataList.push({});
    } else {
      dataList.push(userData);
    }
    const virtualRoot = !option.virtual;
    this.rootType = dataType;
    option.relation = NO_OP;
    return this.dataSet(dataType, dataList, option);
  }
  childSetOf(parentType) {
    return [...this.dataSets.values()].filter(
      (dset) => dset.parentType === parentType
    );
  }
  dataSet(dataType, userDataList, option) {
    const callbacks = {};
    callbacks.relation = option.relation || NO_OP;
    callbacks.model = option.model || NO_OP;
    callbacks.view = option.view;
    const type = dataType.trim();
    if (this.dataSets.has(type)) {
      throw new Error(`[MIND WIRED] existing data type: [${dataType}]`);
    }
    const dataSet = new DataSet(type, userDataList, option.parent, callbacks);
    this.dataSets.set(type, dataSet);
    return this;
  }
  build() {
    const rootSet = this.dataSets.get(this.rootType);
    const rootDataSet = buildTree(this, rootSet);
    return rootDataSet[0];
  }
}
