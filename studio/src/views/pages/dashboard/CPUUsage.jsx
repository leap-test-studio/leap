import React from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { CanvasRenderer } from "echarts/renderers";
import { GaugeChart } from "echarts/charts";
import * as echarts from "echarts/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { IconRenderer } from "../../utilities";

dayjs.extend(relativeTime);
// Register the required components
echarts.use([GaugeChart, CanvasRenderer]);

const CPUUsage = React.memo(({ usage, bootTime }) => {
  const options = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        radius: "115%",
        center: ["50%", "60%"],
        progress: {
          show: false,
          width: 5
        },
        data: [
          {
            value: usage,
            name: `${usage}%`
          }
        ],
        axisLine: {
          roundCap: false,
          lineStyle: {
            width: 10,
            color: [
              [0.5, "#00C853"],
              [0.8, "#FFD740"],
              [1, "#ff674d"]
            ]
          }
        },
        axisTick: {
          show: true
        },
        splitLine: {
          length: 15,
          lineStyle: {
            width: 0,
            color: "#999"
          }
        },
        axisLabel: {
          show: false,
          distance: 5,
          color: "#999",
          fontSize: 14
        },
        pointer: {
          icon: "path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z",
          length: "85%",
          width: 6,
          offsetCenter: [0, "0"]
        },
        anchor: {
          show: true,
          showAbove: true,
          size: 10,
          itemStyle: {
            borderWidth: 3
          }
        },
        detail: {
          show: false,
          valueAnimation: true,
          fontSize: 30,
          offsetCenter: [0, "20%"]
        }
      }
    ]
  };

  return (
    <>
      <div className="relative bg-white rounded-md h-full w-full shadow-xl select-none">
        <div id="toast-success" className="p-2 flex items-center text-gray-500">
          <div className="inline-flex flex-shrink-0 justify-center items-center h-6 w-6 text-green-300 bg-green-100 rounded-md">
            <span className="sr-only">Check icon</span>
            <IconRenderer icon="DeveloperBoard" fontSize="10" />
          </div>
          <div className="ml-2 text-color-label font-semibold text-xs leading-5">CPU Usage</div>
        </div>

        {!isNaN(usage) ? (
          <div className="mt-2 mb-2">
            <ReactEChartsCore echarts={echarts} option={options} notMerge={true} lazyUpdate={true} style={{ height: "110px" }} />
            <div className="-mt-2">
              <div className="font-semibold text-color-label text-xs text-center pb-1">Uptime</div>
              <div className="font-medium text-slate-500 text-xs text-center">{dayjs(Number(bootTime) * 1000).fromNow()}</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-4">
            <div className="bg-slate-200 animate-pulse h-20 w-20 rounded-full" />
            <div className="font-semibold text-color-label text-sm text-center pb-1">Uptime</div>
            <div className="bg-slate-200 w-10/12 animate-pulse h-4 rounded-2xl" />
          </div>
        )}
      </div>
    </>
  );
});

export default CPUUsage;
