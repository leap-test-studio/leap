import React from "react";
import LabelRenderer from "./common/LabelRenderer";
import isEmpty from "lodash/isEmpty";
import merge from "lodash/merge";
import Select from "react-select";
import ErrorMessage from "./common/ErrorMessage";

const customStyles = {
  control: (styles) => ({
    ...styles,
    boxShadow: "none",
    padding: 0,
    minHeight: 24,
    borderStyle: "none"
  }),
  menuPortal: (base) => ({ ...base, zIndex: 100000 }),
  menu: (base) => ({ ...base, width: "auto", minWidth: "40%", zIndex: 100000 }),
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
    fontSize: 12,
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
    fontSize: 12
  }),
  input: (base) => ({
    ...base,
    fontSize: 12,
    borderStyle: "none",
    paddingTop: 0,
    paddingBottom: 0
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: 2,
    paddingTop: 0,
    paddingBottom: 0
  })
};

const TailwindSelectRenderer = React.memo(
  ({
    id,
    path,
    visible = true,
    errors,
    enabled = true,
    label,
    data,
    handleChange,
    enableFilter = true,
    description,
    placeholder,
    showLabel = true,
    className,
    ...props
  }) => {
    const appliedUiSchemaOptions = merge({}, props.config, props.uischema?.options, props.schema?.options);
    const options = !isEmpty(props.schema?.values) ? props.schema?.values : props.options;
    const onChange = (selected) => {
      let ev;
      if (appliedUiSchemaOptions.returnIndex) {
        ev = options?.findIndex((item) => item?.value === selected.value);
      } else {
        ev = selected?.value;
      }
      handleChange(path, ev);
    };

    let selectedOption;
    if (appliedUiSchemaOptions.returnIndex) {
      selectedOption = options[data];
    } else {
      selectedOption = options?.find((item) => item.value === data);
    }

    return (
      <>
        {visible && (
          <div id={id} className="pr-2">
            {showLabel && label?.length > 0 && <LabelRenderer path={path} label={label} {...props} />}
            <Select
              id={`select-${id}`}
              classNamePrefix={`twr-select-${id}`}
              className={`caret-slate-300 block rounded border text-slate-700 placeholder-slate-500 shadow focus:shadow-md ${className}`}
              placeholder={!isEmpty(label) ? label : "Select..."}
              styles={customStyles}
              isSearchable={enableFilter}
              value={selectedOption}
              onChange={onChange}
              options={options}
              isDisabled={!enabled}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            {appliedUiSchemaOptions.returnIndex != null && <ErrorMessage id={id} path={path} errors={errors} />}
          </div>
        )}
      </>
    );
  }
);

export default TailwindSelectRenderer;
