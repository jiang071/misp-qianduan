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
              :readonly="true"
              class="readonly-input"
            />
          </template>
        </el-table-column>
        <el-table-column label="组合描述" min-width="180">
          <template #default="{ row }">
            <el-input
              :value="formatSkuCombo(row.specCombo)"
              size="small"
              :readonly="true"
              class="readonly-input"
            />
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
            <div v-if="row.skuImage" style="margin-bottom: 4px">
              <span
                v-if="row.skuImage"
                style="color: #1677ff; cursor: pointer"
                @click="openPreview(row.skuImage)"
              >
                点击查看
              </span>
            </div>
            <el-input
              v-model="row.skuImage"
              placeholder="URL"
              size="small"
              disabled
            >
              <template #append>
                <el-button size="small" @click="uploadSkuImage(row)"
                  >上传</el-button
                >
              </template>
            </el-input>
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
    <el-form-item label="上传主图" prop="mainImage">
      <div v-if="form.mainImage" style="margin-bottom: 8px">
        <span
          style="color: #1677ff; cursor: pointer"
          @click="openPreview(form.mainImage)"
        >
          点击查看主图
        </span>
      </div>
      <el-input v-model="form.mainImage" placeholder="请输入图片URL" disabled>
        <template #append>
          <el-button @click="uploadImage('image')">上传</el-button>
        </template>
      </el-input>
    </el-form-item>

    <!-- 详情图URL -->
    <el-form-item label="上传详情图" prop="detailImages">
      <div
        v-if="form.detailImages"
        style="margin-bottom: 8px; display: flex; gap: 8px; flex-wrap: wrap"
      >
        <a
          v-for="(url, idx) in JSON.parse(form.detailImages || '[]')"
          :key="idx"
          style="color: #1677ff; cursor: pointer"
          @click.prevent="openPreview(url)"
        >
          详情图{{ Number(idx) + 1 }}
        </a>
      </div>
      <el-input v-model="form.detailImages" placeholder="请上传详情图" disabled>
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

  <!-- 图片预览弹窗 -->
  <el-image-viewer
    v-if="showViewer"
    :url-list="[previewUrl]"
    @close="showViewer = false"
  />
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, toRef, watch } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules
} from "element-plus";
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
  deleteProductSpecAttrByProductId,
  getProductBySn,
  addProductSkus
} from "@/api/pos/product";
import { Category, Product, ProductSku, ProductSpecAttr } from "@/types/pos";
import { ossUpload } from "@/api/pos/oss";

const props = defineProps<{
  productId?: number;
}>();

const emit = defineEmits(["success"]);

const form = reactive({
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
  productStatus: "onsale", // 默认上架
  stockStatus: "OUT_OF_STOCK",
  createTime: "",
  updateTime: "",
  specAttrList: [],
  skuList: []
});
const ruleFormRef = ref<FormInstance>();
const categoryTreeRef = ref(); // 树形选择器ref
const categoryTreeOptions = ref<any[]>([]); // 树形分类数据

// ====================== 规格维度：添加 / 删除（完全使用 ProductSpecAttr） ======================
const addSpecAttr = () => {
  if (!form.specAttrList) {
    form.specAttrList = [];
  }
  form.specAttrList.push({
    attrId: undefined,
    productId: undefined,
    attrName: "",
    attrValues: "",
    attrType: "RADIO"
  });
};

// ====================== 修复：删除规格维度 ======================
// 删除规格维度（带二次确认 + 数据库删除）
const removeSpecAttr = async (index: number) => {
  const item = form.specAttrList[index];
  if (!item) return;

  // 如果有 attrId，说明已保存到数据库，需要二次确认 + 删库
  if (item.attrId) {
    try {
      await ElMessageBox.confirm("确定要删除该规格维度吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      });

      // 调用后端删除数据库
      await deleteProductSpecAttr(item.attrId);
      ElMessage.success("规格维度已从数据库删除");

      // 删除成功后再删除前端数据
      form.specAttrList.splice(index, 1);
    } catch (err: any) {
      console.error("删除规格失败：", err);

      // ====================== 核心：弹出后端返回的提示弹窗 ======================
      let msg = "删除失败，该规格维度正在使用中";
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }

      // 弹出确认弹窗（只有确定按钮）
      await ElMessageBox.alert(msg, "提示", {
        confirmButtonText: "确定",
        type: "error"
      });
    }
  } else {
    // 没有保存过，直接删前端
    form.specAttrList.splice(index, 1);
  }
};

