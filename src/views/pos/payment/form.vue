<template>
  <el-form ref="formRef" :model="form" label-width="100px">
    <el-form-item label="订单编号">
      <el-input v-model="form.orderNo" disabled placeholder="自动生成" />
    </el-form-item>

    <el-form-item label="用户ID">
      <el-input v-model="form.userId" disabled placeholder="用户ID" />
    </el-form-item>

    <el-form-item label="支付用户">
      <el-input v-model="form.username" placeholder="请输入用户名称" />
    </el-form-item>

    <el-form-item label="支付金额">
      <el-input-number
        v-model="form.payAmount"
        :min="0"
        :precision="2"
        style="width: 100%"
        placeholder="支付金额"
      />
    </el-form-item>

    <el-form-item label="订单状态">
      <el-select v-model="form.orderStatus" placeholder="请选择">
        <el-option label="待支付" :value="0" />
        <el-option label="已支付" :value="1" />
        <el-option label="已完成" :value="2" />
        <el-option label="已取消" :value="3" />
      </el-select>
    </el-form-item>

    <el-form-item label="支付状态">
      <el-select v-model="form.payStatus" placeholder="请选择">
        <el-option label="未支付" :value="0" />
        <el-option label="已支付" :value="1" />
      </el-select>
    </el-form-item>

    <el-form-item class="text-right">
      <el-button @click="emit('close')">取消</el-button>
      <el-button type="primary" @click="submitForm">保存</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";

// 你的真实接口
import { getOrderItemsByOrderNo, updateOrder } from "@/api/pos/order";

// 你的真实类型
import type { Order } from "@/types/pos";

const props = defineProps<{
  orderId?: number;
  orderNo?: string; // 新增：用于查询订单详情
}>();
const emit = defineEmits(["close"]);

const formRef = ref<FormInstance>();
const form = reactive<Order>({
  id: 0,
  orderNo: "",
  userId: "",
  username: null,
  payAmount: null,
  orderStatus: 0,
  createTime: "",
  alipayTradeNo: null,
  payUrl: null,
  payTime: null,
  payStatus: 0
});

// 回显订单数据
watch(
  () => props.orderNo,
  async orderNo => {
    if (!orderNo) return;
    const res = await getOrderItemsByOrderNo(orderNo);
    Object.assign(form, res.data);
  },
  { immediate: true }
);

// 提交保存
const submitForm = async () => {
  await formRef.value?.validate();
  await updateOrder(form);
  ElMessage.success("保存成功");
  emit("close");
};
</script>

<style scoped>
.text-right {
  text-align: right;
}
</style>
