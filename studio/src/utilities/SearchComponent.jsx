import { useEffect, useState } from "react";
import { IconRenderer } from "./iconrenderer";
import { useDebouncedChange } from "@hooks/.";

export const SearchComponent = ({ id, search, onChange, placeholder = "Search", className = "min-w-40" }) => {
  const [searchText, setSearchText] = useState(search || "");

  useEffect(() => {
    setSearchText(search ?? "");
  }, [search]);

  const [inputText, onInputTextChange, onInputTextClear] = useDebouncedChange(onChange, "", searchText, 1000);
  return (
    <div className="flex items-center mx-2 relative">
      <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center px-2 pointer-events-none">
        <svg className="size-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
        </svg>
      </div>
      <input
        id={id}
        type="text"
        className={`block py-1 px-7 caret-slate-300 h-[32px] rounded-md focus:shadow focus:outline-none focus:ring-color-0500 placeholder:text-sm ${className} placeholder:pb-1`}
        placeholder={placeholder}
        value={inputText}
        onChange={onInputTextChange}
      />
      {inputText?.length > 0 && (
        <IconRenderer
          id="search-component-clear"
          icon="Close"
          className="absolute right-1 cursor-pointer text-red-600 font-extrabold"
          style={{ fontSize: 16 }}
          onClick={onInputTextClear}
        />
      )}
    </div>
  );
};
