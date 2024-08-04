import { IconRenderer, NewlineText, Tooltip } from "../../utilities";
import CardLayout from "./CardLayout";

export default function DisplayCard({ name, description, status, actions, records, onClick }) {
  return (
    <CardLayout key={name} className="grid grid-cols-12 gap-x-2">
      <div className="col-span-3 flex flex-col text-color-label break-words border-r" onClick={onClick}>
        <p className="text-lg font-medium">{name}</p>
        <NewlineText text={description} />
      </div>
      <div className="col-span-5 flex flex-col text-xs border-r" onClick={onClick}>
        {records?.map(
          ({ icon, tooltip, prefix, element }, index) =>
            element && (
              <div key={index} className="text-color-label break-words select-all flex flex-row items-center mt-1">
                <IconRenderer icon={icon} className="text-color-0600 mr-2" />
                <Tooltip title={tooltip} placement="bottom">
                  {`${prefix}: ${element}`}
                </Tooltip>
              </div>
            )
        )}
      </div>
      <div className="flex flex-col col-span-1 items-center justify-center border-r" onClick={onClick}>
        <div className={`text-white text-xs text-center font-bold mt-2 px-2 py-1 w-18 rounded ${status ? "bg-green-600" : "bg-red-600"}`}>
          {status ? "Active" : "In-Active"}
        </div>
      </div>
      <div className="col-span-3 flex items-center">{actions}</div>
    </CardLayout>
  );
}
