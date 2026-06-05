<script setup lang="ts">
import { ref, onMounted } from "vue";
import ReCol from "@/components/ReCol";
import { useDark } from "./utils";
import WelcomeTable from "./components/table/index.vue";
import { ReNormalCountTo } from "@/components/ReCountTo";
import { ChartBar, ChartRound } from "./components/charts";
import {
  chartData,
  barChartData,
  getchartData,
  totalOrderCount,
  salesData,
  getSalesAmount,
  totalSalesAmount,
  getBarChartData,
  xAxisData
} from "./data";
import { useRouter } from "vue-router";
import { exportSalesRanking } from "@/api/pos/dataPanel";
defineOptions({
  name: "Welcome"
});

const { isDark } = useDark();
const router = useRouter();
const dateRange = ref<[string, string] | []>([]);
onMounted(async () => {
  await getchartData();
  await getSalesAmount();
  await getBarChartData();
});
const handleCardClick = (orderStatus: number) => {
  router.push({
    name: "payment",
    query: {
      orderStatus: orderStatus
    }
  });
};
const tableRef = ref(null);

const handleSearch = () => {
  tableRef.value?.getSalesRankingData();
};
const exportData = async () => {
  try {
    const params = {
      startDate: dateRange.value[0],
      endDate: dateRange.value[1]
    };
    const res = await exportSalesRanking(params);
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `数据报表_${new Date().getTime()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("导出失败", err);
  }
};
</script>

<template>
  <div>
    <div class="chart-card-container">
      <div
        v-for="(item, index) in chartData"
        :key="index"
        v-motion
        class="chart-card-item"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 80 * (index + 1)
          }
        }"
        @click="handleCardClick(item.orderStatus)"
      >
        <el-card class="line-card" shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">
              {{ item.name }}
            </span>
            <div
              class="w-8 h-8 flex justify-center items-center rounded-md"
              :style="{
                backgroundColor: isDark ? 'transparent' : item.bgColor
              }"
            >
              <IconifyIconOffline
                :icon="item.icon"
                :color="item.color"
                width="18"
              />
            </div>
          </div>
          <div class="flex justify-between items-start mt-3">
            <div class="w-1/2">
              <ReNormalCountTo
                :duration="item.duration"
                :fontSize="'1.6em'"
                :startVal="100"
                :endVal="item.value"
              />
            </div>
            <ChartRound
              class="!w-1/2"
              :percentage="((item.value / totalOrderCount) * 100).toFixed(1)"
            />
          </div>
        </el-card>
      </div>
    </div>
    <el-row :gutter="10" justify="space-around">
      <re-col
        v-motion
        class="mb-[18px]"
        :value="18"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 400
          }
        }"
      >
        <el-card class="bar-card" shadow="never" style="padding-bottom: 10px">
          <div class="flex justify-between">
            <span class="text-md font-medium">分析概览</span>
          </div>
          <div class="flex justify-between items-start mt-3">
            <ChartBar
              :requireData="barChartData.totalData"
              :questionData="barChartData.saleData"
              :xAxisData="xAxisData"
            />
          </div>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[18px]"
        :value="6"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 480
          }
        }"
      >
        <el-card shadow="never">
          <div class="flex justify-between">
            <span class="text-md font-medium">近七日交易额统计</span>
          </div>
          <div
            v-for="(item, index) in salesData"
            :key="index"
            :class="[
              'flex',
              'justify-between',
              'items-start',
              index === 0 ? 'mt-8' : 'mt-[2.15rem]'
            ]"
          >
            <el-progress
              :text-inside="true"
              :percentage="
                totalSalesAmount === 0
                  ? 0
                  : parseFloat(
                      ((item.totalAmount / totalSalesAmount) * 100).toFixed(1)
                    )
              "
              :stroke-width="21"
              color="#26ce83"
              striped
              striped-flow
              :duration="100"
            />
            <span class="text-nowrap ml-2 text-text_color_regular text-sm">
              {{ item.date }}
            </span>
          </div>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[18px]"
        :value="24"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 560
          }
        }"
      >
        <el-card shadow="never" class="h-[580px]">
          <div class="flex justify-between">
            <span class="text-md font-medium">数据统计</span>
            <div class="flex items-center gap-5">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :size="'small'"
                value-format="YYYY-MM-DD"
              />
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button type="success" @click="exportData">导出</el-button>
            </div>
          </div>
          <WelcomeTable ref="tableRef" class="mt-3" :date-range="dateRange" />
        </el-card>
      </re-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  --el-card-border-color: none;

  /* 解决概率进度条宽度 */
  .el-progress--line {
    width: 85%;
  }

  /* 解决概率进度条字体大小 */
  .el-progress-bar__innerText {
    font-size: 15px;
  }

  /* 隐藏 el-scrollbar 滚动条 */
  .el-scrollbar__bar {
    display: none;
  }

  /* el-timeline 每一项上下、左右边距 */
  .el-timeline-item {
    margin: 0 6px;
  }
}

.main-content {
  margin: 20px 20px 0 !important;
}
.chart-card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-bottom: 18px;
}

.chart-card-item {
  flex: 1 1 calc(20% - 24px);
  min-width: 180px;
  box-sizing: border-box;
}
</style>
