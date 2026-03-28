<template>
  <el-form ref="formRef" :model="form" label-width="100px">
    <el-form-item label="订单编号">
      <el-input v-model="form.orderSn" disabled placeholder="自动生成" />
    </el-form-item>
    <el-form-item label="支付用户">
      <el-input v-model="form.payUserName" placeholder="请输入" />
    </el-form-item>
    <el-form-item label="支付金额">
      <el-input v-model="form.payAmount" type="number" placeholder="请输入" />
    </el-form-item>
    <el-form-item label="订单状态">
      <el-select v-model="form.orderStatus" placeholder="请选择">
        <el-option label="待支付" value="PENDING" />
        <el-option label="已支付" value="PAID" />
        <el-option label="已完成" value="COMPLETED" />
        <el-option label="已取消" value="CANCELED" />
      </el-select>
    </el-form-item>
    <el-form-item label="订单备注">
      <el-input v-model="form.remark" type="textarea" :rows="3" />
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
import { updateOrder } from "@/api/pos/order";
import type { Order } from "@/types/pos";

const props = defineProps<{ orderId?: number }>();
const emit = defineEmits(["close"]);

const formRef = ref<FormInstance>();
const form = reactive<Order>({
  orderSn: "",
  payUserName: "",
  payAmount: 0,
  orderStatus: "PENDING",
  remark: ""
});

watch(
  () => props.orderId,
  id => {
    if (id) {
      // 回显逻辑
    }
  },
  { immediate: true }
);

const submitForm = () => {
  updateOrder(form).then(() => {
    ElMessage.success("保存成功");
    emit("close");
  });
};
</script>

<style scoped>
.text-right {
  text-align: right;
}
</style>
