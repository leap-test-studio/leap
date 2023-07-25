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
    <div className="py-1 px-3 mx-2 rounded backdrop-blur-sm bg-slate-500/30 text-slate-300 items-center">
      <div className="flex items-center justify-between select-none">
        {username && <p>{username}</p>}
        {role && (
          <p className="text-xs flex items-center">
            <IconRenderer icon="AccountCircle" className="mr-[2px]" style={{ width: "14px" }} />
            {role}
          </p>
        )}
      </div>
      {email && <p style={{ fontSize: 9 }}>e-mail: {email}</p>}
    </div>
  );
}

export default UserInfo;
