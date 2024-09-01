import { useState } from "react";

const OverlayKeys = ({ suggest, onSelect }) => {
  const [selected, setSelected] = useState(suggest && suggest[0]);

  return (
    <div className="grid grid-cols-2 rounded shadow-lg bg-slate-100 p-1 border w-96 min-h-52 max-h-52 overflow-hidden">
      <div className="flex flex-col overflow-y-auto custom-scrollbar overflow-x-hidden mx-1 bg-white max-h-52 ">
        {suggest?.map((s, index) => (
          <div
            key={index}
            className="border-b hover:shadow p-1 text-xs text-color-0600 cursor-pointer inline-flex items-center"
            onClick={() => onSelect(s)}
            onMouseOver={() => setSelected(s)}
          >
            <div className="bg-green-500 p-0.5 px-1.5 mr-2 text-white">E</div>
            <label className="cursor-pointer">{s.key}</label>
          </div>
        ))}
      </div>
      <div className="flex flex-col text-[10px] border-l-2 mx-1 px-1">
        <label className="font-semibold">Current Value:</label>
        <label className="break-all overflow-y-auto custom-scrollbar overflow-x-hidden mx-1 max-h-52 select-all">
          {selected?.key?.toLowerCase().includes("password") ? selected?.value?.replaceAll(/./gi, "*") : selected?.value}
        </label>
      </div>
    </div>
  );
};

export default OverlayKeys;
