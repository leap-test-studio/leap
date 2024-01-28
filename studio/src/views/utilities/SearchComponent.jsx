import { IconRenderer } from "./iconrenderer";

export const SearchComponent = ({ search, onChange, onClear, placeholder = "Filter", className = "w-34" }) => (
  <div className="flex items-center mx-2 relative">
    <IconRenderer icon="Search" className="absolute left-1 text-color-0400 font-extrabold" style={{ fontSize: 16 }} />
    <input
      id="search-component"
      type="text"
      className={`caret-slate-300 h-6 px-5 rounded focus:shadow focus:outline-none placeholder:text-sm ${className} placeholder:pb-0.5`}
      placeholder={placeholder}
      value={search || ""}
      onChange={(e) => onChange(e.target.value)}
    />
    {search?.length > 0 && (
      <IconRenderer
        id="search-component-clear"
        icon="Close"
        className="absolute right-1 cursor-pointer text-red-500 font-extrabold"
        style={{ fontSize: 16 }}
        onClick={onClear}
      />
    )}
  </div>
);
