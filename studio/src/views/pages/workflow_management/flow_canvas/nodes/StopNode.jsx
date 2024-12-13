import BaseNode from "./BaseNode";

const StopNode = (props) => {
  return <BaseNode {...props} showSource={false} />;
};

export default StopNode;
