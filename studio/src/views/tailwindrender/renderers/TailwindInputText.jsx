import React, { useState } from "react";
import isEmpty from "lodash/isEmpty";
import merge from "lodash/merge";
import LabelRenderer from "./common/LabelRenderer";
import IconRenderer from "../../IconRenderer";
import ErrorMessage from "./common/ErrorMessage";

/**
 * Default renderer for a string.
 */
const TailwindInputText = React.memo((props) => {
  const { id, visible, enabled, uischema, path, errors, schema, label, description = "", handleChange, data, trim = false, config } = props;
  const [passwordShow, setPasswordShow] = useState(schema?.format !== "password");
  const isError = !isEmpty(errors);
  const appliedUiSchemaOptions = merge({}, config, uischema.options);

  const temp = data || "";
  const value = schema?.format === "bytes" ? atob(temp) : temp;

  const onChange = (ev) => {
    ev.preventDefault();
    handleChange(path, schema?.format === "bytes" ? btoa(ev.target.value) : ev.target.value);
  };

  return (
    <>
      {visible && (
        <div className="grow mb-1 mx-1 select-none">
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
                      className={passwordShow ? "text-cds-yellow-0500" : "text-color-0500"}
                      fontSize="small"
                    />
                  </span>
                </div>
              </div>
            )}
            <>
              <form>
                {appliedUiSchemaOptions?.multi ? (
                  <textarea
                    disabled={!enabled}
                    name={path}
                    id={id}
                    autoComplete="off"
                    className={`block caret-slate-300 ${enabled ? "bg-white" : "bg-slate-100"} ${appliedUiSchemaOptions?.isLarge ? "h-36" : "h-16"} ${
                      trim ? "text-[11px]" : "text-xs px-1.5 py-1"
                    } rounded border placeholder-gray-300 shadow focus:shadow-md ${
                      isError ? "focus:border-red-500 border-red-600" : "focus:border-color-0600 border-slate-200"
                    } focus:outline-none w-full text-slate-700`}
                    placeholder={description}
                    value={value}
                    onChange={onChange}
                  />
                ) : (
                  <input
                    disabled={!enabled}
                    type={passwordShow ? "text" : "password"}
                    name={path}
                    id={id}
                    className={`block caret-slate-300 ${enabled ? "bg-white" : "bg-slate-100"} ${
                      trim ? "text-[11px] py-px px-1" : "text-xs px-1.5 py-1"
                    } rounded border text-slate-700 placeholder-gray-300 shadow focus:shadow-md ${
                      isError
                        ? "focus:border-red-500 border-red-600 focus:ring-red-600"
                        : "focus:border-color-0600 border-slate-200 focus:ring-color-0500"
                    } focus:outline-none w-full`}
                    placeholder={description}
                    value={value}
                    onChange={onChange}
                    autoComplete="off"
                  />
                )}
              </form>
            </>
          </div>
          <ErrorMessage id={id} path={path} errors={errors} />
        </div>
      )}
    </>
  );
});

export default TailwindInputText;
