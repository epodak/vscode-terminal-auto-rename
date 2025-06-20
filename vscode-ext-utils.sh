# VS Code 扩展开发工具函数
# 使用方法: source vscode-ext-utils.sh

# 打包 VS Code 扩展为 VSIX 文件
# 用法:
#   pack_vsix              # 快速打包（不清理，不更新版本）
#   pack_vsix full         # 完整打包（清理 + patch版本 + 打包）
#   pack_vsix full minor   # 完整打包（清理 + minor版本 + 打包）
#   pack_vsix clean        # 仅清理项目
pack_vsix() {
    local current_dir=$(pwd)
    local script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
    
    # 如果当前目录没有 build.sh，尝试在脚本目录查找
    if [ ! -f "./build.sh" ] && [ -f "$script_dir/build.sh" ]; then
        echo "🔄 切换到扩展目录: $script_dir"
        cd "$script_dir"
    fi
    
    if [ ! -f "./build.sh" ]; then
        echo "❌ 找不到 build.sh 脚本"
        echo "📁 当前目录: $(pwd)"
        echo "📁 脚本目录: $script_dir"
        return 1
    fi
    
    # 执行构建脚本
    case "${1:-quick}" in
        "full")
            ./build.sh full "${2:-patch}"
            ;;
        "quick")
            ./build.sh quick
            ;;
        "clean")
            ./build.sh clean
            ;;
        *)
            echo "用法: pack_vsix [quick|full|clean] [patch|minor|major]"
            echo ""
            echo "  quick  - 快速打包（不清理，不更新版本）"
            echo "  full   - 完整打包（清理 + 更新版本 + 打包）"
            echo "  clean  - 仅清理项目"
            echo ""
            echo "版本类型："
            echo "  patch  - 补丁版本 (0.0.1 -> 0.0.2)"
            echo "  minor  - 次要版本 (0.0.1 -> 0.1.0)"
            echo "  major  - 主要版本 (0.0.1 -> 1.0.0)"
            return 1
            ;;
    esac
    
    # 回到原目录
    cd "$current_dir"
}

# 安装本地 VSIX 扩展
# 用法: install_vsix [vsix文件路径]
install_vsix() {
    local vsix_file="$1"
    
    # 如果没有指定文件，查找当前目录下的 .vsix 文件
    if [ -z "$vsix_file" ]; then
        vsix_file=$(find . -name "*.vsix" -type f | head -n 1)
        
        if [ -z "$vsix_file" ]; then
            echo "❌ 找不到 .vsix 文件"
            echo "💡 请先运行 pack_vsix 生成 VSIX 包"
            return 1
        fi
        
        echo "📦 找到 VSIX 文件: $vsix_file"
    fi
    
    if [ ! -f "$vsix_file" ]; then
        echo "❌ 文件不存在: $vsix_file"
        return 1
    fi
    
    echo "🚀 安装扩展: $vsix_file"
    code --install-extension "$vsix_file"
    
    if [ $? -eq 0 ]; then
        echo "✅ 扩展安装成功"
        echo "💡 重新加载 VS Code 窗口以激活扩展"
    else
        echo "❌ 扩展安装失败"
        return 1
    fi
}

# 卸载扩展
# 用法: uninstall_ext [扩展ID]
uninstall_ext() {
    local ext_id="$1"
    
    if [ -z "$ext_id" ]; then
        # 尝试从 package.json 获取扩展ID
        if [ -f "package.json" ]; then
            local publisher=$(node -p "require('./package.json').publisher" 2>/dev/null)
            local name=$(node -p "require('./package.json').name" 2>/dev/null)
            
            if [ "$publisher" != "undefined" ] && [ "$name" != "undefined" ]; then
                ext_id="${publisher}.${name}"
                echo "📦 从 package.json 获取扩展ID: $ext_id"
            fi
        fi
        
        if [ -z "$ext_id" ]; then
            echo "❌ 请提供扩展ID"
            echo "用法: uninstall_ext publisher.extension-name"
            return 1
        fi
    fi
    
    echo "🗑️  卸载扩展: $ext_id"
    code --uninstall-extension "$ext_id"
    
    if [ $? -eq 0 ]; then
        echo "✅ 扩展卸载成功"
    else
        echo "❌ 扩展卸载失败"
        return 1
    fi
}

