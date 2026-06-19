import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import {
  getRoleList,
  getMenuList,
  addRole,
  updateRole,
  deleteRole,
  updateRoleMenus,
  getAllPermissionList,
  updateRolePermissions
} from "@/api/system";
import {
  type Ref,
  reactive,
  ref,
  onMounted,
  h,
  toRaw,
  watch,
  nextTick
} from "vue";

export function useRole(treeRef: Ref) {
  const form = reactive({
    roleName: "",
    roleCode: "",
    status: ""
  });
  const curRow = ref();
  const formRef = ref();
  const dataList = ref([]);
  const treeIds = ref([]);
  const treeData = ref([]);
  const isShow = ref(false);
  const loading = ref(true);
  const isLinkage = ref(true);
  const treeSearchValue = ref();
  const switchLoadMap = ref({});
  const isExpandAll = ref(false);
  const isSelectAll = ref(false);
  const { switchStyle } = usePublicHooks();

  const permTreeRef = ref(); // 接口权限树组件实例
  const permTreeData = ref([]); // 接口权限树数据
  const permTreeIds = ref<number[]>([]); // 所有权限节点id（用于全选）
  const permSearchValue = ref(""); // 接口权限搜索关键字
  const permIsExpandAll = ref(false); // 接口权限展开/折叠
  const permIsSelectAll = ref(false); // 接口权限全选/全不选
  const permIsLinkage = ref(true); // 接口权限父子联动

  const permTreeProps = {
    value: "id",
    label: "label",
    children: "children"
  };

  // 构建接口权限树（将后端返回的分组数据转为树形结构）
  const buildPermissionTree = (data: any[]) => {
    return data.map(group => ({
      id: group.type, // 使用 type 作为父节点唯一标识
      label: group.typeName,
      children: group.permission.map(perm => ({
        id: perm.id,
        label: perm.permName,
        permCode: perm.permCode,
        // 保留原始数据以便需要时使用
        ...perm
      }))
    }));
  };

  // 递归收集权限树所有节点id
  const collectPermIds = (nodes: any[]): number[] => {
    let ids: number[] = [];
    nodes.forEach(node => {
      ids.push(node.id);
      if (node.children && node.children.length) {
        ids.push(...collectPermIds(node.children));
      }
    });
    return ids;
  };
  const treeProps = {
    value: "id",
    label: "title",
    children: "children"
  };
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "角色编号",
      prop: "id"
    },
    {
      label: "角色名称",
      prop: "roleName"
    },
    {
      label: "角色标识",
      prop: "roleCode"
    },
    {
      label: "状态",
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
      ),
      minWidth: 90
    },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 160,
      formatter: ({ createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];
  // const buttonClass = computed(() => {
  //   return [
  //     "!h-[20px]",
  //     "reset-margin",
  //     "!text-gray-500",
  //     "dark:!text-white",
  //     "dark:hover:!text-primary"
  //   ];
  // });

  function onChange({ row, index }) {
    const newStatus = row.status;
    const oldStatus = newStatus === 1 ? 0 : 1;
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.roleName
      }</strong>吗?`,
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
          await updateRole({
            id: row.id,
            status: newStatus
          });
          // 成功提示
          message("修改角色状态成功", { type: "success" });
          onSearch();
        } catch (error) {
          row.status = oldStatus;
          message("操作失败", { type: "error" });
        } finally {
          switchLoadMap.value[index] = { loading: false };
        }
      })
      .catch(() => {
        // 用户点击取消，恢复原状态
        row.status = oldStatus;
      });
  }
  async function handleDelete(row) {
    try {
      await deleteRole(row.id);
      message(`成功删除用户编号为 ${row.id} 的数据`, {
        type: "success"
      });
      onSearch();
    } catch (error) {
      message(error?.message || "删除失败", { type: "error" });
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

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  async function onSearch() {
    loading.value = true;
    try {
      const params = {
        ...toRaw(form),
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize
      };
      const { data } = await getRoleList(params);
      dataList.value = data.list;
      pagination.total = data.total;
      pagination.pageSize = data.pageSize;
      pagination.currentPage = data.pageNum;
    } catch (error) {
      message("查询失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    const isAdd = title === "新增";
    const formInline = {
      roleName: row?.roleName ?? "",
      roleCode: row?.roleCode ?? "",
      status: isAdd ? 1 : row?.status
    };
    const showStatus = isAdd;
    addDialog({
      title: `${title}角色`,
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () =>
        h(editForm, {
          ref: formRef,
          formInline: formInline,
          showStatus: showStatus
        }),
      beforeSure: done => {
        const FormRef = formRef.value.getRef();
        const curData = formRef.value.getFormData();
        function chores() {
          message(`您${title}了角色名称为${curData.roleName}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async valid => {
          if (!valid) return;
          if (valid) {
            // 表单规则校验通过
            if (title === "新增") {
              try {
                await addRole({
                  roleName: curData.roleName,
                  roleCode: curData.roleCode,
                  status: curData.status
                });
                chores();
              } catch (error) {
                message("新增失败", { type: "error" });
              }
            } else {
              try {
                await updateRole({
                  id: row?.id,
                  roleName: curData.roleName,
                  roleCode: curData.roleCode
                });
                chores();
              } catch (error) {
                message("修改失败", { type: "error" });
              }
            }
          }
        });
      }
    });
  }

  // 加载接口权限列表
  const loadPermissionTree = async () => {
    const { data } = await getAllPermissionList();
    const tree = buildPermissionTree(data);
    permTreeData.value = tree;
    permTreeIds.value = collectPermIds(tree);
  };

  /** 菜单权限 */
  async function handleMenu(row?: any) {
    const { id, routeIdList, permissionIdList } = row;
    if (id) {
      curRow.value = row;
      isShow.value = true;
      await nextTick();
      treeRef.value?.setCheckedKeys(routeIdList || []);
      // 设置权限树勾选
      if (permTreeRef.value) {
        permTreeRef.value.setCheckedKeys(permissionIdList || []);
      }
    } else {
      curRow.value = null;
      isShow.value = false;
    }
  }

  /** 高亮当前权限选中行 */
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : ""
    };
  }

  /** 菜单权限-保存 */
  async function saveMenuPermissions() {
    const { id, roleName } = curRow.value;
    const checkedKeys = treeRef.value?.getCheckedKeys() || [];
    try {
      await updateRoleMenus({
        roleId: id,
        routeIds: checkedKeys
      });
      message(`角色「${roleName}」的菜单权限修改成功`, { type: "success" });
      onSearch();
    } catch (error) {
      message("保存失败", { type: "error" });
    }
  }
  // 接口权限保存
  async function savePermissionPermissions() {
    const { id, roleName } = curRow.value;
    let checkedKeys = permTreeRef.value?.getCheckedKeys() || [];
    checkedKeys = checkedKeys.filter(key => typeof key === "number");
    try {
      await updateRolePermissions({
        roleId: id,
        permissionIds: checkedKeys
      });
      message(`角色「${roleName}」的接口权限修改成功`, { type: "success" });
      onSearch();
    } catch (error) {
      message("保存失败", { type: "error" });
    }
  }

  const onQueryChanged = (query: string) => {
    treeRef.value!.filter(query);
  };

  const filterMethod = (query: string, node) => {
    return node.title!.includes(query);
  };

  // 在 onMounted 中同时加载菜单树和权限树
  onMounted(async () => {
    onSearch();
    const menuData = await getMenuList();
    treeData.value = menuData.data;
    treeIds.value = collectIds(menuData.data); // collectIds 需提前定义

    await loadPermissionTree(); // 加载权限树
  });
  // 定义 collectIds（用于菜单树）
  const collectIds = (nodes: any[]): number[] => {
    let ids: number[] = [];
    nodes.forEach(node => {
      ids.push(node.id);
      if (node.children && node.children.length) {
        ids.push(...collectIds(node.children));
      }
    });
    return ids;
  };

  watch(isExpandAll, val => {
    val
      ? treeRef.value.setExpandedKeys(treeIds.value)
      : treeRef.value.setExpandedKeys([]);
  });

  watch(isSelectAll, val => {
    val
      ? treeRef.value.setCheckedKeys(treeIds.value)
      : treeRef.value.setCheckedKeys([]);
  });
  // 监听权限树的展开/全选
  watch(permIsExpandAll, val => {
    val
      ? permTreeRef.value?.setExpandedKeys(permTreeIds.value)
      : permTreeRef.value?.setExpandedKeys([]);
  });
  watch(permIsSelectAll, val => {
    val
      ? permTreeRef.value?.setCheckedKeys(permTreeIds.value)
      : permTreeRef.value?.setCheckedKeys([]);
  });

  return {
    form,
    isShow,
    curRow,
    loading,
    columns,
    rowStyle,
    dataList,
    treeData,
    treeProps,
    isLinkage,
    pagination,
    isExpandAll,
    isSelectAll,
    treeSearchValue,
    // buttonClass,
    onSearch,
    resetForm,
    openDialog,
    handleMenu,
    handleDelete,
    filterMethod,
    onQueryChanged,
    // handleDatabase,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    permTreeRef,
    permTreeData,
    permTreeProps,
    permSearchValue,
    permIsExpandAll,
    permIsSelectAll,
    permIsLinkage,
    saveMenuPermissions,
    savePermissionPermissions,
    // 添加权限树的 filter 方法
    onPermQueryChanged: (query: string) => {
      permTreeRef.value?.filter(query);
    },
    permFilterMethod: (query: string, node: any) => {
      return node.label?.includes(query);
    }
  };
}
