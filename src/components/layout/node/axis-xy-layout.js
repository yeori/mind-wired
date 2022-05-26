import xLayout from "./axis-x-layout";
import yLayout from "./axis-y-layout";

const doLayout = (nodeUI, context) => {
  const { dir } = context;
  if (!dir) {
    return;
  }
  xLayout.doLayout(nodeUI, context);
  yLayout.doLayout(nodeUI, context);
};
const setPosition = (nodeUI, context) => {
  xLayout.setPosition(nodeUI, context);
};
export default {
  doLayout,
  setPosition,
};
