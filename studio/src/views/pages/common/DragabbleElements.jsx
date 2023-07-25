import React, { useState } from "react";
import Accordion from "../../utilities/Accordion";
import TailwindToggleRenderer from "../../tailwindrender/renderers/TailwindToggleRenderer";
import TailwindInputText from "../../tailwindrender/renderers/TailwindInputText";
import Tooltip from "../../utilities/Tooltip";
import IconRenderer from "../../IconRenderer";

const DragabbleElements = React.memo(({ elements, showExpand = true, showFilter = true, showIcon = true }) => {
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
      <div className="w-28 p-1 shadow h-full flex flex-col items-center justify-center text-color-0500 bg-slate-100 rounded">
        <div className="container flex items-center justify-center px-1 py-1.5 border-b">
          <Tooltip title="Drag and Drop" content="Drag the item from the list and drop onto the convas." placement="left">
            <span className="text-xs select-none font-bold">Palettes</span>
          </Tooltip>
          {showExpand && <TailwindToggleRenderer path="expand" visible={true} data={expand} handleChange={(_, ev) => setExpand(ev)} />}
        </div>
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
        <div
          key={"items"}
          className="container px-0.5 pt-1.5 flex flex-col items-center h-0.95 overflow-y-scroll scrollbar-thin scrollbar-thumb-color-0800 scrollbar-track-slate-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
        >
          {RenderElements(displayElements, expand, showIcon)}
        </div>
      </div>
    </div>
  );
});

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
      if (element.type === "group")
        return (
          <div id={"group-" + ei} key={"group-" + ei} className="container my-1">
            <Accordion title={element.title} defaultOpen={expand && Array.isArray(element.elements) && element.elements.length > 0}>
              {Array.isArray(element.elements) && RenderElements(element.elements)}
            </Accordion>
          </div>
        );
      else return <RenderElement key={element.id} showIcon={showIcon} {...element} />;
    })
  );
};

const onDragStart = (ev, nodeType) => {
  ev.dataTransfer.setData("application/reactflow", nodeType);
  ev.dataTransfer.effectAllowed = "move";
};

const RenderElement = React.memo(({ value, label, showIcon = true, icon }) => {
  return (
    <div
      className="container group shadow hover:shadow-xl mx-1 mb-2.5 py-2 h-fit rounded cursor-pointer flex flex-col items-center justify-center bg-cds-white w-20"
      onDragStart={(ev) => onDragStart(ev, value)}
      draggable
    >
      {showIcon && icon && <IconRenderer icon={icon} className="my-0.5" />}
      <span className="text-xs text-center px-0.5 break-words">{label}</span>
    </div>
  );
});
