import "./reset.css";
import dayjs from "dayjs";
import editForm from "../form/index.vue";
import { message } from "@/utils/message";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import type { FormItemProps } from "../utils/types";
import { getKeyList, hideTextAtIndex, deviceDetection } from "@pureadmin/utils";
import {
  getUserList,
  getAllRoleList,
  updateUser,
  addUser,
  deleteUser
} from "@/api/system";
import { ElMessageBox } from "element-plus";
import { type Ref, h, ref, computed, reactive, onMounted } from "vue";
import CryptoJS from "crypto-js";

export function useUser(tableRef: Ref) {
  const form = reactive({
    nickname: "",
    phone: "",
    userId: "",
    status: ""
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();
  const selectedNum = ref(0);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "勾选列", // 如果需要表格多选，此处label必须设置
      type: "selection",
      fixed: "left",
      reserveSelection: true // 数据刷新后保留选项
    },
    {
      label: "用户ID",
      prop: "id",
      width: 90
    },
    {
      label: "用户账号",
      prop: "userId",
      minWidth: 130
    },
    {
      label: "用户昵称",
      prop: "nickname",
      minWidth: 130
    },
    {
      label: "手机号码",
      prop: "phone",
      minWidth: 90,
      formatter: ({ phone }) => hideTextAtIndex(phone, { start: 3, end: 6 })
    },
    {
      label: "用户角色",
      prop: "roleCodeList",
      minWidth: 150,
      cellRenderer: scope => {
        const roleCodes = scope.row.roleCodeList;
        if (!roleCodes || roleCodes.length === 0) {
          return <el-tag type="info">无</el-tag>;
        }

        // 角色颜色映射
        const getTagType = (code: string): string => {
          switch (code) {
            case "SuperAdmin":
              return "danger"; // 红色
            case "Manager":
              return "success"; // 绿色
            case "Sales":
              return "warning"; // 橙色
            default:
              return "info"; // 灰色
          }
        };

        // 角色中文映射
        const roleMap: Record<string, string> = {
          SuperAdmin: "超级管理员",
          Manager: "门店管理员",
          Sales: "门店售卖员"
        };

        return (
          <div class="flex gap-1 flex-wrap justify-center">
            {roleCodes.map(code => (
              <el-tag type={getTagType(code)}>{roleMap[code] || code}</el-tag>
            ))}
          </div>
        );
      }
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 90,
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value={1}
          inactive-value={0}
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          style={switchStyle.value}
          onChange={() => onChange(scope as any)}
        />
      )
    },
    {
      label: "创建时间",
      minWidth: 90,
      prop: "createTime",
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];
  const buttonClass = computed(() => {
    return [
      "!h-[20px]",
      "reset-margin",
      "!text-gray-500",
      "dark:!text-white",
      "dark:hover:!text-primary"
    ];
  });
  const roleOptions = ref([]);
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
  function onChange({ row, index }) {
    const newStatus = row.status;
    const oldStatus = newStatus === 1 ? 0 : 1;
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.userId
      }</strong>用户吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(async () => {
        switchLoadMap.value[index] = { loading: true };
        try {
          // 调用更新接口
          const updateData = {
            id: row.id,
            status: newStatus
          };
          console.log(updateData);
          await updateUser(updateData);
          message("修改用户状态成功", { type: "success" });
          onSearch();
        } catch (error) {
          // 接口调用失败，恢复原状态
          row.status = oldStatus;
          message("修改失败，请重试", { type: "error" });
        } finally {
          switchLoadMap.value[index] = { loading: false };
        }
      })
      .catch(() => {
        // 用户取消，恢复原状态
        row.status = oldStatus;
      });
  }

  async function handleDelete(row) {
    try {
      await deleteUser([row.id]); // 传入包含当前用户ID的数组
      message(`成功删除用户编号为${row.id}的数据`, { type: "success" });
      onSearch(); // 刷新列表
    } catch (error) {
      message(error?.message || "删除失败，请重试", { type: "error" });
    }
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  /** 批量删除 */
  async function onbatchDel() {
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    const ids = getKeyList(curSelected, "id");
    try {
      await deleteUser(ids);
      message(`成功删除用户编号为 ${ids.join(", ")} 的数据`, {
        type: "success"
      });
      tableRef.value.getTableRef().clearSelection();
      onSearch();
    } catch (error) {
      message(error?.message || "批量删除失败", { type: "error" });
    }
  }

  async function onSearch() {
    loading.value = true;
    const searchParams: any = {};
    Object.keys(form).forEach(key => {
      const value = form[key];
      if (value !== "" && value !== null && value !== undefined) {
        searchParams[key] = value;
      }
    });
    const params = {
      ...searchParams,
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize
    };
    const res = await getUserList(params);
    dataList.value = res.data.list;
    pagination.total = res.data.total;
    pagination.currentPage = res.data.pageNum;
    pagination.pageSize = res.data.pageSize;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}用户`,
      props: {
        formInline: {
          title,
          id: row?.id,
          nickname: row?.nickname ?? "",
          userId: row?.userId ?? "",
          password: "",
          phone: row?.phone ?? "",
          status: row?.status ?? 1,
          roleCodeList: row?.roleCodeList ?? [],
          roleIdList: row?.roleIdList ?? [],
          roleOptions: roleOptions.value // 传递角色列表
        }
      },
      width: "46%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: async done => {
        const formComponent = formRef.value;
        const FormRef = formRef.value.getRef();
        const curData = formComponent.formData;
        const isValid = await FormRef.validate().catch(() => false);
        if (!isValid) return;
        try {
          if (title === "新增") {
            const encryptedPassword = encryptPassword(curData.password);
            const addData = {
              userId: curData.userId,
              nickname: curData.nickname,
              phone: curData.phone,
              password: encryptedPassword,
              status: curData.status,
              roleIdList: curData.roleIdList || []
            };
            await addUser(addData);
            message("新增用户成功", { type: "success" });
          } else {
            const updateData = {
              id: curData.id,
              userId: curData.userId,
              nickname: curData.nickname,
              phone: curData.phone,
              roleIdList: curData.roleIdList || [],
              roleCodeList: curData.roleCodeList || []
            };
            await updateUser(updateData);
            message("修改用户成功", { type: "success" });
          }
          done(); // 关闭弹窗
          onSearch(); // 刷新表格
        } catch (error) {
          message(error?.message || "操作失败", { type: "error" });
        }
      }
    });
  }

  onMounted(async () => {
    onSearch();
    // 角色列表
    roleOptions.value = (await getAllRoleList()).data;
  });

  return {
    form,
    loading,
    columns,
    dataList,
    selectedNum,
    pagination,
    buttonClass,
    deviceDetection,
    onSearch,
    resetForm,
    onbatchDel,
    openDialog,
    handleDelete,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange
  };
}
