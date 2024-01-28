import { useDispatch } from "react-redux";

import { sequenceEvents } from "../../../redux/actions/TestSequencerActions";
import { IconRenderer } from "../../utilities";
import { convertMsToHMString } from "../../tailwindrender/util/converter";

function NodeHeader({ selected, timer = 0 }) {
  const dispatch = useDispatch();

  return (
    <div className="relative h-6 w-24">
      {timer > 0 && (
        <span
          className="absolute -top-1 -right-5 py-0.5 font-medium leading-none transform rounded-full"
          style={{
            fontSize: 9
          }}
        >
          Wait for {convertMsToHMString(timer)}
        </span>
      )}
      {selected && (
        <div className="flex flex-row items-center justify-end">
          <IconRenderer
            icon="FileCopy"
            className="text-color-0500 mr-0.5 cursor-pointer"
            aria-hidden="true"
            style={{ fontSize: "13" }}
            onClick={() => dispatch(sequenceEvents("nodeAction:cloneNode"))}
            tooltip="Clone this Node?"
          />
          <IconRenderer
            icon="DeleteForever"
            className="text-color-0500 mr-0.5 cursor-pointer"
            aria-hidden="true"
            style={{ fontSize: "14" }}
            onClick={() => dispatch(sequenceEvents("nodeAction:deleteNode"))}
            tooltip="Delete this Node?"
          />
        </div>
      )}
    </div>
  );
}

export default NodeHeader;
