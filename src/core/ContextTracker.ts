import * as vscode from "vscode";

import { FileCollector } from "./FileCollector";
import { FileFilter } from "../services/FileFilter";
import { OutputFormatter } from "../services/OutputFormatter";
import { OutputWriter } from "../services/OutputWriter";
import { ErrorHandler } from "../utils/ErrorHandler";
import {
  ExtensionConfig,
  IFileCollector,
  IConfigurationManager,
  IOutputWriter,
} from "../types/interfaces";

/**
 * @testable
 * @test-implementation
 * --> 1. 测试 ContextTracker 类的构造函数
 * describe('ContextTracker Constructor', () => {
 *   it('should initialize with valid configuration manager', () => {
 *     // 准备模拟的配置管理器
 *     // 创建 ContextTracker 实例
 *     // 验证依赖项正确注入
 *   });
 * });
 */
export class ContextTracker {
  private readonly fileCollector: IFileCollector;
  private readonly outputWriter: IOutputWriter;
  private readonly configManager: IConfigurationManager;
  private readonly disposables: vscode.Disposable[] = [];
  private config: ExtensionConfig;

  /**
   * @testable
   * @scenario 使用配置管理器初始化 ContextTracker
   * @input IConfigurationManager 实例
   * @expected 正确创建所有依赖组件
   * @test-implementation
   * --> 2. 测试构造函数依赖注入
   * it('should create file collector and output writer with correct dependencies', () => {
   *   // 模拟配置管理器
   *   // 验证 fileCollector 和 outputWriter 被正确创建
   *   // 验证配置被正确读取
   * });
   */
  constructor(configManager: IConfigurationManager) {
    this.configManager = configManager;
    this.config = configManager.getConfiguration();

    // Create dependencies
    const outputFormatter = new OutputFormatter();
    this.outputWriter = new OutputWriter(outputFormatter);

    // Create file filter and file collector
    const fileFilter = new FileFilter(this.config.outputList);
    this.fileCollector = new FileCollector(
      fileFilter,
      this.config.ignorePinnedTabs
    );
  }

  /**
   * @testable
   * @scenario 初始化文件变更监听器
   * @input 无
   * @expected VS Code 事件监听器被正确注册
   * @test-implementation
   * --> 3. 测试 initialize 方法
   * it('should register file change listener', () => {
   *   // 模拟 vscode.window.onDidChangeActiveTextEditor
   *   // 调用 initialize
   *   // 验证监听器被添加到 disposables
   * });
   */
  public initialize(): void {
    const fileChangeListener = vscode.window.onDidChangeActiveTextEditor(() => {
      this.handleFileChange();
    });
    this.disposables.push(fileChangeListener);
  }

  /**
   * @testable
   * @scenario 清理资源和事件监听器
   * @input 无
   * @expected 所有资源被正确清理
   * @test-implementation
   * --> 4. 测试 dispose 方法
   * it('should cleanup output files and dispose listeners', () => {
   *   // 模拟 outputWriter.cleanupOutputFiles
   *   // 模拟 disposables 数组
   *   // 调用 dispose
   *   // 验证清理方法被调用
   * });
   */
  public dispose(): void {
    // 清理输出文件
    try {
      this.outputWriter.cleanupOutputFiles();
    } catch (error) {
      ErrorHandler.handleError(
        "Failed to cleanup output files during dispose",
        error
      );
    }

    this.disposables.forEach((disposable) => disposable.dispose());
  }

  /**
   * @testable
   * @scenario 处理文件变更事件
   * @input 无（通过配置控制行为）
   * @expected 根据配置决定是否处理文件变更
   * @test-implementation
   * --> 5. 测试 handleFileChange 方法
   * it('should handle file change when shouldOutput is true', () => {
   *   // 设置 config.shouldOutput = true
   *   // 模拟 fileCollector.getOpenFiles
   *   // 模拟 outputWriter.writeOutput
   *   // 调用 handleFileChange
   *   // 验证输出方法被调用
   * });
   * 
   * --> 6. 测试配置为 false 时不处理文件变更
   * it('should skip processing when shouldOutput is false', () => {
   *   // 设置 config.shouldOutput = false
   *   // 调用 handleFileChange
   *   // 验证文件收集器和输出器未被调用
   * });
   * 
   * --> 7. 测试错误处理
   * it('should handle errors gracefully', () => {
   *   // 模拟 fileCollector.getOpenFiles 抛出错误
   *   // 调用 handleFileChange
   *   // 验证 ErrorHandler.handleError 被调用
   * });
   */
  private handleFileChange(): void {
    if (!this.config.shouldOutput) {
      return;
    }
    try {
      const openFiles = this.fileCollector.getOpenFiles();
      this.outputWriter.writeOutput(openFiles, this.config.outputList);
    } catch (error) {
      ErrorHandler.handleError("Failed to process file change", error);
    }
  }
}
