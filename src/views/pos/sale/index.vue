<template>
  <div>
    <div class="app-container">
      <el-steps :active="step" finish-status="success" align-center>
        <el-step title="MakeNewSale" />
        <el-step title="EnterItem" />
        <el-step title="EndSale" />
        <el-step title="MakePayment" />
      </el-steps>
      <el-divider />
      <el-row :gutter="20" style="display: flex; height: 100%">
        <el-col
          :span="6"
          style="display: flex; flex-direction: column; height: 100%"
        >
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

            <el-form>
              <el-form-item label="可用优惠券">
                <el-select
                  v-model="selectedCouponCode"
                  placeholder="选择可用优惠券"
                  :disabled="step !== 3"
                  style="width: 100%"
                  @change="handleSelectCoupon"
                >
                  <el-option
                    v-for="item in availableCouponList"
                    :key="item.couponCode"
                    :label="`${item.couponName}(${item.couponCode}) - ${item.couponType === 1 ? item.discount + '折' : '抵扣' + item.discount + '元'}`"
                    :value="item.couponCode"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="粘贴券码">
                <div style="display: flex; gap: 8px; align-items: center">
                  <el-input
                    v-model="inputCouponCode"
                    placeholder="粘贴优惠券编码"
                    :disabled="step !== 3"
                    style="flex: 1"
                  />
                  <el-button
                    type="primary"
                    :disabled="step !== 3"
                    @click="handleSearchCodeCoupon"
                    >确定</el-button
                  >
                  <el-button
                    type="info"
                    plain
                    size="small"
                    :disabled="!selectedCouponCode && !inputCouponCode"
                    @click="handleClearCoupon"
                    >清除</el-button
                  >
                </div>
              </el-form-item>

              <el-form-item label="明细">
                <div style="display: flex; gap: 30px; align-items: center">
                  <span>原始金额：{{ orderTotalOrigin }} 元</span>
                  <span style="color: red"
                    >优惠券抵扣：{{ couponDiscountVal }} 元</span
                  >
                </div>
              </el-form-item>

              <!-- 优惠后应付金额单独一行 -->
              <el-form-item label="优惠后应付金额">
                <span
                  style="font-size: 16px; font-weight: bold; color: #00b42a"
                >
                  {{ finalPayAmount }} 元
                </span>
              </el-form-item>
            </el-form>
            <!-- === 新增优惠券区域 结束 === -->

            <div
              class="payment-btn-group"
              style="display: flex; justify-content: center"
            >
              <el-form label-width="auto">
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
                    @click="handleCancelPayment"
                    >Cancel PAYMENT</el-button
                  >
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </el-col>
        <el-col
          :span="18"
          style="display: flex; flex-direction: column; height: 100%"
        >
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
            <div style="flex: 1; min-height: 320px; overflow: auto">
              <el-table
                :data="tableData"
                style="width: 100%; height: 100%"
                :row-class-name="tableRowClassName"
              >
                <el-table-column prop="index" label="序号" width="100" />
                <el-table-column prop="skuCode" label="商品编码" width="180" />
                <el-table-column
                  prop="productName"
                  label="商品名称"
                  width="180"
                />
                <el-table-column
                  prop="categoryName"
                  label="商品分类"
                  width="120"
                />
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
            </div>
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

    <el-dialog v-model="couponDetailDialog" title="优惠券详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="券编码">{{
          couponDetailInfo.couponCode
        }}</el-descriptions-item>
        <el-descriptions-item label="可抵扣金额">
          <template v-if="couponDetailInfo.couponType === 1">
            {{ couponDetailInfo.discount }}折
          </template>
          <template v-else> {{ couponDetailInfo.discount }}元 </template>
        </el-descriptions-item>
        <el-descriptions-item label="使用门槛"
          >{{ couponDetailInfo.minAmount }}元可用</el-descriptions-item
        >
        <el-descriptions-item label="有效期"
          >{{ couponDetailInfo.validStartTime }} ~
          {{ couponDetailInfo.validEndTime }}</el-descriptions-item
        >
        <el-descriptions-item label="状态">{{
          getCouponStatusText(couponDetailInfo.status)
        }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="couponDetailDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmUseCodeCoupon"
          >确认使用此券</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import debounce from "lodash-es/debounce";
import type { ComponentSize } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  makeNewSale,
  deleteSaleItem,
  getProductBySku,
  updateSale,
  updateSaleItem,
  paySale,
  cancelSale
} from "@/api/pos/sale";
import {
  getAvailableCoupon,
  getCouponDetailByCode,
  validateCoupon
} from "@/api/pos/coupon";
import type { Sale } from "@/types/pos";
import type {
  Order,
  OrderItem,
  ValidateCouponRequest,
  ValidateCouponResponse,
  AvailableCouponItem
} from "@/types/order";

