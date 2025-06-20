# Terminal Auto Rename - 使用说明

## 🚀 快速开始

### 1. 基本使用

扩展安装后会自动工作，无需额外配置：

```
当你打开新终端时，终端名称会自动更新为当前目录名
```

**示例：**
- 在 `D:/projects/my-app/src` 打开终端 → 显示 `src`
- 在 `D:/projects/my-app/中文目录` 打开终端 → 显示 `中文目录`
- 在 `D:/projects/my-app` 打开终端 → 显示 `my-app`

### 2. 路径策略配置

控制终端重命名的路径来源：

#### Terminal 策略（默认推荐）
```json
{
  "terminal-auto-rename.pathStrategy": "terminal"
}
```
- ✅ 优先使用终端的实际工作目录
- 🎯 适合：希望终端名称反映当前目录
- 📁 示例：在子目录 `src` 中 → 显示 `src`

#### Workspace 策略
```json
{
  "terminal-auto-rename.pathStrategy": "workspace"
}
```
- ✅ 优先使用工作区根目录
- 🎯 适合：希望所有终端都显示项目名称
- 📁 示例：在任何子目录中 → 显示 `my-project`

#### Editor 策略
```json
{
  "terminal-auto-rename.pathStrategy": "editor"
}
```
- ✅ 优先使用活动编辑器所在目录
- 🎯 适合：希望终端名称与当前文件目录一致
- 📁 示例：编辑 `docs/readme.md` → 显示 `docs`

### 3. 调试配置

如果遇到问题，可以开启调试模式：

```json
{
  "terminal-auto-rename.debugLevel": "DEBUG",
  "terminal-auto-rename.debugCategories": ["ALL"]
}
```

然后在调试控制台（Ctrl+Shift+J）搜索 `TERMINAL-AUTO-RENAME` 查看日志。

## 🛠️ 高级用法

### 手动触发重命名

通过命令面板（Ctrl+Shift+P）运行：
- `Terminal Auto Rename: Debug Terminal Rename`

### 测试终端事件

通过命令面板运行：
- `Terminal Auto Rename: Test Terminal Events`

### 调整日志级别

通过命令面板运行：
- `Terminal Auto Rename: Set Debug Log Level`

## 🔍 故障排除

### 问题 1：终端名称没有更新

**可能原因：**
- 没有活动终端
- 路径策略配置不当
- 扩展未正常加载

**解决方法：**
1. 检查是否有打开的终端
2. 运行手动重命名命令
3. 查看调试日志
4. 重启 VS Code

### 问题 2：中文显示乱码

**可能原因：**
- 终端编码设置问题
- VS Code 编码设置问题

**解决方法：**
1. 确保 VS Code 使用 UTF-8 编码
2. 检查终端编码设置
3. 重启 VS Code

### 问题 3：在某些目录下不工作

**可能原因：**
- 目录权限问题
- 特殊字符问题
- 路径过长

**解决方法：**
1. 检查目录权限
2. 避免特殊字符
3. 查看调试日志了解具体原因

## 📋 配置示例

### 基础配置（推荐）
```json
{
  "terminal-auto-rename.pathStrategy": "terminal",
  "terminal-auto-rename.debugLevel": "INFO"
}
```

### 工作区优先配置
```json
{
  "terminal-auto-rename.pathStrategy": "workspace",
  "terminal-auto-rename.debugLevel": "WARN"
}
```

### 调试模式配置
```json
{
  "terminal-auto-rename.pathStrategy": "terminal",
  "terminal-auto-rename.debugLevel": "DEBUG",
  "terminal-auto-rename.debugCategories": ["RENAME", "TERMINAL"]
}
```

## 🎯 使用技巧

### 1. 多项目工作流
- 使用 `workspace` 策略：所有终端显示项目名
- 方便识别不同项目的终端

### 2. 前端开发
- 使用 `terminal` 策略：终端名称反映当前目录
- 如 `src`、`components`、`utils` 等

### 3. 全栈开发
- 使用 `editor` 策略：终端跟随当前编辑文件
- 编辑前端文件时显示前端目录，编辑后端文件时显示后端目录

### 4. 调试模式
- 遇到问题时开启 `DEBUG` 级别
- 筛选特定类别的日志：`["RENAME", "TERMINAL"]`
- 完成调试后关闭以避免控制台刷屏

## 🔧 开发者说明

### 路径获取优先级

**Terminal 策略：**
1. 终端工作目录（`terminal.creationOptions.cwd`）
2. 活动编辑器目录（`activeTextEditor.document.uri`）
3. 工作区文件夹（`workspace.workspaceFolders[0]`）
4. 进程工作目录（`process.cwd()`）

**Workspace 策略：**
1. 工作区文件夹
2. 活动编辑器目录
3. 终端工作目录
4. 进程工作目录

**Editor 策略：**
1. 活动编辑器目录
2. 终端工作目录
3. 工作区文件夹
4. 进程工作目录

### 支持的终端类型
- Windows: PowerShell、CMD、Git Bash
- macOS: Terminal、iTerm
- Linux: 各种终端模拟器

### 支持的路径格式
- Windows: `D:\path\to\directory`
- Unix: `/path/to/directory`
- 网络路径: `\\server\share\path`
- 相对路径: `./relative/path` 