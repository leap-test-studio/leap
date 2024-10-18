import React, { useState } from "react";
import isEmpty from "lodash/isEmpty";
import merge from "lodash/merge";
import { usePopper } from "react-popper";
import LabelRenderer from "./common/LabelRenderer";
import ErrorMessage from "./common/ErrorMessage";
import { IconRenderer } from "../../utilities";
import OverlayKeys from "./common/OverlayKeys";

/**
 * Default renderer for a string.
 */
const TailwindInputText = React.memo((props) => {
  const { id, visible, enabled, uischema, path, errors, schema, label, description = "", handleChange, data, trim = false, config } = props;
  const [passwordShow, setPasswordShow] = useState(schema?.format !== "password");
  const [showOverlay, setShowOverlay] = useState(false);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start"
  });

  if (!visible) return null;

  const isError = !isEmpty(errors);
  const appliedUiSchemaOptions = merge({}, config, uischema.options);

  const value = data || "";

  const shouldSuggest = () => {
    if (appliedUiSchemaOptions.suggest) {
      const textBeforeCursor = value.slice(-2);
      setShowOverlay(textBeforeCursor.endsWith("${"));
    }
  };

  const onChange = (e) => {
    e.preventDefault();
    if (appliedUiSchemaOptions.suggest) {
      const cursorPosition = e.target.selectionStart;
      const textBeforeCursor = e.target.value.slice(0, cursorPosition);
      setShowOverlay(textBeforeCursor.endsWith("${"));
    }
    handleChange(path, e.target.value);
  };

  const onBlur = (e) => {
    e.preventDefault();
    setTimeout(() => setShowOverlay(false), 100);
  };

  return (
    <div className="grow mb-1 mx-1 select-none" onBlur={onBlur}>
      {label?.length > 0 && <LabelRenderer {...props} />}
      <div>
        {schema?.format === "password" && (
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center px-2">
              <input className="hidden js-password-toggle" id={`${path}-toggle`} type="checkbox" />
              <span
                htmlFor={`${path}-toggle`}
                className="absolute inset-y-0 right-0 flex items-center w-5 mr-2 mt-3"
                onClick={() => setPasswordShow(!passwordShow)}
              >
                <IconRenderer
                  icon={passwordShow ? "VisibilityOff" : "Visibility"}
                  className={passwordShow ? "text-cds-yellow-0500" : "text-color-0600"}
                  fontSize="small"
                />
              </span>
            </div>
          </div>
        )}
        <div className="relative">
          <form>
            {appliedUiSchemaOptions?.multi ? (
              <textarea
                disabled={!enabled}
                name={path}
                id={id}
                ref={setReferenceElement}
                autoComplete="off"
                className={`block caret-slate-300 ${enabled ? "bg-white" : "bg-slate-100"} ${appliedUiSchemaOptions?.isLarge ? "h-24" : "h-16"} ${
                  trim ? "text-[11px]" : "text-xs px-1.5 py-1"
                } rounded border placeholder-gray-300 ${
                  isError
                    ? "focus:border-red-500 border-red-600"
                    : "focus:border-color-0600 border-slate-300 hover:ring-color-0500 focus:ring-color-0500"
                } focus:outline-none w-full text-color-label`}
                placeholder={description}
                value={value}
                onChange={onChange}
                onFocus={shouldSuggest}
              />
            ) : (
              <input
                disabled={!enabled}
                type={passwordShow ? "text" : "password"}
                name={path}
                id={id}
                ref={setReferenceElement}
                className={`block caret-slate-300 ${enabled ? "bg-white" : "bg-slate-100"} ${
                  trim ? "text-[11px] py-px px-1" : "text-xs px-1.5 py-1"
                } rounded border text-color-label placeholder-gray-300 ${
                  isError
                    ? "focus:border-red-500 border-red-600 focus:ring-red-600"
                    : "focus:border-color-0600 border-slate-300 hover:ring-color-0500 focus:ring-color-0500"
                } focus:outline-none w-full`}
                placeholder={description}
                value={value}
                onChange={onChange}
                onFocus={shouldSuggest}
              />
            )}
          </form>
          {appliedUiSchemaOptions.suggest && showOverlay && (
            <div ref={setPopperElement} style={{ ...styles.popper, zIndex: Number.MAX_SAFE_INTEGER }} {...attributes.popper}>
              <OverlayKeys
                suggest={appliedUiSchemaOptions.suggest}
                onSelect={(selected) => {
                  setShowOverlay(false);
                  handleChange(path, value + selected.key + "}");
                }}
              />
            </div>
          )}
        </div>
      </div>
      <ErrorMessage id={id} path={path} errors={errors} />
    </div>
  );
});

export default TailwindInputText;