# 发布扩展到市场
# 用法: publish_ext [版本类型]
publish_ext() {
    local version_type="${1:-patch}"
    
    if [ ! -f "package.json" ]; then
        echo "❌ 找不到 package.json 文件"
        return 1
    fi
    
    echo "🚀 发布扩展到 VS Code 市场"
    echo "📋 版本类型: $version_type"
    
    # 检查是否安装了 vsce
    if ! command -v vsce &> /dev/null; then
        echo "⚠️  vsce 未安装，正在安装..."
        npm install -g vsce
    fi
    
    # 发布扩展
    vsce publish "$version_type"
    
    if [ $? -eq 0 ]; then
        echo "✅ 扩展发布成功"
    else
        echo "❌ 扩展发布失败"
        return 1
    fi
}

# 显示扩展信息
show_ext_info() {
    if [ ! -f "package.json" ]; then
        echo "❌ 找不到 package.json 文件"
        return 1
    fi
    
    echo "📦 扩展信息:"
    echo "  名称: $(node -p "require('./package.json').displayName || require('./package.json').name")"
    echo "  ID: $(node -p "require('./package.json').publisher").$(node -p "require('./package.json').name")"
    echo "  版本: $(node -p "require('./package.json').version")"
    echo "  描述: $(node -p "require('./package.json').description")"
    
    # 检查是否有 VSIX 文件
    local vsix_files=$(find . -name "*.vsix" -type f)
    if [ -n "$vsix_files" ]; then
        echo "  VSIX 文件:"
        echo "$vsix_files" | while read -r file; do
            local size=$(du -h "$file" | cut -f1)
            echo "    - $file ($size)"
        done
    fi
}

# 清理所有构建文件
clean_all() {
    echo "🧹 清理所有构建文件..."
    
    # 删除文件夹
    folders_to_remove=(".vscode-test" "node_modules" "out" "dist")
    for folder in "${folders_to_remove[@]}"; do
        if [ -d "$folder" ]; then
            echo "🗑️  删除文件夹: $folder"
            rm -rf "$folder"
        fi
    done
    
    # 删除 VSIX 文件
    if ls *.vsix 1> /dev/null 2>&1; then
        echo "🗑️  删除 VSIX 文件"
        rm -f *.vsix
    fi
    
    echo "✅ 清理完成"
}

# 显示帮助信息
vscode_ext_help() {
    echo "🛠️  VS Code 扩展开发工具函数"
    echo ""
    echo "📦 打包相关:"
    echo "  pack_vsix [quick|full|clean] [patch|minor|major]  - 打包扩展"
    echo "  install_vsix [vsix文件]                          - 安装本地扩展"
    echo "  uninstall_ext [扩展ID]                           - 卸载扩展"
    echo ""
    echo "🚀 发布相关:"
    echo "  publish_ext [patch|minor|major]                  - 发布到市场"
    echo ""
    echo "🔍 信息查看:"
    echo "  show_ext_info                                    - 显示扩展信息"
    echo ""
    echo "🧹 清理相关:"
    echo "  clean_all                                        - 清理所有构建文件"
    echo ""
    echo "💡 使用提示:"
    echo "  - 在扩展项目根目录下使用这些函数"
    echo "  - 确保已安装 Node.js 和 npm"
    echo "  - 首次使用会自动安装 vsce 工具"
}

# 显示加载成功信息
echo "✅ VS Code 扩展开发工具已加载"
echo "💡 运行 vscode_ext_help 查看可用函数" 