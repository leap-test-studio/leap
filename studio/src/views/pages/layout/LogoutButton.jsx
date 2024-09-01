import { useDispatch } from "react-redux";

import { Tooltip, IconRenderer } from "../../utilities";
import { logoutUser } from "../../../redux/actions/LoginActions";

export default function LogoutButton({ resetContext }) {
  const dispatch = useDispatch();

  return (
    <Tooltip title="Logout" placement="bottom">
      <div
        id="logout-button"
        className="group h-6 w-7 flex cursor-pointer rounded justify-center items-center bg-slate-200 hover:bg-red-600 mx-1 mr-2"
        onClick={() => {
          dispatch(logoutUser());
          resetContext();
        }}
      >
        <IconRenderer icon="PowerSettingsNewTwoTone" className="text-color-label group-hover:text-white" fontSize="20px" />
      </div>
    </Tooltip>
  );
}
