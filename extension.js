// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

let renameTimeout = null

// 调试日志系统
class DebugLogger {
	constructor() {
		this.levels = {
			ERROR: 0,
			WARN: 1,
			INFO: 2,
			DEBUG: 3,
			TRACE: 4
		};
		this.currentLevel = this.levels.DEBUG; // 默认级别
		this.enabledCategories = new Set(['ALL']); // 默认启用所有类别
		this.prefix = '🔄 TERMINAL-AUTO-RENAME'; // 独特的前缀标识
	}
	
	setLevel(level) {
		this.currentLevel = typeof level === 'string' ? this.levels[level.toUpperCase()] : level;
	}
	
	setCategories(categories) {
		this.enabledCategories = new Set(categories.map(c => c.toUpperCase()));
	}
	
	shouldLog(level, category = 'GENERAL') {
		const levelValue = typeof level === 'string' ? this.levels[level.toUpperCase()] : level;
		const categoryMatch = this.enabledCategories.has('ALL') || this.enabledCategories.has(category.toUpperCase());
		return levelValue <= this.currentLevel && categoryMatch;
	}
	
	formatMessage(level, category, message, data = null) {
		const timestamp = new Date().toISOString().substr(11, 12);
		const levelIcon = this.getLevelIcon(level);
		const baseMessage = `${this.prefix} ${levelIcon} [${timestamp}] [${level.toUpperCase()}] [${category}] ${message}`;
		
		if (data) {
			return `${baseMessage}\n${this.prefix} 📊 数据: ${JSON.stringify(data, null, 2)}`;
		}
		return baseMessage;
	}
	
	getLevelIcon(level) {
		const icons = {
			ERROR: '❌',
			WARN: '⚠️',
			INFO: 'ℹ️',
			DEBUG: '🐛',
			TRACE: '🔍'
		};
		return icons[level.toUpperCase()] || '📝';
	}
	
	log(level, category, message, data = null) {
		if (this.shouldLog(level, category)) {
			console.log(this.formatMessage(level, category, message, data));
		}
	}
	
	// 添加筛选提示方法
	showFilterTip() {
		console.log(`${this.prefix} 💡 调试控制台筛选提示:`);
		console.log(`${this.prefix} 💡 在控制台搜索框输入: "${this.prefix}"`);
		console.log(`${this.prefix} 💡 或者输入: "TERMINAL-AUTO-RENAME"`);
		console.log(`${this.prefix} 💡 即可只显示此扩展的日志`);
		console.log(`${this.prefix} ═════════════════════════════════════`);
	}
	
	error(category, message, data = null) { this.log('ERROR', category, message, data); }
	warn(category, message, data = null) { this.log('WARN', category, message, data); }
	info(category, message, data = null) { this.log('INFO', category, message, data); }
	debug(category, message, data = null) { this.log('DEBUG', category, message, data); }
	trace(category, message, data = null) { this.log('TRACE', category, message, data); }
}

const logger = new DebugLogger();

