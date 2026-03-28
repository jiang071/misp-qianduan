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
            <el-form-item label="商品分类">
              <el-tree-select
                ref="categoryTreeRef"
                v-model="queryParams.productCategoryId"
                style="width: 200px"
                :data="categoryTreeOptions"
                :props="{
                  label: 'categoryName',
                  value: 'categoryId',
                  children: 'children'
                }"
                placeholder="请选择产品类别"
                :render-after-expand="false"
                @change="handleCategoryChange"
              />
            </el-form-item>
            <el-form-item label="商品编码">
              <el-select
                v-model="enterItemForm.itemSn"
                placeholder="请选择商品"
              >
                <el-option
                  v-for="item in productOptions"
                  :key="item.productSn"
                  :label="item.productName"
                  :value="item.productSn"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="订购数量">
              <el-input-number
                v-model="enterItemForm.quantity"
                :min="1"
                :max="10"
                controls-position="right"
                @change="handleChange"
              />
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

          <el-form :model="makePaymentForm" label-width="auto">
            <el-form-item label="付款金额">
              <el-input v-model="makePaymentForm.cashTendered" />
            </el-form-item>
            <el-form-item label="找零">
              <el-input v-model="makePaymentForm.changeDue" />
            </el-form-item>

            <el-form-item>
              <el-button
                type="danger"
                size="small"
                :disabled="step !== 3"
                @click="handleMakePayment"
                >MAKE PAYMENT</el-button
              >
            </el-form-item>
          </el-form>
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
            <el-table-column prop="itemSn" label="商品选择" width="180" />
            <el-table-column prop="productName" label="商品名称" width="180" />
            <el-table-column prop="category" label="商品分类" width="180" />
            <el-table-column prop="price" label="销售价格" width="180" />
            <el-table-column prop="quantity" label="订购数量" width="200">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  size="small"
                  :disabled="step !== 1"
                  :min="1"
                  :max="10"
                  @change="handleChangeQuantity(scope.row)"
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
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import type { ComponentSize } from "element-plus";
import { ElMessage } from "element-plus";
import {
  makeNewSale,
  enterItem,
  endSale,
  makePayment,
  changeQuantity,
  deleteSaleItem
} from "@/api/pos/sale";

// 控制业务步骤
const step = ref(0);
const queryParams = ref({
  productCategoryId: undefined as number | undefined
});

// 商品分类树（三级）模拟数据，后续需要接新接口
const categoryTreeOptions = ref([
  {
    categoryId: 1,
    categoryName: "食品饮料",
    children: [
      {
        categoryId: 11,
        categoryName: "休闲零食",
        children: [
          { categoryId: 111, categoryName: "膨化食品" },
          { categoryId: 112, categoryName: "糖果巧克力" }
        ]
      },
      {
        categoryId: 12,
        categoryName: "酒水饮料",
        children: [
          { categoryId: 121, categoryName: "碳酸饮料" },
          { categoryId: 122, categoryName: "茶饮咖啡" }
        ]
      }
    ]
  },
  {
    categoryId: 2,
    categoryName: "日用百货",
    children: [
      {
        categoryId: 21,
        categoryName: "洗护用品",
        children: [
          { categoryId: 211, categoryName: "洗发水" },
          { categoryId: 212, categoryName: "沐浴露" }
        ]
      }
    ]
  }
]);

// 分类切换事件
const handleCategoryChange = (val: number | undefined) => {
  console.log("选中分类ID：", val);
};

/*** =======第一步:开始一次新的销售 ======= */
import type { Sale } from "@/types/pos";

const totalQuantity = ref(0);
const totalAmount = ref(0.0);
const customerName = ref("张三");
const sale = ref<Sale>({
  saleNo: "",
  total: 0.0,
  totalQuantity: 0,
  status: ""
});
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
  makeNewSale().then(response => {
    sale.value = response.data;
  });
  step.value = 1;
}

/*** =======第二步: 输入商品明细 ======= */
import type { Product, EnterItemForm, SaleItem } from "@/types/pos";
import { listAllProduct } from "@/api/pos/product";
const productOptions = ref<Product[]>([]);
const enterItemForm = ref<EnterItemForm>({
  itemSn: "",
  quantity: 1
});
const tableData = ref<SaleItem[]>([]);

// 加载商品列表数据
onMounted(() => {
  listAllProduct().then(response => {
    productOptions.value = response.data;
  });
});
// 输入商品明细
function handleEnterItem() {
  enterItem(enterItemForm.value).then(response => {
    tableData.value = response.data;
  });
}

// 商品输入数量change事件, 无需处理
const handleChange = (value: number) => {
  console.log(value);
};

/*** =======第三步: 结束录入, 计算总金额/总件数 ====== */

// 结束录入
function handleEndSale() {
  endSale().then(response => {
    sale.value.total = response.data;
    totalAmount.value = response.data;
  });
  step.value = 3;
}

/*** =======第四步: 确认支付 ====== */
import type { MakePaymentForm } from "@/types/pos";
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
    tableData.value.forEach(item => {
      quantity += item.quantity;
    });
    totalQuantity.value = quantity;
    sale.value.totalQuantity = quantity;
  },
  { deep: true }
);

/*** =======终极任务二: 维护订单商品明细 ====== */
// 修改订单商品明细数量
const handleChangeQuantity = (row: SaleItem) => {
  changeQuantity(row).then(response => {
    tableData.value = response.data;
  });
};

// 删除订单商品明细
const handleDelete = (row: SaleItem) => {
  deleteSaleItem(row.itemSn).then(response => {
    tableData.value = response.data;
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
