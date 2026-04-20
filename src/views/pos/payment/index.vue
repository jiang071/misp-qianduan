<template>
  <div class="app-container">
    <!-- 数据查询区：表单 -->
    <el-form ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="订单编号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编号"
          clearable
          style="width: 220px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="支付用户" prop="username">
        <el-input
          v-model="queryParams.username"
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
          <el-option label="待支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已完成" :value="2" />
          <el-option label="已取消" :value="3" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据操作区：按钮 -->
    <el-row :gutter="10">
      <el-col :span="2">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="!single"
          @click="handleUpdate()"
          >修改</el-button
        >
      </el-col>
      <el-col :span="2">
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
      <el-table-column label="序号" align="center" width="100">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template></el-table-column
      >
      <el-table-column
        label="订单编号"
        align="center"
        prop="orderNo"
        width="220"
      />
      <el-table-column
        label="支付用户"
        align="center"
        prop="username"
        width="180"
      />
      <el-table-column
        label="支付金额"
        align="center"
        prop="payAmount"
        width="200"
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
        prop="createTime"
        width="200"
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
            type="danger"
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
      style="margin-top: 20px; text-align: right"
      :page-sizes="[5, 10, 20, 30]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getOrderList"
      @current-change="getOrderList"
    />

    <!-- 查看抽屉 -->
    <!-- 查看抽屉 -->
    <el-drawer
      v-model="drawer"
      title="订单详情"
      size="50%"
      @close="handleCloseDrawer"
    >
      <!-- 只有数据存在才渲染，避免报错 -->
      <div v-if="order">
        <!-- 订单信息 -->
        <el-descriptions :column="2" border label-width="120px" class="mb-4">
          <el-descriptions-item label="订单ID">{{
            order.id
          }}</el-descriptions-item>
          <el-descriptions-item label="订单编号">{{
            order.orderNo
          }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{
            order.userId
          }}</el-descriptions-item>
          <el-descriptions-item label="支付用户">{{
            order.username || "无"
          }}</el-descriptions-item>
          <el-descriptions-item label="支付金额">{{
            order.payAmount || 0
          }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">{{
            getStatusText(order.orderStatus)
          }}</el-descriptions-item>
          <el-descriptions-item label="支付状态">{{
            order.payStatus === 1 ? "已支付" : "未支付"
          }}</el-descriptions-item>
          <el-descriptions-item label="支付宝交易号">{{
            order.alipayTradeNo || "无"
          }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            order.createTime
          }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{
            order.payTime || "未支付"
          }}</el-descriptions-item>
        </el-descriptions>

        <!-- 商品明细表格 🔥 完全正常显示 -->
        <div class="mt-4">
          <h3 class="font-bold text-base mb-2">商品明细</h3>
          <el-table :data="orderItemList" border>
            <el-table-column label="商品编号" prop="productSn" align="center" />
            <el-table-column
              label="商品名称"
              prop="productName"
              align="center"
            />
            <el-table-column label="SKU编码" prop="skuCode" align="center" />
            <el-table-column label="规格组合" align="center">
              <template #default="scope">
                {{ formatSpecCombo(scope.row.specCombo) }}
              </template>
            </el-table-column>
            <el-table-column label="分类" prop="categoryName" align="center" />
            <el-table-column label="单价" prop="orderPrice" align="center" />
            <el-table-column label="数量" prop="orderQuantity" align="center" />
          </el-table>
        </div>
      </div>
    </el-drawer>

    <!-- 修改弹窗 -->
    <el-dialog v-model="dialogOpen" :title="title" width="700px" append-to-body>
      <order-form
        :order-id="selectedId"
        :order-no="selectedOrderNo"
        @close="handleCloseDialog"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import type { FormInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";

import {
  listOrderByPage,
  getOrderItemsByOrderNo,
  deleteOrderByOrderId,
  deleteOrderBatch,
  updateOrder,
  updateOrderItems
} from "@/api/pos/order";

// 子组件
import OrderForm from "./form.vue";
import type { OrderQueryParams, Order, OrderItem } from "@/types/pos";

onMounted(() => {
  getOrderList();
});

// ====================== 查询区域 ======================
const queryRef = ref<FormInstance>();
const queryParams = reactive<OrderQueryParams>({
  pageNum: 1,
  pageSize: 10,
  orderNo: undefined,
  username: undefined,
  orderStatus: undefined
});

// 查询
function handleQuery() {
  queryParams.pageNum = 1;
  getOrderList();
}

// 重置
function resetQuery() {
  queryRef.value?.resetFields();
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  queryParams.orderNo = undefined;
  queryParams.username = undefined;
  queryParams.orderStatus = undefined;
  getOrderList();
}

// ====================== 列表数据 ======================
const loading = ref(false);
const total = ref(0);
const dataList = ref<Order[]>([]);

// 获取订单列表
function getOrderList() {
  loading.value = true;
  listOrderByPage(queryParams)
    .then(res => {
      dataList.value = res.data.list || [];
      total.value = res.data.total || 0;
    })
    .catch(() => ElMessage.error("查询失败"))
    .finally(() => (loading.value = false));
}

// ====================== 选择 ======================
const selectedIds = ref<number[]>([]);
const single = ref(false);
const multiple = ref(false);

function handleSelectionChange(selection: Order[]) {
  selectedIds.value = selection
    .map(item => item.id)
    .filter(Boolean) as number[];
  single.value = selection.length === 1;
  multiple.value = selection.length > 0;
}

// ====================== 查看 ======================
const drawer = ref(false);
const order = ref<Order>({
  id: 0,
  orderNo: "",
  userId: "",
  username: null,
  payAmount: null,
  orderStatus: 0,
  createTime: "",
  alipayTradeNo: null,
  payUrl: null,
  payTime: null,
  payStatus: 0
});

const orderItemList = ref<OrderItem[]>([]);

async function handleView(row: Order) {
  try {
    // ==============================================
    // 🔥 核心修复：直接用当前表格的 row，不再调用任何订单接口
    // ==============================================
    order.value = row;

    // 只查询商品明细（你唯一能用的详情接口）
    const itemsRes = await getOrderItemsByOrderNo(row.orderNo);
    orderItemList.value = itemsRes.data || [];

    // 打开抽屉
    drawer.value = true;
  } catch (err) {
    ElMessage.error("加载订单信息失败");
    console.error(err);
  }
}

// 关闭抽屉 → 延迟清空数据，避免生命周期报错
const handleCloseDrawer = () => {
  drawer.value = false;
  setTimeout(() => {
    order.value = null;
    orderItemList.value = [];
  }, 500);
};

const formatSpecCombo = (spec: string | any[] | Record<string, any>) => {
  if (!spec) return "无";
  if (typeof spec === "string") return spec;
  if (Array.isArray(spec)) return spec.join(" | ");
  return Object.values(spec).join(" | ");
};

// ====================== 修改 ======================
const dialogOpen = ref(false);
const title = ref("");
const selectedId = ref<number | undefined>();
const selectedOrderNo = ref("");

function handleUpdate(row?: Order) {
  const current =
    row || dataList.value.find(item => item.id === selectedIds.value[0]);
  if (!current) return ElMessage.warning("请选择一条订单");

  selectedId.value = current.id;
  selectedOrderNo.value = current.orderNo;
  title.value = "修改订单：" + current.orderNo;
  dialogOpen.value = true;
}

function handleCloseDialog() {
  dialogOpen.value = false;
  getOrderList();
}

// ====================== 删除 ======================
function handleDelete(row: Order) {
  ElMessageBox.confirm("确认删除该订单？", "提示").then(() => {
    deleteOrderByOrderId(row.id).then(() => {
      ElMessage.success("删除成功");
      getOrderList();
    });
  });
}

// 批量删除
function handleBatchDelete() {
  ElMessageBox.confirm("确认删除选中订单？", "提示").then(() => {
    deleteOrderBatch(selectedIds.value).then(() => {
      ElMessage.success("批量删除成功");
      getOrderList();
    });
  });
}

// ====================== 状态工具 ======================
const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "待支付";
    case 1:
      return "已支付";
    case 2:
      return "已完成";
    case 3:
      return "已取消";
    default:
      return "未知";
  }
};

const getStatusTagType = (status: number) => {
  switch (status) {
    case 0:
      return "warning";
    case 1:
      return "success";
    case 2:
      return "primary";
    case 3:
      return "danger";
    default:
      return "info";
  }
};
</script>

<style scoped></style>