// ====================== 核心：自动生成规则 SKU 编码（不重复） ======================
const generateSkuFromAttr = () => {
  const attrs = form.specAttrList;
  if (!attrs || attrs.length === 0) {
    ElMessage.warning("请先添加规格维度");
    return;
  }

  // 1. 从商品编码 SNxxxx 取出前4位数字
  const sn = form.productSn || "";
  const prefixNum = sn.replace(/\D/g, "").padEnd(4, "0").slice(0, 4);

  // 2. 解析规格值（兼容 字符串 / 数组，彻底修复报错）
  const dims = attrs.map(attr => {
    let values = [];
    // 兼容数据库数组 & 前端输入字符串
    if (typeof attr.attrValues === "string") {
      values = attr.attrValues
        .split(/[,，]/)
        .map(v => v.trim())
        .filter(Boolean);
    } else if (Array.isArray(attr.attrValues)) {
      values = attr.attrValues;
    }

    return {
      name: attr.attrName,
      values: values
    };
  });

  // 3. 笛卡尔积生成组合
  const combinations = [];
  function dfs(idx, curr) {
    if (idx === dims.length) {
      combinations.push([...curr]);
      return;
    }
    dims[idx].values.forEach(v => {
      dfs(idx + 1, [...curr, `${dims[idx].name}:${v}`]);
    });
  }
  dfs(0, []);

  // 4. 生成新SKU
  const existingCodes = new Set(
    form.skuList.map(sku => sku.skuCode).filter(Boolean)
  );

  let seqNum = 1001; // 起始序号
  const newSkus = combinations.map(combo => {
    // 找到未使用的最小序号
    while (existingCodes.has(`SKU${prefixNum}${seqNum}`)) {
      seqNum++;
    }

    const skuCode = `SKU${prefixNum}${seqNum}`;
    existingCodes.add(skuCode); // 加入已使用集合
    seqNum++; // 序号自增
    return {
      skuId: undefined,
      productId: undefined,
      skuCode: skuCode,
      specCombo: combo,
      skuPrice: form.displayPrice || 0,
      skuStock: 0,
      skuImage: ""
    };
  });

  // ==========================================
  // ✅ 保留旧SKU + 追加新SKU + 强制视图刷新
  // ==========================================
  form.skuList = [...form.skuList, ...newSkus];

  ElMessage.success("已生成新SKU，新旧同时显示");
};

