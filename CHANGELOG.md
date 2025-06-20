# Change Log

epodak维护版本的更新日志。

所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](http://keepachangelog.com/)。

## [1.0.0] - 2024-12-19

### 新的开始
- 🎉 项目由 epodak 接手维护
- 🔄 版本重新开始计数

### 功能特性
- ✅ 智能终端重命名：自动使用文件夹名称重命名终端
- ✅ 中文支持：完美支持中文文件夹名称显示
- ✅ 多路径策略：支持 terminal、workspace、editor 三种策略
- ✅ 实时重命名：打开新终端或切换终端时自动重命名
- ✅ 调试系统：提供详细的调试日志和分类

### 配置选项
- `terminal-auto-rename.pathStrategy` - 路径获取策略配置
- `terminal-auto-rename.debugLevel` - 调试日志级别
- `terminal-auto-rename.debugCategories` - 调试日志类别

### 开发工具
- ✅ 便捷的构建脚本 (build.sh)
- ✅ VS Code 扩展工具函数 (vscode-ext-utils.sh)
- ✅ 支持快速打包和版本管理

### 技术细节
- 路径获取优先级：终端工作目录 > 活动编辑器目录 > 工作区文件夹 > process.cwd()
- 支持 VS Code 1.54.0+ 版本
- 兼容 Windows、macOS、Linux