import { IconRenderer, Tooltip } from "../../utilities";
import SelectedProject from "../project_management/SelectedProject";
import HelpMenu from "./HelpMenu";
import LogoutButton from "./LogoutButton";
import LocalStorageService from "../../../redux/actions/LocalStorageService";

const IconLabel = ({ icon, label }) => (
  <p className="text-xs flex items-center">
    <IconRenderer icon={icon} className="mr-1" style={{ width: "14px" }} />
    {label}
  </p>
);

export default function Header({ isProjectSelected, ...props }) {
  const UserInfo = LocalStorageService.getUserInfo();
  return (
    <header
      className="sticky top-0 z-30 shadow-md select-none w-full h-10 grid grid-cols-12 grid-rows-1 gap-4 bg-white"
      style={{
        minHeight: props.windowDimension?.headerHeight,
        maxHeight: props.windowDimension?.headerHeight
      }}
    >
      <div className="col-span-8 flex flex-row items-center justify-start pl-2">{isProjectSelected && <SelectedProject {...props} />}</div>
      <span className="col-span-4 flex flex-row items-center justify-end">
        {isProjectSelected && <hr className="w-px h-5 bg-sky-950 mx-1.5" />}
        {UserInfo && (
          <Tooltip
            title="User Information"
            content={
              <div className="p-2 m-1 rounded backdrop-blur-sm bg-slate-500/30 text-slate-300 items-center">
                {UserInfo?.name && <IconLabel label={UserInfo.name} icon="PermIdentityTwoTone" />}
                {UserInfo?.tenant?.name && <IconLabel label={"Team: " + UserInfo.tenant?.name} icon="Groups3TwoTone" />}
                {UserInfo?.role && <IconLabel label={"Role: " + UserInfo.role} icon="AccountCircle" />}
                {UserInfo?.email && <IconLabel label={UserInfo.email} icon="Email" />}
              </div>
            }
          >
            <div className="inline-flex items-center justify-end">
              <div className="px-1.5 py-0.5 mr-2 rounded bg-color-0100 border shadow text-color-label">
                {UserInfo?.name && (
                  <IconLabel label={`${UserInfo.tenant?.name ? UserInfo.tenant?.name + " - " : ""}${UserInfo.name}`} icon="PermIdentityTwoTone" />
                )}
              </div>
              <div className="px-1.5 py-0.5 mr-2 rounded bg-color-0100 border shadow text-color-label">
                {UserInfo?.role && <IconLabel label={"Role: " + UserInfo.role} icon="AccountCircle" />}
              </div>
            </div>
          </Tooltip>
        )}
        <HelpMenu {...props} />
        {!props.product.isOktaEnabled && <LogoutButton {...props} />}
      </span>
    </header>
  );
}