function activate() {
	// 显示筛选提示
	logger.showFilterTip();
	
	// 从配置中读取调试设置
	const config = vscode.workspace.getConfiguration('terminal-auto-rename');
	const debugLevel = config.get('debugLevel', 'INFO');
	const debugCategories = config.get('debugCategories', ['ALL']);
	
	logger.setLevel(debugLevel);
	logger.setCategories(debugCategories);
	
	logger.info('STARTUP', '扩展激活开始');

	function renameWithDirName(terminal = null) {
		try {
			logger.debug('RENAME', '开始重命名流程');
			
			// 获取当前活动终端或传入的终端
			const activeTerminal = terminal || vscode.window.activeTerminal;
			if (!activeTerminal) {
				logger.warn('TERMINAL', '没有活动终端');
				return;
			}
			
			let targetPath = null;
			let pathSource = '';
			
			// 获取路径策略配置
			const config = vscode.workspace.getConfiguration('terminal-auto-rename');
			const pathStrategy = config.get('pathStrategy', 'terminal');
			logger.debug('CONFIG', '使用路径策略', { strategy: pathStrategy });
			
			// 根据策略选择路径获取方法
			const pathMethods = [];
			
			if (pathStrategy === 'terminal') {
				pathMethods.push('terminal', 'workspace', 'editor', 'process');
			} else if (pathStrategy === 'workspace') {
				pathMethods.push('workspace', 'editor', 'terminal', 'process');
			} else if (pathStrategy === 'editor') {
				pathMethods.push('editor', 'terminal', 'workspace', 'process');
			}
			
			// 按策略顺序尝试获取路径
			for (const method of pathMethods) {
				if (targetPath) break;
				
				switch (method) {
					case 'terminal':
						// 使用终端的创建选项中的 cwd（实际工作目录）
						if (activeTerminal.creationOptions && activeTerminal.creationOptions.cwd) {
							if (activeTerminal.creationOptions.cwd.fsPath) {
								// URI 对象
								targetPath = activeTerminal.creationOptions.cwd.fsPath;
							} else if (typeof activeTerminal.creationOptions.cwd === 'string') {
								// 字符串路径
								targetPath = activeTerminal.creationOptions.cwd;
							}
							if (targetPath) {
								pathSource = '终端工作目录';
								logger.debug('TERMINAL', '使用终端工作目录', { path: targetPath });
							}
						}
						break;
						
					case 'editor':
						// 使用活动编辑器文件所在目录
						if (vscode.window.activeTextEditor) {
							const filePath = vscode.window.activeTextEditor.document.uri.fsPath;
							targetPath = path.dirname(filePath);
							pathSource = '活动编辑器目录';
							logger.debug('EDITOR', '使用编辑器文件目录', { filePath, targetPath });
						}
						break;
						
					case 'workspace':
						// 使用工作区文件夹路径
						if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
							targetPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
							pathSource = '工作区文件夹';
							logger.debug('WORKSPACE', '使用工作区路径', { path: targetPath });
						}
						break;
						
					case 'process':
						// 使用 process.cwd()
						targetPath = process.cwd();
						pathSource = 'process.cwd()';
						logger.debug('ENV', '使用进程工作目录', { targetPath });
						break;
				}
			}
			
			// 基础环境信息（用于调试）
			const cwd = process.cwd();
			const dirname = __dirname;
			logger.trace('ENV', 'process.cwd()', { cwd });
			logger.trace('ENV', '__dirname', { dirname });
			
			// 工作区信息
			if (vscode.workspace.workspaceFolders) {
				const workspacePaths = vscode.workspace.workspaceFolders.map(f => f.uri.fsPath);
				logger.debug('WORKSPACE', '工作区文件夹', { paths: workspacePaths });
			} else {
				logger.warn('WORKSPACE', '没有工作区文件夹');
			}
			
			// 活动编辑器信息
			if (vscode.window.activeTextEditor) {
				const filePath = vscode.window.activeTextEditor.document.uri.fsPath;
				const fileDir = path.dirname(filePath);
				logger.debug('EDITOR', '活动编辑器信息', { filePath, fileDir });
			} else {
				logger.debug('EDITOR', '没有活动编辑器');
			}
			
			// 终端信息
			const terminalName = activeTerminal.name;
			logger.debug('TERMINAL', '活动终端名称', { name: terminalName });
			
			activeTerminal.processId.then(pid => {
				logger.trace('TERMINAL', '终端进程ID', { pid });
			});
			
			// 计算新名称
			const folderName = path.basename(targetPath);
			logger.info('RENAME', '计算文件夹名', { 
				folderName, 
				targetPath,
				pathSource 
			});
			
			if (folderName && folderName.trim()) {
				logger.info('RENAME', '执行重命名', { 
					newName: folderName,
					pathSource,
					oldName: terminalName 
				});
				vscode.commands.executeCommand('workbench.action.terminal.renameWithArg', { name: folderName });
				logger.info('RENAME', '重命名命令已发送');
			} else {
				logger.error('RENAME', '文件夹名无效', { folderName, targetPath });
			}
			
		} catch (error) {
			logger.error('RENAME', '重命名失败', { 
				message: error.message, 
				stack: error.stack 
			});
		}
	}

	// 注册调试命令
	const debugCommand = vscode.commands.registerCommand('terminal-auto-rename.debug', renameWithDirName);
	
	// 注册测试终端事件的命令
	const testTerminalCommand = vscode.commands.registerCommand('terminal-auto-rename.testTerminal', () => {
		logger.info('TEST', '手动测试开始');
		logger.info('TEST', '当前活动终端数量', { count: vscode.window.terminals.length });
		
		// 显示路径获取优先级
		logger.info('TEST', '=== 路径获取测试 ===');
		
		// 测试终端工作目录（优先级1）
		if (vscode.window.activeTerminal && vscode.window.activeTerminal.creationOptions) {
			const terminal = vscode.window.activeTerminal;
			const cwd = terminal.creationOptions.cwd;
			if (cwd) {
				let terminalPath = '';
				if (cwd.fsPath) {
					terminalPath = cwd.fsPath;
				} else if (typeof cwd === 'string') {
					terminalPath = cwd;
				}
				if (terminalPath) {
					const terminalName = path.basename(terminalPath);
					logger.info('TEST', '终端工作目录 (优先级1)', {
						path: terminalPath,
						folderName: terminalName
					});
				} else {
					logger.info('TEST', '终端工作目录 (优先级1): cwd 格式未知', { cwd });
				}
			} else {
				logger.info('TEST', '终端工作目录 (优先级1): 无 cwd');
			}
		} else {
			logger.info('TEST', '终端工作目录 (优先级1): 无活动终端或创建选项');
		}
		
		// 测试工作区路径（优先级3）
		if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
			const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
			const workspaceName = path.basename(workspacePath);
			logger.info('TEST', '工作区路径 (优先级3)', { 
				path: workspacePath, 
				folderName: workspaceName 
			});
		} else {
			logger.info('TEST', '工作区路径 (优先级3): 无');
		}
		
		// 测试活动编辑器路径
		if (vscode.window.activeTextEditor) {
			const filePath = vscode.window.activeTextEditor.document.uri.fsPath;
			const fileDir = path.dirname(filePath);
			const dirName = path.basename(fileDir);
			logger.info('TEST', '活动编辑器路径 (优先级2)', {
				filePath,
				fileDir,
				folderName: dirName
			});
		} else {
			logger.info('TEST', '活动编辑器路径 (优先级2): 无');
		}
		
		// 测试进程工作目录
		const processCwd = process.cwd();
		const processName = path.basename(processCwd);
		logger.info('TEST', '进程工作目录 (优先级4)', {
			path: processCwd,
			folderName: processName
		});
		
		logger.info('TEST', '=== 终端信息测试 ===');
		
		if (vscode.window.activeTerminal) {
			logger.info('TEST', '当前活动终端信息', {
				name: vscode.window.activeTerminal.name,
				processId: 'pending...'
			});
			vscode.window.activeTerminal.processId.then(pid => {
				logger.info('TEST', '当前活动终端进程ID', { pid });
			});
		} else {
			logger.info('TEST', '当前没有活动终端');
		}
		
		// 创建一个测试终端
		logger.info('TEST', '正在创建测试终端...');
		const testTerminal = vscode.window.createTerminal('Test-Terminal');
		logger.info('TEST', '测试终端已创建', { name: testTerminal.name });
	});
	
	// 注册显示筛选提示的命令
	const showFilterCommand = vscode.commands.registerCommand('terminal-auto-rename.showFilter', () => {
		logger.showFilterTip();
	});
	
	// 注册日志级别切换命令
	const setLogLevelCommand = vscode.commands.registerCommand('terminal-auto-rename.setLogLevel', async () => {
		const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
		const selected = await vscode.window.showQuickPick(levels, {
			placeHolder: '选择调试级别'
		});
		if (selected) {
			logger.setLevel(selected);
			logger.info('CONFIG', `调试级别已设置为: ${selected}`);
		}
	});
	
	// 注册类别筛选命令
	const setCategoriesCommand = vscode.commands.registerCommand('terminal-auto-rename.setCategories', async () => {
		const categories = ['ALL', 'STARTUP', 'RENAME', 'TERMINAL', 'WORKSPACE', 'EDITOR', 'ENV', 'CONFIG'];
		const selected = await vscode.window.showQuickPick(categories, {
			placeHolder: '选择要显示的日志类别（可多选）',
			canPickMany: true
		});
		if (selected && selected.length > 0) {
			logger.setCategories(selected);
			logger.info('CONFIG', `调试类别已设置为: ${selected.join(', ')}`);
		}
	});

	logger.debug('STARTUP', '命令注册完成');

	if(vscode.window.activeTerminal) {
		logger.debug('STARTUP', '发现活动终端，立即重命名');
		renameWithDirName();
	}

	vscode.window.onDidOpenTerminal((terminal) => {
		logger.info('TERMINAL', '检测到终端打开事件', { 
			terminalName: terminal.name,
			creationOptions: terminal.creationOptions 
		});
		clearTimeout(renameTimeout);
		renameTimeout = setTimeout(() => {
			logger.info('TERMINAL', '延迟重命名触发 - 开始执行');
			renameWithDirName(terminal);
		}, 400);
	});
	
	// 添加额外的事件监听用于调试
	vscode.window.onDidChangeActiveTerminal((terminal) => {
		if (terminal) {
			logger.info('TERMINAL', '活动终端已切换', { 
				terminalName: terminal.name 
			});
		} else {
			logger.info('TERMINAL', '没有活动终端');
		}
	});
	
	logger.info('STARTUP', '扩展激活完成');
	
	return {
		dispose: () => {
			debugCommand.dispose();
			testTerminalCommand.dispose();
			showFilterCommand.dispose();
			setLogLevelCommand.dispose();
			setCategoriesCommand.dispose();
			logger.info('STARTUP', '扩展已释放');
		}
	};
}

// this method is called when your extension is deactivated
function deactivate() {
	logger.info('STARTUP', '扩展停用');
	clearTimeout(renameTimeout);
	renameTimeout = undefined;
}

module.exports = {
	activate,
	deactivate
}
