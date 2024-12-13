import React, { useState, useEffect } from "react";
import isEmpty from "lodash/isEmpty";
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";

import TailwindToggleRenderer from "@tailwindrender/renderers/TailwindToggleRenderer";
import TailwindInputText from "@tailwindrender/renderers/TailwindInputText";

import { Accordion, Tooltip, IconRenderer } from "@utilities/.";

const DragabbleElements = ({ title = "Palettes", elements = [], showExpand = true, showFilter = true, showIcon = true }) => {
  const [expand, setExpand] = useState(false);
  const [filter, setFilter] = useState("");
  const [displayElements, setDisplayElements] = useState(elements);
  const [showDraggables, setShowDraggables] = useState(false);

  useEffect(() => {
    setDisplayElements(elements);
  }, [elements]);

  const handleChange = (value) => {
    setFilter(value);
    if (value.trim().length <= 0) {
      setExpand(false);
      setDisplayElements(elements);
    } else {
      setExpand(true);
      setDisplayElements(filterItems(value.toLowerCase(), elements));
    }
  };

  return (
    <div className={`sticky top-0 ${showDraggables ? "w-32" : "w-fit"}`}>
      <div className="h-full flex flex-col justify-center text-slate-600 space-y-1 p-1">
        {!isEmpty(title) && (
          <div className="w-full flex flex-row items-center justify-between p-[0.1rem] space-x-2">
            {showDraggables && (
              <Tooltip title={`Drag and Drop ${title}`} content="Drag the item from the list and drop onto the canvas." placement="left">
                <span className="text-xs select-none font-bold ml-2">{title}</span>
              </Tooltip>
            )}
            <>
              {showExpand && (
                <Tooltip title="Expand/Collapse All" placement="left">
                  <TailwindToggleRenderer path="expand" visible={true} enabled={true} data={expand} handleChange={(_, ev) => setExpand(ev)} />
                </Tooltip>
              )}
              <Tooltip title={`${showDraggables ? "Hide" : "Show"} ${title}`}>
                <button
                  className={`bg-white ${showDraggables ? "bg-slate-100" : ""} hover:bg-slate-100 cursor-pointer p-2 rounded-lg`}
                  onClick={() => setShowDraggables(!showDraggables)}
                >
                  {showDraggables ? <FiMinusCircle /> : <FiPlusCircle />}
                </button>
              </Tooltip>
            </>
          </div>
        )}
        {showFilter && (
          <div className="w-full">
            <TailwindInputText
              id="search"
              visible={showFilter}
              enabled={true}
              uischema={{}}
              path="search"
              errors=""
              schema={{}}
              trim={true}
              description="Filter"
              handleChange={(_, ev) => handleChange(ev)}
              readonly={false}
              data={filter}
            />
          </div>
        )}
        {showDraggables && (
          <div id="dragabble-items" className="w-full p-0.5 flex flex-col items-center space-y-3 border-t pt-2">
            {RenderElements(displayElements, expand, showIcon)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DragabbleElements;

const filterItems = (search, elements) => {
  const res = [];
  elements.forEach((element) => {
    if (element.type === "group") {
      const temp = { ...element };
      temp.elements = element.elements.filter((e) => e.label?.toLowerCase().includes(search));
      res.push(temp);
    } else if (element.label?.toLowerCase().includes(search)) {
      res.push(element);
    }
  });
  return res;
};

const RenderElements = (elements, expand, showIcon) => {
  return (
    Array.isArray(elements) &&
    elements.map((element, ei) => {
      if (element.type === "group" && Array.isArray(element.elements))
        return (
          <div key={ei} className="w-full my-1">
            {element.elements.length > 0 && (
              <div id={`group-${ei}`}>
                <Accordion pid={ei} title={element.title} defaultOpen={expand && element.elements.length > 0} disableOnMouseHover={true}>
                  {RenderElements(element.elements)}
                </Accordion>
              </div>
            )}
          </div>
        );
      else return <RenderElement id={element.id} key={ei} showIcon={showIcon} {...element} />;
    })
  );
};

const onDragStart = (ev, id, type, value) => {
  ev.dataTransfer.setData("node-id", id);
  ev.dataTransfer.setData("node-type", type);
  ev.dataTransfer.setData("node-value", JSON.stringify(value));
  ev.dataTransfer.effectAllowed = "move";
};

const RenderElement = React.memo(({ id, type, value, label, description, showIcon = true, icon }) => {
  return (
    <div
      id={`draggable-item-${id}`}
      className="group shadow hover:shadow-xl h-fit rounded cursor-pointer flex flex-col items-center justify-center bg-white w-full space-y-0.5 py-2 border"
      onDragStart={(ev) => onDragStart(ev, id, type, value)}
      draggable
    >
      {showIcon && icon && typeof icon === "string" ? <IconRenderer icon={icon} className="my-0.5" /> : icon}
      <div className="inline-flex items-center justify-center">
        <span className={`text-xs text-center ${showIcon ? "" : "p-2"} break-all font-medium mx-0.5`}>{label}</span>
        {description && <IconRenderer icon="HelpOutlined" fontSize="8px" className="pb-0.5 ml-1" tooltip={label} description={description} />}
      </div>
    </div>
  );
});
