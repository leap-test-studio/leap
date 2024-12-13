import ReactEcharts from "echarts-for-react";

const RAMUsage = ({ memInfo }) => {
  let total = 0;
  let available = 0;
  let totalRam = 0;
  let usageRam = 0;
  let availableRam = 0;
  if (memInfo) {
    total = Number(memInfo.total);
    available = Math.floor(total - Number(memInfo.used)); //+ Number(memInfo.available);
    availableRam = Math.ceil(available / (1024 * 1024 * 1024));
    totalRam = Math.ceil(total / (1024 * 1024 * 1024));
  }
  if (total > 0) {
    usageRam = Math.abs(Math.ceil((total - available) / (1024 * 1024 * 1024)));
  }
  let used = Math.floor(usageRam / totalRam) * 100;
  let usedC = "#ff9900";
  if (used >= 80) {
    usedC = "#ff0000";
  } else if (used >= 60 && used < 80) {
    usedC = "#ff6600";
  }
  const option = {
    color: [usedC, "#c7c7c7"],
    legend: {
      show: true,
      itemGap: 10,
      icon: "circle",
      bottom: "10%",
      align: "right",
      textStyle: {
        color: "#336B87",
        fontSize: 9
      }
    },

    tooltip: {
      show: true,
      trigger: "item",
      formatter: "Total {a} GB <br/>{b}: {c} ({d}%)"
    },
    series: [
      {
        name: totalRam,
        type: "pie",
        radius: ["55%", "72.55%"],
        center: ["50%", "40%"],
        avoidLabelOverlap: true,
        hoverOffset: 5,
        stillShowZeroSum: false,
        label: {
          normal: {
            show: true,
            position: "center", // shows the description data to center, turn off to show in right side
            textStyle: {
              color: "#336B87",
              fontSize: 10,
              fontWeight: "bold"
            },
            formatter: "Total: {a} GB\n\nUsed: " + usageRam + " GB\n\nFree: " + availableRam + " GB"
          }
        },
        labelLine: {
          normal: {
            show: false
          }
        },
        data: [
          {
            value: usageRam,
            name: "Used"
          },
          { value: availableRam, name: "Free" }
        ]
      }
    ]
  };
  return (
    <>
      <div className="font-semibold text-color-label text-base text-center pt-4 select-none">RAM Usage</div>
      {!isNaN(total) ? (
        <ReactEcharts style={{ height: "180px" }} option={option} />
      ) : (
        <div className="flex flex-col items-center justify-center mt-4">
          <div className="bg-slate-200 animate-pulse size-32 rounded-full" />
        </div>
      )}
    </>
  );
};

export default RAMUsage;
