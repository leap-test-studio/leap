export const ReactSelectCustomStyles = {
  control: (styles) => ({
    ...styles,
    boxShadow: "none",
    padding: 0,
    minHeight: 26,
    height: 26,
    outline: "none",
    cursor: "pointer",
    border: "1.5px solid #CBD5E1",
    "&:hover": {
      border: "1.8px solid #f7f3ff !important",
      color: "#6d48bf"
    }
  }),
  menuPortal: (base) => ({ ...base, zIndex: 100000 }),
  menu: (base) => ({ ...base, width: "auto", minWidth: "40%", zIndex: 100000 }),
  menuList: (base) => ({
    ...base,
    fontSize: 12,
    "::-webkit-scrollbar": {
      width: "8px",
      height: "0px"
    },
    "::-webkit-scrollbar-track": {
      background: "#f1f1f1"
    },
    "::-webkit-scrollbar-thumb": {
      background: "#6d48bf"
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
    backgroundColor: isSelected ? "#6d48bf" : "",
    color: isSelected ? "white" : "",
    fontWeight: 600,
    cursor: "pointer",
    ":active": {
      backgroundColor: "#6d48bf"
    },
    ":hover": {
      backgroundColor: isSelected ? "#6d48bf" : "#f7f3ff",
      color: isSelected ? "white" : "#6d48bf"
    }
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgb(100 116 139)",
    fontSize: 12
  }),
  input: (base) => ({
    ...base,
    border: "none",
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
