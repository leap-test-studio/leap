import React from "react";
import LabelRenderer from "./common/LabelRenderer";
import isEmpty from "lodash/isEmpty";

const TailwindMultipleSelectRenderer = React.memo(
  ({
    id,
    path,
    visible = true,
    enabled = true,
    label,
    data,
    handleChange,
    enableFilter = true,
    description,
    disabled = false,
    openDropDown,
    showDropdown,
    wrapperRef,
    ...props
  }) => {
    const options = !isEmpty(props.schema?.values) ? props.schema?.values : props.options;

    return (
      <div className={`grow mb-1.5 mx-1 relative ${disabled ? "opacity-50 select-none cursor-not-allowed" : ""}`}>
        <LabelRenderer path="" label={label} />

        <button
          id="dropdownBgHoverButton"
          data-dropdown-toggle="dropdownBgHover"
          className="bg-white drop-shadow-sm w-full border text-slate-700 rounded-sm text-sm px-2 py-1 text-center inline-flex items-center"
          type="button"
          onClick={() => openDropDown()}
        >
          Select Stat
          <svg
            className="absolute text-slate-400 right-0 mr-2 w-4 h-4 flex flex-end"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        {showDropdown && (
          <div
            ref={wrapperRef}
            id="dropdownBgHover"
            className="z-10 w-full absolute bg-white rounded shadow block"
            data-popper-reference-hidden=""
            data-popper-escaped=""
            data-popper-placement="bottom"
          >
            <ul className="space-y-1 text-sm text-gray-700" aria-labelledby="dropdownBgHoverButton">
              {options.map((item, index) => {
                return (
                  <li key={index}>
                    <div className="flex items-center px-2 py-2 hover:bg-gray-100">
                      <input
                        type="checkbox"
                        name={index}
                        id={index}
                        checked={Boolean(item.value)}
                        className="text-color-0500 ring-blue-500 rounded mx-2"
                        onChange={(ev) => handleChange(item, ev)}
                      />
                      <label htmlFor="checkbox-item-4" className="ml-2 w-full text-sm font-medium text-gray-900 rounded">
                        {item.label}
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

export default TailwindMultipleSelectRenderer;
