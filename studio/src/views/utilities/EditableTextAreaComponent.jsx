import { useEffect, useState } from "react";

import { NewlineText } from "./NewlineText";
import { IconRenderer } from "./iconrenderer/IconRenderer";

export const EditableTextAreaComponent = ({ data, onChange }) => {
  const [description, setDescription] = useState(data);
  const [modify, setModify] = useState(false);

  useEffect(() => {
    setDescription(data);
  }, [data]);

  const onTextChange = (ev) => {
    ev.preventDefault();
    setDescription(ev.target.value);
  };

  const onSave = () => {
    onChange(description);
    setModify(false);
  };

  return (
    <div className="flex flex-row w-full">
      <div className="w-[99%]">
        {modify ? (
          <textarea
            autoComplete="off"
            className="block caret-slate-300 h-10 text-xs rounded border placeholder-slate-500 shadow focus:shadow-md focus:border-color-0600 border-slate-200 focus:outline-none w-full text-slate-700"
            placeholder="Enter the setup description"
            value={description}
            onChange={onTextChange}
          />
        ) : (
          <NewlineText text={description} />
        )}
      </div>
      <IconRenderer
        icon={modify ? "Check" : "ModeEdit"}
        className=" text-slate-300 hover:text-cds-blue-0500 mt-1 mx-2 cursor-pointer"
        fontSize="small"
        onClick={() => (modify ? onSave() : setModify(true))}
      />
    </div>
  );
};
