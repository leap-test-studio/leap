import SelectedProject from "../common/SelectedProject";
import HelpMenu from "./HelpMenu";

export default function Header({ isProjectSelected, ...props }) {
  return (
    <header
      className="sticky top-0 z-30 shadow-md select-none bg-[#21394B] w-full h-10 flex flex-row items-center justify-between"
      style={{
        minHeight: props.windowDimension?.headerHeight,
        maxHeight: props.windowDimension?.headerHeight
      }}
    >
      <div className="flex flex-row items-center px-2 justify-start">
        <div className="w-0.30 ml-3">{isProjectSelected && <SelectedProject {...props} />}</div>
      </div>
      <span className="flex flex-row items-center justify-end">
        {isProjectSelected && <hr className="w-px h-5 bg-color-0100 mx-1.5" />}
        <HelpMenu {...props} />
      </span>
    </header>
  );
}
