interface FormItemProps {
  id?: number;
  title: string;
  nickname: string;
  userId: string;
  password?: string;
  phone: string | number;
  status: number;
  roleCodeList?: string[];
  roleIdList?: number[];
  roleOptions?: any[]; // 角色列表，用于下拉选择
}
interface FormProps {
  formInline: FormItemProps;
}

interface RoleFormItemProps {
  username: string;
  nickname: string;
  /** 角色列表 */
  roleOptions: any[];
  /** 选中的角色列表 */
  ids: Record<number, unknown>[];
}
interface RoleFormProps {
  formInline: RoleFormItemProps;
}

export type { FormItemProps, FormProps, RoleFormItemProps, RoleFormProps };
