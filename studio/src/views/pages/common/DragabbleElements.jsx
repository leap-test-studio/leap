import React, { useState } from "react";
import Accordion from "../../utilities/Accordion";
import TailwindToggleRenderer from "../../tailwindrender/renderers/TailwindToggleRenderer";
import TailwindInputText from "../../tailwindrender/renderers/TailwindInputText";
import Tooltip from "../../utilities/Tooltip";
import IconRenderer from "../../IconRenderer";

const DragabbleElements = ({ title = "Palettes", elements, showExpand = true, showFilter = true, showIcon = true }) => {
  const [expand, setExpand] = useState(false);
  const [filter, setFilter] = useState("");
  const [displayElements, setDisplayElements] = useState(elements);

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
    <div className="sticky top-0">
      <div
        className={`"w-28 p-1 shadow h-full flex flex-col items-center justify-center text-color-0800 bg-slate-100 rounded", ${
          showExpand && "w-[120px]"
        }`}
      >
        <div className="w-full flex flex-row items-center justify-center p-[0.1rem] border-b">
          <Tooltip title="Drag and Drop" content="Drag the item from the list and drop onto the canvas." placement="left">
            <span className="text-xs select-none font-bold">{title}</span>
          </Tooltip>
          {showExpand && (
            <Tooltip title="Expand/Collapse All" placement="left">
              <TailwindToggleRenderer path="expand" visible={true} enabled={true} data={expand} handleChange={(_, ev) => setExpand(ev)} />
            </Tooltip>
          )}
        </div>
        <div className="mt-1">
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
        <div
          key="dragabble-items"
          className="w-full p-0.5 flex flex-col items-center h-0.95 overflow-y-scroll scrollbar-thin scrollbar-thumb-color-0800 scrollbar-track-slate-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
        >
          {RenderElements(displayElements, expand, showIcon)}
        </div>
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
    } else if (element.type === "element" && element.label?.toLowerCase().includes(search)) {
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

const onDragStart = (ev, nodeType) => {
  ev.dataTransfer.setData("application/reactflow", nodeType);
  ev.dataTransfer.effectAllowed = "move";
};

const RenderElement = React.memo(({ id, value, label, description, showIcon = true, icon }) => {
  if (description) {
    return (
      <Tooltip title={label} content={description}>
        <div
          id={`draggable-item-${id}`}
          className="group shadow hover:shadow-xl mx-1 mb-2.5 py-2 h-fit rounded cursor-pointer flex flex-col items-center justify-center bg-white w-24"
          onDragStart={(ev) => onDragStart(ev, value)}
          draggable
        >
          {showIcon && icon && <IconRenderer icon={icon} className="my-0.5" />}
          <span className="text-xs text-center px-0.1 break-words font-medium">{label}</span>
        </div>
      </Tooltip>
    );
  }

  return (
    <div
      id={`draggable-item-${id}`}
      className="group shadow hover:shadow-xl mx-1 mb-2.5 h-fit rounded cursor-pointer flex flex-col items-center justify-center bg-white w-28"
      onDragStart={(ev) => onDragStart(ev, value)}
      draggable
    >
      {showIcon && icon && <IconRenderer icon={icon} className="my-0.5" />}
      <span className={`text-xs text-center ${showIcon ? "" : "p-2"} break-all font-medium mx-0.5`}>{label}</span>
    </div>
  );
});
