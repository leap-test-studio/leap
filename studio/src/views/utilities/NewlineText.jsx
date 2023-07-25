import isEmpty from "lodash/isEmpty";

function NewlineText({ text, className, style }) {
  let child = "";
  if (!isEmpty(text)) {
    child = text.split("\n").map((str, i) => <p key={i}>{str}</p>);
  }
  return (
    <div className={className} style={style}>
      {child}
    </div>
  );
}

export default NewlineText;