// ====================== SKU 删除 ======================
// 删除 SKU（带二次确认 + 数据库删除）
const removeSku = async (index: number) => {
  const sku = form.skuList[index];
  if (!sku) return;

  // 如果有 skuId，说明已保存，需要确认 + 删库
  if (sku.skuId) {
    try {
      await ElMessageBox.confirm("确定要删除该SKU吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      });

      // 调用后端删除数据库
      await deleteProductSkuBySkuId(sku.skuId);
      ElMessage.success("SKU已从数据库删除");
    } catch {
      ElMessage.info("已取消删除");
      return;
    }
  }

  // 删除前端列表
  form.skuList.splice(index, 1);
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
  if (!form.skuList) {
    form.skuList = [];
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

  form.skuList.push(newSku);
};

// 验证规格编码唯一性
const validateSkuCode = (currentIndex: number) => {
  const currentSku = form.skuList[currentIndex];
  if (!currentSku.skuCode) return;

  const hasDuplicate = form.skuList.some(
    (sku, index) => index !== currentIndex && sku.skuCode === currentSku.skuCode
  );

  if (hasDuplicate) {
    ElMessage.warning("规格编码不能重复");
  }
};

// 验证规格列表
const validateSkuList = (): boolean => {
  // 规格为可选：如果没有规格，视为通过验证
  if (!form.skuList || form.skuList.length === 0) {
    return true;
  }

  for (let i = 0; i < form.skuList.length; i++) {
    const sku = form.skuList[i];
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

    // 关键：如果没有 ID = 新增，必须清空所有数据
    if (!newVal) {
      Object.assign(form, {
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
        productStatus: "onsale",
        stockStatus: "OUT_OF_STOCK",
        specAttrList: [], //  清空规格
        skuList: [] // 清空SKU
      });
      return;
    }

    if (newVal) {
      const res = await getProductById(newVal);
      Object.assign(form, res.data);

      // 确保状态正确回显
      if (form.productStatus === "onsale") {
        form.productStatus = "onsale";
      } else if (form.productStatus === "offshelf") {
        form.productStatus = "offshelf";
      }

      //显示SKu
      const [specRes, skuRes] = await Promise.all([
        getProductSpecAttrById(newVal),
        getProductSkuByProductId(newVal)
      ]);

      // 回填规格
      form.specAttrList = specRes.data || [];

      // 回填SKU
      // 回填SKU（后端返回的就是数组，直接用！）
      form.skuList = skuRes.data || [];
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

    //校验商品编码不重复
    try {
      const checkRes = await getProductBySn(form.productSn);
      const existProduct = checkRes.data;

      // 情况1：新增商品 → 只要查到就重复
      if (!form.productId && existProduct) {
        ElMessage.error("输入商品编码重复");
        return;
      }

      // 情况2：编辑商品 → 只有查到别的商品才重复
      if (
        form.productId &&
        existProduct &&
        existProduct.productId !== form.productId
      ) {
        ElMessage.error("输入商品编码重复");
        return;
      }
    } catch (err) {
      // 接口报错（比如404）= 不重复，正常提交
      console.log("商品编码校验通过");
    }

    const skuList = form.skuList || [];
    const specList = form.specAttrList || [];

    try {
      // 1. 计算总库存
      const totalStock = skuList.reduce((sum, s) => sum + (s.skuStock || 0), 0);
      form.productStock = totalStock;
      form.stockStatus = totalStock > 0 ? "IN_STOCK" : "OUT_OF_STOCK";

      // 2. 计算商品最低价
      const prices = skuList.map(s => s.skuPrice || 0).filter(p => p > 0);
      form.displayPrice = prices.length ? Math.min(...prices) : 0;

      // 3. 商品主表
      const productPayload = {
        productId: form.productId || undefined,
        productSn: form.productSn,
        productName: form.productName,
        productDesc: form.productDesc,
        displayPrice: form.displayPrice,
        categoryId: form.categoryId,
        mainImage: form.mainImage || "",
        detailImages: form.detailImages || "",
        productStock: form.productStock,
        productStatus: form.productStatus,
        stockStatus: form.stockStatus
      };

      let productId = form.productId;

      // 4. 保存商品
      if (productId) {
        await updateProduct(productPayload);
        await deleteProductSkuByProductId(productId);
        await deleteProductSpecAttrByProductId(productId);
      } else {
        await addProduct(productPayload);
        const res = await getProductBySn(form.productSn); // 获取新创建的商品ID
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
          attrValues: Array.isArray(item.attrValues)
            ? item.attrValues
            : item.attrValues
                .split(/[,，]/)
                .map(i => i.trim())
                .filter(Boolean),
          attrType: "RADIO"
        });
      }

      // 6. 保存SKU
      if (skuList.length > 0) {
        const batchSkus = skuList.map(sku => ({
          skuId: undefined,
          productId: productId,
          skuCode: sku.skuCode,
          specCombo: sku.specCombo,
          skuPrice: sku.skuPrice || 0,
          skuStock: sku.skuStock || 0,
          skuImage: sku.skuImage || ""
        }));
        await addProductSkus(batchSkus);
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
  resetForm(ruleFormRef.value);
  emit("success");
}

// 上传图片
// 上传图片到 OSS
const uploadImage = async (type: "image" | "detail") => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    try {
      ElMessage.info("正在上传...");
      const res = await ossUpload(file);
      const url = res.data;

      if (type === "image") {
        // 主图：只允许1张，直接覆盖
        form.mainImage = url;
      } else {
        // 详情图：允许多张，拼接成 JSON 数组字符串
        let list: string[] = [];
        if (form.detailImages) {
          try {
            list = JSON.parse(form.detailImages);
          } catch {}
        }
        // 去重 + 追加
        if (!list.includes(url)) list.push(url);
        form.detailImages = JSON.stringify(list);
      }

      ElMessage.success("上传成功");
    } catch (err) {
      console.error(err);
      ElMessage.error("上传失败");
    }
  };
  input.click();
};

// 格式化 SKU 组合描述（数组 → 字符串）
const formatSkuCombo = (combo: any) => {
  if (!combo) return "";
  // 如果是数组，转成逗号分隔字符串
  if (Array.isArray(combo)) {
    return combo.join(",");
  }
  return combo;
};

// 专门给 SKU 上传图片
// SKU 图片上传（修复TS类型错误）
// 专门给 SKU 上传图片
// SKU 图片上传（单张 + 预览）
const uploadSkuImage = async (row: ProductSku) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    try {
      ElMessage.info("上传中...");
      const res = await ossUpload(file);
      row.skuImage = res.data;
      ElMessage.success("上传成功");
    } catch (err) {
      console.error(err);
      ElMessage.error("上传失败");
    }
  };
  input.click();
};

// 图片预览
const showViewer = ref(false);
const previewUrl = ref("");

// 打开预览
const openPreview = (url: string) => {
  if (!url) return;
  previewUrl.value = url;
  showViewer.value = true;
};
</script>

<style scoped>
.el-input,
.el-select,
.el-input-number {
  width: 100%;
}
</style>
