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
    <el-form-item label="所属第一级别" prop="firstlevel">
      <el-select
        v-model="ruleForm.firstlevel"
        placeholder="请选择一级类别"
        @change="handleFirstLevelChange"
      >
        <el-option
          v-for="item in level1Options"
          :key="item.categoryId"
          :label="item.categoryName"
          :value="item.categoryId"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="类别级别" prop="level">
      <el-select v-model="ruleForm.level" placeholder="请选择类别级别">
        <el-option label="第二级" value="2" />
        <el-option label="第三级" value="3" />
      </el-select>
    </el-form-item>
    <el-form-item
      v-if="ruleForm.level == 3"
      label="所属第二级别"
      prop="secondlevel"
    >
      <el-select v-model="ruleForm.secondlevel" placeholder="请选择二级类别">
        <el-option
          v-for="item in level2Options"
          :key="item.categoryId"
          :label="item.categoryName"
          :value="item.categoryId"
        />
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
import { onMounted, reactive, ref, toRaw, watch, nextTick } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { getCategoryById, listCategory, addCategory } from "@/api/pos/category";
import { Category } from "@/types/pos";

const props = defineProps<{
  categoryId: number | null;
}>();
const emit = defineEmits(["close", "refresh"]);

/** 表单数据接口定义 */
interface RuleForm {
  categoryId?: number;
  parentId: number;
  categoryName: string;
  state: string;
  level: number;
  firstlevel?: number;
  secondlevel?: number;
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
onMounted(() => {
  // 先加载类别下拉框数据，再初始化表单
  loadCategoryOptions().then(() => {
    init();
  });
});
// 一级类别下拉框选项（level=1）
const level1Options = ref<Category[]>([]);
// 二级类别下拉框选项（level=2）
const level2Options = ref<Category[]>([]);
const allLevel2Options = ref<Category[]>([]);
function init() {
  // 如果 categoryId 为空，则重置表单
  ruleForm.categoryId = null;
  ruleForm.parentId = 0;
  ruleForm.categoryName = "";
  ruleForm.level = null;
  ruleForm.state = "";
  ruleForm.firstlevel = null;
  ruleForm.secondlevel = null;
  console.log("props.categoryId", props.categoryId);
  if (props.categoryId) {
    getCategoryById(props.categoryId).then(res => {
      ruleForm.categoryId = res.data.categoryId;
      ruleForm.parentId = res.data.parentId;
      ruleForm.categoryName = res.data.categoryName;
      ruleForm.level = res.data.level;
      ruleForm.state = res.data.state ? "true" : "false";
      if (res.data.level === 2) {
        ruleForm.firstlevel = res.data.parentId;
      } else if (res.data.level === 3) {
        // 先找二级类别的parentId（即一级类别ID）
        const level2Item = allLevel2Options.value.find(
          item => item.categoryId === res.data.parentId
        );
        if (level2Item) {
          // 增加非空判断，避免undefined
          ruleForm.firstlevel = level2Item.parentId;
          // 2. 先触发一级类别变更，筛选出对应的二级下拉框选项
          handleFirstLevelChange(ruleForm.firstlevel);
          // 3. 等下拉框选项加载完成后，再赋值二级类别
          nextTick(() => {
            ruleForm.secondlevel = res.data.parentId;
          });
        }
        ruleForm.firstlevel = level2Item?.parentId;
        handleFirstLevelChange(level2Item?.parentId);
        ruleForm.secondlevel = res.data.parentId;
      }
    });
  }
}
/** 加载一级/二级类别下拉框数据 */
async function loadCategoryOptions() {
  try {
    const res = await listCategory();
    const allCategory = res.data || [];
    // 筛选level=1的类别作为一级下拉框数据
    level1Options.value = allCategory.filter(item => item.level === 1);
    // 筛选level=2的类别作为二级下拉框数据
    allLevel2Options.value = allCategory.filter(item => item.level === 2);
    level2Options.value = [];
  } catch (err) {
    ElMessage.error("加载类别下拉框数据失败");
    console.error(err);
  }
}
function handleFirstLevelChange(firstLevelId: number) {
  // 重置二级类别选中值
  ruleForm.secondlevel = null;
  // 筛选当前一级类别下的二级类别（parentId = 一级类别ID）
  if (firstLevelId) {
    level2Options.value = allLevel2Options.value.filter(
      item => item.parentId === firstLevelId
    );
  } else {
    // 未选一级类别时，清空二级类别
    level2Options.value = [];
  }
}
watch(
  () => ruleForm.firstlevel,
  newVal => {
    handleFirstLevelChange(newVal);
  },
  { immediate: false }
);

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
  console.log("form.categoryId", ruleForm.categoryId);
  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      const form = toRaw(ruleForm);
      if (form.level == 2) {
        form.parentId = form.firstlevel;
      } else if (form.level == 3) {
        form.parentId = form.secondlevel;
      }
      const requestData: Category = {
        categoryId: form.categoryId,
        parentId: form.parentId,
        categoryName: form.categoryName,
        state: form.state === "true",
        level: Number(form.level),
        path: "" // 路径由后端生成（如0,1,5），前端无需传入
      };
      try {
        if (props.categoryId) {
          // 有categoryId则为修改操作
          await updateCategory(requestData);
          ElMessage.success("修改类别成功！");
        } else {
          // 无categoryId则为新增操作
          await addCategory(requestData);
          ElMessage.success("新增类别成功！");
        }
        emit("close"); // 关闭弹窗
        emit("refresh"); // 通知父组件刷新列表
      } catch (err: any) {
        ElMessage.error(
          `${form.categoryId ? "修改" : "新增"}失败：${err.message || "服务器错误"}`
        );
        console.error(`${form.categoryId ? "修改" : "新增"}接口报错：`, err);
      }
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
