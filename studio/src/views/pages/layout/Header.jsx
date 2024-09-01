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
  const userProfile = LocalStorageService.getItem("auth_user");
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
        {userProfile && (
          <Tooltip
            title="User Information"
            content={
              <div className="p-2 m-1 rounded backdrop-blur-sm bg-slate-500/30 text-slate-300 items-center">
                {userProfile?.name && <IconLabel label={userProfile.name} icon="PermIdentityTwoTone" />}
                {userProfile?.tenant?.name && <IconLabel label={"Team: " + userProfile.tenant?.name} icon="Groups3TwoTone" />}
                {userProfile?.role && <IconLabel label={"Role: " + userProfile.role} icon="AccountCircle" />}
                {userProfile?.email && <IconLabel label={userProfile.email} icon="Email" />}
              </div>
            }
          >
            <div className="inline-flex items-center justify-end">
              <div className="px-1.5 py-0.5 mr-2 rounded bg-color-0100 border shadow text-color-label">
                {userProfile?.name && (
                  <IconLabel
                    label={`${userProfile.tenant?.name ? userProfile.tenant?.name + " - " : ""}${userProfile.name}`}
                    icon="PermIdentityTwoTone"
                  />
                )}
              </div>
              <div className="px-1.5 py-0.5 mr-2 rounded bg-color-0100 border shadow text-color-label">
                {userProfile?.role && <IconLabel label={"Role: " + userProfile.role} icon="AccountCircle" />}
              </div>
            </div>
          </Tooltip>
        )}
        <HelpMenu {...props} />
        <LogoutButton {...props} />
      </span>
    </header>
  );
}
