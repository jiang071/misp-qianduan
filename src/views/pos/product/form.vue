<template>
  <el-form
    ref="ruleFormRef"
    style="max-width: 800px; padding-right: 40px; padding-left: 40px"
    :model="form"
    :rules="rules"
    label-width="90px"
  >
    <el-form-item label="产品名称" prop="productName">
      <el-input v-model="form.productName" placeholder="请输入商品名称" />
    </el-form-item>
    <el-form-item label="商品编号" prop="productSn">
      <el-input v-model="form.productSn" placeholder="请输入商品编号" />
    </el-form-item>
    <el-form-item label="商品价格" prop="price">
      <el-input
        v-model="form.price"
        style="width: 100%"
        placeholder="请输入商品价格"
      />
    </el-form-item>
    <el-form-item label="产品类别" prop="productCategoryId">
      <el-tree-select
        ref="categoryTreeRef"
        v-model="form.productCategoryId"
        :data="categoryTreeOptions"
        :props="{
          label: 'categoryName',
          value: 'categoryId',
          children: 'children'
        }"
        placeholder="请选择产品类别"
        :render-after-expand="false"
        style="width: 100%"
        @change="handleCategoryChange"
      />
    </el-form-item>

    <!--商品规格-->
    <el-divider content-position="left">商品规格</el-divider>
    <el-form-item label="规格列表">
      <div style="width: 100%">
        <!-- 规格表格 -->
        <el-table
          :data="form.skuList"
          border
          style="width: 100%; margin-bottom: 16px"
        >
          <el-table-column label="规格编码" min-width="120">
            <template #default="{ row, $index }">
              <el-input
                v-model="row.skuCode"
                placeholder="请输入规格编码"
                size="small"
                @blur="validateSkuCode($index)"
              />
            </template>
          </el-table-column>
          <el-table-column label="规格名称" min-width="120">
            <template #default="{ row }">
              <el-input
                v-model="row.skuName"
                placeholder="请输入规格名称"
                size="small"
              />
            </template>
          </el-table-column>
          <el-table-column label="规格价格" min-width="120">
            <template #default="{ row }">
              <el-input-number
                v-model="row.price"
                :min="0"
                :precision="2"
                size="small"
                style="width: 100%"
                placeholder="价格"
              />
            </template>
          </el-table-column>
          <el-table-column label="规格库存" min-width="120">
            <template #default="{ row }">
              <el-input-number
                v-model="row.stock"
                :min="0"
                :precision="0"
                size="small"
                style="width: 100%"
                placeholder="库存"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ $index }">
              <el-button
                type="danger"
                link
                size="small"
                @click="removeSku($index)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <!-- 添加规格按钮 -->
        <el-button type="primary" plain :icon="Plus" @click="addSku">
          添加规格
        </el-button>

        <!-- 规格提示信息 -->
        <div style="margin-top: 8px; font-size: 12px; color: #909399">
          <el-alert type="info" :closable="false" show-icon>
            <span>规格编码必须唯一，各规格库存之和即为商品总库存</span>
          </el-alert>
        </div>
      </div>
    </el-form-item>

    <!-- 商品描述 -->
    <el-form-item label="商品描述" prop="productDescription">
      <el-input
        v-model="form.productDescription"
        type="textarea"
        :rows="3"
        placeholder="请输入商品描述"
      />
    </el-form-item>

    <!-- 主图URL -->
    <el-form-item label="主图URL" prop="imageUrl">
      <el-input v-model="form.imageUrl" placeholder="请输入图片URL">
        <template #append>
          <el-button @click="uploadImage('image')">上传</el-button>
        </template>
      </el-input>
    </el-form-item>

    <!-- 详情图URL -->
    <el-form-item label="详情图URL" prop="detailUrl">
      <el-input v-model="form.detailUrl" placeholder="请输入详情图URL">
        <template #append>
          <el-button @click="uploadImage('detail')">上传</el-button>
        </template>
      </el-input>
    </el-form-item>

    <!-- 提交与重置按钮 -->
    <el-form-item>
      <el-button type="primary" @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
      <el-button @click="resetForm(ruleFormRef)">重置</el-button>
      <el-button @click="close()">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, toRef, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { listCategory } from "@/api/pos/category";
