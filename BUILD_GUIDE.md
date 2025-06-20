# Terminal Auto Rename - 构建指南

## 🎯 项目概述

这是一个 VS Code 扩展，支持自动将终端标签页重命名为当前目录名称，完美支持中文路径。

## 🛠️ 构建工具

本项目提供了两套便捷的构建工具：

### 1. 构建脚本 (`build.sh`)

独立的 bash 脚本，可直接运行：

```bash
# 快速构建（不清理，不更新版本）
./build.sh quick

# 完整构建（清理 + patch版本 + 打包）
./build.sh full

# 完整构建并指定版本类型
./build.sh full minor  # 0.0.2 -> 0.1.0
./build.sh full major  # 0.0.2 -> 1.0.0

# 仅清理项目
./build.sh clean

# 查看帮助
./build.sh help
```

### 2. Bash 函数工具 (`vscode-ext-utils.sh`)

可加载到 bash 环境的函数集合：

```bash
# 加载工具函数
source vscode-ext-utils.sh

# 打包相关
pack_vsix              # 快速打包
pack_vsix full         # 完整打包 (patch版本)
pack_vsix full minor   # 完整打包 (minor版本)
pack_vsix clean        # 仅清理

# 安装测试
install_vsix           # 安装本地扩展
uninstall_ext          # 卸载扩展

# 信息查看
show_ext_info          # 显示扩展信息
vscode_ext_help        # 查看所有可用函数

# 发布相关
publish_ext patch      # 发布到市场
```

## 🚀 快速开始

### 初次构建

```bash
# 1. 给脚本添加执行权限
chmod +x build.sh

# 2. 完整构建
./build.sh full

# 3. 安装测试（可选）
source vscode-ext-utils.sh
install_vsix
```

### 日常开发

```bash
# 加载工具函数（建议加入 .bashrc）
source vscode-ext-utils.sh

# 快速打包测试
pack_vsix

# 安装本地扩展测试
install_vsix

# 查看扩展信息
show_ext_info
```

## 📦 构建产物

构建成功后会生成：

- `terminal-auto-rename-{version}.vsix` - 扩展安装包 (约 400KB)

## 🧹 项目清理

已删除的无关文件/文件夹：
- `.vscode-test/` - 测试临时文件
- `test/` - 测试代码
- `vsc-extension-quickstart.md` - 快速入门文档
- `.eslintrc.json` - ESLint 配置（构建时删除）

保留的重要文件：
- `extension.js` - 扩展主代码
- `package.json` - 扩展配置
- `README.md` - 项目说明
- `CHANGELOG.md` - 版本历史
- `images/` - 扩展图标和截图

## ⚙️ 构建配置

### `.vscodeignore` 配置

以下文件/文件夹会被排除在 VSIX 包之外：

```
.vscode/**          # VS Code 配置
.vscode-test/**     # 测试文件
test/**             # 测试代码
build.sh            # 构建脚本
vscode-ext-utils.sh # 工具函数
USAGE.md            # 使用说明
node_modules/**     # 依赖包
```

### 版本管理

- `patch` - 补丁版本：0.0.1 → 0.0.2
- `minor` - 次要版本：0.0.1 → 0.1.0  
- `major` - 主要版本：0.0.1 → 1.0.0

## 🔧 手动构建

如果不使用提供的工具：

```bash
# 安装 vsce
npm install -g vsce

# 安装依赖
npm install

# 打包
vsce package
```

## 📋 构建检查清单

构建前确认：

- [ ] 代码修改已保存
- [ ] 版本号已更新 (如需要)
- [ ] CHANGELOG.md 已更新
- [ ] README.md 已更新

构建后确认：

- [ ] VSIX 文件已生成
- [ ] 文件大小合理 (约 400KB)
- [ ] 本地安装测试正常
- [ ] 扩展功能正常

## 🚢 发布流程

```bash
# 1. 完整构建并更新版本
pack_vsix full minor

# 2. 本地测试
install_vsix

# 3. 提交代码
git add .
git commit -m "feat: 新版本 v0.1.0"
git tag v0.1.0
git push origin master --tags

# 4. 发布到市场（需要配置 access token）
publish_ext
```

## 💡 使用技巧

### 1. 添加到 ~/.bashrc

```bash
# 在 ~/.bashrc 中添加
alias pack="source /path/to/vscode-ext-utils.sh && pack_vsix"
```

### 2. 集成到 IDE

在 VS Code 的 tasks.json 中添加：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Build Extension",
      "type": "shell",
      "command": "./build.sh",
      "args": ["full"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always"
      }
    }
  ]
}
```

### 3. CI/CD 集成

```yaml
# GitHub Actions 示例
- name: Build Extension
  run: |
    chmod +x build.sh
    ./build.sh full
    
- name: Upload VSIX
  uses: actions/upload-artifact@v2
  with:
    name: extension-vsix
    path: "*.vsix"
```

## 🐛 故障排除

### 构建失败

1. 检查 Node.js 和 npm 版本
2. 删除 `node_modules` 重新安装依赖
3. 检查网络连接
4. 查看详细错误日志

### VSIX 文件过大

1. 检查 `.vscodeignore` 配置
2. 压缩图片文件
3. 移除不必要的依赖

### 安装失败

1. 检查 VS Code 版本兼容性
2. 尝试重启 VS Code
3. 手动安装：`code --install-extension *.vsix` 