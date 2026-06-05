import { ref, onMounted, reactive } from "vue";
import type { PaginationProps } from "@pureadmin/table";
import ThumbUp from "@iconify-icons/ri/thumb-up-line";
import Hearts from "@iconify-icons/ri/hearts-line";
import Empty from "./empty.svg?component";
import { salesRanking } from "@/api/pos/dataPanel";

export function useColumns() {
  const dataList = ref([]);
  const loading = ref(true);
  const dateRange = ref<[string, string] | []>([]);
  const columns: TableColumnList = [
    {
      label: "序号",
      prop: "id",
      cellRenderer: ({ $index }) => {
        return (pagination.currentPage - 1) * pagination.pageSize + $index + 1;
      }
    },
    {
      label: "商品名称",
      prop: "productName",
      cellRenderer: ({ row }) => row.productName || "-"
    },
    {
      label: "商品编号",
      prop: "productSn",
      cellRenderer: ({ row }) => row.productSn || "-"
    },
    {
      label: "商品类别",
      prop: "categoryName",
      cellRenderer: ({ row }) => row.categoryName || "-"
    },
    {
      sortable: true,
      label: "销售总量",
      prop: "totalQuantity",
      filterMultiple: false,
      filterClassName: "pure-table-filter",
      filters: [
        { text: "≥10", value: "more" },
        { text: "<10", value: "less" }
      ],
      filterMethod: (value, { totalQuantity }) => {
        return value === "more" ? totalQuantity >= 10 : totalQuantity < 10;
      }
    },
    {
      sortable: true,
      label: "销量总额",
      minWidth: 100,
      prop: "totalAmount",
      cellRenderer: ({ row }) => (
        <div class="flex justify-center w-full">
          <span class="flex items-center w-[60px]">
            <span class="ml-auto mr-2">{row.totalAmount}</span>
            <iconifyIconOffline
              icon={row.totalAmount > 1000 ? Hearts : ThumbUp}
              color="#e85f33"
            />
          </span>
        </div>
      )
    }
  ];

  /** 分页配置 */
  const pagination = reactive<PaginationProps>({
    pageSize: 10,
    currentPage: 1,
    layout: "prev, pager, next",
    total: 0,
    align: "center"
  });

  //获取销售排名数据
  const getSalesRankingData = async () => {
    loading.value = true;
    try {
      const params = {
        startDate: dateRange.value[0],
        endDate: dateRange.value[1],
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize
      };
      const res = await salesRanking(params);
      dataList.value = res.data.list || [];
      pagination.total = res.data.total || 0;
    } catch (error) {
      console.error("获取销售排名数据失败：", error);
      dataList.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  };

  function onCurrentChange(page: number) {
    pagination.currentPage = page;
    getSalesRankingData();
  }

  onMounted(() => {
    getSalesRankingData();
  });

  return {
    Empty,
    loading,
    columns,
    dataList,
    pagination,
    onCurrentChange,
    dateRange,
    getSalesRankingData
  };
}
