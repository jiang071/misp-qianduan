<template>
  <div class="app-container">
    <el-form ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="类别ID" prop="categoryId">
        <el-input
          v-model="queryParams.categoryId"
          placeholder="请输入类别ID"
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
      <el-form-item label="类别级别" prop="level">
        <el-select
          v-model="queryParams.level"
          placeholder="请选择类别级别"
          clearable
          style="width: 150px"
        >
          <el-option label="第一级" value="1" />
          <el-option label="第二级" value="2" />
          <el-option label="第三级" value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="类别状态" prop="state">
        <el-select
          v-model="queryParams.state"
          placeholder="请选择类别状态"
          clearable
          style="width: 150px"
        >
          <el-option label="上架" value="true" />
          <el-option label="下架" value="false" />
        </el-select>
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

    <!-- 条件查询时展示基础表格 -->
    <el-table
      v-if="isQueryMode"
      :data="categoryList"
      row-key="categoryId"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        prop="categoryId"
        label="类别ID"
        align="center"
        width="200"
      />
      <el-table-column prop="categoryName" label="类别名称" align="center" />
      <el-table-column
        prop="parentId"
        label="上级ID"
        align="center"
        width="200"
      />
      <el-table-column
        prop="level"
        label="类别层级"
        align="center"
        width="150"
      />
      <el-table-column prop="state" label="类别状态" align="center" width="150">
        <template #default="scope">
          <el-tag :type="scope.row.state ? 'success' : 'danger'">
            {{ scope.row.state ? "上架" : "下架" }}
          </el-tag>
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

    <!-- 无查询条件时展示树形表格 -->
    <el-table
      v-else
      :data="cateogryTreeOptions"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      row-key="categoryId"
      default-expand-all
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        prop="categoryId"
        label="类别ID"
        align="center"
        width="200"
      />
      <el-table-column prop="categoryName" label="类别名称" align="center" />
      <el-table-column
        prop="parentId"
        label="上级ID"
        align="center"
        width="200"
      />
      <el-table-column
        prop="level"
        label="类别层级"
        align="center"
        width="150"
      />
      <el-table-column prop="state" label="类别状态" align="center" width="150">
        <template #default="scope">
          <el-tag :type="scope.row.state ? 'success' : 'danger'">
            {{ scope.row.state ? "上架" : "下架" }}
          </el-tag>
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

    <el-drawer v-model="drawer" title="类别信息" :with-header="false">
      <el-descriptions title="查看类别信息" :column="2" border>
        <el-descriptions-item label="类别ID">{{
          category.categoryId
        }}</el-descriptions-item>
        <el-descriptions-item label="类别名称">{{
          category.categoryName
        }}</el-descriptions-item>
        <el-descriptions-item label="所属上一类别">{{
          category.parentId
        }}</el-descriptions-item>
        <el-descriptions-item label="上级类别名称">{{
          parentCategoryNames
        }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{
          category.state ? "上架" : "下架"
        }}</el-descriptions-item>
        <el-descriptions-item label="类别层级">{{
          category.level
        }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
    <el-dialog
      v-model="dialogOpen"
      :title="title"
      width="500"
      @close="resetDialog"
    >
      <!-- 也可以写成 <CateogryForm /> -->
      <category-form
        v-if="dialogOpen"
        :category-id="categoryId"
        @close="dialogOpen = false"
        @refresh="refreshCategoryList"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import { ref, reactive, toRef, computed } from "vue";
import { onMounted } from "vue";
import CategoryForm from "./form.vue";
// 导入api接口
import {
  listCategory,
  getCategoryById,
  getCategoryTree,
  getCategoryByquery,
  deleteCategory,
  deleteCategoryBatch
} from "@/api/pos/category";

import { CategoryQueryParams, CategoryTree } from "@/types/pos";

onMounted(() => {
  getCategoryTreeOptions();
  loadAllCategoryData();
});

interface Category {
  categoryId: number;
  parentId: number;
  categoryName: string;
  categorySn: string;
  state: boolean;
  level: number;
  path: string;
  categoryDescription?: string;
  children?: Category[];
  hasChildren?: boolean;
  status?: string;
}
const categoryList = ref<Category[]>([]);
const allCategoryData = ref<Category[]>([]);
const dialogOpen = ref(false); // 对话框 v-model
const title = ref(""); // 对话框 v-bind
const ids = ref<number[]>([]); // 表单勾选的id
const categoryId = ref(0);
const total = ref<number>(0); // table数据总数
const cateogryTreeOptions = ref<CategoryTree[]>([]);
const drawer = ref<boolean>(false);
const selectedId = ref<number | undefined>();
const isQueryMode = ref<boolean>(false);
// 查询
const queryRef = ref<FormInstance>();
const query = reactive<CategoryQueryParams>({
  pageNum: 1,
  pageSize: 10,
  categoryId: undefined,
  categoryName: undefined,
  state: undefined,
  level: undefined
});
const queryParams = toRef(query);

// 处理表格选中事件
const handleSelectionChange = (val: Category[]) => {
  ids.value = val.map(item => item.categoryId);
};

// 数据查询区--> 查询按钮
function handleQuery() {
  // 标记为查询模式
  isQueryMode.value = true;
  getCategoryByquery(queryParams.value)
    .then(response => {
      categoryList.value = response.data.list || [];
      total.value = response.data.total || 0;
      ElMessage.success("查询成功");
    })
    .catch(err => {
      ElMessage.error("查询失败：" + err.message);
    });
}
// 数据查询区--> 重置按钮
const resetQuery = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  isQueryMode.value = false;
  // 重新加载树形数据
  getCategoryTreeOptions();
  // 重置分页参数
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  total.value = 0;
};
function getCategoryTreeOptions() {
  getCategoryTree().then(response => {
    cateogryTreeOptions.value = response.data;
    total.value = response.data.length;
  });
}

