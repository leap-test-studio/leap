import React, { useEffect } from "react";
import isEmpty from "lodash/isEmpty";

import ErrorMessage from "./common/ErrorMessage";
import LabelRenderer from "./common/LabelRenderer";

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

  useEffect(() => {
    if (data === undefined && props.schema?.default !== undefined) {
      onChange(props.schema?.default);
    }
  }, [data]);

  if (!props.visible) return null;

  return (
    <div className="flex flex-col px-2 pb-2 border rounded my-2 mx-1">
      {props.label?.length > 0 && <LabelRenderer {...props} />}
      <div className={`grid gap-2 ${props.options?.length >= 3 ? "grid-cols-4" : "grid-cols-2"}`}>
        {typeof props.options?.map === "function" &&
          props.options?.map((plan, index) => (
            <div
              id={props.id + "/" + index}
              key={index}
              className={`cursor-pointer inline-flex items-center border ${plan.value === data ? "bg-color-0050 shadow border-color-0300" : "border-slate-300 hover:bg-color-0050"}
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
  );
});

export default TailwindRadioGroupRenderer;
