import { IconRenderer } from "../../../utilities";

const ValidationIcon = ({ errorMessages }) => {
  return (
    <span className="mx-4 relative inline-block">
      <IconRenderer icon="NotificationsActive" />
      <span className="absolute -top-1 -right-4 px-1 py-0.5 text-[10px] font-bold leading-none text-white transform bg-red-600 rounded-full">
        {errorMessages.split("\n").length}
      </span>
    </span>
  );
};

export default ValidationIcon;
