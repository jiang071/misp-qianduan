<template>
  <el-form
    ref="ruleFormRef"
    style="max-width: 600px"
    :model="ruleForm"
    :rules="rules"
    label-width="auto"
  >
    <el-form-item label="类别ID" prop="categoryId">
      <el-input v-model.number="ruleForm.categoryId" />
    </el-form-item>
    <el-form-item label="类别编号" prop="categorySn">
      <el-input v-model="ruleForm.categorySn" />
    </el-form-item>
    <el-form-item label="父级类别" prop="parentId">
      <el-select v-model="ruleForm.parentId" placeholder="请选择父级类别">
        <el-option
          v-for="item in parentCategoryOptions"
          :key="item.categoryId"
          :label="item.categoryName"
          :value="item.categoryId"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="类别名称" prop="categoryName">
      <el-input v-model="ruleForm.categoryName" />
    </el-form-item>
    <el-form-item label="类别状态" prop="status">
      <el-select v-model="ruleForm.status" placeholder="请选择类别状态">
        <el-option
          v-for="item in parentCategoryOptions"
          :key="item.categoryId"
          :label="item.categoryName"
          :value="item.categoryId"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="类别描述" prop="categoryDescription">
      <el-input v-model="ruleForm.categoryDescription" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm(ruleFormRef)">
        确定
      </el-button>
      <el-button @click="resetForm(ruleFormRef)">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, toRaw, watch } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { getCategoryById } from "@/api/pos/category";

const props = defineProps<{
  categoryId: number;
}>();

onMounted(() => {
  init();
});

function init() {
  if (props.categoryId) {
    getCategoryById(props.categoryId).then(res => {
      ruleForm.categoryId = res.data.categoryId;
      ruleForm.parentId = res.data.parentId;
      ruleForm.categoryName = res.data.categoryName;
    });
  } else {
    // 如果 categoryId 为空，则重置表单
    ruleForm.categoryId = null;
    ruleForm.parentId = 0;
    ruleForm.categoryName = "";
  }
}

/** 表单数据接口定义 */
interface RuleForm {
  categoryId?: number;
  parentId: number;
  categoryName: string;
  status: string;
  categoryDescription?: string;
  categorySn?: string;
}
const ruleFormRef = ref<FormInstance>(); //表单实例
const ruleForm = reactive<RuleForm>({
  //表单数据
  categoryId: null,
  parentId: 0,
  categoryName: "",
  status: "",
  categoryDescription: "",
  categorySn: ""
});

/** 父级类别下拉框选项列表 */
const parentCategoryOptions = [
  { categoryId: 0, categoryName: "顶级类别" },
  { categoryId: 1, categoryName: "类别1" },
  { categoryId: 2, categoryName: "类别2" },
  { categoryId: 3, categoryName: "类别3" }
];

/** 表单验证规则 */
const rules = reactive<FormRules<RuleForm>>({
  categoryId: [
    { required: true, message: "类别ID不能为空", trigger: "blur" },
    { type: "number", message: "必须为数字值", trigger: "blur" }
  ],
  parentId: [{ required: true, message: "父级ID不能为空", trigger: "blur" }],
  categoryName: [
    { required: true, message: "类别名称不能为空", trigger: "change" }
  ]
});
/** 提交表单 */
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      const form = toRaw(ruleForm);
      ElMessage.success(JSON.stringify(form));
    } else {
      console.log("校验不通过", fields);
    }
  });
};

/** 重置表单 */
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};
</script>
