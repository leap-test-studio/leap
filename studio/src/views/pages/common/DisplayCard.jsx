import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import { IconRenderer, NewlineText, Toast, Tooltip } from "../../utilities";
import CardLayout from "./CardLayout";
import copy from "copy-to-clipboard";

export default function DisplayCard({ id, name, description, status, actions, moreOptions, records, onClick }) {
  return (
    <CardLayout key={name} className="grid grid-cols-12 gap-x-2 border-color-0200 hover:border-color-0300" onDoubleClick={onClick}>
      <div className="col-span-5 flex flex-col justify-center text-color-label break-words border-r px-2">
        <p className="text-lg font-medium">{name}</p>
        {id && (
          <div className="text-color-label break-words select-all flex flex-row items-center mb-3">
            <IconRenderer icon="Fingerprint" className="text-color-0600" style={{ fontSize: 15 }} />
            <Tooltip title="Unique Identifier">
              <label
                className="text-xs"
                onClick={() => {
                  copy(id);
                  Toast.fire({
                    icon: "success",
                    title: `Copied UUID: ${id}`
                  });
                }}
              >
                {id}
              </label>
            </Tooltip>
          </div>
        )}
        <Tooltip title="Details">
          <NewlineText text={description} />
        </Tooltip>
      </div>
      <div className="col-span-4 flex flex-col justify-center text-xs border-r">
        {records?.map(
          ({ icon, tooltip, prefix, element }, index) =>
            element && (
              <div key={index} className="text-color-label break-words select-all flex flex-row items-center mt-1">
                <IconRenderer icon={icon} className="text-color-0600 mr-1" style={{ fontSize: 20 }} />
                <Tooltip title={tooltip}>
                  <label className="text-xs">{`${prefix}: ${element}`}</label>
                </Tooltip>
              </div>
            )
        )}
      </div>
      <div className="flex flex-col col-span-1 items-center justify-center border-r pr-2">
        <div className={`text-white text-xs text-center font-bold mt-2 px-2 py-1 w-full rounded ${status ? "bg-green-600" : "bg-red-600"}`}>
          {status ? "Active" : "In-Active"}
        </div>
      </div>
      <div className="flex flex-row col-span-2 items-center min-w-[100px] w-full justify-end">
        <div className="flex flex-row items-center justify-end pr-1">{actions}</div>
        {moreOptions && <MoreActionsDropDowns id={id} elements={moreOptions} />}
      </div>
    </CardLayout>
  );
}

export const MoreActionsDropDowns = ({ id, elements = [] }) => {
  return (
    <Tooltip title="More Options">
      <Menu>
        <MenuButton>
          {({ active }) => (
            <div
              id={id}
              className={`inline-flex text-sm font-medium text-color-0600 hover:text-color-0500 items-center transition duration-150 hover:bg-white ${active ? "bg-white border shadow" : ""} p-1 rounded-md`}
            >
              <IconRenderer icon="MoreVert" />
            </div>
          )}
        </MenuButton>
        <MenuItems
          anchor="left"
          transition
          className="min-w-56 transition duration-200 ease-out bg-white border border-slate-300 py-1.5 rounded shadow-lg overflow-hidden"
        >
          {elements.map(({ icon, label, onClick, tooltip, description, disabled }, index) => (
            <MenuItem
              as="div"
              key={index}
              className={`hover:bg-slate-100 font-medium text-base text-slate-600 hover:text-slate-700 flex flex-row items-center p-1.5 px-2 cursor-pointer mx-1.5 rounded ${disabled ? "bg-slate-100 cursor-not-allowed" : ""}`}
              onClick={onClick}
              disabled={disabled}
            >
              {icon && (
                <IconRenderer
                  icon={icon}
                  className={`text-color-0600 hover:text-color-0500 mx-1.5 cursor-pointer ${disabled ? "text-slate-500" : ""}`}
                  style={{ fontSize: 20 }}
                  tooltip={tooltip}
                  description={description}
                />
              )}
              <label className="pl-2 cursor-pointer">{label}</label>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </Tooltip>
  );
};

export const ActionButton = ({ tooltip, description, icon, onClick, disabled, className = "" }) => (
  <Tooltip title={tooltip} content={description}>
    <div className="cursor-pointer hover:bg-white p-1.5 rounded-md">
      <IconRenderer
        icon={icon}
        style={{ fontSize: 20 }}
        onClick={onClick}
        disabled={disabled}
        className={`text-color-0600 hover:text-color-0500 ${className} ${disabled ? "text-slate-500 hover:text-slate-400 cursor-not-allowed" : ""}`}
      />
    </div>
  </Tooltip>
);

export const CardHeaders = ({ items }) => (
  <div className="absoulte sticky top-0 grid grid-cols-12 w-full gap-x-2 bg-white px-4 py-2 rounded-lg border border-color-0200 hover:border-color-0300 mb-2.5">
    {items?.map(({ colSpan, label }, index) => (
      <div key={index} className={`col-span-${colSpan} text-center ${index < items.length - 1 ? "border-r" : ""}`}>
        {label}
      </div>
    ))}
  </div>
);
