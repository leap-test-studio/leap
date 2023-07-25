import LabelRenderer from "./common/LabelRenderer";
import TagsInput from "./TagsInput";

export default function TailwindTagsRenderer(props) {
  return (
    <>
      {props.visible && (
        <div className="grow mb-1.5 mx-1">
          {props.label?.length > 0 && <LabelRenderer {...props} />}
          <TagsInput
            path={props.path}
            value={props.value || []}
            addItem={props.addItem}
            removeItems={props.removeItems}
            type={props.primitive}
            placeholder={props.description || "Add Item"}
            onChange={(t) => {
              if (t) {
                props.handleChange(props.path, t);
              }
            }}
          />
        </div>
      )}
    </>
  );
}
