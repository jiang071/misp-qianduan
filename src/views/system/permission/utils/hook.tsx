import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection, getKeyList } from "@pureadmin/utils";
import {
  addPermission,
  updatePermission,
  deletePermission,
  getAllPermissionListByPage,
  deletePermissions
} from "@/api/system";
import { type Ref, reactive, ref, onMounted, h, toRaw } from "vue";

export function useRole(tableRef: Ref) {
  const form = reactive({
    permName: "",
    typeName: ""
  });
  const curRow = ref();
  const formRef = ref();
  const dataList = ref([]);
  const treeData = ref([]);
  const isShow = ref(false);
  const loading = ref(true);
  const isLinkage = ref(true);
  const treeSearchValue = ref();
  const isExpandAll = ref(false);
  const isSelectAll = ref(false);
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
      label: "权限编号",
      prop: "id"
    },
    {
      label: "权限名称",
      prop: "permName"
    },
    {
      label: "权限标识",
      prop: "permCode"
    },
    {
      label: "权限类型",
      prop: "permType"
    },
    {
      label: "类型名称",
      prop: "typeName"
    },
    {
      label: "备注",
      prop: "remark"
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

  async function handleDelete(row) {
    try {
      await deletePermission(row.id);
      message(`成功删除权限编号为 ${row.id} 的数据`, {
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

  async function onSearch() {
    loading.value = true;
    try {
      const params = {
        ...toRaw(form),
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize
      };
      const { data } = await getAllPermissionListByPage(params);
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
    const formInline = {
      permName: row?.permName ?? "",
      permCode: row?.permCode ?? "",
      permType: row?.permType ?? "",
      typeName: row?.typeName ?? "",
      remark: row?.remark ?? ""
    };
    addDialog({
      title: `${title}权限`,
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () =>
        h(editForm, {
          ref: formRef,
          formInline: formInline
        }),
      beforeSure: done => {
        const FormRef = formRef.value.getRef();
        const curData = formRef.value.getFormData();
        function chores() {
          message(`您${title}了权限名称为${curData.permName}的这条数据`, {
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
                await addPermission({
                  permName: curData.permName,
                  permCode: curData.permCode,
                  permType: curData.permType,
                  typeName: curData.typeName,
                  remark: curData.remark
                });
                chores();
              } catch (error) {
                message("新增失败", { type: "error" });
              }
            } else {
              try {
                await updatePermission({
                  id: row?.id,
                  permName: curData.permName,
                  permCode: curData.permCode,
                  permType: curData.permType,
                  typeName: curData.typeName,
                  remark: curData.remark
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

  /** 高亮当前权限选中行 */
  function rowStyle({ row: { id } }) {
    return {
      cursor: "pointer",
      background: id === curRow.value?.id ? "var(--el-fill-color-light)" : ""
    };
  }

  const onQueryChanged = (query: string) => {
    tableRef.value!.filter(query);
  };

  const filterMethod = (query: string, node) => {
    return node.title!.includes(query);
  };
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
      await deletePermissions(ids);
      message(`成功删除权限编号为 ${ids.join(", ")} 的数据`, {
        type: "success"
      });
      tableRef.value.getTableRef().clearSelection();
      onSearch();
    } catch (error) {
      message(error?.message || "批量删除失败", { type: "error" });
    }
  }

  onMounted(async () => {
    onSearch();
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
    isLinkage,
    pagination,
    isExpandAll,
    isSelectAll,
    treeSearchValue,
    // buttonClass,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    filterMethod,
    onQueryChanged,
    // handleDatabase,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    selectedNum,
    onSelectionCancel,
    onbatchDel
  };
}
