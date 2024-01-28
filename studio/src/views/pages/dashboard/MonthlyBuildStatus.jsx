import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactEcharts from "echarts-for-react";

import { IconRenderer } from "../../utilities";
import { getBuildTrend } from "../../../redux/actions/DashboardActions";

const INTERVAL = 10 * 1000;

let timer = null;
const MonthlyBuildStatus = ({ project }) => {
  const dispatch = useDispatch();
  const { buildStats } = useSelector((state) => state.dashboard);

  useEffect(() => {
    const fetchBuildTrend = () => {
      if (project) dispatch(getBuildTrend(project?.id));
    };
    fetchBuildTrend();
    timer = setInterval(() => {
      fetchBuildTrend();
    }, INTERVAL);
    return () => {
      clearInterval(timer);
    };
  }, [project]);

  const option = {
    color: ["#3b82f6", "#0ea472", "#d31212", "#fcd34d", "#008ae6"],
    smooth: true,
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross"
      }
    },
    grid: {
      bottom: "20%",
      top: "15%"
    },
    legend: {
      show: true,
      itemGap: 20,
      icon: "circle",
      align: "right",
      textStyle: {
        color: "#336B87",
        fontSize: 10,
        fontFamily: "roboto"
      }
    },
    xAxis: {
      type: "category",
      data: buildStats.buildNo,
      axisLine: {
        show: true
      },
      axisTick: {
        show: true
      }
    },
    yAxis: {
      type: "value",
      axisLine: {
        show: true
      },
      axisTick: {
        show: true
      },
      splitLine: {
        show: true,
        lineStyle: {
          opacity: 0.15
        }
      },
      labels: {
        style: {
          colors: "#ff6e54"
        }
      }
    },
    series: getSeries(buildStats)
  };
  return (
    <>
      {project && (
        <div className="relative bg-white p-4 rounded-md w-full shadow-xl mt-1 border">
          <div className="text-white flex items-center absolute rounded-md p-2 shadow-xl bg-violet-500 left-4 -top-4 select-none">
            <IconRenderer icon="LineAxis" className="h-10 w-10" />
            <p className="text-sm font-semibold ml-3">Project Build Trend</p>
          </div>
          <div className="mt-5">
            <ReactEcharts option={option} />
          </div>
        </div>
      )}
    </>
  );
};

export default MonthlyBuildStatus;

function getSeries(ni) {
  return [
    {
      data: ni.total,
      type: "line",
      name: "Total",
      smooth: true,
      symbolSize: 0,
      lineStyle: {
        width: 2
      }
    },
    {
      data: ni.passed,
      type: "line",
      name: "Pass",
      smooth: true,
      symbolSize: 0,
      lineStyle: {
        width: 2
      }
    },
    {
      data: ni.failed,
      type: "line",
      name: "Fail",
      smooth: true,
      symbolSize: 0,
      lineStyle: {
        width: 2
      }
    },
    {
      data: ni.skipped,
      type: "line",
      name: "Skipped",
      smooth: true,
      symbolSize: 0,
      lineStyle: {
        width: 2
      }
    },
    {
      data: ni.running,
      type: "line",
      name: "Running",
      smooth: true,
      symbolSize: 0,
      lineStyle: {
        width: 2
      }
    }
  ];
}
