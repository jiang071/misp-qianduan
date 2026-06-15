<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { usePublicHooks } from "../hooks";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    permName: "",
    permCode: "",
    permType: "",
    typeName: "",
    remark: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}
function getFormData() {
  return { ...newFormInline.value };
}
defineExpose({ getRef, getFormData });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-form-item label="权限名称" prop="permName">
      <el-input
        v-model="newFormInline.permName"
        clearable
        placeholder="请输入权限名称"
      />
    </el-form-item>

    <el-form-item label="权限标识" prop="permCode">
      <el-input
        v-model="newFormInline.permCode"
        clearable
        placeholder="请输入权限标识"
      />
    </el-form-item>
    <el-form-item label="权限类型" prop="permType">
      <el-input
        v-model="newFormInline.permType"
        clearable
        placeholder="请输入权限类型"
      />
    </el-form-item>
    <el-form-item label="类型名称" prop="typeName">
      <el-input
        v-model="newFormInline.typeName"
        clearable
        placeholder="请输入类型名称"
      />
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="newFormInline.remark"
        clearable
        placeholder="请输入备注"
      />
    </el-form-item>
  </el-form>
</template>
