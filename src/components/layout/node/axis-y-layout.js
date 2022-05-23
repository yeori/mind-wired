/**
 * reflective layout manager relative to parent
 *
 */
const reverseYPos = (node, context) => {
  const { x, y } = node;
  node.setPos(x, -y);
  const manager = context.layoutManager.getLayoutManager(node.layout);
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
  const { baseNode, rect } = context;
  const x = baseNode.x + rect.width + 10;
  const y = baseNode.y;
  nodeUI.setPos(x, y);
};
export default { doLayout, setPosition };
