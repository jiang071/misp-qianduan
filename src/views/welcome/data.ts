import GroupLine from "@iconify-icons/ri/group-line";
import Question from "@iconify-icons/ri/question-answer-line";
import CheckLine from "@iconify-icons/ri/chat-check-line";
import Smile from "@iconify-icons/ri/star-smile-line";
import {
  orderStatusCount,
  salesAmountCount,
  overview
} from "@/api/pos/dataPanel";
import { ref, computed } from "vue";

const statusStyleMap = {
  0: {
    icon: GroupLine,
    bgColor: "#effaff",
    color: "#41b6ff",
    duration: 2200
  },
  1: {
    icon: Question,
    bgColor: "#fff5f4",
    color: "#e85f33",
    duration: 1600
  },
  2: {
    icon: CheckLine,
    bgColor: "#eff8f4",
    color: "#26ce83",
    duration: 1500
  },
  3: { icon: Smile, bgColor: "#f6f4fe", color: "#7846e5", duration: 100 },
  4: { icon: Smile, bgColor: "#f6f4fe", color: "#7846e5", duration: 100 }
};
const chartList = ref([]);
const chartData = ref([]);
const salesData = ref([]);
const barChartData = ref({ totalData: [], saleData: [] });
const xAxisData = ref([]);
const getchartData = async () => {
  try {
    const res = await orderStatusCount();
    chartList.value = res.data;
    chartData.value = chartList.value.map(item => {
      const style = statusStyleMap[item.orderStatus] || {
        icon: Smile,
        bgColor: "#f5f5f5",
        color: "#999",
        duration: 100
      };
      return {
        ...style,
        orderStatus: item.orderStatus,
        name: item.statusLabel,
        value: item.count
      };
    });
  } catch (error) {
    console.error("获取订单状态数据失败：", error);
    chartData.value = [];
  }
};
// 计算总订单数
const totalOrderCount = computed(() => {
  return chartData.value.reduce((sum, item) => sum + item.value, 0);
});

// 获取交易额
const getSalesAmount = async () => {
  try {
    const res = await salesAmountCount();
    salesData.value = res.data;
    const total = salesData.value.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );
    // 排序（降序）
    salesData.value.sort((a, b) => {
      const percentA = total === 0 ? 0 : (a.totalAmount / total) * 100;
      const percentB = total === 0 ? 0 : (b.totalAmount / total) * 100;
      return percentB - percentA; // 降序：B - A
    });
  } catch (error) {
    console.error("获取交易额数据失败：", error);
  }
};
// 计算交易额总额
const totalSalesAmount = computed(() => {
  return salesData.value.reduce((sum, item) => sum + item.totalAmount, 0);
});

// 获取分析概览数据
const getBarChartData = async () => {
  try {
    const res = await overview();
    xAxisData.value = res.data.map(item => item.date);
    const orderCountList = res.data.map(item => item.orderCount);
    const totalAmountList = res.data.map(item => item.totalAmount);
    barChartData.value = {
      totalData: orderCountList,
      saleData: totalAmountList
    };
  } catch (error) {
    console.error("获取分析概览数据失败：", error);
  }
};

export {
  chartData,
  barChartData,
  getchartData,
  totalOrderCount,
  salesData,
  getSalesAmount,
  totalSalesAmount,
  getBarChartData,
  xAxisData
};
