import ReactEcharts from "echarts-for-react";

const LoadAverage = ({ timeline, load }) => {
  const option = {
    color: ["#006699", "#4cabce", "#BC85A3"],
    smooth: true,
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross"
      }
    },
    grid: {
      top: "20%",
      bottom: "10%",
      right: "10%"
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
        formatter: function (value) {
          return Math.trunc(+(value / 1e9));
        }
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
        fontFamily: "roboto"
      }
    },
    series: getSeries(load)
  };
  return (
    <>
      <div className="font-semibold text-color-label text-base text-center pt-2 select-none">Load Average</div>
      <ReactEcharts option={option} />
    </>
  );
};

export default LoadAverage;

function getSeries(ni) {
  return [
    {
      data: ni.load1,
      type: "line",
      name: "1 second",
      smooth: true,
      symbolSize: 0,
      lineStyle: {
        width: 2
      }
    },
    {
      data: ni.load5,
      type: "line",
      name: "5 seconds",
      smooth: true,
      symbolSize: 0,
      lineStyle: {
        width: 2
      }
    },
    {
      data: ni.load15,
      type: "line",
      name: "15 seconds",
      smooth: true,
      symbolSize: 0,
      lineStyle: {
        width: 2
      }
    }
  ];
}
