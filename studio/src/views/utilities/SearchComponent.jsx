import IconRenderer from "../IconRenderer";

export default function SearchComponent({ search, onChange, onClear, placeholder = "Filter" }) {
  return (
    <div className="flex items-center mx-2 relative">
      <div className="absolute left-3 z-30">
        <IconRenderer icon="Search" className="text-color-0400 font-extrabold" fontSize="small" />
      </div>
      <input
        id="search-component"
        type="text"
        className="caret-slate-300 h-6 w-34 pl-10 pr-20 rounded z-0 focus:shadow focus:outline-none"
        placeholder={placeholder}
        value={search}
        onChange={(e) => onChange(e.target.value)}
      />
      {search?.length > 0 && (
        <div className="absolute right-3">
          <button id="search-component-clear" className="flex flex-row items-center p-px focus:outline-none hover:shadow-2xl" onClick={onClear}>
            <IconRenderer icon="Close" className="text-red-500 font-extrabold" fontSize="small" />
          </button>
        </div>
      )}
    </div>
  );
}
