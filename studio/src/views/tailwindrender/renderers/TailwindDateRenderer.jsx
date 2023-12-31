import React, { useMemo } from "react";
import merge from "lodash/merge";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getData, createOnChangeHandler } from "../util";
import LabelRenderer from "./common/LabelRenderer";
import ErrorMessage from "./common/ErrorMessage";

const DateFormats = {
  "YYYY-MM-DD": "yyyy-MM-dd",
  "YYYY-MM-DD HH:mm:ss": "yyyy-MM-dd HH:mm:ss",
  "HH:mm:ss": "HH:mm:ss"
};

const TailwindDateRenderer = React.memo((props) => {
  const { data, id, path, handleChange } = props;
  const appliedUiSchemaOptions = merge({}, props.config, props.uischema.options);
  const format = appliedUiSchemaOptions.dateTimeFormat ?? props.format;
  const saveFormat = appliedUiSchemaOptions.dateTimeSaveFormat ?? props.format;
  const onChange = useMemo(() => createOnChangeHandler(path, handleChange, saveFormat), [path, handleChange, saveFormat]);
  const finalData = getData(data, saveFormat);
  const dateFormat = DateFormats.hasOwnProperty(format) ? DateFormats[format] : format;
  return (
    <>
      {props.visible && (
        <div className="grow mb-1 mx-1">
          {props.label?.length > 0 && <LabelRenderer {...props} />}
          <DatePicker
            id={id}
            name={path}
            selected={finalData}
            onChange={onChange}
            dateFormat={dateFormat}
            showTimeSelect={props.showTimeSelect}
            showTimeSelectOnly={props.showTimeSelectOnly}
            placeholderText={props.placeholderText || "Select date"}
            isClearable={true}
            minDate={new Date()}
            className={`text-xs caret-slate-300 block px-1.5 py-0.5 rounded border placeholder-slate-500 shadow focus:shadow-md ${
              props.errors?.length > 0 ? "focus:border-red-500 border-red-600" : "focus:border-color-0600 border-slate-200"
            } focus:outline-none w-full`}
          />
          <ErrorMessage {...props} />
        </div>
      )}
    </>
  );
});

export default TailwindDateRenderer;
