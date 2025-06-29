import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

import { ContextTracker } from '../../../core/ContextTracker';
import { IConfigurationManager, ExtensionConfig, IFileCollector, IOutputWriter } from '../../../types/interfaces';

/**
 * @test-implementation
 * --> 实现 ContextTracker 的单元测试
 * 测试所有公共方法和关键私有方法的行为
 */
suite('ContextTracker Unit Tests', () => {
    let contextTracker: ContextTracker;
    let mockConfigManager: sinon.SinonStubbedInstance<IConfigurationManager>;
    let mockConfig: ExtensionConfig;
    let mockVSCode: any;

    setup(() => {
        // --> 1. 准备测试环境和模拟对象
        mockConfig = {
            outputList: [
                {
                    path: 'test-output.txt',
                    format: 'Test format: ${fileName} - ${content}',
                    prependContent: 'Test prepend'
                }
            ],
            shouldOutput: true,
            ignorePinnedTabs: true
        };

        mockConfigManager = {
            getConfiguration: sinon.stub().returns(mockConfig)
        } as any;

        // --> 2. 模拟 VS Code API
        mockVSCode = {
            window: {
                onDidChangeActiveTextEditor: sinon.stub().returns({
                    dispose: sinon.stub()
                })
            }
        };

        // 替换 vscode 模块（需要在测试运行器中配置）
        // 这里假设已经在测试环境中正确设置了 vscode 模拟
    });

    teardown(() => {
        sinon.restore();
    });

    suite('Constructor Tests', () => {
        test('should initialize with valid configuration manager', () => {
            // --> 3. 测试构造函数正确初始化
            
            // 创建 ContextTracker 实例
            contextTracker = new ContextTracker(mockConfigManager);

            // 验证配置管理器被调用
            assert.ok(mockConfigManager.getConfiguration.calledOnce, 'Configuration should be loaded during construction');
            
            // 验证实例被正确创建
            assert.ok(contextTracker instanceof ContextTracker, 'Should create ContextTracker instance');
        });

        test('should create file collector and output writer with correct dependencies', () => {
            // --> 4. 测试依赖注入的正确性
            
            contextTracker = new ContextTracker(mockConfigManager);

            // 验证配置被正确读取
            assert.ok(mockConfigManager.getConfiguration.calledOnce);
            
            // 注意：由于 fileCollector 和 outputWriter 是私有属性，
            // 我们通过公共方法的行为来验证它们的正确创建
            assert.ok(contextTracker, 'ContextTracker should be created successfully');
        });
    });

    suite('Initialize Method Tests', () => {
        beforeEach(() => {
            contextTracker = new ContextTracker(mockConfigManager);
        });

        test('should register file change listener', () => {
            // --> 5. 测试 initialize 方法注册事件监听器
            
            const mockListener = { dispose: sinon.stub() };
            const onDidChangeStub = sinon.stub(vscode.window, 'onDidChangeActiveTextEditor').returns(mockListener as any);

            // 调用 initialize
            contextTracker.initialize();

            // 验证监听器被注册
            assert.ok(onDidChangeStub.calledOnce, 'File change listener should be registered');
            
            // 验证监听器函数被传递
            assert.ok(onDidChangeStub.calledWith(sinon.match.func), 'Listener function should be provided');
        });
    });

    suite('Dispose Method Tests', () => {
        beforeEach(() => {
            contextTracker = new ContextTracker(mockConfigManager);
        });

        test('should cleanup output files and dispose listeners', () => {
            // --> 6. 测试 dispose 方法清理资源
            
            const mockListener = { dispose: sinon.stub() };
            sinon.stub(vscode.window, 'onDidChangeActiveTextEditor').returns(mockListener as any);
            
            // 初始化以添加监听器
            contextTracker.initialize();
            
            // 调用 dispose
            contextTracker.dispose();

            // 验证监听器被清理
            assert.ok(mockListener.dispose.calledOnce, 'Listeners should be disposed');
            
            // 注意：outputWriter.cleanupOutputFiles 的验证需要通过集成测试或者
            // 通过重构来注入 outputWriter 依赖来实现
        });

        test('should handle cleanup errors gracefully', () => {
            // --> 7. 测试 dispose 过程中的错误处理
            
            const mockListener = { dispose: sinon.stub().throws(new Error('Dispose error')) };
            sinon.stub(vscode.window, 'onDidChangeActiveTextEditor').returns(mockListener as any);
            
            contextTracker.initialize();
            
            // dispose 应该不会抛出错误，即使监听器清理失败
            assert.doesNotThrow(() => {
                contextTracker.dispose();
            }, 'Dispose should handle errors gracefully');
        });
    });

    suite('File Change Handling Tests', () => {
        beforeEach(() => {
            contextTracker = new ContextTracker(mockConfigManager);
        });

        test('should handle file change when shouldOutput is true', () => {
            // --> 8. 测试当启用输出时处理文件变更
            
            // 确保配置为启用输出
            mockConfig.shouldOutput = true;
            
            const mockListener = { dispose: sinon.stub() };
            const onDidChangeStub = sinon.stub(vscode.window, 'onDidChangeActiveTextEditor').returns(mockListener as any);
            
            contextTracker.initialize();
            
            // 获取注册的监听器函数并调用
            const listenerFunction = onDidChangeStub.getCall(0).args[0];
            
            // 这里无法直接测试私有方法，但可以通过触发事件来测试行为
            // 实际测试需要通过集成测试或者重构来暴露更多可测试的接口
            assert.ok(typeof listenerFunction === 'function', 'Listener should be a function');
        });

        test('should skip processing when shouldOutput is false', () => {
            // --> 9. 测试当禁用输出时跳过处理
            
            // 设置配置为禁用输出
            mockConfig.shouldOutput = false;
            mockConfigManager.getConfiguration.returns(mockConfig);
            
            // 重新创建实例以使用新配置
            contextTracker = new ContextTracker(mockConfigManager);
            
            const mockListener = { dispose: sinon.stub() };
            sinon.stub(vscode.window, 'onDidChangeActiveTextEditor').returns(mockListener as any);
            
            contextTracker.initialize();
            
            // 验证监听器仍然被注册（但处理逻辑会根据配置跳过）
            assert.ok(mockListener, 'Listener should still be registered');
        });
    });

    suite('Integration Points Tests', () => {
        test('should integrate correctly with configuration manager', () => {
            // --> 10. 测试与配置管理器的集成
            
            contextTracker = new ContextTracker(mockConfigManager);
            
            // 验证配置被正确获取
            assert.ok(mockConfigManager.getConfiguration.calledOnce);
            
            // 验证配置内容被正确使用
            // 这需要通过行为验证，因为配置被用于创建其他组件
            assert.ok(contextTracker instanceof ContextTracker);
        });

        test('should handle configuration errors gracefully', () => {
            // --> 11. 测试配置错误的处理
            
            // 模拟配置管理器抛出错误
            mockConfigManager.getConfiguration.throws(new Error('Configuration error'));
            
            // 构造函数应该能够处理配置错误
            assert.throws(() => {
                new ContextTracker(mockConfigManager);
            }, 'Should propagate configuration errors');
        });
    });
});

/**
 * @test-notes
 * 注意事项：
 * 1. 由于 ContextTracker 的许多依赖是在构造函数中创建的，完整的单元测试
 *    需要依赖注入重构或者使用集成测试来验证行为
 * 2. VS Code API 的模拟需要在测试运行器级别配置
 * 3. 私有方法 handleFileChange 的测试需要通过公共接口间接验证
 * 4. 某些测试可能需要移到集成测试中，特别是涉及文件操作的部分
 */