/**
 * reflective layout manager relative to parent
 *
 */
const reverseYPos = (node, context) => {
  const { x, y } = node;
  node.setPos(x, -y);
  const doLayout = context.layoutManager.getLayoutManager(node.layout.type);
  doLayout(node, context);
};
const doLayout = (nodeUI, context) => {
  const { dir } = context;
  if (!dir) {
    return;
  }
  if (dir.updated("TB") || dir.updated("BT")) {
    nodeUI.children((childUI) => {
      reverseYPos(childUI, context);
    });
  }
};
export default doLayout;
