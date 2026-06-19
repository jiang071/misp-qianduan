<template>
  <div class="app-container">
    <!-- ========== 顶部查询区域 ========== -->
    <el-form ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="优惠券编码" prop="couponCode">
        <el-input
          v-model="queryParams.couponCode"
          placeholder="请输入优惠券编码"
          clearable
          style="width: 220px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="优惠券状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          style="width: 180px"
        >
          <el-option label="未启用" :value="1" />
          <el-option label="正常发放" :value="0" />
          <el-option label="已过期" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- ========== 操作按钮区 ========== -->
    <el-row :gutter="10">
      <el-col :span="2">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          >新增</el-button
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

    <!-- ========== 数据表格 ========== -->
    <el-table
      v-loading="loading"
      :data="dataList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" width="60">
        <template #default="scope">
          {{
            (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1
          }}
        </template>
      </el-table-column>
      <el-table-column
        label="优惠券名称"
        align="center"
        prop="couponName"
        min-
        width="140"
      />
      <el-table-column
        label="优惠券编码"
        align="center"
        prop="couponCode"
        width="160"
      />
      <el-table-column label="优惠券类型" align="center" width="110">
        <template #default="scope">
          {{ getCouponTypeText(scope.row.couponType) }}
        </template>
      </el-table-column>
      <el-table-column label="优惠值" align="center" width="100">
        <template #default="scope">
          <template v-if="scope.row.couponType === 1">
            {{ scope.row.discount }}折
          </template>
          <template v-else>
            {{ scope.row.discount }}
          </template>
        </template>
      </el-table-column>
      <el-table-column
        label="最低消费"
        align="center"
        prop="minAmount"
        width="110"
      />
      <el-table-column label="剩余/总量" align="center" width="120">
        <template #default="scope">
          {{ scope.row.remainQuantity }} / {{ scope.row.quantity }}
        </template>
      </el-table-column>
      <el-table-column label="有效期" align="center" width="220">
        <template #default="scope">
          {{ scope.row.validStartTime }} ~ {{ scope.row.validEndTime }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="110">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="250">
        <template #default="scope">
          <el-button
            link
            type="info"
            icon="View"
            size="small"
            @click="handleUsageRecords(scope.row)"
          >
            查看使用记录
          </el-button>
          <el-button
            link
            type="primary"
            icon="Edit"
            size="small"
            @click="handleUpdate(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            icon="Delete"
            size="small"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- ========== 分页 ========== -->
    <el-pagination
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      style="margin-top: 20px; text-align: right"
      :page-sizes="[5, 10, 20, 30]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getList"
      @current-change="getList"
    />

    <!-- ========== 新增/编辑弹窗 ========== -->
    <el-dialog
      v-model="dialogOpen"
      :title="dialogTitle"
      width="650px"
      append-to-body
      @close="handleCloseDialog"
    >
      <coupon-form
        v-if="dialogOpen"
        :coupon-code="selectedCouponCode"
        @close="handleCloseDialog"
        @refresh="getList"
      />
    </el-dialog>

    <!-- ========== 使用记录弹窗 ========== -->
    <el-dialog
      v-model="usageDialogOpen"
      :title="'优惠券使用记录 - ' + currentRecordCouponCode"
      width="900px"
      append-to-body
      @close="handleCloseUsageDialog"
    >
      <!-- 弹窗内查询区 -->
      <el-form :model="usageQueryParams" :inline="true">
        <el-form-item label="用户ID">
          <el-input
            v-model="usageQueryParams.userId"
            placeholder="请输入用户ID"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input
            v-model="usageQueryParams.orderNo"
            placeholder="请输入订单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleUsageSearch"
            >搜索</el-button
          >
          <el-button icon="Refresh" @click="handleUsageReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 记录表格 -->
      <el-table v-loading="usageLoading" :data="usageRecords" border>
        <el-table-column label="序号" align="center" width="70">
          <template #default="scope">
            {{
              (usageQueryParams.pageNum - 1) * usageQueryParams.pageSize +
              scope.$index +
              1
            }}
          </template>
        </el-table-column>
        <el-table-column label="用户ID" align="center" prop="userId" />
        <el-table-column label="订单编号" align="center" prop="orderNo" />
        <el-table-column
          label="抵扣金额"
          align="center"
          prop="discountAmount"
        />
        <el-table-column label="核销时间" align="center" prop="useTime" />
      </el-table>

      <!-- 弹窗分页 -->
      <el-pagination
        v-model:current-page="usageQueryParams.pageNum"
        v-model:page-size="usageQueryParams.pageSize"
        style="margin-top: 12px; text-align: right"
        :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next"
        :total="usageTotal"
        @size-change="loadUsageRecords"
        @current-change="loadUsageRecords"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import type { FormInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  listCouponByPage,
  deleteCouponByCode,
  deleteCouponBatch,
  listCouponRecords
} from "@/api/pos/coupon";
import { request } from "@/utils/request";
import CouponForm from "./form.vue";
import type {
  CouponQueryParams,
  CouponInfo,
  CouponUserRecord
} from "@/types/pos";

// ==================== 工具函数（必须在模板引用之前定义） ====================
const getCouponTypeText = (type: number): string => {
  switch (type) {
    case 0:
      return "满减券";
    case 1:
      return "折扣券";
    case 2:
      return "现金券";
    default:
      return "未知";
  }
};

const getStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return "正常发放";
    case 1:
      return "未启用";
    case 2:
      return "已过期";
    default:
      return "未知";
  }
};

