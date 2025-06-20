# Terminal Auto Rename

由 **epodak** 维护的 VS Code 终端自动重命名扩展。

自动使用当前文件夹名称重命名终端标签页，支持中文路径和多种路径策略。

![Terminal Auto Rename](images/terminal-auto-rename.gif)

## ✨ 功能特性

- 🎯 **智能路径识别**：自动检测终端的实际工作目录
- 🌏 **中文支持**：完美支持中文文件夹名称显示
- ⚙️ **多种策略**：支持终端目录、工作区、编辑器三种路径策略
- 🔄 **实时重命名**：打开新终端时自动重命名
- 🐛 **调试友好**：提供详细的调试日志

## 🚀 使用方法

扩展会在以下情况自动重命名终端：
- 打开新的终端时
- 切换活动终端时

### 示例效果

```
之前: bash, powershell, cmd
现在: 中文名, english, project-folder
```

## ⚙️ 配置选项

### 路径策略 (`terminal-auto-rename.pathStrategy`)

控制终端重命名使用的路径来源：

- **`terminal`** (默认) - 优先使用终端的实际工作目录
  ```
  适用场景: 希望终端名称反映当前目录
  示例: 在 project/src 目录打开终端 → 显示 "src"
  ```

- **`workspace`** - 优先使用工作区根目录
  ```
  适用场景: 希望所有终端都显示项目名称
  示例: 在任何子目录打开终端 → 显示 "project"
  ```

- **`editor`** - 优先使用活动编辑器所在目录
  ```
  适用场景: 希望终端名称与当前编辑的文件目录一致
  示例: 编辑 project/docs/readme.md → 显示 "docs"
  ```

### 调试选项

- `terminal-auto-rename.debugLevel` - 调试日志级别 (ERROR, WARN, INFO, DEBUG, TRACE)
- `terminal-auto-rename.debugCategories` - 显示的日志类别

## 🛠️ 手动配置

在 VS Code 设置中添加：

```json
{
  "terminal-auto-rename.pathStrategy": "terminal",
  "terminal-auto-rename.debugLevel": "INFO"
}
```

或通过设置界面搜索 "terminal auto rename" 进行配置。

## 🎮 命令面板

- `Terminal Auto Rename: Debug Terminal Rename` - 手动触发重命名
- `Terminal Auto Rename: Test Terminal Events` - 测试终端事件
- `Terminal Auto Rename: Set Debug Log Level` - 设置调试级别
- `Terminal Auto Rename: Show Filter Tip` - 显示日志筛选提示

## 🐛 故障排除

### 问题：终端名称没有更新
1. 检查是否有活动终端
2. 确认路径策略设置正确
3. 查看调试控制台中的日志（搜索 "TERMINAL-AUTO-RENAME"）

### 问题：中文显示乱码
- 确保 VS Code 使用 UTF-8 编码
- 检查终端编码设置

### 调试步骤
1. 打开调试控制台 (Ctrl+Shift+J)
2. 搜索 "TERMINAL-AUTO-RENAME" 查看扩展日志
3. 运行命令 "Terminal Auto Rename: Debug Terminal Rename"

## 📋 路径获取优先级

根据配置的路径策略，扩展按以下优先级获取路径：

**terminal 策略** (默认):
1. 终端工作目录 → 2. 活动编辑器目录 → 3. 工作区文件夹 → 4. process.cwd()

**workspace 策略**:
1. 工作区文件夹 → 2. 活动编辑器目录 → 3. 终端工作目录 → 4. process.cwd()

**editor 策略**:
1. 活动编辑器目录 → 2. 终端工作目录 → 3. 工作区文件夹 → 4. process.cwd()

## 🔧 开发和构建

### 构建 VSIX 包

本项目提供了便捷的构建工具：

#### 方法一：使用构建脚本

```bash
# 快速构建（不清理，不更新版本）
./build.sh quick

# 完整构建（清理 + patch版本 + 打包）
./build.sh full

# 完整构建并指定版本类型
./build.sh full minor  # 1.0.0 -> 1.1.0
./build.sh full major  # 1.0.0 -> 2.0.0

# 仅清理项目
./build.sh clean
```

#### 方法二：使用 bash 函数

```bash
# 加载工具函数
source vscode-ext-utils.sh

# 打包扩展
pack_vsix              # 快速打包
pack_vsix full         # 完整打包 (patch版本)
pack_vsix full minor   # 完整打包 (minor版本)

# 安装本地扩展进行测试
install_vsix

# 查看扩展信息
show_ext_info

# 查看所有可用函数
vscode_ext_help
```

### 手动构建

如果需要手动构建：

```bash
# 安装 vsce 工具
npm install -g vsce

# 安装依赖
npm install

# 代码检查
npm run lint

# 打包
vsce package
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 👨‍💻 作者

**epodak** - [GitHub](https://github.com/epodak)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📦 发布说明

### 1.0.0 - 新的开始
- 🎉 项目由 epodak 接手维护
- ✅ 智能终端重命名功能
- ✅ 完美支持中文文件夹名称
- ✅ 多种路径策略配置
- ✅ 详细的调试日志系统
- ✅ 便捷的构建和打包工具