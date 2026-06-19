<!-- ChartRound.vue 完整修改后代码 -->
<script setup lang="ts">
import { ref, computed, watch } from "vue"; // 补充导入 watch
import { useDark, useECharts } from "@pureadmin/utils";

// 新增：定义 props 接收占比
const props = defineProps({
  percentage: {
    type: String
  }
});

const { isDark } = useDark();
const theme = computed(() => (isDark.value ? "dark" : "light"));

const chartRef = ref();
const { setOptions } = useECharts(chartRef, {
  theme,
  renderer: "svg"
});

// 封装图表配置逻辑
const setChartOptions = (percent: number) => {
  setOptions({
    container: ".line-card",
    title: {
      text: `${percent}%`, // 动态显示占比
      left: "47%",
      top: "30%",
      textAlign: "center",
      textStyle: {
        fontSize: "16",
        fontWeight: 600
      }
    },
    polar: {
      radius: ["100%", "90%"],
      center: ["50%", "50%"]
    },
    angleAxis: {
      max: 100,
      show: false
    },
    radiusAxis: {
      type: "category",
      show: true,
      axisLabel: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    series: [
      {
        type: "bar",
        roundCap: true,
        barWidth: 2,
        showBackground: true,
        backgroundStyle: {
          color: "#dfe7ef"
        },
        data: [percent], // 动态设置数据为占比
        coordinateSystem: "polar",
        color: "#7846e5",
        itemStyle: {
          shadowBlur: 2,
          shadowColor: "#7846e5",
          shadowOffsetX: 0,
          shadowOffsetY: 0
        }
      }
    ]
  });
};

// 初始化渲染
setChartOptions(Number(props.percentage));

// 监听占比变化，更新图表
watch(
  () => props.percentage,
  newVal => {
    setChartOptions(Number(newVal));
  },
  { immediate: true }
);
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 60px" />
</template>
