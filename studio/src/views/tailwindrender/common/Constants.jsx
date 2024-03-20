export const ReactSelectCustomStyles = {
  control: (styles) => ({
    ...styles,
    boxShadow: "none",
    padding: 0,
    minHeight: 26,
    height: 26,
    border: "1px solid #CBD5E1",
    "&:hover": {
      border: "1px solid #CBD5E1 !important"
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
