import { JsonFormsDispatch } from "@jsonforms/react";

const Tab = ({ id, label, selected, handleChange }) => {
  return (
    <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
      <a
        className={`text-xs font-semibold uppercase py-1.5 shadow hover:shadow-lg rounded block leading-normal select-none ${
          selected === id ? "text-white bg-color-0800" : "text-color-0800 bg-white"
        }`}
        onClick={(e) => {
          e.preventDefault();
          handleChange(id);
        }}
        data-toggle="tab"
        href={`#${id}`}
        role="tablist"
      >
        {label}
      </a>
    </li>
  );
};

const TabList = ({ selected, handleChange, infos }) => (
  <ul className="flex mb-0 list-none flex-wrap py-2 flex-row" role="tablist">
    {Array.isArray(infos) &&
      infos.map((info, index) => <Tab key={`tab-list-${index}`} id={index} label={info?.label} selected={selected} handleChange={handleChange} />)}
  </ul>
);

const TabPanels = ({ selected, infos, ...otherProps }) => {
  return (
    <div className="flex flex-col min-w-0 break-words bg-white w-full mb-2 shadow rounded">
      <div className="px-1.5 py-0.5 flex-auto">
        <div className="tab-content tab-space">
          {Array.isArray(infos) &&
            infos.map((info, index) => (
              <div key={`tab-panel-${index}`} className={selected === index ? "block" : "hidden"} id={`tab-panel-${index}`}>
                <JsonFormsDispatch
                  key={index}
                  schema={info.schema}
                  uischema={info.uischema}
                  path={otherProps.path}
                  renderers={otherProps.renderers}
                  cells={otherProps.cells}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const TabRenderer = ({ selected, onChange, infos, ...otherProps }) => {
  return (
    <div className="flex flex-wrap px-2 pb-1">
      <div className="w-full">
        <TabList selected={selected} handleChange={onChange} infos={infos} />
        <TabPanels selected={selected} infos={infos} {...otherProps} />
      </div>
    </div>
  );
};

export default TabRenderer;
