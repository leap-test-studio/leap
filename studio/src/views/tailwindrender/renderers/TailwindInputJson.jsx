import React, { useEffect, useState } from "react";
import merge from "lodash/merge";
import { usePopper } from "react-popper";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-tomorrow";

import LabelRenderer from "./common/LabelRenderer";
import ErrorMessage from "./common/ErrorMessage";
import OverlayKeys from "./common/OverlayKeys";

/**
 * Default renderer for a string.
 */
const TailwindInputJson = React.memo((props) => {
  const { id, enabled, path, errors, label, description = "", handleChange, data, config, uischema } = props;
  const [showOverlay, setShowOverlay] = useState(false);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start"
  });

  const appliedUiSchemaOptions = merge({}, config, uischema.options);

  useEffect(() => {}, [referenceElement]);
  const onChange = (e, ...rest) => {
    if (appliedUiSchemaOptions.suggest) {
      //const cursorPosition = e.target.selectionStart;
      //const textBeforeCursor = e.target.value.slice(0, cursorPosition);
      //setShowOverlay(textBeforeCursor.endsWith("${"));
    }
    handleChange(path, e.toString());
  };
  const onSelectionChange = (e) => {
    if (data) {
      const cursorPosition = e.anchor.column;
      const textBeforeCursor = data.slice(0, cursorPosition);
      setShowOverlay(textBeforeCursor.endsWith("${"));
    }
  };
  const shouldSuggest = () => {
    if (appliedUiSchemaOptions.suggest) {
      //const textBeforeCursor = data.slice(-2);
      //setShowOverlay(textBeforeCursor.endsWith("${"));
    }
  };
  const onBlur = (e) => {
    e.preventDefault();
    setTimeout(() => setShowOverlay(false), 100);
  };

  return (
    <div className="grow mb-1 mx-1 select-none" onBlur={onBlur}>
      {label?.length > 0 && <LabelRenderer {...props} />}
      <form>
        <AceEditor
          ref={setReferenceElement}
          name="setup-configuration"
          onChange={onChange}
          width="100%"
          height="100px"
          mode="json"
          readOnly={!enabled}
          theme="tomorrow"
          fontSize={14}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          enableSnippets={true}
          placeholder={description}
          onSelectionChange={onSelectionChange}
          className="border border-gray-300 rounded"
          setOptions={{
            enableBasicAutocompletion: false,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: true,
            spellcheck: true,
            tabSize: 2
          }}
          wrapEnabled={true}
          editorProps={{ $blockScrolling: true }}
          value={data}
          onFocus={shouldSuggest}
        />
      </form>
      {appliedUiSchemaOptions.suggest && showOverlay && (
        <div ref={setPopperElement} style={{ ...styles.popper, zIndex: Number.MAX_SAFE_INTEGER }} {...attributes.popper}>
          <OverlayKeys
            suggest={appliedUiSchemaOptions.suggest}
            onSelect={(selected) => {
              setShowOverlay(false);
              handleChange(path, data + selected.key + "}");
            }}
          />
        </div>
      )}
      <ErrorMessage id={id} path={path} errors={errors} />
    </div>
  );
});

export default TailwindInputJson;
