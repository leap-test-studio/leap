const SystemInfo = ({ info, noOfnetworkInterfaces }) => {
  let ram = undefined;
  if (info.totalRam) {
    let total = Math.ceil(info.totalRam / (1024 * 1024 * 1024));
    ram = total + " GB";
  }

  let swap = undefined;
  if (info.totalSwap) {
    let total = Math.ceil(info.totalSwap / (1024 * 1024 * 1024));
    swap = total + " GB";
  }
  return (
    <div className="px-2 py-4">
      <div className="font-semibold text-color-label text-base mb-4 select-none">System Information</div>
      <div className="font-semibold text-xs mb-1">CPU</div>
      {info.numCpu !== undefined ? (
        <p className="text-slate-500 font-semibold text-xs mb-4">{info.numCpu}</p>
      ) : (
        <div className="bg-slate-200 w-full animate-pulse h-3 rounded-2xl mb-4" />
      )}
      <div className="font-semibold text-xs mb-1">HOSTNAME</div>
      {info.hostname !== undefined ? (
        <p className="text-slate-500 font-semibold text-xs mb-4">{info.hostname}</p>
      ) : (
        <div className="bg-slate-200 w-full animate-pulse h-3 rounded-2xl mb-4" />
      )}
      <div className="font-semibold text-xs mb-1">OS</div>
      {info.os !== undefined ? (
        <p className="text-slate-500 font-semibold text-xs mb-4">{info.os}</p>
      ) : (
        <div className="bg-slate-200 w-full animate-pulse h-3 rounded-2xl mb-4" />
      )}
      <div className="font-semibold text-xs mb-1">PLATFORM</div>
      {info.platform !== undefined ? (
        <p className="text-slate-500 font-semibold text-xs mb-4">{info.platform}</p>
      ) : (
        <div className="bg-slate-200 w-full animate-pulse h-3 rounded-2xl mb-4" />
      )}
      <div className="font-semibold text-xs mb-1">ARCH</div>
      {info.kernelArchitecture !== undefined ? (
        <p className="text-slate-500 font-semibold text-xs mb-4">{info.kernelArchitecture}</p>
      ) : (
        <div className="bg-slate-200 w-full animate-pulse h-3 rounded-2xl mb-4" />
      )}
      <div className="font-semibold text-xs mb-1">RAM</div>
      {ram !== undefined ? (
        <p className="text-slate-500 font-semibold text-xs mb-4">{ram}</p>
      ) : (
        <div className="bg-slate-200 w-full animate-pulse h-3 rounded-2xl mb-4" />
      )}
      <div className="font-semibold text-xs mb-1">SWAP</div>
      {swap !== undefined ? (
        <p className="text-slate-500 font-semibold text-xs mb-4">{swap}</p>
      ) : (
        <div className="bg-slate-200 w-full animate-pulse h-3 rounded-2xl mb-4" />
      )}
      <div className="font-semibold text-xs mb-1">NETWORK INTERFACES</div>
      {noOfnetworkInterfaces !== undefined ? (
        <p className="text-slate-500 font-semibold text-xs mb-4">{noOfnetworkInterfaces}</p>
      ) : (
        <div className="bg-slate-200 w-full animate-pulse h-3 rounded-2xl mb-4" />
      )}
    </div>
  );
};

export default SystemInfo;
