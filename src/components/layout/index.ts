/**
 * list of layout managers to assign the positions
 */
import defaultLayout from "./node/default-layout";
import xAxisLayout from "./node/axis-x-layout";
import yAxisLayout from "./node/axis-y-layout";
import xyAxisLayout from "./node/axis-xy-layout";

const layoutMap = new Map();
layoutMap.set("DEFAULT", defaultLayout);
layoutMap.set("X-AXIS", xAxisLayout);
layoutMap.set("Y-AXIS", yAxisLayout);
layoutMap.set("XY-AXIS", xyAxisLayout);

const getLayoutManager = (layout) => {
  let fn = layout ? layoutMap.get(layout.type) : defaultLayout;
  return fn;
};
const setPosition = (nodeUI, context) => {
  const { layout } = nodeUI;
  const manager = getLayoutManager(layout);
  manager.setPosition(nodeUI, context);
};
const layout = (nodeUI, context) => {
  const { layout } = nodeUI;
  const manager = getLayoutManager(layout);
  manager.doLayout(nodeUI, context);
};
export default {
  getLayoutManager,
  setPosition,
  layout,
};
