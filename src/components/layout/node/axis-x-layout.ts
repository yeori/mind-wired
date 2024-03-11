/**
 * reflective layout manager relative to parent
 *
 */
const reverseXPos = (node, context) => {
  const { x, y } = node;
  node.setPos(-x, y);
  const manager = context.layoutManager.getLayoutManager(node.layout);
  manager.doLayout(node, context);
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
const setPosition = (nodeUI, context) => {
  const { baseNode, rect } = context;
  const x = baseNode.x;
  const y = baseNode.y + rect.height + 10;
  nodeUI.setPos(x, y);
};
export default { doLayout, setPosition };
