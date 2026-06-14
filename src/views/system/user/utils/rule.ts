import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { isPhone } from "@pureadmin/utils";
import { REGEXP_PWD } from "@/utils/rule";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  nickname: [{ required: true, message: "用户昵称为必填项", trigger: "blur" }],
  userId: [{ required: true, message: "用户名称为必填项", trigger: "blur" }],
  password: [
    { required: true, message: "用户密码为必填项", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (!REGEXP_PWD.test(value)) {
          callback(
            new Error("密码格式应为8-18位数字、字母、符号的任意两种组合")
          );
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  phone: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback();
        } else if (!isPhone(value)) {
          callback(new Error("请输入正确的手机号码格式"));
        } else {
          callback();
        }
      },
      trigger: "blur"
      // trigger: "click" // 如果想在点击确定按钮时触发这个校验，trigger 设置成 click 即可
    }
  ]
});