// 控制业务步骤
const step = ref(0);
const skuStock = ref(-1);
const currentProductInfo = ref<any>({});

const totalQuantity = ref(0);
const totalAmount = ref(0.0);
const customerName = ref("123456");

// ===================== 优惠券新增变量 =====================
// 下拉选中的券码
const selectedCouponCode = ref<string>("");
// 手动输入框券码
const inputCouponCode = ref<string>("");
// 可用优惠券下拉列表
const availableCouponList = ref<AvailableCouponItem[]>([]);
// 券码详情弹窗开关
const couponDetailDialog = ref(false);
// 弹窗里优惠券详情信息
const couponDetailInfo = ref<any>({});
// 当前抵扣金额
const couponDiscountVal = ref<number>(0);
//原始订单总额
const orderTotalOrigin = computed(() => totalAmount.value);

// 最终实付金额（原始-抵扣）
const finalPayAmount = computed(() => {
  const origin = orderTotalOrigin.value;
  const discount = couponDiscountVal.value || 0;
  return Number((origin - discount).toFixed(2));
});

const sale = ref<Sale>({
  saleNo: "",
  total: 0.0,
  totalQuantity: 0,
  status: "",
  couponCode: null,
  couponDiscount: null,
  orderTotal: 0
});
const drawer = ref<boolean>(false);
// 初始化数据, 清空盘面数据
function initData() {
  tableData.value = [];
  enterItemForm.value = {
    itemSn: "",
    quantity: 1
  };
  totalAmount.value = 0.0;
  totalQuantity.value = 0;
  step.value = 0;

  // 新增：重置优惠券所有状态
  selectedCouponCode.value = "";
  inputCouponCode.value = "";
  couponDiscountVal.value = 0;
  availableCouponList.value = [];
  sale.value.couponCode = null;
  sale.value.couponDiscount = null;
  sale.value.orderTotal = 0;
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
import { status } from "nprogress";
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
  const updateParams: Order = {
    orderNo: sale.value.saleNo,
    payAmount: totalAmount.value,
    // 同步填充新增三个字段默认值
    orderTotal: totalAmount.value,
    couponCode: null,
    couponDiscount: null
  };
  updateSale(updateParams)
    .then(() => {
      ElMessage.success("订单金额更新成功");
      step.value = 3;
      // 结束录入进入支付步骤时，加载当前订单可用优惠券
      loadAvailableCoupon();
    })
    .catch(error => {
      console.error("更新订单失败：", error);
      ElMessage.error("更新订单失败，请重试");
    });
}

/*** =======第四步: 确认支付 ====== */
// 发起支付
function handleMakePayment() {
  // 修改判断为最终应付金额
  if (finalPayAmount.value <= 0) {
    ElMessage.error("订单应付金额异常，无法发起支付");
    return;
  }
  paySale(sale.value.saleNo)
    .then(response => {
      handleAlipayForm(response.data.payForm);
      ElMessage.info("正在跳转到支付页面...");
    })
    .catch(error => {
      console.error("支付请求失败：", error);
      ElMessage.error("支付请求失败，请重试");
    });
}

// 处理支付宝支付表单
function handleAlipayForm(payForm: string) {
  // 创建临时容器存放支付表单
  const tempDiv = document.createElement("div");
  tempDiv.id = "alipay-pay-form";
  // 将接口返回的表单字符串插入到临时容器
  tempDiv.innerHTML = payForm;
  // 追加到body中（表单提交需要DOM存在）
  document.body.appendChild(tempDiv);

  // 自动触发表单提交（接口返回的script已包含自动提交，兜底再触发一次）
  const form = document.forms["punchout_form"];
  if (form) {
    form.submit();
  }

  // 提交后移除临时DOM（可选，防止冗余）
  setTimeout(() => {
    document.body.removeChild(tempDiv);
  }, 1000);
}

