<template>
  <div v-loading="loading" @close="handleClose">
    <!-- ==================== 订单基本信息 ==================== -->
    <el-form ref="formRef" :model="form" label-width="110px" width="700px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="订单编号">
            <el-input v-model="form.orderNo" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户ID">
            <el-input v-model="form.userId" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户名">
            <el-input v-model="form.username" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="支付金额">
            <el-input-number
              v-model="form.payAmount"
              disabled
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <!-- 只有订单状态可以修改 -->
        <el-col :span="12">
          <el-form-item label="订单状态" prop="orderStatus">
            <el-select v-model="form.orderStatus" style="width: 100%">
              <!-- 🔥 基于原始状态渲染，永远不会乱 -->
              <template v-if="originalOrderStatus === 0">
                <el-option label="待支付" :value="0" />
                <el-option label="已取消" :value="3" />
                <el-option label="已支付" :value="1" />
              </template>

              <template v-else-if="originalOrderStatus === 1">
                <el-option label="已支付" :value="1" />
                <el-option label="已完成" :value="2" />
                <el-option label="已退款" :value="4" />
              </template>

              <template v-else-if="originalOrderStatus === 2">
                <el-option label="已完成" :value="2" />
                <el-option label="已退款" :value="4" />
              </template>

              <template v-else>
                <el-option
                  :label="getStatusText(originalOrderStatus)"
                  :value="originalOrderStatus"
                />
              </template>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="创建时间">
            <el-input v-model="form.createTime" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="使用优惠券">
            <el-input v-model="coupon" disabled clearable />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-divider />

    <!-- ==================== 订单明细表 ==================== -->
    <div class="order-items-section">
      <h4 class="section-title">订单明细</h4>
      <el-table :data="orderItems" border stripe>
        <el-table-column label="序号" align="center" width="70">
          <template #default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          label="商品名称"
          prop="productName"
          align="center"
          min-width="140"
        />
        <el-table-column
          label="商品分类"
          prop="categoryName"
          align="center"
          width="120"
        >
          <template #default="scope">
            {{ scope.row.categoryName || "无" }}
          </template>
        </el-table-column>
        <el-table-column
          label="订购价格"
          prop="orderPrice"
          align="center"
          width="110"
        />
        <el-table-column
          label="订购数量"
          prop="orderQuantity"
          align="center"
          width="100"
        />
        <el-table-column label="商品状态" align="center" width="110">
          <template #default="scope">
            <el-tag :type="getItemStatusTagType(scope.row.orderItemStatus)">
              {{ getItemStatusText(scope.row.orderItemStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="300" fixed="right">
          <template #default="scope">
            <!-- 查看详情（永远显示） -->
            <el-button
              link
              type="primary"
              icon="View"
              size="small"
              @click="handleViewItemDetail(scope.row)"
            >
              查看详情
            </el-button>

            <!-- 换货：仅 订单状态 = 已完成(2) 时显示 -->
            <el-button
              v-if="originalOrderStatus === 2"
              link
              type="warning"
              icon="Edit"
              size="small"
              @click="handleExchangeItem(scope.row)"
            >
              换货
            </el-button>

            <!-- 删除：待支付(0) + 已退款(2)
            <el-button
              v-if="[0, 2].includes(scope.row.orderItemStatus)"
              link
              type="danger"
              icon="Delete"
              size="small"
              @click="handleDeleteItem(scope.$index, scope.row)"
            >
              删除
            </el-button> -->

            <!-- 退款：已支付(1) + 已换货(3) -->
            <el-button
              v-if="[1, 3].includes(scope.row.orderItemStatus)"
              link
              type="danger"
              icon="Delete"
              size="small"
              @click="handleRefundSingleItem(scope.row)"
            >
              退款
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ==================== 底部按钮 ==================== -->
    <div class="form-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submitForm">
        保存
      </el-button>
    </div>

    <!-- ==================== 商品详情弹窗 ==================== -->
    <el-dialog
      v-model="itemDetailVisible"
      title="商品详情"
      width="520px"
      append-to-body
    >
      <el-descriptions v-if="currentItem" :column="2" border>
        <el-descriptions-item label="商品名称">
          {{ currentItem.productName }}
        </el-descriptions-item>
        <el-descriptions-item label="商品编码">
          {{ currentItem.productSn }}
        </el-descriptions-item>
        <el-descriptions-item label="商品分类">
          {{ currentItem.categoryName || "无" }}
        </el-descriptions-item>
        <el-descriptions-item label="SKU编码">
          {{ currentItem.skuCode }}
        </el-descriptions-item>
        <el-descriptions-item label="规格组合">
          {{ formatSpecCombo(currentItem.specCombo) }}
        </el-descriptions-item>
        <el-descriptions-item label="订购价格">
          {{ currentItem.orderPrice }}
        </el-descriptions-item>
        <el-descriptions-item label="订购数量">
          {{ currentItem.orderQuantity }}
        </el-descriptions-item>
        <el-descriptions-item label="商品状态">
          <el-tag :type="getItemStatusTagType(currentItem.orderItemStatus)">
            {{ getItemStatusText(currentItem.orderItemStatus) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- ====================【新增：换货选择SKU弹窗 ↓ 改动1】==================== -->
    <el-dialog
      v-model="exchangeSkuVisible"
      title="选择换货SKU"
      width="720px"
      append-to-body
    >
      <el-table border stripe :data="exchangeSkuList" highlight-current-row>
        <!-- 单选选择列 -->
        <el-table-column label="选择" align="center" width="70">
          <template #default="scope">
            <!-- 🔥 移除 .native 即可 -->
            <el-radio
              v-model="selectExchangeSkuId"
              :label="scope.row.skuId"
              @click.stop
            />
          </template>
        </el-table-column>
        <el-table-column
          label="SKU编码"
          prop="skuCode"
          align="center"
          min-width="130"
        />
        <el-table-column
          label="商品名称"
          prop="productName"
          align="center"
          min-width="150"
        />
        <el-table-column label="规格组合" align="center" min-width="160">
          <template #default="scope">
            {{ formatSpecCombo(scope.row.specCombo) }}
          </template>
        </el-table-column>
        <el-table-column
          label="商品分类"
          prop="categoryName"
          align="center"
          width="120"
        />
      </el-table>
      <template #footer>
        <el-button @click="exchangeSkuVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="exchangeLoading"
          @click="submitExchange"
          >确认换货</el-button
        >
      </template>
    </el-dialog>
    <!-- ====================【新增：换货选择SKU弹窗 ↑】==================== -->
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import {
  updateOrder,
  deleteOrderItemById,
  changeOrderItem,
  getOrderByOrderNo,
  updateOrderItem,
  refundOrder,
  payOrder,
  refundOrderItem,
  selectSkuDetailToChange
} from "@/api/pos/order";
import type { Order, OrderItem } from "@/types/pos";
import { ca } from "element-plus/es/locale/index.mjs";

// ==================== Props / Emits ====================
const props = defineProps<{
  orderId?: number;
  orderNo?: string; // 只需要这个
}>();

const emit = defineEmits(["close", "refreshParent"]);

// ==================== 表单 ====================
const formRef = ref<FormInstance>();
const loading = ref(false);
const saving = ref(false);

const form = reactive<Order>({
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

const originalOrderStatus = ref(0);

// 优惠券（不在 Order 基础类型中，单独管理）
const coupon = ref("");

// ==================== 订单明细 ====================
const orderItems = ref<OrderItem[]>([]);

// ==================== 加载订单数据 ====================
watch(
  () => props.orderNo,
  async orderNo => {
    if (!orderNo) return;
    loading.value = true;
    try {
      const res = await getOrderByOrderNo(orderNo);
      const dataList = res.data;

      // 🔥 适配你的真实接口结构：data 是数组，取第一条
      if (Array.isArray(dataList) && dataList.length > 0) {
        const orderData = dataList[0]; // 订单主信息

        // 1. 赋值订单表单（所有信息）
        Object.assign(form, {
          id: orderData.id,
          orderNo: orderData.orderNo,
          userId: orderData.userId,
          username: orderData.username,
          payAmount: orderData.payAmount,
          orderStatus: orderData.orderStatus,
          createTime: orderData.createTime,
          payStatus: orderData.payStatus,
          alipayTradeNo: orderData.alipayTradeNo,
          payTime: orderData.payTime
        });
        originalOrderStatus.value = form.orderStatus;

        // 2. 🔥 赋值订单明细（关键字段：orderItems）
        if (Array.isArray(orderData.orderItems)) {
          orderItems.value = orderData.orderItems;
        }
      }
    } catch (err) {
      ElMessage.error("加载订单信息失败");
      console.error(err);
    } finally {
      loading.value = false;
    }
  },
  { immediate: true }
);

// ==================== 商品状态工具 ====================
const getItemStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: "待支付",
    1: "已支付",
    2: "已退款",
    3: "已换货"
  };
  return map[status] ?? "未知";
};

const getItemStatusTagType = (status: number) => {
  const map: Record<number, any> = {
    0: "warning",
    1: "success",
    2: "danger",
    3: "info"
  };
  return (map[status] ?? "info") as
    | "success"
    | "warning"
    | "info"
    | "primary"
    | "danger";
};

// ==================== 规格格式化 ====================
const formatSpecCombo = (spec: string | any[] | Record<string, any>) => {
  if (!spec) return "无";
  if (typeof spec === "string") return spec;
  if (Array.isArray(spec)) return spec.join(" | ");
  return Object.values(spec).join(" | ");
};

// ==================== 查看详情 ====================
const itemDetailVisible = ref(false);
const currentItem = ref<OrderItem | null>(null);

const handleViewItemDetail = (item: OrderItem) => {
  currentItem.value = item;
  itemDetailVisible.value = true;
};

// ==================== 删除商品 ====================
const handleDeleteItem = (index: number, item: OrderItem) => {
  ElMessageBox.confirm(`确认删除商品「${item.productName}」？`, "删除确认", {
    type: "warning"
  })
    .then(async () => {
      try {
        await deleteOrderItemById(Number(props.orderNo), item.skuId);
        // 前端同步删除，序号自动减一
        orderItems.value.splice(index, 1);
        ElMessage.success("删除成功");
      } catch {
        ElMessage.error("删除失败，请重试");
      }
    })
    .catch(() => {});
};

// 刷新订单数据和明细
const refreshOrderData = async () => {
  if (!props.orderNo) return;
  const res = await getOrderByOrderNo(props.orderNo);
  const dataList = res.data;

  if (Array.isArray(dataList) && dataList.length > 0) {
    const orderData = dataList[0];
    Object.assign(form, orderData);
    orderItems.value = orderData.orderItems || [];
  }
};

const submitForm = async () => {
  const oldStatus = originalOrderStatus.value;
  const newStatus = form.orderStatus;

  // 合法状态流转规则
  const allowMap: Record<number, number[]> = {
    0: [0, 1, 3],
    1: [1, 2, 4],
    2: [2, 4],
    3: [3],
    4: [4]
  };

  if (!allowMap[oldStatus].includes(newStatus)) {
    ElMessage.error("该状态不允许这样修改！");
    return;
  }

  let confirmText = "";
  const confirmTitle = "操作确认";
  let confirmType: any = "warning";

  if (oldStatus === 0 && newStatus === 3) {
    confirmText = "是否确认取消订单";
  } else if (oldStatus === 0 && newStatus === 1) {
    confirmText = "是否确认用户已完成支付";
    confirmType = "success";
  } else if (oldStatus === 1 && newStatus === 2) {
    confirmText = "您在将订单状态修改为“已完成”，是否确认该用户已经收到货物？";
  } else if (oldStatus === 1 && newStatus === 4) {
    confirmText = "是否确认更改订单状态为“已退款”";
  } else if (oldStatus === 2 && newStatus === 4) {
    confirmText = "您在将订单状态修改为“已退款”，是否确认该用户已经退还货物？";
  }

  try {
    await ElMessageBox.confirm(confirmText, confirmTitle, {
      type: confirmType
    });

    saving.value = true;

    // ======【1.待支付(0)→已支付(1)：明细状态=已支付1，组装后端需要的数组】======
    if (oldStatus === 0 && newStatus === 1) {
      // 前端商品状态改为已支付
      orderItems.value.forEach(item => {
        item.orderItemStatus = 1;
      });
      // ✅ 调用支付接口（你提供的）
      await payOrder(form.orderNo);
    }

    if (newStatus === 4) {
      await refundOrder(form.orderNo);
      orderItems.value.forEach(item => {
        item.orderItemStatus = 2;
      });
    }

    // 更新订单主表
    await updateOrder(form);

    ElMessage.success("保存成功");
    emit("close");
  } catch (error) {
    ElMessage.info("已取消操作");
  } finally {
    saving.value = false;
  }
};

// 订单主状态 文字显示
const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: "待支付",
    1: "已支付",
    2: "已完成",
    3: "已取消",
    4: "已退款"
  };
  return map[status] ?? "未知";
};

// 🔥 新增：关闭弹窗时还原订单状态，解决脏数据
const handleClose = () => {
  form.orderStatus = originalOrderStatus.value;
  emit("close");
};

// 单个商品退款 / 删除 二合一函数
const handleRefundSingleItem = async (item: OrderItem) => {
  // ====================== 核心判断 ======================
  // 当前是【已支付/已换货】→ 执行退款
  if ([1, 3].includes(item.orderItemStatus)) {
    ElMessageBox.confirm(
      `确认对商品【${item.productName}】退款？`,
      "退款确认",
      {
        type: "warning"
      }
    )
      .then(async () => {
        try {
          // 调用退款接口
          await refundOrderItem([item.id]);
          // 状态改为已退款
          item.orderItemStatus = 2;
          await refreshOrderData();
          ElMessage.success("退款成功");
        } catch (err) {
          ElMessage.error("退款失败");
          console.error(err);
        }
      })
      .catch(() => {});
  }
};

// ====================【改动2：新增换货弹窗相关变量】====================
// 换货弹窗显示
const exchangeSkuVisible = ref(false);
// 可选换货SKU列表
const exchangeSkuList = ref<any[]>([]);
// 选中的SKUID
const selectExchangeSkuId = ref<number | null>(null);
// 换货loading
const exchangeLoading = ref(false);

// 缓存当前要换货的原明细行
let tempExchangeItem: OrderItem | null = null;

// ==================== 换货【原方法重构：改动3】 ====================
const handleExchangeItem = (item: OrderItem) => {
  // 缓存当前需要换货的原商品明细
  tempExchangeItem = item;
  // 调用接口查询同商品可选换货SKU：productId + skuPrice
  selectSkuDetailToChange(item.productId!, item.orderPrice)
    .then(res => {
      exchangeSkuList.value = res.data || [];
      selectExchangeSkuId.value = null; // 清空上次选择
      exchangeSkuVisible.value = true; // 打开选择SKU弹窗
    })
    .catch(() => {
      ElMessage.error("加载可选换货商品失败");
    });
};

// ====================【改动4：新增确认换货提交函数】====================
const submitExchange = async () => {
  if (!selectExchangeSkuId.value || !tempExchangeItem || !props.orderId) {
    ElMessage.warning("请先选择需要更换的SKU商品");
    return;
  }
  exchangeLoading.value = true;
  try {
    // 找到选中的SKU完整数据
    const targetSku = exchangeSkuList.value.find(
      item => item.skuId === selectExchangeSkuId.value
    )!;
    // 组装后端需要的JSON参数：数量沿用原商品订购数量
    const replaceSkuInfo = {
      productName: targetSku.productName,
      categoryName: targetSku.categoryName,
      categoryId: targetSku.categoryId,
      skuId: targetSku.skuId,
      productId: targetSku.productId,
      productSn: targetSku.productSn,
      orderPrice: targetSku.skuPrice,
      skuCode: targetSku.skuCode,
      specCombo: targetSku.specCombo,
      orderQuantity: tempExchangeItem.orderQuantity // 换货数量和原来保持一致
    };
    // 传入第三个参数：新商品JSON数据
    await changeOrderItem(props.orderId, tempExchangeItem.id, replaceSkuInfo);
    exchangeSkuVisible.value = false;
    await refreshOrderData();
    ElMessage.success("换货成功");
    emit("close");
    emit("refreshParent");
  } catch {
    ElMessage.error("换货失败，请重试");
  } finally {
    exchangeLoading.value = false;
    tempExchangeItem = null;
  }
};
</script>

<style scoped>
.order-items-section {
  margin-bottom: 16px;
}

.section-title {
  padding-left: 8px;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  border-left: 3px solid #409eff;
}

.form-footer {
  margin-top: 20px;
  text-align: right;
}
</style>
