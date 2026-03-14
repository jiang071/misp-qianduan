# Misp-Boot3-Pure

描述: 华南农业大学《管理信息系统课程设计》前端模版项目基础代码。

基于pure-admin-thin模版作为前端，访问Misp-Boot3项目。

## 技术栈

Vue3.4.38 + element-plus 2.8.0 + Vue-router4.3.3 + Pinia2.2.2 + axios1.7.4

## 前端模版

基于 [pure-admin-thin](https://github.com/pure-admin/pure-admin-thin)修改。

1. 参照Pure-Admin添加了tagView功能，同时开启多个页面窗口；

2. 添加了Prue-Admin的系统管理模版页面。

3. 移植了ISDP课程的前端项目的组件集成到模块项目中，供同学参考。

4. 为保持和ISDP前端课程的延续性，写了ts适配了ISDP课程前端Api接口风格，供同学参考。详见src/utils/request目录

## 模版配套文档

[点我查看 vue-pure-admin 文档](https://pure-admin.github.io/pure-admin-doc)

## 安装

pnpm install

## 运行

pnpm dev

或点击VS Code的NPM脚本serve

## Ajax请求说明

同时支持mock / 后端接口。

mock参见“系统管理”功能, 代码位于根目录mock目录

后端Ajax请求测试：

(1) 修改vite.config.ts配置，将baseUrl指向后端地址/接口;

(2) axios配置，参见src/utils/http

(3) 关于有后端接口测试。项目支持两种api编写风格，两种放个对比参考src/api/hello.ts

(4) Pos项目有两种风格示例。Product为PureAdmin API风格，Category和Sale为ISDP API风格。

## 组件封装

1. Pure Admin封装了比较多的组件，参见src/components。如果需要加入Pure Admin更多功能组件，请在完整版项目对应目录拷贝。

2. Isdp项目的Category和Product的表单进行了封装和组件通信，参见form.vue。封装组件有利于代码维护、增强代码复用。

## 开发规范与指导

1.创建功能模块，功能模块目录结构如下：

组件目录：src/views/应用名称/功能模块名称/index.vue

api目录：src/api/应用名称/功能模块名称.ts

自定义类型目录：src/types/应用名称.d.ts

2.对比api接口路径和后端Controller路径，确保映射正确。
