#!/bin/bash

# Terminal Auto Rename - 构建和打包脚本
# 作者: batatop
# 功能: 清理项目、安装依赖、打包VSIX

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查必要工具
check_tools() {
    log_info "检查必要工具..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装，请先安装 npm"
        exit 1
    fi
    
    # 检查 vsce 是否安装
    if ! command -v vsce &> /dev/null; then
        log_warning "vsce 未安装，正在安装..."
        npm install -g vsce
    fi
    
    log_success "工具检查完成"
}

# 清理函数
clean_project() {
    log_info "清理项目..."
    
    # 删除不需要的文件夹
    folders_to_remove=(
        ".vscode-test"
        "node_modules"
        "out"
        "dist"
    )
    
    for folder in "${folders_to_remove[@]}"; do
        if [ -d "$folder" ]; then
            log_info "删除文件夹: $folder"
            rm -rf "$folder"
        fi
    done
    
    # 删除不需要的文件
    files_to_remove=(
        "*.vsix"
        "vsc-extension-quickstart.md"
        ".eslintrc.json"
    )
    
    for file_pattern in "${files_to_remove[@]}"; do
        if ls $file_pattern 1> /dev/null 2>&1; then
            log_info "删除文件: $file_pattern"
            rm -f $file_pattern
        fi
    done
    
    log_success "项目清理完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装依赖..."
    
    # 只安装生产依赖和必要的开发依赖
    npm install
    
    log_success "依赖安装完成"
}

# 代码检查
lint_code() {
    log_info "执行代码检查..."
    
    if npm run lint; then
        log_success "代码检查通过"
    else
        log_warning "代码检查有警告，继续构建..."
    fi
}

# 更新版本号
update_version() {
    local version_type=${1:-patch}  # patch, minor, major
    
    log_info "更新版本号 ($version_type)..."
    
    # 获取当前版本
    current_version=$(node -p "require('./package.json').version")
    log_info "当前版本: $current_version"
    
    # 更新版本号
    npm version $version_type --no-git-tag-version
    
    new_version=$(node -p "require('./package.json').version")
    log_success "新版本: $new_version"
}

# 打包VSIX
package_vsix() {
    log_info "打包 VSIX..."
    
    # 获取包名和版本
    package_name=$(node -p "require('./package.json').name")
    package_version=$(node -p "require('./package.json').version")
    
    # 创建VSIX包
    if vsce package; then
        vsix_file="${package_name}-${package_version}.vsix"
        log_success "VSIX 打包完成: $vsix_file"
        
        # 显示文件大小
        if [ -f "$vsix_file" ]; then
            file_size=$(du -h "$vsix_file" | cut -f1)
            log_info "文件大小: $file_size"
        fi
    else
        log_error "VSIX 打包失败"
        exit 1
    fi
}

# 主函数
build_extension() {
    local clean_first=${1:-true}
    local version_type=${2:-patch}
    
    echo ""
    log_info "🚀 开始构建 Terminal Auto Rename 扩展"
    echo ""
    
    # 检查工具
    check_tools
    echo ""
    
    # 清理项目（可选）
    if [ "$clean_first" = "true" ]; then
        clean_project
        echo ""
    fi
    
    # 安装依赖
    install_dependencies
    echo ""
    
    # 代码检查
    lint_code
    echo ""
    
    # 更新版本号
    if [ "$version_type" != "none" ]; then
        update_version "$version_type"
        echo ""
    fi
    
    # 打包VSIX
    package_vsix
    echo ""
    
    log_success "🎉 构建完成！"
}

# 快速构建函数（供外部调用）
quick_build() {
    build_extension false none
}

# 完整构建函数（供外部调用）
full_build() {
    local version_type=${1:-patch}
    build_extension true "$version_type"
}

# 如果脚本被直接执行
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # 解析命令行参数
    case "${1:-full}" in
        "quick")
            quick_build
            ;;
        "full")
            full_build "${2:-patch}"
            ;;
        "clean")
            clean_project
            ;;
        *)
            echo "用法: $0 [quick|full|clean] [patch|minor|major]"
            echo ""
            echo "  quick  - 快速构建（不清理，不更新版本）"
            echo "  full   - 完整构建（清理 + 更新版本 + 打包）"
            echo "  clean  - 仅清理项目"
            echo ""
            echo "版本类型："
            echo "  patch  - 补丁版本 (0.0.1 -> 0.0.2)"
            echo "  minor  - 次要版本 (0.0.1 -> 0.1.0)"
            echo "  major  - 主要版本 (0.0.1 -> 1.0.0)"
            exit 1
            ;;
    esac
fi 