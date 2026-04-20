<template>
  <div class="app-container">
    <el-steps :active="step" finish-status="success" align-center>
      <el-step title="MakeNewSale" />
      <el-step title="EnterItem" />
      <el-step title="EndSale" />
      <el-step title="MakePayment" />
    </el-steps>
    <el-divider />
    <el-row :gutter="20">
      <el-col :span="5">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>商品录入</span>
            </div>
          </template>
          <el-form :model="enterItemForm" label-width="auto">
            <el-form-item label="商品编码">
              <el-input
                v-model="enterItemForm.itemSn"
                placeholder="请输入商品编号"
                @input="handleItemSnInput"
              />
            </el-form-item>
            <el-form-item label="订购数量">
              <el-input-number
                v-model="enterItemForm.quantity"
                :min="1"
                controls-position="right"
              />
              <div v-if="skuStock > -1" class="sku-stock-tip">
                当前库存：{{ skuStock }} 件
              </div>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="small"
                :disabled="step !== 1"
                @click="handleEnterItem"
                >ENTER ITEM</el-button
              >
              <el-button
                type="warning"
                size="small"
                :disabled="step !== 1"
                @click="handleEndSale"
                >END SALE</el-button
              >
            </el-form-item>
          </el-form>
        </el-card>
        <el-divider />
        <el-card>
          <template #header>
            <div class="card-header">
              <span>订单支付</span>
            </div>
          </template>
          <div
            class="payment-btn-group"
            style="display: flex; justify-content: center"
          >
            <el-form :model="makePaymentForm" label-width="auto">
              <el-form-item>
                <el-button
                  type="success"
                  size="small"
                  :disabled="step !== 3"
                  @click="handleMakePayment"
                  >MAKE PAYMENT</el-button
                >
              </el-form-item>
              <el-form-item>
                <el-button
                  type="danger"
                  size="small"
                  :disabled="step !== 3"
                  @click="handleMakePayment"
                  >Cancel PAYMENT</el-button
                >
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
      <el-col :span="19">
        <el-descriptions
          class="margin-top"
          title="订单信息"
          :column="3"
          :size="size"
          border
        >
          <template #extra>
            <el-button
              type="info"
              size="default"
              :disabled="step !== 0"
              style="margin-right: 10px"
              @click="handleGetPurchaser"
              >GET PURCHASER</el-button
            >
            <el-button
              type="success"
              :disabled="!(step === 0 || step === 4)"
              @click="handleMakeNewSale"
              >MAKE NEW SALE</el-button
            >
          </template>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <user-filled />
                </el-icon>
                会员
              </div>
            </template>
            {{ customerName }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <goods-filled />
                </el-icon>
                订单号
              </div>
            </template>
            {{ sale.saleNo }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <wallet-filled />
                </el-icon>
                总金额
              </div>
            </template>
            {{ sale.total }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <grid />
                </el-icon>
                总件数
              </div>
            </template>
            {{ sale.totalQuantity }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <info-filled />
                </el-icon>
                状态
              </div>
            </template>
            {{ sale.status }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-card>
          <template #header>
            <div class="card-header">
              <span>订单明细</span>
            </div>
          </template>
          <el-table
            :data="tableData"
            style="width: 100%"
            :row-class-name="tableRowClassName"
          >
            <el-table-column prop="index" label="序号" width="100" />
            <el-table-column prop="skuCode" label="商品编码" width="180" />
            <el-table-column prop="productName" label="商品名称" width="180" />
            <el-table-column prop="categoryName" label="商品分类" width="120" />
            <el-table-column prop="skuPrice" label="销售价格" width="120" />
            <el-table-column prop="quantity" label="订购数量" width="180">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  size="small"
                  :disabled="step !== 1"
                  :min="1"
                  @change="val => handleQuantityChange(val, scope.row)"
                />
              </template>
            </el-table-column>
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
                  icon="Delete"
                  size="small"
                  :disabled="step !== 1"
                  @click="handleDelete(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <template #footer
            >总件数: {{ totalQuantity }}件 ｜ 总金额:
            {{ totalAmount }} 元</template
          >
        </el-card>
      </el-col>
    </el-row>

    <el-drawer v-model="drawer" title="商品信息" :with-header="false">
      <el-descriptions title="商品信息" :column="2" border>
        <el-descriptions-item label="商品图片">
          <el-image
            :src="currentProductInfo.skuImage"
            style="width: 100px; height: 100px"
          />
        </el-descriptions-item>
        <el-descriptions-item label="编码">{{
          currentProductInfo.skuCode
        }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{
          currentProductInfo.productName
        }}</el-descriptions-item>
        <el-descriptions-item label="类别名称">{{
          currentProductInfo.categoryName
        }}</el-descriptions-item>
        <el-descriptions-item label="价格">{{
          currentProductInfo.skuPrice
        }}</el-descriptions-item>
        <el-descriptions-item label="类别ID">{{
          currentProductInfo.categoryId
        }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{
          currentProductInfo.productDesc
        }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import debounce from "lodash-es/debounce";
import type { ComponentSize } from "element-plus";
import { ElMessage } from "element-plus";
import {
  makeNewSale,
  makePayment,
  deleteSaleItem,
  getProductBySku,
  updateSale,
  updateSaleItem
} from "@/api/pos/sale";

import type { Sale } from "@/types/pos";
import type { Order, OrderItem } from "@/types/order";

// 控制业务步骤
const step = ref(0);
const skuStock = ref(-1);
const currentProductInfo = ref<any>({});

const totalQuantity = ref(0);
const totalAmount = ref(0.0);
const customerName = ref("123456");
const sale = ref<Sale>({
  saleNo: "",
  total: 0.0,
  totalQuantity: 0,
  status: ""
});
const drawer = ref<boolean>(false);
// 初始化数据, 清空盘面数据
function initData() {
  tableData.value = [];
  enterItemForm.value = {
    itemSn: "",
    quantity: 1
  };
  makePaymentForm.value = {
    payMethod: "",
    cashTendered: 0.0,
    changeDue: 0.0
  };
  totalAmount.value = 0.0;
  totalQuantity.value = 0;
  step.value = 0;
}

function initializeSale() {
  // 清空商品录入表单和状态
  enterItemForm.value.itemSn = "";
  enterItemForm.value.quantity = 1;
  skuStock.value = -1;
  currentProductInfo.value = null;
}
// ===================== 预留：获取购买者/会员信息接口 =====================
const handleGetPurchaser = () => {
  ElMessage.info("正在调用获取购买者信息接口...");

  // ========== 在这里写你的接口调用逻辑 ==========
  // getPurchaserInfo().then(res => {
  //   customerName.value = res.data.userName;
  //   ElMessage.success("获取会员信息成功");
  // })
};

// 开始新的销售
function handleMakeNewSale() {
  initData();
  initializeSale();
  makeNewSale({
    userId: 123456,
    orderStatus: 0,
    payStatus: 0
  }).then(response => {
    sale.value.saleNo = response.data.orderNo;
  });
  step.value = 1;
  sale.value.status = "待支付";
}

/*** =======第二步: 输入商品明细 ======= */
import type { Product, EnterItemForm, SaleItem } from "@/types/pos";
const enterItemForm = ref<EnterItemForm>({
  itemSn: "",
  quantity: 1
});
const tableData = ref<SaleItem[]>([]);

// 输入商品明细
function handleEnterItem() {
  if (!currentProductInfo.value) {
    ElMessage.warning("请先输入有效的商品编码并获取库存信息");
    return;
  }
  if (skuStock.value >= 0) {
    const inputQuantity = enterItemForm.value.quantity;
    if (inputQuantity > skuStock.value) {
      ElMessage.error(`订购数量不能超过库存！`);
      return;
    }
  }
  try {
    // 1. 查找表格中是否已存在该商品
    const existItem = tableData.value.find(
      item => item.skuCode === currentProductInfo.value.skuCode
    );

    // 2. 计算累加后的总数量
    const newQuantity = existItem
      ? existItem.quantity + enterItemForm.value.quantity
      : enterItemForm.value.quantity;

    const orderItem: OrderItem = {
      // 构造orderItems数组
      orderNo: sale.value.saleNo,
      productId: currentProductInfo.value.productId,
      productSn: currentProductInfo.value.productSn,
      skuId: currentProductInfo.value.skuId,
      skuCode: currentProductInfo.value.skuCode || enterItemForm.value.itemSn,
      specCombo: currentProductInfo.value.specCombo,
      productName: currentProductInfo.value.productName,
      categoryId: currentProductInfo.value.categoryId,
      categoryName: currentProductInfo.value.categoryName,
      orderPrice: currentProductInfo.value.skuPrice,
      orderQuantity: newQuantity
    };
    updateSaleItem([orderItem]);

    // 5. 更新本地表格数据（保持和接口一致）
    if (existItem) {
      existItem.quantity = newQuantity; // 累加已有商品数量
    } else {
      const newItem: SaleItem = {
        index: tableData.value.length + 1,
        skuCode: currentProductInfo.value.skuCode || enterItemForm.value.itemSn,
        productName: currentProductInfo.value.productName || "未知商品",
        categoryName: currentProductInfo.value.categoryName || "未知分类",
        skuPrice: currentProductInfo.value.skuPrice || 0,
        quantity: newQuantity, // 新增商品用本次数量
        skuId: currentProductInfo.value.skuId,
        skuStock: currentProductInfo.value.orderQuantity - newQuantity // 计算剩余库存
      };
      tableData.value.push(newItem);
    }

    initializeSale();
  } catch (error) {
    console.error("更新订单商品明细失败：", error);
  }
}

// 新增商品编码输入处理函数（带防抖）
const handleItemSnInput = debounce(async (val: string) => {
  // 当输入长度等于11位时调用接口
  if (val.trim().length === 11) {
    try {
      const response = await getProductBySku(val.trim());
      skuStock.value = response.data.skuStock || 0;
      currentProductInfo.value = response.data;
    } catch (error) {
      skuStock.value = 0;
      console.error("获取商品库存失败：", error);
    }
  } else {
    // 输入长度不足11位时重置库存状态
    skuStock.value = -1;
  }
}, 300);

// 处理表格中数量变更的逻辑
const handleQuantityChange = async (val: number, row: SaleItem) => {
  if (row.skuStock >= 0) {
    const inputQuantity = val;
    if (inputQuantity > skuStock.value) {
      ElMessage.error(`订购数量不能超过库存！`);
      return;
    }
  }
  try {
    const orderItem: OrderItem = {
      orderNo: sale.value.saleNo,
      skuId: row.skuId,
      orderQuantity: val
    };
    await updateSaleItem([orderItem]);
  } catch (error) {
    console.error("更新商品数量失败：", error);
    ElMessage.error("更新商品数量失败，请重试");
    // 接口失败时回滚数量显示
    row.quantity = row.quantity;
  }
};

/*** =======第三步: 结束录入, 计算总金额/总件数 ====== */

// 结束录入
function handleEndSale() {
  // 构造仅包含orderNo和payAmount的Order对象
  const updateParams: Order = {
    orderNo: sale.value.saleNo, // 订单号
    payAmount: totalAmount.value // 总金额
  };
  // 调用updateSale并处理Promise
  updateSale(updateParams)
    .then(() => {
      ElMessage.success("订单金额更新成功");
      step.value = 3;
    })
    .catch(error => {
      console.error("更新订单失败：", error);
      ElMessage.error("更新订单失败，请重试");
      // 即使接口失败，也可以选择是否切换步骤（根据业务需求调整）
      // step.value = 3;
    });
}

/*** =======第四步: 确认支付 ====== */
import type { MakePaymentForm } from "@/types/pos";
import { c } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
const makePaymentForm = ref<MakePaymentForm>({
  payMethod: "CASH",
  cashTendered: 0.0,
  changeDue: 0.0
});

// 发起支付
function handleMakePayment() {
  if (makePaymentForm.value.cashTendered < totalAmount.value) {
    ElMessage({ type: "warning", message: "输入的付款金额小于订单总金额" });
  } else {
    makePayment(makePaymentForm.value).then(response => {
      makePaymentForm.value.changeDue = response.data;
    });

    step.value = 4;
  }
}

watch(
  tableData,
  () => {
    let quantity = 0;
    let sumAmount = 0.0;
    tableData.value.forEach(item => {
      quantity += item.quantity;
      sumAmount += item.skuPrice * item.quantity;
    });
    totalQuantity.value = quantity;
    sale.value.totalQuantity = quantity;

    totalAmount.value = sumAmount;
    sale.value.total = sumAmount;
  },
  { deep: true }
);

/*** =======终极任务二: 维护订单商品明细 ====== */
// 查看订单商品明细
const handleView = (row: SaleItem) => {
  if (row.skuCode !== undefined) {
    getProductBySku(row.skuCode).then(response => {
      currentProductInfo.value = response.data;
      drawer.value = true;
    });
  }
};

// 删除订单商品明细
const handleDelete = (row: SaleItem) => {
  deleteSaleItem(sale.value.saleNo, row.skuId).then(() => {
    // 从表格数据中移除该行
    const index = tableData.value.findIndex(item => item.skuId === row.skuId);
    if (index !== -1) {
      tableData.value.splice(index, 1);
      ElMessage.success("删除成功");
    } else {
      ElMessage.error("删除失败，未找到对应商品");
    }
  });
};

// 表格样式
const size = ref<ComponentSize>("default");
const iconStyle = computed(() => {
  const marginMap: any = {
    large: "8px",
    default: "6px",
    small: "4px"
  };
  return {
    marginRight: marginMap[size.value] || marginMap.default
  };
});

const tableRowClassName = ({
  row,
  rowIndex
}: {
  row: SaleItem;
  rowIndex: number;
}) => {
  row.index = rowIndex + 1;
  if (rowIndex % 2 === 0) {
    return "warning-row";
  } else if (rowIndex % 2 === 1) {
    return "success-row";
  }
  return "";
};
</script>

<style scoped>
.el-descriptions {
  margin-top: 20px;
}

.cell-item {
  display: flex;
  align-items: center;
}

.margin-top {
  margin-top: 20px;
}

.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>
