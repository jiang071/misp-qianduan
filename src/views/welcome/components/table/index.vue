<script setup lang="ts">
import { useColumns } from "./columns";
import { watch } from "vue";
const {
  loading,
  columns,
  dataList,
  pagination,
  Empty,
  onCurrentChange,
  getSalesRankingData,
  dateRange: innerDateRange
} = useColumns();
const props = defineProps({
  dateRange: {
    type: [Array, null] as unknown as () => [string, string] | [],
    default: () => []
  }
});
watch(
  () => props.dateRange,
  val => {
    innerDateRange.value = val;
  },
  { deep: true, immediate: true }
);

// 暴露方法给父组件调用
defineExpose({
  getSalesRankingData
});
</script>

<template>
  <pure-table
    row-key="id"
    alignWhole="center"
    showOverflowTooltip
    :loading="loading"
    :loading-config="{ background: 'transparent' }"
    :data="dataList"
    :columns="columns"
    :pagination="pagination"
    @page-current-change="onCurrentChange"
  >
    <template #empty>
      <el-empty description="暂无数据" :image-size="60">
        <template #image>
          <Empty />
        </template>
      </el-empty>
    </template>
  </pure-table>
</template>

<style lang="scss">
.pure-table-filter {
  .el-table-filter__list {
    min-width: 80px;
    padding: 0;

    li {
      line-height: 28px;
    }
  }
}
</style>

<style lang="scss" scoped>
:deep(.el-table) {
  --el-table-border: none;
  --el-table-border-color: transparent;

  .el-empty__description {
    margin: 0;
  }

  .el-scrollbar__bar {
    display: none;
  }
}
</style>
