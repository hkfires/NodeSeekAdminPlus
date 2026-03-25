# NodeSeek 管理预设增强工具

本脚可自定义 NodeSeek 的管理预设并快速调用。

> **重要提示：仅限管理员使用**
> 本工具仅在具备 NodeSeek 管理权限的账号下生效。普通用户安装后将无法使用预设功能。

---

## 安装方式

1. 确保浏览器已安装 [Tampermonkey (油猴)](https://www.tampermonkey.net/) 扩展。
2. 点击下方链接完成脚本安装：

[点击安装 NodeSeek Admin Plus](https://raw.githubusercontent.com/hkfires/NodeSeekAdminPlus/master/NodeSeekAdminPlus.user.js)

---

## 核心功能：管理预设增强

* **预设方案快速切换**：支持保存并一键应用多套常用的管理预设配置。
* **参数录入优化**：针对预设管理界面进行交互加固，提升复杂参数的填写效率。
* **批量任务处理**：提供针对预设任务的快捷入口，减少重复点击。
* **界面精简**：优化管理面板布局，突出显示预设核心操作区，过滤无关干扰。

---

## 开发者说明

若需进行二次开发或功能扩展：

1. **项目结构**
   * NodeSeekAdminPlus.user.js：包含元数据与核心逻辑的脚本文件。
2. **调试建议**
   * 建议在 Tampermonkey 设置中开启“允许访问文件网址”，通过 @require 引用本地文件路径实现热更新开发。

## 开源协议

本项目采用 [MIT License](LICENSE) 协议开源。

---

**由 [hKFirEs](https://github.com/hkfires) 为 NodeSeek 管理员团队开发**