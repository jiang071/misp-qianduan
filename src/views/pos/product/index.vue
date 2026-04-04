<template>
  <div class="app-container">
    <!-- 数据查询区：表单 -->
    <el-form ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="编码" prop="productSn">
        <el-input
          v-model="queryParams.productSn"
          placeholder="请输入编码"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品类别" prop="productCategoryId">
        <!-- <el-select v-model="queryParams.productCategoryId" style="width: 200px" placeholder="请选择类别">
                    <el-option v-for="item in categoryOptions" :key="item.categoryId" :label="item.categoryName"
                        :value="item.categoryId" />
                </el-select> -->
        <el-tree-select
          ref="categoryTreeRef"
          v-model="queryParams.productCategoryId"
          :data="cateogryTreeOptions"
          :props="{
            label: 'categoryName',
            value: 'categoryId',
            children: 'children'
          }"
          placeholder="请选择产品类别"
          :render-after-expand="false"
          style="width: 200px"
          @change="handleCategoryChange"
        />
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          >新增</el-button
        >
      </el-col>
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
      <el-table-column label="ID" align="center" width="100" prop="productId" />
      <el-table-column
        label="编码"
        align="center"
        width="200"
        prop="productSn"
      />
      <el-table-column label="名称" align="center" prop="productName" />
      <el-table-column
        label="类别ID"
        align="center"
        width="200"
        prop="category.categoryId"
      />
      <el-table-column
        label="类别"
        align="center"
        width="200"
        prop="category.categoryName"
      />
      <el-table-column label="价格" align="center" width="200" prop="price" />
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

    <!-- 数据展示区：分页加载 -->
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

    <el-drawer v-model="drawer" title="商品信息" :with-header="false">
      <el-descriptions :title="productTitle" :column="2" border>
        <el-descriptions-item label="编码">{{
          product.productSn
        }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{
          product.productName
        }}</el-descriptions-item>
        <el-descriptions-item label="价格">{{
          product.displayPrice
        }}</el-descriptions-item>
        <el-descriptions-item label="类别">{{
          product.categoryId
        }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{
          product.productDesc
        }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>

    <el-dialog v-model="dialogOpen" :title="title" width="800" append-to-body>
      <product-form :product-id="selectedId" @close="handleCloseDiaglog" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
/** ------------------全局导入区-------------------- */
import { ref, reactive, toRef, onMounted } from "vue";
import type { FormInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { listCategory, getCategoryTree } from "@/api/pos/category";
import {
  getProductById,
  deleteProduct,
  deleteProductBatch,
  listAllProduct,
  listProductByPage
} from "@/api/pos/product";
import ProductForm from "./form.vue";
import {
  Category,
  CategoryTree,
  ProductQueryParams,
  Product,
  ProductSku,
  ProductSpecAttr
} from "@/types/pos";

onMounted(() => {
  // 挂载后加载数据
  getProductList();
  getCategoryTreeOptions();
});

const categoryTreeRef = ref();
const selectedCategoryId = ref<number | undefined>(undefined);
/** ------------------数据查询区——表单-------------------- */
// 表单实例
const queryRef = ref<FormInstance>();
const cateogryTreeOptions = ref<CategoryTree[]>([]);
const getCategoryTreeOptions = () => {
  getCategoryTree().then(res => {
    cateogryTreeOptions.value = res.data;
  });
};

// 查询
const query = reactive<ProductQueryParams>({
  pageNum: 1,
  pageSize: 10,
  productSn: undefined,
  productName: undefined,
  productCategoryId: undefined,
  categoryIds: []
});
const queryParams = toRef(query);

const handleCategoryChange = (value: number | undefined) => {
  selectedCategoryId.value = value;
  console.log("📌 树形选择器选中的原始值：", value);
  if (!value || !categoryTreeRef.value) {
    queryParams.value.categoryIds = [];
    return;
  }

  try {
    // 获取 el-tree 实例（兼容不同版本的 element-plus）
    const treeInstance =
      categoryTreeRef.value.tree || categoryTreeRef.value.getTree?.();
    if (!treeInstance) {
      queryParams.value.categoryIds = [];
      return;
    }

    // 根据选中的 value 获取节点对象
    const node = treeInstance.getNode(value);
    if (!node || !node.data) {
      queryParams.value.categoryIds = [];
      return;
    }

    // 从当前节点向上遍历，收集所有父节点 ID（顺序：一级 -> 二级 -> 三级）
    const categoryIds: number[] = [];
    let currentNode: any = node;

    while (currentNode && currentNode.data) {
      if (currentNode.data.categoryId !== undefined) {
        categoryIds.unshift(currentNode.data.categoryId); // unshift 保证父节点在前面
      }
      currentNode = currentNode.parent; // 移动到父节点
    }

    // 更新查询参数
    queryParams.value.categoryIds = categoryIds;
  } catch (error) {
    console.error("获取分类路径失败:", error);
    queryParams.value.categoryIds = [];
  }
};

// 数据查询区--> 查询按钮
function handleQuery() {
  queryParams.value.pageNum = 1;
  getProductList();
  const categoryTip = queryParams.value.productCategoryId
    ? `，分类ID：${queryParams.value.productCategoryId}`
    : "";
  ElMessage.success(`已执行查询${categoryTip}`);
}
// 数据查询区--> 重置按钮
const resetQuery = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  getProductList();
};

/** ------------------数据展示区——表格-------------------- */

const loading = ref<boolean>(false); // table数据加载遮罩
const total = ref<number>(0); // table数据总数
const tableData = reactive<Product[]>([]); // table数据
const dataList = toRef(tableData);

// 数据展示区--> 数据加载
// 数据展示区--> 数据加载（修复 500 不崩溃）
function getProductList() {
  loading.value = true;

  const requestParams = {
    pageNum: queryParams.value.pageNum,
    pageSize: queryParams.value.pageSize,
    productSn: queryParams.value.productSn || "",
    productName: queryParams.value.productName || "",
    categoryIds: queryParams.value.categoryIds || []
  };

  listProductByPage(requestParams)
    .then(response => {
      dataList.value = response?.data?.list || [];
      total.value = response?.data?.total || 0;
      loading.value = false;
    })
    .catch(error => {
      console.error("商品查询异常（已兼容）:", error);
      dataList.value = [];
      total.value = 0;
      loading.value = false;
      ElMessage.warning("部分商品数据异常，已安全显示");
    });
}

/** ------------------数据展示区：数据选择-------------------- */

const ids = ref<number[]>([]); // 表单勾选的id
const single = ref<boolean>(false); // 勾选1个
const multiple = ref<boolean>(false); // 勾选多个

// 数据展示区--> 勾选数据
function handleSelectionChange(selection: Product[]) {
  ids.value = selection
    .map((item: Product) => item.productId)
    .filter(id => id !== undefined) as number[];
  single.value = selection.length == 1;
  multiple.value = selection.length >= 1;
}

/** ------------------数据展示区：分页加载-------------------- */
// 分页--> 修改每页数据数（5｜10｜20｜30）
function handleSizeChange(val: number) {
  queryParams.value.pageSize = val;
  getProductList();
}

//分页--> 修改当前页
function handleCurrentChange(val: number) {
  queryParams.value.pageNum = val;
  getProductList();
}

/** 查看按钮 */
const drawer = ref<boolean>(false);
const productTitle = ref<string>("");
const responseData = reactive<Product>({
  productId: 0,
  productSn: "",
  productName: "",
  productDesc: "",
  displayPrice: 0,
  categoryId: 0,
  categoryName: "",
  mainImage: "",
  detailImages: "",
  productStock: 0,
  productStatus: "",
  stockStatus: "",
  createTime: "",
  updateTime: ""
});

const newSku: ProductSku = {
  skuId: undefined,
  productId: undefined,
  skuCode: "",
  specCombo: "",
  skuPrice: 0,
  skuStock: 0,
  skuImage: ""
};

const skus = ref<ProductSku[]>([]); // 商品规格列表

const product = toRef(responseData);
function handleView(row: Product) {
  if (row.productId !== undefined) {
    getProductById(row.productId).then(response => {
      product.value = response.data;
      productTitle.value = "查看商品数据[" + row.productId + "]";
    });
    drawer.value = true;
  }
}

/** ------------------数据操作区：按钮-------------------- */
/** 新增按钮 */
const dialogOpen = ref(false);
const title = ref("");
const selectedId = ref<number | undefined>();
function handleAdd() {
  title.value = "新增商品";
  selectedId.value = undefined;
  dialogOpen.value = true;
}

/** 修改按钮 */
function handleUpdate(row: any) {
  ElMessage.success("修改操作,勾选的数据id为:" + ids.value.join(","));
  selectedId.value = row.productId || ids.value[0];
  title.value = "修改商品[" + selectedId.value + "]";
  dialogOpen.value = true;
}

/** 提交表单后关闭对话框 */
function handleCloseDiaglog() {
  dialogOpen.value = false;
  getProductList();
}

/** ------------------数据删除操作-------------------- */
/** 删除按钮 */
function handleDelete(row: any) {
  ElMessageBox.confirm("是否删除编号为" + row.productId + "的数据?", "警告")
    .then(() => {
      if (row.productId) {
        return deleteProduct(row.productId);
      }
    })
    .then(() => {
      getProductList();
      ElMessage.success("删除id为" + row.productId + "的数据成功!");
    });
}

/** 批量删除按钮 */
// 正确代码：函数声明为 async
async function handleBatchDelete() {
  // 🔧 添加 async 关键字
  try {
    // await 可以正常使用（ElMessageBox.confirm 返回 Promise）
    await ElMessageBox.confirm(
      `是否删除编号为${ids.value.join(",")}的数据?`,
      "警告"
    );
    // 确认后执行删除
    await deleteProductBatch(ids.value); // 若 deleteProductBatch 是异步函数，也需 await
    getProductList();
    ElMessage.success(`批量删除${ids.value.length}条数据成功！`);
  } catch (error) {
    // 用户取消确认时的异常捕获（无需处理，仅关闭弹窗）
    ElMessage.info("已取消删除操作");
  }
}
</script>
