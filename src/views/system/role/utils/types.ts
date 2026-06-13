// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了

interface FormItemProps {
  id?: number;
  /** 角色名称 */
  roleName: string;
  /** 角色编号 */
  roleCode: string;
  /** 角色状态 */
  status?: number;
}
interface FormProps {
  formInline: FormItemProps;
  showStatus?: boolean;
}

export type { FormItemProps, FormProps };
