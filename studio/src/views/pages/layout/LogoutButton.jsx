import { useDispatch } from "react-redux";

import { logoutUser } from "../../../redux/actions/LoginActions";
import IconRenderer from "../../IconRenderer";
import Tooltip from "../../utilities/Tooltip";

function LogoutButton({ resetContext }) {
  const dispatch = useDispatch();

  return (
    <Tooltip title="Logout" placement="bottom">
      <div
        id="logout-button"
        className="h-6 w-7 flex cursor-pointer rounded justify-center items-center hover:bg-slate-500/40 mx-1 mr-2"
        onClick={() => {
          dispatch(logoutUser());
          resetContext();
        }}
      >
        <IconRenderer icon="PowerSettingsNewTwoTone" className="text-white" fontSize="20px" />
      </div>
    </Tooltip>
  );
}

export default LogoutButton;
