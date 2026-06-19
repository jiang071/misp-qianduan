<script setup lang="ts">
import { ref, toRef } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { usePublicHooks } from "../hooks";
const { switchStyle } = usePublicHooks();

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    roleName: "",
    roleCode: "",
    status: 1
  }),
  showStatus: false
});
const showStatus = toRef(props, "showStatus");

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
    <el-form-item label="角色名称" prop="roleName">
      <el-input
        v-model="newFormInline.roleName"
        clearable
        placeholder="请输入角色名称"
      />
    </el-form-item>

    <el-form-item label="角色标识" prop="roleCode">
      <el-input
        v-model="newFormInline.roleCode"
        clearable
        placeholder="请输入角色标识"
      />
    </el-form-item>
    <el-form-item v-if="showStatus" label="角色状态" prop="status">
      <el-switch
        v-model="newFormInline.status"
        inline-prompt
        :active-value="1"
        :inactive-value="0"
        active-text="启用"
        inactive-text="停用"
        :style="switchStyle"
      />
    </el-form-item>
  </el-form>
</template>
