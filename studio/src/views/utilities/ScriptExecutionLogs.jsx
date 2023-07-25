import React, { useCallback, useEffect } from "react";
import ConsoleOutputComponent from "./ConsoleOutputComponent";
import { useDispatch, useSelector } from "react-redux";
import { FetchApplicationLogs, ClearApplicationLogs } from "../../redux/actions/ExecuteAction";

let polling;
const ScriptExecutionLogs = ({
  setup,
  online,
  isSetupSelected,
  title = "Procedure Logs",
  className = "flex flex-col grow min-h-[230px] max-h-[230px] rounded"
}) => {
  const dispatch = useDispatch();

  const { logs } = useSelector((state) => state.execute);

  const clearLogs = () => dispatch(ClearApplicationLogs(setup));

  const loadInfo = useCallback(() => {
    if (isSetupSelected) {
      dispatch(FetchApplicationLogs(setup));
    } else {
      clearInterval(polling);
    }
  }, [setup, isSetupSelected]);

  useEffect(() => {
    if (polling) clearInterval(polling);
    loadInfo();
    polling = setInterval(loadInfo, 60000);
    return () => clearInterval(polling);
  }, [loadInfo]);

  return (
    <div className={`${className} mt-2`}>
      <ConsoleOutputComponent title={title} online={online} logs={logs} onClear={clearLogs} />
    </div>
  );
};

export default ScriptExecutionLogs;
