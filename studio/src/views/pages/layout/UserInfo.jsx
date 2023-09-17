import LocalStorageService from "../../../redux/actions/LocalStorageService";
import IconRenderer from "./../../../views/IconRenderer";
function UserInfo({ showTitle = false }) {
  if (!showTitle) return null;
  const user = LocalStorageService.getItem("auth_user");
  let username, role, email;
  if (user) {
    username = user?.name;
    role = user?.role;
    email = user?.email;
  }
  return (
    <div className="py-1 px-2 mx-2 rounded backdrop-blur-sm bg-slate-500/30 text-slate-300 items-center">
      <div className="flex-1 items-center justify-between select-none">
        {username && <p>{username}</p>}
        {role && <IconLabel label={role} icon="AccountCircle" />}
      </div>
      {email && <IconLabel label={email} icon="Email" />}
    </div>
  );
}

function IconLabel({ icon, label }) {
  return (
    <p className="text-xs flex items-center">
      <IconRenderer icon={icon} className="mr-1" style={{ width: "12px" }} />
      {label}
    </p>
  );
}

export default UserInfo;
