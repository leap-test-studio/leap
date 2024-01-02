import { isOneOfEnumControl, rankWith } from "@jsonforms/core";
import { withJsonFormsOneOfEnumProps } from "@jsonforms/react";
import LabelRenderer from "../renderers/common/LabelRenderer";
import ReactSelect from "react-select";

import { customStyles } from "../common/Constants";

export const TailwindOneOfEnum = (props) => {
  const { handleChange, path, visible, label, options } = props;
  const handleSelectChange = (selectedOption) => {
    handleChange(path, selectedOption.value);
  };

  return (
    <>
      {visible && (
        <div className="mx-1">
          {label?.length > 0 && <LabelRenderer {...props} />}
          <ReactSelect
            value={options.find((option) => option.value === props.data)}
            onChange={(option) => handleSelectChange(option)}
            options={options}
            isSearchable={true}
            className="rounded border text-slate-700 placeholder-slate-500 shadow focus:shadow-md"
            styles={customStyles}
          />
        </div>
      )}
    </>
  );
};

export const tailwindOneOfEnumControlTester = rankWith(1005, isOneOfEnumControl);

export const TailwindOneOfEnumControl = withJsonFormsOneOfEnumProps(TailwindOneOfEnum);
