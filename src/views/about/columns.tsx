export function useColumns() {
  const { pkg, lastBuildTime } = __APP_INFO__;
  const { engines } = pkg;
  const columns = [
    {
      label: "当前版本",
      minWidth: 100,
      cellRenderer: () => {
        return (
          <el-tag size="large" class="!text-base">
            1.1.0
          </el-tag>
        );
      }
    },
    {
      label: "最后编译时间",
      minWidth: 120,
      cellRenderer: () => {
        return (
          <el-tag size="large" class="!text-base">
            {lastBuildTime}
          </el-tag>
        );
      }
    },
    {
      label: "推荐 node 版本",
      minWidth: 140,
      cellRenderer: () => {
        return (
          <el-tag size="large" class="!text-base">
            {engines.node}
          </el-tag>
        );
      }
    },
    {
      label: "推荐 pnpm 版本",
      minWidth: 140,
      cellRenderer: () => {
        return (
          <el-tag size="large" class="!text-base">
            {engines.pnpm}
          </el-tag>
        );
      }
    },
    {
      label: "前端代码地址",
      minWidth: 140,
      className: "pure-version",
      cellRenderer: () => {
        return (
          <a
            href="https://github.com/jiang071/misp-qianduan.git"
            target="_blank"
          >
            <span style="color: var(--el-color-primary)">前端代码连接</span>
          </a>
        );
      }
    },
    {
      label: "后端代码地址",
      minWidth: 140,
      className: "pure-version",
      cellRenderer: () => {
        return (
          <a
            href="https://github.com/lxy925/misp-background.git"
            target="_blank"
          >
            <span style="color: var(--el-color-primary)">后端代码链接</span>
          </a>
        );
      }
    },
    {
      label: "产品文档地址",
      minWidth: 100,
      className: "pure-version",
      cellRenderer: () => {
        return (
          <a
            href="https://ocn6jtwof5z1.feishu.cn/wiki/space/7651498516090637526?ccm_open_type=lark_wiki_spaceLink&open_tab_from=wiki_home"
            target="_blank"
          >
            <span style="color: var(--el-color-primary)">产品文档链接</span>
          </a>
        );
      }
    },
    {
      label: "测试文档地址",
      minWidth: 100,
      className: "pure-version",
      cellRenderer: () => {
        return (
          <a
            href="https://ocn6jtwof5z1.feishu.cn/wiki/HJGPwOax8ipXlUkMJQDcTuYFn5b?from=from_copylink"
            target="_blank"
          >
            <span style="color: var(--el-color-primary)">测试文档链接</span>
          </a>
        );
      }
    }
  ];

  return {
    columns
  };
}
