<template>
  <div>
    <el-card class="mb-4 box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="font-medium">平台介绍</span>
        </div>
      </template>
      <div class="intro-content">
        <p class="intro-text">
          本平台是一个<strong>宠物周边产品售卖</strong>的线上线下全域销售管理平台，
          面向管理者用户，适配线下门店<strong>POS收银场景</strong>，
          支持工作人员手动录入商品完成线下收银付款。
        </p>
        <p class="intro-text mt-4">
          后台<strong>商品管理中心</strong>可对商品分类、商品及其细化SKU进行增删改查。
          <strong>订单中心</strong
          >支持订单查询、修改、删除等操作，同时覆盖订单退换货全流 程操作。
          <strong>优惠券管理中心</strong
          >进行优惠券的分发、管理、查询、删除等操作，并内嵌 在POS收银体系内。
        </p>
        <p class="intro-text mt-4">
          平台采用<strong>RBAC权限管控机制</strong>，划分普通员工、经理级管理员多级账号权限，
          差异化开放后台操作权限，规避运营操作风险，适配门店分级管理模式。
          配套<strong>可视化数据面板</strong>，管理员可一键查看全站交易流水、用户账号、经
          营营收等核心数据， 完成数据复盘、站点运维、风险管控工作。
        </p>
      </div>
    </el-card>

    <el-card class="m-4 box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="font-medium">平台信息</span>
        </div>
      </template>
      <el-scrollbar>
        <PureDescriptions border :columns="columns" :column="4" />
      </el-scrollbar>
    </el-card>

    <el-card class="m-4 box-card dev-env-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="font-medium">开发环境介绍</span>
        </div>
      </template>

      <!-- 前端技术栈 -->
      <el-divider content-position="left">
        <span class="env-section-title">前端</span>
      </el-divider>
      <el-descriptions border :column="4" class="mb-4">
        <el-descriptions-item label="框架" label-align="right">
          Vue 3
        </el-descriptions-item>
        <el-descriptions-item label="构建工具" label-align="right">
          Vite 5
        </el-descriptions-item>
        <el-descriptions-item label="UI 组件库" label-align="right">
          Element Plus
        </el-descriptions-item>
        <el-descriptions-item label="状态管理" label-align="right">
          Pinia
        </el-descriptions-item>
        <el-descriptions-item label="路由" label-align="right">
          Vue Router 4
        </el-descriptions-item>
        <el-descriptions-item label="HTTP 请求" label-align="right">
          Axios
        </el-descriptions-item>
        <el-descriptions-item label="图表库" label-align="right">
          ECharts 5
        </el-descriptions-item>
        <el-descriptions-item label="CSS 方案" label-align="right">
          TailwindCSS + Sass
        </el-descriptions-item>
        <el-descriptions-item label="类型支持" label-align="right">
          TypeScript
        </el-descriptions-item>
        <el-descriptions-item label="工具库" label-align="right">
          Day.js / VueUse
        </el-descriptions-item>
        <el-descriptions-item label="代码规范" label-align="right">
          ESLint / Prettier
        </el-descriptions-item>
        <el-descriptions-item label="包管理" label-align="right">
          pnpm
        </el-descriptions-item>
      </el-descriptions>

      <!-- 后端技术栈 -->
      <el-divider content-position="left">
        <span class="env-section-title">后端</span>
      </el-divider>
      <el-descriptions border :column="4">
        <el-descriptions-item label="运行时" label-align="right">
          Node.js
        </el-descriptions-item>
        <el-descriptions-item label="后端框架" label-align="right">
          Spring Boot
        </el-descriptions-item>
        <el-descriptions-item label="语言" label-align="right">
          JavaScript
        </el-descriptions-item>
        <el-descriptions-item label="数据库" label-align="right">
          MySQL
        </el-descriptions-item>
        <el-descriptions-item label="构建工具" label-align="right">
          Maven
        </el-descriptions-item>
        <el-descriptions-item label="注册中心" label-align="right">
          Nacos
        </el-descriptions-item>
        <el-descriptions-item label="包管理" label-align="right">
          pnpm
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="m-4 box-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="font-medium">开发者介绍</span>
        </div>
      </template>
      <div class="dev-team">
        <el-row :gutter="20">
          <!-- 后端开发 -->
          <el-col :span="12">
            <el-card shadow="hover" class="member-card">
              <template #header>
                <div class="card-header">
                  <el-icon><icon-ep-avatar /></el-icon>
                  <span class="font-medium ml-2">后端开发</span>
                </div>
              </template>
              <div class="member-list">
                <div
                  v-for="member in memberList.filter(
                    m => m.role === '后端开发'
                  )"
                  :key="member.name"
                  class="member-item clickable-member"
                  @click="openMemberDialog(member)"
                >
                  <el-avatar :size="40" :src="member.avatar" />
                  <span class="member-name ml-2">{{ member.name }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
          <!-- 前端开发 -->
          <el-col :span="12">
            <el-card shadow="hover" class="member-card">
              <template #header>
                <div class="card-header">
                  <el-icon><icon-ep-avatar /></el-icon>
                  <span class="font-medium ml-2">前端开发</span>
                </div>
              </template>
              <div class="member-list">
                <div
                  v-for="member in memberList.filter(
                    m => m.role === '前端开发'
                  )"
                  :key="member.name"
                  class="member-item clickable-member"
                  @click="openMemberDialog(member)"
                >
                  <el-avatar :size="40" :src="member.avatar" />
                  <span class="member-name ml-2">{{ member.name }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="currentMember?.name"
      width="620px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div v-if="currentMember" class="member-dialog-content">
        <!-- 左侧头像区域 -->
        <div class="dialog-left">
          <img :src="currentMember.introImage" alt="头像" class="intro-image" />
        </div>
        <!-- 右侧信息 -->
        <div class="dialog-right">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="姓名" label-align="right" width="80">
              {{ currentMember.name }}
            </el-descriptions-item>
            <el-descriptions-item label="班级" label-align="right">
              {{ currentMember.className }}
            </el-descriptions-item>
            <el-descriptions-item label="学号" label-align="right">
              {{ currentMember.studentId }}
            </el-descriptions-item>
            <el-descriptions-item label="职位" label-align="right">
              <el-tag type="primary">{{ currentMember.position }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="个人介绍" label-align="right">
              {{ currentMember.intro }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useColumns } from "./columns";

// 导入头像
import avatarFanying from "@/assets/about/范颖.jpg";
import avatarLiangxiyi from "@/assets/about/梁熙怡.jpg";
import avatarJiangwanjing from "@/assets/about/江婉菁.jpg";
import avatarLiushengnan from "@/assets/about/刘盛楠.jpg";

defineOptions({
  name: "About"
});

// ========== 平台信息 ==========
const { pkg } = __APP_INFO__;
const { columns } = useColumns();

// ========== 开发者弹窗 ==========
interface MemberInfo {
  name: string;
  role: string;
  className: string;
  studentId: string;
  position: string;
  intro: string;
  avatar: string;
  introImage: string;
}

const memberList: MemberInfo[] = [
  {
    name: "范颖",
    role: "后端开发",
    className: "23信管4班",
    studentId: "202325710403",
    position: "架构师、后端程序员",
    intro: "不爱说话的工程师一枚呀~",
    avatar: avatarFanying,
    introImage: avatarFanying
  },
  {
    name: "梁熙怡",
    role: "后端开发",
    className: "23信管4班",
    studentId: "202325710412",
    position: "项目经理、后端程序员",
    intro: "一马当先，起到一个最先完成任务然后督促其他人的作用",
    avatar: avatarLiangxiyi,
    introImage: avatarLiangxiyi
  },

  {
    name: "江婉菁",
    role: "前端开发",
    className: "23信管4班",
    studentId: "202325710407",
    position: "测试员、前端程序员",
    intro: "小江今天也很努力呢！",
    avatar: avatarJiangwanjing,
    introImage: avatarJiangwanjing
  },
  {
    name: "刘盛楠",
    role: "前端开发",
    className: "23信管4班",
    studentId: "202325710413",
    position: "产品经理、前端程序员",
    intro: "稍等，产品还在写文档。",
    avatar: avatarLiushengnan,
    introImage: avatarLiushengnan
  }
];

const dialogVisible = ref(false);
const currentMember = ref<MemberInfo | null>(null);

function openMemberDialog(member: MemberInfo) {
  currentMember.value = member;
  dialogVisible.value = true;
}
</script>

<style lang="scss" scoped>
:deep(.main-label) {
  font-size: 16px !important;
  color: var(--el-color-danger) !important;
}

:deep(.pure-version) {
  font-size: 14px !important;
  font-weight: 600 !important;
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
}

.main-content {
  margin: 0 !important;
}

.env-section-title {
  font-size: 15px;
  font-weight: 700;
  color: #6c6c6c;
}

.dev-env-card {
  :deep(.el-card__body) {
    padding-top: 0;
  }
}

.clickable-member {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 8px;
  transition:
    background-color 0.3s,
    transform 0.2s;

  &:hover {
    background-color: var(--el-color-primary-light-9);
    transform: translateX(4px);

    .member-name {
      color: var(--el-color-primary);
    }
  }
}

.member-dialog-content {
  display: flex;
  gap: 24px;
  align-items: flex-start;

  .dialog-left {
    flex-shrink: 0;
    width: 200px;
    height: 200px;
    overflow: hidden;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;

    .intro-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .dialog-right {
    flex: 1;
    min-width: 0;
  }
}
</style>
