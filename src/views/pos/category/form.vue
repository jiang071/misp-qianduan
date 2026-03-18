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
    <el-form-item label="类别名称" prop="categoryName">
      <el-input v-model="ruleForm.categoryName" />
    </el-form-item>
    <el-form-item label="类别级别" prop="level">
      <el-select v-model="ruleForm.level" placeholder="请选择类别级别">
        <el-option label="第一级" value="1" />
        <el-option label="第二级" value="2" />
        <el-option label="第三级" value="3" />
      </el-select>
    </el-form-item>
    <el-form-item label="类别状态" prop="state">
      <el-select v-model="ruleForm.state" placeholder="请选择类别状态">
        <el-option label="上架" value="true" />
        <el-option label="下架" value="false" />
      </el-select>
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
  state: string;
  level: number;
}
const ruleFormRef = ref<FormInstance>(); //表单实例
const ruleForm = reactive<RuleForm>({
  //表单数据
  categoryId: null,
  parentId: 0,
  categoryName: "",
  state: "",
  level: null
});

/** 表单验证规则 */
const rules = reactive<FormRules<RuleForm>>({
  categoryId: [
    { required: true, message: "类别ID不能为空", trigger: "blur" },
    { type: "number", message: "必须为数字值", trigger: "blur" }
  ],
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
