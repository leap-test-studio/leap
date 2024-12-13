import LocalStorageService from "@redux-actions/LocalStorageService";
import { IconRenderer } from "@utilities/.";

const IconLabel = ({ icon, label }) => (
  <p className="text-xs flex items-center break-all">
    <IconRenderer icon={icon} className="mr-1" style={{ width: "12px" }} />
    {label}
  </p>
);

export default function UserInfo({ showTitle = false }) {
  if (!showTitle) return null;
  const UserInfo = LocalStorageService.getUserInfo();
  let username, role, email;
  if (UserInfo) {
    username = UserInfo?.name;
    role = UserInfo?.role;
    email = UserInfo?.email;
  }
  return (
    <div className="p-1 m-0.5 rounded backdrop-blur-sm bg-slate-500/30 text-white items-center">
      <div className="flex-1 items-center justify-between select-none">
        {username && <p>{username}</p>}
        {role && <IconLabel label={role} icon="AccountCircle" />}
      </div>
      {email && <IconLabel label={email} icon="Email" />}
    </div>
  );
}
