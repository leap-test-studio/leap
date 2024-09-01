import { IconRenderer } from "./iconrenderer";

export const SearchComponent = ({ search, onChange, onClear, placeholder = "Filter", className = "w-34" }) => (
  <div className="flex items-center mx-2 relative">
    <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
      </svg>
    </div>
    <input
      id="search-component"
      type="text"
      className={`block pt-2 ps-10 caret-slate-300 h-[28px] rounded-md focus:shadow focus:outline-none focus:ring-color-0500 placeholder:text-xs ${className} placeholder:pb-1`}
      placeholder={placeholder}
      value={search || ""}
      onChange={(e) => onChange(e.target.value)}
    />
    {search?.length > 0 && (
      <IconRenderer
        id="search-component-clear"
        icon="Close"
        className="absolute right-1 cursor-pointer text-red-600 font-extrabold"
        style={{ fontSize: 16 }}
        onClick={onClear}
      />
    )}
  </div>
);