import { getProductById, addProduct, updateProduct } from "@/api/pos/product";
import { Category, Product, ProductSku } from "@/types/pos";

const props = defineProps<{
  productId?: number;
}>();

const emit = defineEmits(["close"]);

const product = reactive<Product>({
  productId: undefined,
  productSn: "",
  productName: "",
  productDescription: "",
  price: 0,
  productCategoryId: undefined,
  category: {
    categoryId: undefined,
    parentId: 0,
    categoryName: "",
    state: false,
    level: 0,
    path: ""
  },
  imageUrl: "",
  detailUrl: "",
  skuList: [],
  count: 0,
  restock: 0,
  status: ""
});
const form = toRef(product);
const ruleFormRef = ref<FormInstance>();
const categoryTreeRef = ref(); // 树形选择器ref
const categoryTreeOptions = ref<any[]>([]); // 树形分类数据

// 表单校验规则
const rules = reactive<FormRules<Product>>({
  productName: [
    { required: true, message: "请输入商品名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符之间", trigger: "blur" }
  ],
  productSn: [
    { required: true, message: "请输入商品编号", trigger: "blur" },
    { min: 3, max: 20, message: "编号长度在 3 到 20 之间", trigger: "blur" }
  ],
  price: [
    { required: true, message: "请输入商品价格", trigger: "blur" },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value && Number(value) <= 0) {
          callback(new Error("价格必须大于0"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  productCategoryId: [
    { required: true, message: "请选择商品分类", trigger: "change" }
  ]
});

// 添加规格
const addSku = () => {
  if (!form.value.skuList) {
    form.value.skuList = [];
  }

  const newSku: ProductSku = {
    skuId: undefined,
    skuCode: "",
    skuName: "",
    price: 0,
    stock: 0
  };

  form.value.skuList.push(newSku);
};

// 删除规格
const removeSku = (index: number) => {
  form.value.skuList.splice(index, 1);
};

// 验证规格编码唯一性
const validateSkuCode = (currentIndex: number) => {
  const currentSku = form.value.skuList[currentIndex];
  if (!currentSku.skuCode) return;

  const hasDuplicate = form.value.skuList.some(
    (sku, index) => index !== currentIndex && sku.skuCode === currentSku.skuCode
  );

  if (hasDuplicate) {
    ElMessage.warning("规格编码不能重复");
  }
};

// 验证规格列表
const validateSkuList = (): boolean => {
  // 规格为可选：如果没有规格，视为通过验证
  if (!form.value.skuList || form.value.skuList.length === 0) {
    return true;
  }

  for (let i = 0; i < form.value.skuList.length; i++) {
    const sku = form.value.skuList[i];
    if (!sku.skuCode) {
      ElMessage.warning(`第 ${i + 1} 行规格编码不能为空`);
      return false;
    }
    if (!sku.skuName) {
      ElMessage.warning(`第 ${i + 1} 行规格名称不能为空`);
      return false;
    }
    if (sku.price <= 0) {
      ElMessage.warning(`第 ${i + 1} 行规格价格必须大于0`);
      return false;
    }
    if (sku.stock < 0) {
      ElMessage.warning(`第 ${i + 1} 行规格库存不能为负数`);
      return false;
    }
  }

  return true;
};

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

/**
 * 构建分类树形结构
 * @param categories 扁平分类列表
 * @returns 树形结构分类数据
 */
const buildCategoryTree = (categories: Category[]): any[] => {
  // 1. 创建分类ID映射表
  const categoryMap = new Map<number, any>();
  categories.forEach(category => {
    categoryMap.set(category.categoryId!, {
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      parentId: category.parentId,
      children: []
    });
  });

  // 2. 构建树形结构
  const tree: any[] = [];
  categories.forEach(category => {
    const currentNode = categoryMap.get(category.categoryId!);
    if (currentNode) {
      if (category.parentId === 0) {
        // 一级分类加入根节点
        tree.push(currentNode);
      } else {
        // 子分类加入父节点children
        const parentNode = categoryMap.get(category.parentId);
        if (parentNode) {
          parentNode.children.push(currentNode);
        }
      }
    }
  });
  return tree;
};

// 新增树形选择器change事件处理
/**
 * 分类选择变化回调
 * @param value 选中的分类ID
 */
const handleCategoryChange = (value: number) => {
  console.log("选中的分类ID:", value);
  // 可选：添加分类选择后的逻辑（如验证分类级别、联动其他字段等）
};

onMounted(() => {
  getCategoryOptions();
});

// 侦听器
watch(
  () => props.productId,
  newVal => {
    resetForm(ruleFormRef.value);
    if (newVal) {
      getProductById(newVal).then(res => {
        form.value = res.data;
      });
    }
  },
  { immediate: true }
);

// 获取类别下拉框列表
const getCategoryOptions = () => {
  listCategory().then(res => {
    categoryTreeOptions.value = buildCategoryTree(res.data);
  });
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid, fields) => {
    if (!valid) {
      console.log("表单验证失败:", fields);
      return;
    }

    // 验证规格列表
    if (!validateSkuList()) {
      return;
    }

    // 计算商品总库存（规格库存之和），若无规格则尝试使用表单中的 count 字段或 0
    const productStock =
      form.value.skuList && form.value.skuList.length > 0
        ? (form.value.skuList || []).reduce(
            (sum: number, sku: any) => sum + (Number(sku.stock) || 0),
            0
          )
        : Number(form.value.count) || 0;

    // 构建后端需要的字段映射
    const payload: any = {
      productId: form.value.productId ?? 0,
      productSn: form.value.productSn || "",
      productName: form.value.productName || "",
      categoryId:
        form.value.productCategoryId || form.value.category?.categoryId || 0,
      displayPrice: Number(form.value.price) || 0,
      productDesc: form.value.productDescription || "",
      mainImage: form.value.imageUrl || "",
      // 确保传给后端的 detailImages 是合法的 JSON（MySQL JSON 列不接受空字符串）
      detailImages: form.value.detailUrl
        ? JSON.stringify(
            typeof form.value.detailUrl === "string" &&
              form.value.detailUrl.includes(",")
              ? form.value.detailUrl
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean)
              : [form.value.detailUrl]
          )
        : JSON.stringify([]),
      productStock: productStock,
      productStatus: form.value.status || "",
      stockStatus: productStock > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
      // 可选：创建/更新时间交给后端生成，如果后端必须要可以改为 new Date().toISOString()
      // createTime: new Date().toISOString(),
      // updateTime: new Date().toISOString(),
      // 保留原始 sku 列表以便后端同步明细（如果后端需要）
      // 仅在存在规格时传递 skuList，避免向后端传空数组（根据后端偏好可调整）
      ...(form.value.skuList && form.value.skuList.length > 0
        ? { skuList: form.value.skuList }
        : {})
    };

    try {
      // 打印请求体以便调试后端 500 问题
      console.log("提交商品 payload:", payload);
      if (form.value.productId != undefined) {
        await updateProduct(payload);
        ElMessage({ type: "success", message: "修改数据成功" });
      } else {
        await addProduct(payload);
        ElMessage({ type: "success", message: "新增数据成功" });
      }
      close();
    } catch (error) {
      const err: any = error;
      console.error("提交商品数据失败:", err);
      if (err && err.response && err.response.data) {
        console.error("后端响应数据:", err.response.data);
        const msg =
          err.response.data.message || JSON.stringify(err.response.data);
        ElMessage.error(`提交商品失败: ${msg}`);
      } else {
        ElMessage.error("提交商品失败，请重试");
      }
    }
  });
};

function close() {
  emit("close");
}

// 上传图片
const uploadImage = (type: "image" | "detail") => {};
</script>

<style scoped>
.el-input,
.el-select,
.el-input-number {
  width: 100%;
}
</style>
