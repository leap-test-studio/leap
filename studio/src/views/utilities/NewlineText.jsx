import isEmpty from "lodash/isEmpty";

export const NewlineText = ({ text, className, style }) => {
  let child = "";
  if (!isEmpty(text)) {
    child = text.split("\n").map((str, i) => (
      <p key={i} className="mb-1">
        {str}
      </p>
    ));
  }
  return (
    <div className={className} style={style}>
      {child}
    </div>
  );
};
