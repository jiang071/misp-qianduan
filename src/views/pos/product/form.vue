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
    <el-form-item label="商品状态" prop="productStatus">
      <el-select
        v-model="form.productStatus"
        placeholder="请选择商品状态"
        style="width: 100%"
      >
        <el-option label="上架" value="onsale" />
        <el-option label="下架" value="offshelf" />
      </el-select>
    </el-form-item>
    <el-form-item label="产品类别" prop="categoryId">
      <el-tree-select
        ref="categoryTreeRef"
        v-model="form.categoryId"
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

    <el-divider content-position="left">商品规格维度</el-divider>
    <el-form-item label="规格维度">
      <div style="width: 100%">
        <el-table :data="form.specAttrList" border style="margin-bottom: 12px">
          <el-table-column label="维度名称" min-width="120">
            <template #default="{ row }">
              <el-input
                v-model="row.attrName"
                placeholder="如：颜色"
                size="small"
              />
            </template>
          </el-table-column>
          <el-table-column label="可选值" min-width="180">
            <template #default="{ row }">
              <el-input
                v-model="row.attrValues"
                placeholder="红色,蓝色,绿色 逗号分隔"
                size="small"
              />
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ $index }">
              <el-button
                type="danger"
                link
                size="small"
                @click="removeSpecAttr($index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary" plain :icon="Plus" @click="addSpecAttr">
          添加规格维度
        </el-button>
        <el-button
          type="success"
          plain
          style="margin-left: 8px"
          @click="generateSkuFromAttr"
        >
          生成组合SKU
        </el-button>
      </div>
    </el-form-item>

    <!-- ====================== 优化：SKU 列表（完全使用你的 ProductSku） ====================== -->
    <el-divider content-position="left">SKU 组合管理</el-divider>
    <el-form-item label="SKU列表">
      <el-table :data="form.skuList" border style="width: 100%">
        <el-table-column label="SKU编码" min-width="130">
          <template #default="{ row }">
            <el-input
              v-model="row.skuCode"
              placeholder="自动生成"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column label="组合描述" min-width="180">
          <template #default="{ row }">
            <el-input v-model="row.skuCombo" disabled size="small" />
          </template>
        </el-table-column>
        <el-table-column label="价格" min-width="100">
          <template #default="{ row }">
            <el-input-number
              v-model="row.skuPrice"
              :min="0"
              :precision="2"
              size="small"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="库存" min-width="100">
          <template #default="{ row }">
            <el-input-number
              v-model="row.skuStock"
              :min="0"
              size="small"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="详情图" min-width="150">
          <template #default="{ row }">
            <el-input v-model="row.skuImage" placeholder="URL" size="small" />
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
    </el-form-item>

    <!-- 商品描述 -->
    <el-form-item label="商品描述" prop="productDesc">
      <el-input
        v-model="form.productDesc"
        type="textarea"
        :rows="3"
        placeholder="请输入商品描述"
      />
    </el-form-item>

    <!-- 主图URL -->
    <el-form-item label="主图URL" prop="mainImage">
      <el-input v-model="form.mainImage" placeholder="请输入图片URL">
        <template #append>
          <el-button @click="uploadImage('image')">上传</el-button>
        </template>
      </el-input>
    </el-form-item>

    <!-- 详情图URL -->
    <el-form-item label="详情图URL" prop="detailImages">
      <el-input v-model="form.detailImages" placeholder="请输入详情图URL">
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
import {
  getProductById,
  addProduct,
  updateProduct,
  getProductSkuByProductId,
  getProductSpecAttrById,
  addProductSku,
  addProductSpecAttr,
  updateProductSku,
  updateProductSpecAttr,
  deleteProductSkuBySkuId,
  deleteProductSpecAttr,
  deleteProductSkuByProductId,
  deleteProductSpecAttrByProductId
} from "@/api/pos/product";
import { Category, Product, ProductSku, ProductSpecAttr } from "@/types/pos";

const props = defineProps<{
  productId?: number;
}>();

const emit = defineEmits(["close"]);

const product = reactive<any>({
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
  productStatus: "1",
  stockStatus: "OUT_OF_STOCK",
  createTime: "",
  updateTime: "",
  specAttrList: [], // 规格维度
  skuList: [] // SKU列表
});
const form = toRef(product);
const ruleFormRef = ref<FormInstance>();
const categoryTreeRef = ref(); // 树形选择器ref
const categoryTreeOptions = ref<any[]>([]); // 树形分类数据

// ====================== 规格维度：添加 / 删除（完全使用 ProductSpecAttr） ======================
const addSpecAttr = () => {
  if (!form.value.specAttrList) {
    form.value.specAttrList = [];
  }
  form.value.specAttrList.push({
    attrId: undefined,
    productId: undefined,
    attrName: "",
    attrValues: "",
    attrType: "RADIO"
  });
};

// ====================== 修复：删除规格维度 ======================
const removeSpecAttr = (index: number) => {
  if (!form.value.specAttrList) form.value.specAttrList = [];
  form.value.specAttrList.splice(index, 1);
};

