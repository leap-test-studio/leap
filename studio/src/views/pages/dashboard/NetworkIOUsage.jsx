import { useState } from "react";
import ReactEcharts from "echarts-for-react";

import { cashFormat } from "../utils";
import TailwindSelectRenderer from "../../tailwindrender/renderers/TailwindSelectRenderer";

const types = [
  { label: "Bytes", value: "bytes" },
  { label: "Packets", value: "packets" }
];

const NetworkIOUsage = ({ timeline, networkInterfaces }) => {
  const interfaces = [];

  Object.keys(networkInterfaces).forEach((key) => {
    interfaces.push({
      id: interfaces.length + 1,
      label: String(key).toUpperCase(),
      value: key
    });
  });

  const [currentInterface, setCurrentInterface] = useState(interfaces && interfaces.length > 0 ? interfaces[0]?.value : null);
  const [currentType, setCurrentType] = useState(types[0].value);

  const option = {
    smooth: true,
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross"
      }
    },
    grid: {
      top: "10%",
      left: "15%",
      bottom: "25%"
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
      data: timeline,
      axisLine: {
        show: true
      },
      axisTick: {
        show: true
      },
      axisLabel: {
        fontSize: 8,
        fontFamily: "roboto",
        rotate: 45
      },
      labels: {
        style: {
          colors: "#ff6e54"
        },
        formatter: (value) => Math.trunc(value / 1e9)
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
      axisLabel: {
        fontSize: 10,
        fontFamily: "roboto",
        formatter: (val) => (currentType?.value === "packets" ? cashFormat(val) : val + " Kbps")
      }
    },
    series: getSeries(networkInterfaces, currentInterface, currentType)
  };
  return (
    <>
      <div className="font-semibold text-color-label text-base text-center pt-2 select-none">Network I/O</div>
      <div className="grid grid-cols-2 gap-2">
        <TailwindSelectRenderer
          id="interface"
          path="interface"
          label="Interface"
          options={interfaces}
          data={currentInterface}
          handleChange={(_, ev) => setCurrentInterface(ev)}
          enableFilter={false}
        />
        <TailwindSelectRenderer
          id="type"
          path="type"
          label="Type"
          options={types}
          data={currentType}
          handleChange={(_, ev) => setCurrentType(ev)}
          enableFilter={false}
        />
      </div>
      <ReactEcharts option={option} />
    </>
  );
};

export default NetworkIOUsage;

function getSeries(ni, currentInterface, currentType) {
  const series = [];
  currentInterface &&
    Object.keys(ni)
      .sort()
      .forEach((key) => {
        if (key === currentInterface.value) {
          let divider = currentType.value === "bytes" ? 1024 : 10;
          series.push({
            data: diff(ni[key]["transmitted" + currentType.value], divider),
            type: "line",
            name: "Sent",
            smooth: true,
            symbolSize: 0,
            lineStyle: {
              width: 2
            }
          });
          series.push({
            data: diff(ni[key]["received" + currentType.value], divider),
            type: "line",
            name: "Received",
            smooth: true,
            symbolSize: 0,
            lineStyle: {
              width: 2
            }
          });
        }
      });

  return series;
}

function diff(a, divide = 10) {
  const result = [0];
  if (a !== undefined)
    for (let i = 1; i < a.length; i++) {
      result.push(Math.ceil((a[i] - a[i - 1]) / divide));
    }
  return result;
}
