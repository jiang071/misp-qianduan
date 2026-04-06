<template>
  <div class="app-container">
    <!-- 数据查询区：表单 -->
    <el-form ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="订单编号" prop="orderSn">
        <el-input
          v-model="queryParams.orderSn"
          placeholder="请输入订单编号"
          clearable
          style="width: 220px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="支付用户" prop="payUserName">
        <el-input
          v-model="queryParams.payUserName"
          placeholder="请输入用户名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select
          v-model="queryParams.orderStatus"
          placeholder="请选择状态"
          clearable
          style="width: 180px"
        >
          <el-option label="待支付" value="PENDING" />
          <el-option label="已支付" value="PAID" />
          <el-option label="已完成" value="COMPLETED" />
          <el-option label="已取消" value="CANCELED" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery(queryRef)">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据操作区：按钮 -->
    <el-row :gutter="10">
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="!single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="!multiple"
          @click="handleBatchDelete"
          >批量删除</el-button
        >
      </el-col>
    </el-row>

    <el-divider />

    <!-- 数据展示区：表格 -->
    <el-table
      v-loading="loading"
      :data="dataList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        label="订单ID"
        align="center"
        width="100"
        prop="orderId"
      />
      <el-table-column
        label="订单编号"
        align="center"
        width="220"
        prop="orderSn"
      />
      <el-table-column
        label="支付用户"
        align="center"
        width="150"
        prop="payUserName"
      />
      <el-table-column
        label="支付金额"
        align="center"
        width="130"
        prop="payAmount"
      />
      <el-table-column
        label="订单状态"
        align="center"
        width="130"
        prop="orderStatus"
      >
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.orderStatus)">
            {{ getStatusText(scope.row.orderStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        width="200"
        prop="createTime"
      />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="View"
            size="small"
            @click="handleView(scope.row)"
            >查看</el-button
          >
          <el-button
            link
            type="primary"
            icon="Edit"
            size="small"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            link
            type="primary"
            icon="Delete"
            size="small"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      style="margin-top: 20px"
      :page-sizes="[5, 10, 20, 30]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 查看抽屉 -->
    <el-drawer
      v-model="drawer"
      title="订单信息"
      :with-header="false"
      size="50%"
    >
      <el-descriptions :title="orderTitle" :column="2" border>
        <el-descriptions-item label="订单编号">{{
          order.orderSn
        }}</el-descriptions-item>
        <el-descriptions-item label="支付用户">{{
          order.payUserName
        }}</el-descriptions-item>
        <el-descriptions-item label="支付金额">{{
          order.payAmount
        }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">{{
          getStatusText(order.orderStatus)
        }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{
          order.payTime || "未支付"
        }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          order.createTime
        }}</el-descriptions-item>
        <el-descriptions-item label="订单备注" label-align="left" :span="2">
          {{ order.remark || "无" }}
        </el-descriptions-item>
      </el-descriptions>
    </el-drawer>

    <!-- 新增/修改弹窗 -->
    <el-dialog v-model="dialogOpen" :title="title" width="800" append-to-body>
      <order-form :order-id="selectedId" @close="handleCloseDialog" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, toRef, onMounted } from "vue";
import type { FormInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";

// 接口（全部预留，直接替换即可）
import {
  deleteOrder,
  deleteOrderBatch,
  listOrderByPage,
  getOrderById
} from "@/api/pos/order";

// 子组件
import OrderForm from "./form.vue";

// 类型（自己在 types 里补充即可）
import type { OrderQueryParams, Order } from "@/types/pos";

onMounted(() => {
  getOrderList();
});

// ====================== 查询区域 ======================
const queryRef = ref<FormInstance>();
const query = reactive<OrderQueryParams>({
  pageNum: 1,
  pageSize: 10,
  orderSn: undefined,
  payUserName: undefined,
  orderStatus: undefined
});
const queryParams = toRef(query);

// 查询
function handleQuery() {
  queryParams.value.pageNum = 1;
  getOrderList();
  ElMessage.success("查询成功");
}

// 重置
const resetQuery = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  getOrderList();
};

// ====================== 列表数据 ======================
const loading = ref(false);
const total = ref(0);
const orderList = reactive<Order[]>([]);
const dataList = toRef(orderList);

// 获取订单列表
function getOrderList() {
  loading.value = true;
  const params = { ...queryParams.value };

  listOrderByPage(params)
    .then(res => {
      dataList.value = res.data.list || [];
      total.value = res.data.total || 0;
      if (dataList.value.length === 0) {
        ElMessage.info("未查询到订单数据");
      }
    })
    .catch(err => {
      console.error(err);
      ElMessage.error("查询失败");
    })
    .finally(() => {
      loading.value = false;
    });
}

// ====================== 选择 ======================
const ids = ref<number[]>([]);
const single = ref(false);
const multiple = ref(false);

function handleSelectionChange(selection: Order[]) {
  ids.value = selection
    .map(item => item.orderId)
    .filter(id => id != null) as number[];
  single.value = selection.length === 1;
  multiple.value = selection.length > 0;
}

// ====================== 分页 ======================
function handleSizeChange(val: number) {
  queryParams.value.pageSize = val;
  getOrderList();
}

function handleCurrentChange(val: number) {
  queryParams.value.pageNum = val;
  getOrderList();
}

// ====================== 查看 ======================
const drawer = ref(false);
const orderTitle = ref("");
const order = reactive<Order>({
  orderId: undefined,
  orderSn: "",
  payUserName: "",
  payAmount: 0,
  orderStatus: "",
  payTime: "",
  createTime: "",
  remark: ""
});

function handleView(row: Order) {
  if (row.orderId) {
    getOrderById(row.orderId).then(res => {
      Object.assign(order, res.data);
      orderTitle.value = `订单详情【${row.orderSn}】`;
    });
    drawer.value = true;
  }
}

// ====================== 新增/修改 ======================
const dialogOpen = ref(false);
const title = ref("");
const selectedId = ref<number | undefined>();

function handleAdd() {
  title.value = "新增订单";
  selectedId.value = undefined;
  dialogOpen.value = true;
}

function handleUpdate(row?: any) {
  const id = row?.orderId || ids.value[0];
  selectedId.value = id;
  title.value = `修改订单【${id}】`;
  dialogOpen.value = true;
}

function handleCloseDialog() {
  dialogOpen.value = false;
  getOrderList();
}

// ====================== 删除 ======================
function handleDelete(row: any) {
  ElMessageBox.confirm(`确认删除订单 ${row.orderSn}？`, "提示")
    .then(() => deleteOrder(row.orderId!))
    .then(() => {
      getOrderList();
      ElMessage.success("删除成功");
    });
}

// 批量删除
async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${ids.value.length} 条订单？`);
    await deleteOrderBatch(ids.value);
    getOrderList();
    ElMessage.success("批量删除成功");
  } catch {
    ElMessage.info("已取消");
  }
}

// ====================== 工具 ======================
const getStatusText = (status?: string) => {
  switch (status) {
    case "PENDING":
      return "待支付";
    case "PAID":
      return "已支付";
    case "COMPLETED":
      return "已完成";
    case "CANCELED":
      return "已取消";
    default:
      return "未知";
  }
};

const getStatusTagType = (status?: string) => {
  switch (status) {
    case "PENDING":
      return "warning";
    case "PAID":
      return "success";
    case "COMPLETED":
      return "primary";
    case "CANCELED":
      return "danger";
    default:
      return "info"; // 这里改成 info，不返回空字符串
  }
};
</script>
