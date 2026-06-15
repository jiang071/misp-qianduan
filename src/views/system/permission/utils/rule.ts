import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  permName: [{ required: true, message: "权限名称为必填项", trigger: "blur" }],
  permCode: [{ required: true, message: "权限标识为必填项", trigger: "blur" }],
  permType: [{ required: true, message: "权限类型为必填项", trigger: "blur" }],
  typeName: [{ required: true, message: "类型名称为必填项", trigger: "blur" }]
});
