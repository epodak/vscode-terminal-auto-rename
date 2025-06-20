# Change Log

All notable changes to the "terminal-auto-rename" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Fixed
- 修复终端重命名逻辑：现在优先使用终端的实际工作目录而不是工作区根目录
- 现在在子目录中打开终端时，终端名称会正确显示为子目录名称（如"中文名"、"english"）而不是工作区根目录名称

### Added
- 新增路径策略配置选项 `terminal-auto-rename.pathStrategy`，支持三种策略：
  - `terminal`（默认）：优先使用终端实际工作目录
  - `workspace`：优先使用工作区根目录  
  - `editor`：优先使用活动编辑器所在目录
- 改进调试日志，显示所使用的路径策略和路径来源

### Changed
- 路径获取优先级调整：终端工作目录 > 活动编辑器目录 > 工作区文件夹 > process.cwd()
- 函数 `renameWithDirName` 现在接受可选的终端参数，以支持特定终端的重命名

## [0.0.1] - Initial release