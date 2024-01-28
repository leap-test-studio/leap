import React from "react";
import isEmpty from "lodash/isEmpty";

import ErrorMessage from "./common/ErrorMessage";
import { Tooltip } from "../../utilities";
import IconRenderer from "../../IconRenderer";

const TailwindRadioGroupRenderer = React.memo((props) => {
  const onChange = (value) => {
    if (!props.enabled) return;
    let ev = value;
    if (props.uischema?.options?.returnIndex) {
      const index = props.options.findIndex((item) => item?.value === value);
      ev = !isEmpty(props.schema?.values) ? props.schema?.values[index] : index;
    }
    props.handleChange(props.path, ev);
  };

  let data = props.data;
  if (props.uischema?.options?.returnIndex) {
    if (!isEmpty(props.schema?.values)) {
      const index = props.schema?.values?.findIndex((item) => item === props.data);
      if (index !== -1) data = props.options[index]?.value;
    } else {
      data = props.options[props.data]?.value;
    }
  }

  if (data === undefined && props.schema?.default !== undefined) {
    onChange(props.schema?.default);
  }

  return (
    <>
      {props.visible && (
        <div className="w-full flex flex-col rounded border my-px">
          <div className="flex flex-row items-center justify-between bg-color-0100 rounded-t select-none px-2 py-px">
            {props.label?.length > 0 && <span className="text-xs font-normal text-color-primary">{props.label}</span>}
            {props.description?.length > 0 && (
              <IconRenderer icon="HelpOutlined" fontSize="8px" className="pb-0.5 ml-1 text-color-0500" tooltip={props.description} />
            )}
          </div>
          <div className={`grid px-2 py-1 gap-1 ${props.options?.length >= 3 ? "grid-cols-4" : "grid-cols-2"}`}>
            {props.options?.map((plan, index) => (
              <div
                id={props.id + "/" + index}
                key={index}
                className={`inline-flex items-center border ${plan.value === data ? "bg-color-0200 shadow border-color-0400" : "border-slate-300"}
                  ${plan.value === data && !props.enabled && "bg-slate-300 border-slate-400 opacity-70"}
                  p-1 rounded text-[10px] select-none`}
                onClick={() => onChange(plan.value)}
              >
                <input
                  disabled={!props.enabled}
                  checked={plan.value === data}
                  type="radio"
                  className={`form-radio h-5 w-5
                    ${!props.enabled && "cursor-default opacity-50 text-slate-500"}
                    ${
                      plan.value === data ? "text-color-0700" : "text-slate-400"
                    } focus:outline-none relative flex cursor-pointer rounded-full p-1 shadow hover:shadow-lg ml-1 ring-transparent`}
                  onChange={() => onChange(plan.value)}
                />
                <span className={`ml-2 text-gray-700 ${plan.value === data ? "font-semibold" : ""}`}>{plan.label}</span>
              </div>
            ))}
          </div>
          {!props.uischema?.options?.returnIndex && <ErrorMessage {...props} />}
        </div>
      )}
    </>
  );
});

export default TailwindRadioGroupRenderer;
