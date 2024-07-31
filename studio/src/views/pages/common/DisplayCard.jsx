import { IconRenderer, Tooltip } from "../../utilities";

export default function DisplayCard({ name, cardIcon, actions, records, children }) {
  return (
    <div key={name} className="bg-slate-50 border border-slate-300 rounded-md shadow-md hover:shadow-lg transition duration-300 p-4">
      <div className="flex flex-row rounded-tr rounded-tl h-full">
        <div className="flex flex-col w-3/12 items-center justify-center">{cardIcon}</div>
        <div className="flex flex-col w-9/12 text-left pb-2">
          <div className="flex flex-col w-full">{actions}</div>
          <div className="text-color-0700 text-lg font-medium break-words pb-0.5 -mt-1">{name}</div>
          <div className="flex flex-col text-xs">
            {records?.map(
              ({ icon, tooltip, prefix, element }, index) =>
                element && (
                  <div key={index} className="text-slate-700 break-words select-all flex flex-row items-center mt-1">
                    <IconRenderer icon={icon} className="text-color-0600 mr-2" />
                    <Tooltip title={tooltip} placement="bottom">
                      {`${prefix}: ${element}`}
                    </Tooltip>
                  </div>
                )
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