//取消订单
const handleCancelPayment = () => {
  cancelSale(sale.value.saleNo)
    .then(() => {
      ElMessage.success("订单已取消");
      sale.value = {
        saleNo: "",
        total: 0.0,
        totalQuantity: 0,
        status: "",
        couponCode: null,
        couponDiscount: null,
        orderTotal: 0
      };
      initData();
      initializeSale();
    })
    .catch(error => {
      console.error("取消订单失败：", error);
    });
};

/**
 * 步骤1：拉取当前订单可用优惠券列表（下拉框数据源）
 */
async function loadAvailableCoupon() {
  try {
    // 第一个参数订单金额，第二个用户ID
    const res = await getAvailableCoupon(totalAmount.value, 123456);
    availableCouponList.value = res.data || [];
  } catch (err) {
    console.error("加载可用优惠券失败", err);
    availableCouponList.value = [];
  }
}

/**
 * 下拉选择优惠券触发校验
 */
async function handleSelectCoupon(couponCode: string) {
  if (!couponCode) {
    handleClearCoupon();
    return;
  }
  try {
    const res = await validateCoupon({
      couponCode,
      userId: 123456,
      orderTotal: totalAmount.value
    });
    const validateRes: ValidateCouponResponse = res.data;
    if (!validateRes.valid) {
      ElMessage.warning(validateRes.message || "该优惠券无法使用");
      selectedCouponCode.value = "";
      couponDiscountVal.value = 0;
      return;
    }
    // 赋值抵扣金额
    couponDiscountVal.value = validateRes.discountAmount;
    inputCouponCode.value = ""; // 清空手动输入框，互斥
    // 同步更新Order实体的优惠券字段
    sale.value.couponCode = couponCode;
    sale.value.couponDiscount = validateRes.discountAmount;
    sale.value.orderTotal = totalAmount.value;
    // 同步更新订单后端数据
    await updateSale({
      orderNo: sale.value.saleNo,
      payAmount: finalPayAmount.value,
      couponCode: couponCode,
      couponDiscount: validateRes.discountAmount,
      orderTotal: totalAmount.value
    });
    ElMessage.success(`优惠券抵扣${validateRes.discountAmount}元`);
  } catch (err) {
    console.error("选择优惠券校验失败", err);
    ElMessage.error("优惠券校验请求异常");
    handleClearCoupon();
  }
}

/**
 * 手动输入券码 点击确定查询详情
 */
async function handleSearchCodeCoupon() {
  const code = inputCouponCode.value.trim();
  if (!code) {
    ElMessage.warning("请输入优惠券编码");
    return;
  }
  try {
    const res = await getCouponDetailByCode(code);

    if (res.code === 600) {
      ElMessageBox.alert("您所输入的优惠券不存在", "提示", {
        confirmButtonText: "确定",
        type: "warning"
      });
      return;
    }

    couponDetailInfo.value = res.data;
    couponDetailDialog.value = true;
  } catch (err) {
    // 网络异常等真正的 HTTP 错误
    ElMessage.error("查询优惠券详情失败，请稍后重试");
    console.error("查询券详情失败", err);
  }
}

/**
 * 弹窗点击【确认使用此券】
 */
async function handleConfirmUseCodeCoupon() {
  const code = couponDetailInfo.value.couponCode;
  if (!code) return;
  couponDetailDialog.value = false;
  // 和下拉逻辑一致，走校验接口
  await handleSelectCoupon(code);
  selectedCouponCode.value = code;
}

/**
 * 清空所有已选优惠券
 */
async function handleClearCoupon() {
  selectedCouponCode.value = "";
  inputCouponCode.value = "";
  couponDiscountVal.value = 0;
  // 清空订单实体优惠券字段
  sale.value.couponCode = null;
  sale.value.couponDiscount = null;
  sale.value.orderTotal = totalAmount.value;
  // 同步后端清空优惠券
  try {
    await updateSale({
      orderNo: sale.value.saleNo,
      payAmount: totalAmount.value,
      couponCode: null,
      couponDiscount: null,
      orderTotal: totalAmount.value
    });
    ElMessage.info("已清除优惠券");
  } catch (err) {
    console.error("清空优惠券更新订单失败", err);
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

// 优惠券状态数字转文字
const getCouponStatusText = (statusNum: number | undefined) => {
  switch (statusNum) {
    case 0:
      return "启用";
    case 1:
      return "停用";
    case 2:
      return "已过期";
    default:
      return "未知状态";
  }
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
