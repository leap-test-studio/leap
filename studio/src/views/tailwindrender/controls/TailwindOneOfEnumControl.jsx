import { isOneOfEnumControl, rankWith } from "@jsonforms/core";
import { withJsonFormsOneOfEnumProps } from "@jsonforms/react";
import LabelRenderer from "../renderers/common/LabelRenderer";
import Select from "react-select";

const customStyles = {
  control: (styles) => ({
    ...styles,
    boxShadow: "none",
    padding: 0,
    minHeight: 20,
    minWidth: 100,
    borderStyle: "none"
  }),
  menuList: (base) => ({
    ...base,

    "::-webkit-scrollbar": {
      width: "8px",
      height: "0px"
    },
    "::-webkit-scrollbar-track": {
      background: "#f1f1f1"
    },
    "::-webkit-scrollbar-thumb": {
      background: "#154374"
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "#555"
    }
  }),
  valueContainer: (styles) => ({
    ...styles,
    fontSize: 14,
    paddingTop: 0,
    paddingBottom: 0
  }),
  option: (base, { isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? "#154374" : "",
    color: isSelected ? "white" : "",
    ":active": {
      backgroundColor: "#154374"
    },
    ":hover": {
      backgroundColor: "#316eaf",
      color: "#fff"
    }
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgb(100 116 139)",
    fontSize: 14
  }),
  input: (base) => ({
    ...base,
    fontSize: 14,
    borderStyle: "none",
    paddingTop: 0,
    paddingBottom: 0
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: 5,
    paddingTop: 0,
    paddingBottom: 0
  })
};

export const TailwindOneOfEnum = (props) => {
  const { handleChange, path, visible, label, options } = props;
  const handleSelectChange = (selectedOption) => {
    handleChange(path, selectedOption.value);
  };

  return (
    <>
      {visible && (
        <div className="w-full flex flex-col">
          {label?.length > 0 && <LabelRenderer {...props} />}
          <Select
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
