<script setup lang="ts">
import { useDark, useECharts } from "@pureadmin/utils";
import { type PropType, ref, computed, watch, nextTick } from "vue";

const props = defineProps({
  requireData: {
    type: Array as PropType<Array<number>>,
    default: () => []
  },
  questionData: {
    type: Array as PropType<Array<number>>,
    default: () => []
  },
  xAxisData: {
    // 新增x轴日期props
    type: Array as PropType<Array<string>>,
    default: () => ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
  }
});

const { isDark } = useDark();

const theme = computed(() => (isDark.value ? "dark" : "light"));

const chartRef = ref();
const { setOptions } = useECharts(chartRef, {
  theme
});

watch(
  () => props,
  async () => {
    await nextTick(); // 确保DOM更新完成后再执行
    setOptions({
      container: ".bar-card",
      color: ["#41b6ff", "#e85f33"],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "none"
        }
      },
      grid: {
        top: "30px",
        left: "50px",
        right: "50px"
      },
      legend: {
        data: ["订单成交数", "当日交易总额"],
        textStyle: {
          color: "#606266",
          fontSize: "0.875rem"
        },
        bottom: 0
      },
      xAxis: [
        {
          type: "category",
          data: props.xAxisData,
          axisLabel: {
            fontSize: "0.875rem"
          },
          axisPointer: {
            type: "shadow"
          }
        }
      ],
      yAxis: [
        {
          type: "value",
          name: "订单数 (个)",
          nameTextStyle: {
            fontSize: "0.875rem",
            color: "#41b6ff"
          },
          axisLabel: {
            fontSize: "0.875rem",
            color: "#41b6ff"
          },
          splitLine: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: "#41b6ff"
            }
          },
          min: 0,
          max: 10
        },
        // 第二个Y轴（右侧）：对应「当日交易总额」
        {
          type: "value",
          name: "交易额 (元)",
          nameTextStyle: {
            fontSize: "0.875rem",
            color: "#e86033ce"
          },
          axisLabel: {
            fontSize: "0.875rem",
            color: "#e86033ce"
          },
          splitLine: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: "#e86033ce"
            }
          },
          min: 0,
          max: 100,
          position: "right"
        }
      ],
      series: [
        {
          name: "订单成交数",
          type: "bar",
          barWidth: 10,
          itemStyle: {
            color: "#41b6ff",
            borderRadius: [10, 10, 0, 0]
          },
          data: props.requireData
        },
        {
          name: "当日交易总额",
          type: "bar",
          barWidth: 10,
          itemStyle: {
            color: "#e86033ce",
            borderRadius: [10, 10, 0, 0]
          },
          data: props.questionData
        }
      ]
    });
  },
  {
    deep: true,
    immediate: true
  }
);
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 365px" />
</template>
