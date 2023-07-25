import React from "react";

import Autocomplete from "@mui/material/Autocomplete";
import Input from "@mui/material/Input";
import merge from "lodash/merge";

const TailwindAutocompleteRenderer = React.memo((props) => {
  const { data, className, id, enabled, uischema, path, handleChange, options, config, getOptionLabel, renderOption, filterOptions } = props;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const [inputValue, setInputValue] = React.useState(data ?? "");

  const findOption = options.find((o) => o.value === data) ?? null;
  return (
    <Autocomplete
      className={className}
      id={id}
      disabled={!enabled}
      value={findOption}
      onChange={(_event, newValue) => {
        handleChange(path, newValue?.value);
      }}
      inputValue={inputValue}
      onInputChange={(_event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      autoHighlight
      autoSelect
      autoComplete
      fullWidth
      options={options}
      getOptionLabel={getOptionLabel || ((option) => option?.label)}
      style={{ marginTop: 16 }}
      renderInput={(params) => (
        <Input
          style={{ width: "100%" }}
          type="text"
          inputProps={params.inputProps}
          inputRef={params.InputProps.ref}
          autoFocus={appliedUiSchemaOptions.focus}
          disabled={!enabled}
        />
      )}
      renderOption={renderOption}
      filterOptions={filterOptions}
    />
  );
});

export default TailwindAutocompleteRenderer;
