/**
 * list of layout managers to assign the positions
 */
import defaultLayout from "./node/default-layout";
import xAxisLayout from "./node/axis-x-layout";
import yAxisLayout from "./node/axis-y-layout";

const layoutMap = new Map();
layoutMap.set("DEFAULT", defaultLayout);
layoutMap.set("X-AXIS", xAxisLayout);
layoutMap.set("Y-AXIS", yAxisLayout);

const getLayoutManager = (type) => {
  let fn = layoutMap.get(type) || defaultLayout;
  return fn;
};

const layout = (nodeUI, context) => {
  const { layout } = nodeUI;
  const doLayout = getLayoutManager(layout.type);
  doLayout(nodeUI, context);
};
export default {
  getLayoutManager,
  layout,
};