const getStatusTagType = (
  status: number
): "info" | "success" | "danger" | "warning" => {
  switch (status) {
    case 0:
      return "success";
    case 1:
      return "info";
    case 2:
      return "danger";
    case 3:
      return "warning";
    default:
      return "info";
  }
};

// ==================== 查询 ====================
const queryRef = ref<FormInstance>();
const queryParams = reactive<CouponQueryParams>({
  pageNum: 1,
  pageSize: 10,
  couponCode: undefined,
  status: undefined
});

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryRef.value?.resetFields();
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  queryParams.couponCode = undefined;
  queryParams.status = undefined;
  getList();
};

// ==================== 列表 ====================
const loading = ref(false);
const total = ref(0);
const dataList = ref<CouponInfo[]>([]);

function getList() {
  loading.value = true;
  listCouponByPage(queryParams)
    .then(res => {
      dataList.value = res.data.list || [];
      total.value = res.data.total || 0;
    })
    .catch(() => ElMessage.error("查询失败"))
    .finally(() => (loading.value = false));
}

// ==================== 选择 ====================
const selectedCodes = ref<string[]>([]);
const multiple = ref(false);

const handleSelectionChange = (selection: CouponInfo[]) => {
  selectedCodes.value = selection.map(item => item.couponCode);
  multiple.value = selection.length > 0;
};

// ==================== 新增/编辑 ====================
const dialogOpen = ref(false);
const dialogTitle = ref("");
const selectedCouponCode = ref("");

const handleAdd = () => {
  selectedCouponCode.value = "";
  dialogTitle.value = "新增优惠券";
  dialogOpen.value = true;
};

const handleUpdate = (row: CouponInfo) => {
  selectedCouponCode.value = row.couponCode;
  dialogTitle.value = "编辑优惠券 - " + row.couponCode;
  dialogOpen.value = true;
};

const handleCloseDialog = () => {
  dialogOpen.value = false;
  selectedCouponCode.value = "";
};

// ==================== 删除 ====================
const handleDelete = (row: CouponInfo) => {
  if (![1, 2].includes(row.status)) {
    ElMessageBox.alert("仅【未启用】或【已过期】的优惠券可以删除", "提示", {
      confirmButtonText: "确定",
      type: "warning"
    });
    return;
  }
  ElMessageBox.confirm("确认删除该优惠券？", "提示").then(() => {
    deleteCouponByCode(row.couponCode).then(() => {
      ElMessage.success("删除成功");
      getList();
    });
  });
};

const handleBatchDelete = () => {
  if (selectedCodes.value.length === 0) {
    ElMessage.warning("请至少选择一条记录");
    return;
  }
  const selectedItems = dataList.value.filter(item =>
    selectedCodes.value.includes(item.couponCode)
  );
  const hasInvalid = selectedItems.some(item => ![1, 2].includes(item.status));
  if (hasInvalid) {
    ElMessageBox.alert(
      "选中的优惠券包含不可删除的类型！仅【未启用】或【已过期】的优惠券可以删除！",
      "提示",
      {
        confirmButtonText: "确定",
        type: "warning"
      }
    );
    return;
  }
  ElMessageBox.confirm("确认批量删除选中优惠券？", "提示").then(() => {
    deleteCouponBatch(selectedCodes.value).then(() => {
      ElMessage.success("批量删除成功");
      getList();
    });
  });
};

// ==================== 使用记录 ====================
const usageDialogOpen = ref(false);
const usageLoading = ref(false);
const usageTotal = ref(0);
const usageRecords = ref<CouponUserRecord[]>([]);
const currentRecordCouponCode = ref("");

const usageQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  couponCode: "",
  userId: "",
  orderNo: ""
});

const handleUsageRecords = (row: CouponInfo) => {
  currentRecordCouponCode.value = row.couponCode;
  usageQueryParams.couponCode = row.couponCode;
  usageQueryParams.pageNum = 1;
  usageQueryParams.userId = "";
  usageQueryParams.orderNo = "";
  usageDialogOpen.value = true;
  loadUsageRecords();
};

const loadUsageRecords = () => {
  usageLoading.value = true;
  listCouponRecords(usageQueryParams)
    .then(res => {
      usageRecords.value = res.data.list || [];
      usageTotal.value = res.data.total || 0;
    })
    .catch(() => ElMessage.error("查询使用记录失败"))
    .finally(() => (usageLoading.value = false));
};

const handleUsageSearch = () => {
  usageQueryParams.pageNum = 1;
  loadUsageRecords();
};

const handleUsageReset = () => {
  usageQueryParams.pageNum = 1;
  usageQueryParams.userId = "";
  usageQueryParams.orderNo = "";
  loadUsageRecords();
};

const handleCloseUsageDialog = () => {
  usageDialogOpen.value = false;
  usageRecords.value = [];
};

// ==================== 初始化 ====================
onMounted(() => {
  getList();
});
</script>