/** 获取类别列表 */
function getCategoryList() {
  listCategory().then(res => {
    categoryList.value = res.data;
    total.value = res.data.length;
  });
}

/** 查看按钮 */
const responseData = reactive<Category>({
  categoryId: undefined,
  categorySn: "",
  categoryName: "",
  state: false,
  parentId: undefined,
  categoryDescription: "",
  level: 0,
  path: ""
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

// 计算属性：解析path并拼接上级类别名称
const parentCategoryNames = computed(() => {
  if (!category.value.path) return "无";
  // 解析path为ID数组，过滤0（根节点）和当前类别ID
  const pathIds = category.value.path
    .split(",")
    .map(Number)
    .filter(id => id > 0 && id !== category.value.categoryId);
  if (pathIds.length === 0) return "无";
  // 匹配ID对应的名称
  const names = pathIds.map(id => {
    const item = allCategoryData.value.find(cate => cate.categoryId === id);
    return item ? item.categoryName : `未知(${id})`;
  });
  return names.join(" > "); // 拼接成 "一级 > 二级" 格式
});

// 加载全量类别数据（用于匹配ID和名称）
function loadAllCategoryData() {
  listCategory()
    .then(res => {
      allCategoryData.value = res.data || [];
    })
    .catch(err => {
      ElMessage.error("加载全量类别数据失败：" + err.message);
    });
}

/** ------------------数据展示区：分页加载-------------------- */
// 分页--> 修改每页数据数（5｜10｜20｜30）
function handleSizeChange(val: number) {
  queryParams.value.pageSize = val;
  if (isQueryMode.value) {
    handleQuery();
  } else {
    getCategoryList();
  }
}

//分页--> 修改当前页
function handleCurrentChange(val: number) {
  queryParams.value.pageNum = val;
  if (isQueryMode.value) {
    handleQuery();
  } else {
    getCategoryList();
  }
}

/** 新增按钮 */
function handleAdd() {
  resetDialog();
  dialogOpen.value = true;
  title.value = "新增类别";
}

function refreshCategoryList() {
  if (isQueryMode.value) {
    handleQuery(); // 条件查询模式：重新执行查询
  } else {
    getCategoryTreeOptions(); // 树形模式：重新加载树形数据
    loadAllCategoryData(); // 刷新全量数据（用于查看时匹配上级名称）
  }
}

/** 重置弹窗状态 */
function resetDialog() {
  categoryId.value = null;
  title.value = "新增类别";
}

/** 修改按钮 */
function handleUpdate(row?: any) {
  // 优先取行数据的ID，其次取选中的ID（批量修改）
  const targetId = row?.categoryId || ids.value[0];
  if (!targetId) {
    ElMessage.warning("请选择要修改的类别");
    return;
  }
  categoryId.value = targetId; // 传递给子组件的ID
  title.value = `修改类别`;
  dialogOpen.value = true;
}

/** 删除按钮 */
/** 删除按钮 */
function handleDelete(row?: any) {
  // 确定要删除的ID集合：优先取行数据（单删），其次取选中的ID数组（批删）
  const deleteIds = row?.categoryId ? [row.categoryId] : ids.value;

  // 校验：无选中数据时提示
  if (deleteIds.length === 0) {
    ElMessage.warning("请选择要删除的类别");
    return;
  }

  ElMessageBox.confirm(
    `是否确认删除${deleteIds.length > 1 ? "选中的" : ""}类别数据？`,
    "警告",
    {
      confirmButtonText: "是",
      cancelButtonText: "否",
      type: "warning"
    }
  )
    .then(async () => {
      try {
        if (deleteIds.length === 1) {
          // 单条删除：调用原接口
          await deleteCategory(deleteIds[0]);
        } else {
          // 批量删除：调用批量删除接口
          await deleteCategoryBatch(deleteIds);
        }
        ElMessage({ type: "success", message: "删除成功" });
        refreshCategoryList(); // 刷新列表
      } catch (err: any) {
        ElMessage.error(`删除失败：${err.message || "服务器错误"}`);
      }
    })
    .catch(() => {
      ElMessage({ type: "info", message: "取消删除" });
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
