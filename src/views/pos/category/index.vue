<template>
  <div class="app-container">
    <el-form ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="类别编码" prop="categorySn">
        <el-input
          v-model="queryParams.categorySn"
          placeholder="请输入类别编码"
          clearable
          style="width: 150px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类别名称" prop="categoryName">
        <el-input
          v-model="queryParams.categoryName"
          placeholder="请输入类别名称"
          clearable
          style="width: 150px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属第一级类别" prop="parentId">
        <el-tree-select
          v-model="queryParams.parentId"
          :data="categoryList"
          placeholder="请选择类别"
          :render-after-expand="false"
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="类别状态" prop="status">
        <el-tree-select
          v-model="queryParams.status"
          :data="categoryList"
          placeholder="请选择类别状态"
          :render-after-expand="false"
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery(queryRef)">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col v-if="categoryList.length > 0" :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          >导出</el-button
        >
      </el-col>
    </el-row>
    <el-divider />
    <el-row :gutter="20">
      <el-table :data="categoryList" style="width: 100%">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          prop="categoryId"
          label="类别ID"
          align="center"
          width="200"
        />
        <el-table-column prop="categorySn" label="类别编号" align="center" />
        <el-table-column prop="categoryName" label="类别名称" align="center" />
        <el-table-column
          prop="parentId"
          label="上级ID"
          align="center"
          width="200"
        />
        <el-table-column prop="status" label="类别状态" align="center" />
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
    </el-row>

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

    <el-drawer v-model="drawer" title="类别信息" :with-header="false">
      <el-descriptions title="查看类别信息" :column="2" border>
        <el-descriptions-item label="类别编码">{{
          category.categorySn
        }}</el-descriptions-item>
        <el-descriptions-item label="类别名称">{{
          category.categoryName
        }}</el-descriptions-item>
        <el-descriptions-item label="所属第一级类别">{{
          category.parentId
        }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{
          category.status
        }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{
          category.categoryDescription
        }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
    <el-dialog v-model="dialogOpen" :title="title" width="500">
      <!-- 也可以写成 <CateogryForm /> -->
      <category-form :category-id="categoryId" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import { ref, reactive, toRef } from "vue";
import { onMounted } from "vue";
import CategoryForm from "./form.vue";
// 导入api接口
import { listCategory, getCategoryById } from "@/api/pos/category";

import { CategoryQueryParams } from "@/types/pos";
import { pa } from "element-plus/es/locale/index.mjs";

onMounted(() => {
  getCategoryList();
});

interface Category {
  categoryId: number;
  parentId: number;
  categoryName: string;
  categorySn: string;
  status: string;
  categoryDescription?: string;
}
const categoryList = ref<Category[]>([]);

const dialogOpen = ref(false); // 对话框 v-model
const title = ref(""); // 对话框 v-bind
const ids = ref<number[]>([]); // 表单勾选的id
const categoryId = ref(0);
const total = ref<number>(0); // table数据总数
// 查询
const queryRef = ref<FormInstance>();
const query = reactive<CategoryQueryParams>({
  pageNum: 1,
  pageSize: 10,
  categorySn: undefined,
  categoryName: undefined,
  status: undefined,
  parentId: undefined
});
const queryParams = toRef(query);
// 数据查询区--> 查询按钮
function handleQuery() {
  queryParams.value.pageNum = 1;
  getCategoryList();
  ElMessage.success(JSON.stringify(queryParams.value));
}
// 数据查询区--> 重置按钮
const resetQuery = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  getCategoryList();
};

/** 获取类别列表 */
function getCategoryList() {
  listCategory().then(res => {
    console.log(res);
    categoryList.value = res.data;
  });
}

/** 查看按钮 */
const drawer = ref<boolean>(false);
const responseData = reactive<Category>({
  categoryId: undefined,
  categorySn: "",
  categoryName: "",
  status: "",
  parentId: undefined,
  categoryDescription: ""
});
const category = toRef(responseData);
function handleView(row: Category) {
  if (row.categoryId !== undefined) {
    getCategoryById(row.categoryId).then(response => {
      category.value = response.data;
    });
    drawer.value = true;
  }
}
/** ------------------数据展示区：分页加载-------------------- */
// 分页--> 修改每页数据数（5｜10｜20｜30）
function handleSizeChange(val: number) {
  queryParams.value.pageSize = val;
  getCategoryList();
}

//分页--> 修改当前页
function handleCurrentChange(val: number) {
  queryParams.value.pageNum = val;
  getCategoryList();
}
const selectedId = ref<number | undefined>();
/** 新增按钮 */
function handleAdd() {
  dialogOpen.value = true;
  title.value = "新增类别";
}

/** 修改按钮 */
function handleUpdate(row: any) {
  selectedId.value = row.productId || ids.value[0];
  title.value = "修改商品[" + selectedId.value + "]";
  dialogOpen.value = true;
}

/** 删除按钮 */
function handleDelete(row: any) {
  ElMessageBox.confirm("是否删除数据?", "警告", {
    confirmButtonText: "是",
    cancelButtonText: "否",
    type: "warning"
  })
    .then(() => {
      ElMessage({ type: "success", message: "删除成功" });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消删除"
      });
    });
}

/** 导出按钮 */
function handleExport() {
  ElMessage({ type: "info", message: "导出数据" });
}
</script>

<style>
@media (min-width: 1024px) {
}
</style>