// ====================== 核心：自动生成规则 SKU 编码（不重复） ======================
const generateSkuFromAttr = () => {
  const attrs = form.value.specAttrList;
  if (!attrs || attrs.length === 0) {
    ElMessage.warning("请先添加规格维度");
    return;
  }

  // 1. 从商品编码 SNxxxx 取出前4位数字
  const sn = form.value.productSn || "";
  const prefixNum = sn.replace(/\D/g, "").padEnd(4, "0").slice(0, 4); // 提取数字 → 保留4位

  // 2. 解析规格值（支持中英文逗号）
  const dims = attrs.map(attr => ({
    name: attr.attrName,
    values: attr.attrValues
      .split(/[,，]/)
      .map(v => v.trim())
      .filter(Boolean)
  }));

  // 3. 笛卡尔积生成组合
  const combinations: string[][] = []; // 这里改成二维数组
  function dfs(idx: number, curr: string[]) {
    if (idx === dims.length) {
      combinations.push([...curr]); //直接 push 数组，不 join
      return;
    }
    dims[idx].values.forEach(v => {
      dfs(idx + 1, [...curr, `${dims[idx].name}:${v}`]);
    });
  }
  dfs(0, []);

  // 4. 生成 SKU 编码：SKU + 前4位(商品编码) + 后4位(自增序号)
  let seqNo = 1;
  form.value.skuList = combinations.map(combo => {
    const suffixNum = (seqNo++).toString().padStart(4, "0"); // 0001、0002...
    const skuCode = `SKU${prefixNum}${suffixNum}`; // 最终格式

    return {
      skuId: undefined,
      productId: undefined,
      skuCode: skuCode,
      skuCombo: combo,
      skuPrice: form.value.displayPrice || 0,
      skuStock: 0,
      skuImage: ""
    };
  });

  ElMessage.success("SKU组合与编码生成成功");
};

// ====================== SKU 删除 ======================
const removeSku = (index: number) => {
  if (!form.value.skuList) form.value.skuList = [];
  form.value.skuList.splice(index, 1);
};

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
  productStatus: [
    { required: true, message: "请选择商品状态", trigger: "change" }
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
    productId: undefined,
    skuCode: "",
    specCombo: "",
    skuPrice: 0,
    skuStock: 0,
    skuImage: ""
  };

  form.value.skuList.push(newSku);
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
  async newVal => {
    resetForm(ruleFormRef.value);
    if (newVal) {
      const res = await getProductById(newVal);
      form.value = res.data;

      // 确保状态正确回显
      if (form.value.productStatus === "onsale") {
        form.value.productStatus = "onsale";
      } else if (form.value.productStatus === "offshelf") {
        form.value.productStatus = "offshelf";
      }
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
// ======================
// 最终提交：商品 + SKU + 规格（attrValues 自动转数组）
// 完全匹配你的后端接口
// ======================
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async valid => {
    if (!valid) return;

    const skuList = form.value.skuList || [];
    const specList = form.value.specAttrList || [];

    try {
      // 1. 计算总库存
      const totalStock = skuList.reduce((sum, s) => sum + (s.skuStock || 0), 0);
      form.value.productStock = totalStock;
      form.value.stockStatus = totalStock > 0 ? "IN_STOCK" : "OUT_OF_STOCK";

      // 2. 计算商品最低价
      const prices = skuList.map(s => s.skuPrice || 0).filter(p => p > 0);
      form.value.displayPrice = prices.length ? Math.min(...prices) : 0;

      // 3. 商品主表
      const productPayload = {
        productId: form.value.productId || undefined,
        productSn: form.value.productSn,
        productName: form.value.productName,
        productDesc: form.value.productDesc,
        displayPrice: form.value.displayPrice,
        categoryId: form.value.categoryId,
        mainImage: form.value.mainImage || "",
        detailImages: form.value.detailImages || "",
        productStock: form.value.productStock,
        productStatus: form.value.productStatus,
        stockStatus: form.value.stockStatus
      };

      let productId = form.value.productId;

      // 4. 保存商品
      if (productId) {
        await updateProduct(productPayload);
        await deleteProductSkuByProductId(productId);
        await deleteProductSpecAttrByProductId(productId);
      } else {
        const res = await addProduct(productPayload);
        productId = res.data.productId;
      }

      // ======================
      // 5. 保存规格（✅ 关键：字符串转数组）
      // ======================
      for (let item of specList) {
        await addProductSpecAttr({
          productId: productId,
          attrName: item.attrName,
          // ✅ 这里自动把 “红色,蓝色” 变成 ["红色","蓝色"]
          attrValues: item.attrValues
            .split(/[,，]/)
            .map(i => i.trim())
            .filter(Boolean),
          attrType: "RADIO"
        });
      }

      // 6. 保存SKU
      for (let sku of skuList) {
        await addProductSku({
          productId: productId,
          skuCode: sku.skuCode,
          specCombo: sku.skuCombo,
          skuPrice: sku.skuPrice || 0,
          skuStock: sku.skuStock || 0,
          skuImage: sku.skuImage || ""
        });
      }

      ElMessage.success("商品 + 规格 + SKU 保存成功！");
      close();
    } catch (err) {
      console.error(err);
      ElMessage.error("提交失败");
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
