<template>
  <div v-loading="loading">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="优惠券名称" prop="couponName">
            <el-input
              v-model="formData.couponName"
              placeholder="请输入优惠券名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优惠券编码" prop="couponCode">
            <el-input
              v-model="formData.couponCode"
              disabled
              placeholder="系统自动生成"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优惠券类型" prop="couponType">
            <!-- 编辑模式：只读 -->
            <el-input
              v-if="isEdit"
              :value="typeLabel"
              disabled
              style="width: 100%"
            />
            <!-- 新增模式：可选 -->
            <el-select
              v-else
              v-model="formData.couponType"
              placeholder="请选择类型"
              style="width: 100%"
              @change="onTypeChange"
            >
              <el-option label="满减券" :value="0" />
              <el-option label="折扣券" :value="1" />
              <el-option label="现金券" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优惠值" prop="discount">
            <div style="display: flex; align-items: center; width: 100%">
              <el-input-number
                v-model="formData.discount"
                :min="0"
                :max="formData.couponType === 1 ? 10 : undefined"
                :precision="2"
                style="flex: 1"
                :placeholder="
                  formData.couponType === 1 ? '折扣比例' : '满减金额或现金金额'
                "
              />
              <span
                v-if="formData.couponType === 1"
                style="margin-left: 6px; font-weight: bold; white-space: nowrap"
                >折</span
              >
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最低消费金额" prop="minAmount">
            <el-input-number
              v-model="formData.minAmount"
              :min="0"
              :precision="2"
              style="width: 100%"
              placeholder="0表示无门槛"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发放总量" prop="quantity">
            <el-input-number
              v-model="formData.quantity"
              :min="1"
              style="width: 100%"
              placeholder="可领取总数量"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="有效期开始" prop="validStartTime">
            <el-date-picker
              v-model="formData.validStartTime"
              type="datetime"
              placeholder="选择开始时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              :disabled="
                isEdit && (formData.status === 1 || formData.status === 2)
              "
              :disabled-date="disabledStartDate"
              @change="onStartChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="有效期结束" prop="validEndTime">
            <el-date-picker
              v-model="formData.validEndTime"
              type="datetime"
              placeholder="选择结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
              :disabled="
                isEdit && (formData.status === 1 || formData.status === 2)
              "
              :disabled-date="disabledEndDate"
              @change="onEndChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="statusDisplay"
              style="width: 100%"
              :disabled="formData.status === 2"
            >
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">
        保存
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { addCoupon, updateCoupon, listCouponByPage } from "@/api/pos/coupon";
import type { CouponInfo } from "@/types/pos";
import { computed } from "vue";

const typeLabel = computed(() => {
  switch (formData.couponType) {
    case 0:
      return "满减券";
    case 1:
      return "折扣券";
    case 2:
      return "现金券";
    default:
      return "";
  }
});

// 切换类型时，重置优惠值
const onTypeChange = () => {
  formData.discount = 0;
};

// ==================== Props / Emits ====================
const props = defineProps<{
  couponCode?: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "refresh"): void;
}>();

// ==================== 表单引用与数据 ====================
const formRef = ref<FormInstance>();
const loading = ref(false);
const saving = ref(false);
const isEdit = ref(false);

const formData = reactive<CouponInfo>({
  couponName: "",
  couponCode: "",
  couponType: 0,
  discount: 0,
  minAmount: 0,
  quantity: 1,
  remainQuantity: 0,
  validStartTime: "",
  validEndTime: "",
  status: 0
});

const statusDisplay = computed({
  get: (): number => (formData.status === 1 ? 1 : 0),
  set: (val: number) => {
    formData.status = val;
  }
});

const rules: FormRules = {
  couponName: [
    { required: true, message: "请输入优惠券名称", trigger: "blur" }
  ],
  couponType: [
    { required: true, message: "请选择优惠券类型", trigger: "change" }
  ],
  discount: [{ required: true, message: "请输入优惠值", trigger: "blur" }],
  quantity: [{ required: true, message: "请输入发放总量", trigger: "blur" }],
  validStartTime: [
    { required: true, message: "请选择有效期开始时间", trigger: "change" }
  ],
  validEndTime: [
    { required: true, message: "请选择有效期结束时间", trigger: "change" }
  ],
  status: [{ required: true, message: "请选择状态", trigger: "change" }]
};

