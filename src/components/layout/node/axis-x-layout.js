/**
 * reflective layout manager relative to parent
 *
 */
const reverseXPos = (node, context) => {
  const { x, y } = node;
  node.setPos(-x, y);
  const doLayout = context.layoutManager.getLayoutManager(node.layout.type);
  doLayout(node, context);
};
const doLayout = (nodeUI, context) => {
  const { dir } = context;
  if (!dir) {
    return;
  }
  if (dir.updated("LR") || dir.updated("RL")) {
    nodeUI.children((childUI) => {
      reverseXPos(childUI, context);
    });
  }
};
export default doLayout;
