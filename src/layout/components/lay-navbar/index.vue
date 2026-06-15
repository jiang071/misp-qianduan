<script setup lang="ts">
import { reactive, ref } from "vue";
import { useNav } from "@/layout/hooks/useNav";
import LaySearch from "../lay-search/index.vue";
import LayNavMix from "../lay-sidebar/NavMix.vue";
import LaySidebarFullScreen from "../lay-sidebar/components/SidebarFullScreen.vue";
import LaySidebarBreadCrumb from "../lay-sidebar/components/SidebarBreadCrumb.vue";
import LaySidebarTopCollapse from "../lay-sidebar/components/SidebarTopCollapse.vue";
import { updateUserPassword } from "@/api/system";
import { useUserStoreHook } from "@/store/modules/user";
import LogoutCircleRLine from "@iconify-icons/ri/logout-circle-r-line";
import EditPen from "@iconify-icons/ep/edit-pen";
import Setting from "@iconify-icons/ri/settings-3-line";
import { passwordRules, REGEXP_PWD } from "@/utils/rule";
import {
  ElMessage,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  type FormItemRule
} from "element-plus";
import CryptoJS from "crypto-js";

const { layout, device, logout, onPanel, pureApp, username, toggleSideBar } =
  useNav();

const userStore = useUserStoreHook();
// 弹窗显示状态
const dialogVisible = ref(false);

// 表单数据
const passwordForm = reactive({
  newPassword: "",
  confirmPassword: ""
});

// 合并规则，添加 confirmPassword 的验证
const rules = reactive<Record<string, FormItemRule[]>>({
  ...passwordRules,
  confirmPassword: [
    {
      required: true,
      message: "请再次输入新密码",
      trigger: "blur"
    },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

// 表单引用
const passwordFormRef = ref();

function encryptPassword(password: string): string {
  if (!password) return "";
  const key = CryptoJS.enc.Utf8.parse("misp2024@scau!#1");
  const iv = CryptoJS.enc.Utf8.parse("misp2024@scau!#1");
  const encrypted = CryptoJS.AES.encrypt(password, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString(); // 默认返回 Base64 字符串
}

// 打开修改密码弹窗
const openPasswordDialog = () => {
  dialogVisible.value = true;
  // 重置表单
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
};

// 关闭弹窗
const closePasswordDialog = () => {
  dialogVisible.value = false;
};

// 修改密码
const handleUpdatePassword = async () => {
  passwordFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const encryptedPassword = encryptPassword(passwordForm.newPassword);
        await updateUserPassword({
          id: userStore.id ?? 0,
          password: encryptedPassword
        });
        ElMessage.success("密码修改成功");
        dialogVisible.value = false;
      } catch (error) {
        ElMessage.error("密码修改失败");
      }
    }
  });
};
</script>

<template>
  <div class="navbar bg-[#fff] shadow-sm shadow-[rgba(0,21,41,0.08)]">
    <LaySidebarTopCollapse
      v-if="device === 'mobile'"
      class="hamburger-container"
      :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />

    <LaySidebarBreadCrumb
      v-if="layout !== 'mix' && device !== 'mobile'"
      class="breadcrumb-container"
    />

    <LayNavMix v-if="layout === 'mix'" />

    <div v-if="layout === 'vertical'" class="vertical-header-right">
      <!-- 菜单搜索 -->
      <LaySearch id="header-search" />
      <!-- 全屏 -->
      <LaySidebarFullScreen id="full-screen" />
      <!-- 退出登录 -->
      <el-dropdown trigger="click">
        <span class="el-dropdown-link navbar-bg-hover select-none">
          <p v-if="username" class="dark:text-white">{{ username }}</p>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="openPasswordDialog">
              <IconifyIconOffline :icon="EditPen" style="margin: 5px" />
              修改密码
            </el-dropdown-item>
            <el-dropdown-item @click="logout">
              <IconifyIconOffline
                :icon="LogoutCircleRLine"
                style="margin: 5px"
              />
              退出系统
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span
        class="set-icon navbar-bg-hover"
        title="打开系统配置"
        @click="onPanel"
      >
        <IconifyIconOffline :icon="Setting" />
      </span>
    </div>
  </div>

  <!-- 修改密码弹窗 -->
  <ElDialog
    v-model="dialogVisible"
    title="修改密码"
    width="400px"
    :close-on-click-modal="false"
  >
    <ElForm
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="rules"
      label-width="100px"
    >
      <ElFormItem label="新密码" prop="newPassword">
        <ElInput
          v-model="passwordForm.newPassword"
          type="password"
          placeholder="请输入新密码"
        />
      </ElFormItem>
      <ElFormItem label="确认密码" prop="confirmPassword">
        <ElInput
          v-model="passwordForm.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <button
        type="button"
        class="el-button el-button--default"
        @click="closePasswordDialog"
      >
        取消
      </button>
      <button
        type="button"
        class="el-button el-button--primary"
        @click="handleUpdatePassword"
      >
        确定
      </button>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  height: 48px;
  overflow: hidden;

  .hamburger-container {
    float: left;
    height: 100%;
    line-height: 48px;
    cursor: pointer;
  }

  .vertical-header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 280px;
    height: 48px;
    color: #000000d9;

    .el-dropdown-link {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: 48px;
      padding: 10px;
      color: #000000d9;
      cursor: pointer;

      p {
        font-size: 14px;
      }
    }
  }

  .breadcrumb-container {
    float: left;
    margin-left: 16px;
  }
}

.logout {
  width: 120px;

  ::v-deep(.el-dropdown-menu__item) {
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 100%;
  }
}
</style>
