import NodeSelectionModel from "./node-selection-model";
const createSelectionModel = (type, configuration) => {
  return new NodeSelectionModel(configuration);
};
export default {
  createSelectionModel,
};
