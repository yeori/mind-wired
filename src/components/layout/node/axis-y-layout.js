/**
 * reflective layout manager relative to parent
 *
 */
const reverseYPos = (node, context) => {
  const { x, y } = node;
  node.setPos(x, -y);
  const manager = context.layoutManager.getLayoutManager(node.layout.type);
  manager.doLayout(node, context);
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
const setPosition = (nodeUI, context) => {
  console.log(nodeUI);
};
export default { doLayout, setPosition };