// ==================== 编码生成 ====================
function generateCouponCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase(); // 约 8 位
  const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 位
  return (timestamp + random).slice(0, 12); // 截取前 12 位
}

// ==================== 初始化 ====================
onMounted(async () => {
  if (props.couponCode) {
    // 编辑模式
    isEdit.value = true;
    loading.value = true;
    try {
      const res = await listCouponByPage({
        pageNum: 1,
        pageSize: 1,
        couponCode: props.couponCode
      });
      const list = res.data.list || [];
      if (list.length > 0) {
        const item = list[0];
        formData.couponName = item.couponName;
        formData.couponCode = item.couponCode;
        formData.couponType = item.couponType;
        formData.discount = item.discount;
        formData.minAmount = item.minAmount;
        formData.quantity = item.quantity;
        formData.remainQuantity = item.remainQuantity;
        formData.validStartTime = item.validStartTime;
        formData.validEndTime = item.validEndTime;
        formData.status = item.status;
      } else {
        ElMessage.error("优惠券不存在");
        emit("close");
      }
    } catch {
      ElMessage.error("加载优惠券信息失败");
    } finally {
      loading.value = false;
    }
  } else {
    // 新增模式
    isEdit.value = false;
    formData.couponCode = generateCouponCode();
    formData.remainQuantity = formData.quantity;
  }
});

// ==================== 取消 ====================
function handleCancel() {
  emit("close");
}

// 日期禁用逻辑
const disabledStartDate = (time: Date) => {
  // 新增模式：只能从今天开始
  if (!isEdit.value) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return time.getTime() < today.getTime();
  }
  // 编辑模式：正常发放/已过期 → 整个选择器 disabled，不走到这里
  return false;
};

const disabledEndDate = (time: Date) => {
  // 结束时间必须在开始时间之后
  if (formData.validStartTime) {
    const start = new Date(formData.validStartTime);
    return time.getTime() <= start.getTime();
  }
  return false;
};

// 开始时间变化时，若结束时间早于开始时间则清空
const onStartChange = () => {
  if (
    formData.validEndTime &&
    new Date(formData.validEndTime) <= new Date(formData.validStartTime)
  ) {
    formData.validEndTime = "";
  }
  autoSetStatus();
};

// 结束时间变化时，自动判断状态
const onEndChange = () => {
  autoSetStatus();
};

// 自动设置状态：当前时间在有效期期间 → 正常发放(1)，否则保持
const autoSetStatus = () => {
  if (!formData.validStartTime || !formData.validEndTime) return;
  const now = new Date();
  const start = new Date(formData.validStartTime);
  const end = new Date(formData.validEndTime);
  if (now >= start && now <= end) {
    formData.status = 1; // 正常发放
  }
};

// ==================== 提交 ====================
async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  saving.value = true;
  try {
    const now = new Date();
    const endTime = new Date(formData.validEndTime);
    if (endTime < now) {
      formData.status = 2;
    }

    const submitData: CouponInfo = {
      couponName: formData.couponName,
      couponCode: formData.couponCode,
      couponType: formData.couponType,
      discount: formData.discount,
      minAmount: formData.minAmount,
      quantity: formData.quantity,
      remainQuantity: isEdit.value
        ? formData.remainQuantity
        : formData.quantity,
      validStartTime: formData.validStartTime,
      validEndTime: formData.validEndTime,
      status: formData.status,
      createTime: formData.createTime
    };

    // 🔥 拿返回值判断 code
    const res = isEdit.value
      ? await updateCoupon(submitData)
      : await addCoupon(submitData);

    if (res.code !== 200) {
      const msg = res.message || "";
      if (msg.includes("剩余量不能超过新的发行量")) {
        ElMessageBox.alert(
          "您修改的优惠券发行量小于已领取数量，请将发行量调至不小于当前领取数量的值",
          "无法修改",
          { confirmButtonText: "确定", type: "warning" }
        );
      } else {
        ElMessage.error(msg || "保存失败");
      }
      return;
    }

    ElMessage.success(isEdit.value ? "修改成功" : "新增成功");
    emit("refresh");
    emit("close");
  } catch {
    ElMessage.error("网络异常，保存失败");
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.form-footer {
  margin-top: 24px;
  text-align: right;
}
</style>
