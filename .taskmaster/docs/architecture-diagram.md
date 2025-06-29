# Auto Copilot Context - 架构图与测试策略

## 当前项目架构

```mermaid
graph TB
    subgraph "VS Code Extension"
        A[extension.ts<br/>扩展入口] --> B[ContextTracker<br/>核心跟踪器]
    end
    
    subgraph "Core Layer"
        B --> C[FileCollector<br/>文件收集器]
        B --> D[ConfigurationManager<br/>配置管理器]
    end
    
    subgraph "Service Layer"
        C --> E[FileFilter<br/>文件过滤器]
        B --> F[OutputFormatter<br/>输出格式化器]
    end
    
    subgraph "Utils Layer"
        B --> G[ErrorHandler<br/>错误处理器]
    end
    
    subgraph "Types Layer"
        H[interfaces.ts<br/>类型定义]
    end
    
    subgraph "External Dependencies"
        I[VS Code API] --> B
        J[File System] --> C
        K[Configuration] --> D
    end
    
    subgraph "Output"
        F --> L[context-output.txt]
        F --> M[.cursor/rules/context-output.mdc]
    end
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#e8f5e8
    style E fill:#fff3e0
    style F fill:#fff3e0
    style G fill:#ffebee
    style H fill:#f1f8e9
```

## 数据流架构

```mermaid
sequenceDiagram
    participant VS as VS Code
    participant CT as ContextTracker
    participant FC as FileCollector
    participant FF as FileFilter
    participant OF as OutputFormatter
    participant FS as File System
    
    VS->>CT: onDidChangeActiveTextEditor
    CT->>FC: getOpenFiles()
    FC->>VS: vscode.window.tabGroups
    FC->>FF: isValidDocument()
    FF-->>FC: boolean
    FC-->>CT: FileData[]
    CT->>OF: formatOutput()
    OF-->>CT: formatted string
    CT->>FS: writeFileSync()
    
    Note over CT,FS: 配置驱动的多输出支持
```

## 测试架构设计

```mermaid
graph TB
    subgraph "测试层次架构"
        subgraph "L4: 端到端测试 (E2E)"
            E2E1[完整用户场景测试]
            E2E2[多文件切换测试]
            E2E3[配置变更实时生效测试]
        end
        
        subgraph "L3: 扩展级集成测试"
            INT3[扩展激活测试]
            INT4[组件协调测试]
            INT5[资源清理测试]
        end
        
        subgraph "L2: 服务层集成测试"
            INT1[配置管理集成测试]
            INT2[文件处理流程测试]
        end
        
        subgraph "L1: 基础组件集成测试"
            UNIT1[FileCollector + FileFilter]
            UNIT2[OutputFormatter + Config]
            UNIT3[ErrorHandler + Components]
        end
    end
    
    subgraph "测试支持基础设施"
        MOCK[Mock 对象]
        FIXTURE[测试数据]
        HELPER[测试工具类]
        ASSERT[断言库增强]
    end
    
    E2E1 --> INT3
    INT3 --> INT1
    INT1 --> UNIT1
    
    UNIT1 --> MOCK
    UNIT1 --> FIXTURE
    INT1 --> HELPER
    INT3 --> ASSERT
    
    style E2E1 fill:#ffcdd2
    style INT3 fill:#f8bbd9
    style INT1 fill:#e1bee7
    style UNIT1 fill:#c5cae9
```

## 测试策略矩阵

```mermaid
graph LR
    subgraph "测试类型"
        A[单元测试<br/>Unit Tests]
        B[集成测试<br/>Integration Tests]
        C[端到端测试<br/>E2E Tests]
    end
    
    subgraph "测试目标"
        D[功能正确性<br/>Functionality]
        E[组件交互<br/>Integration]
        F[用户体验<br/>User Experience]
    end
    
    subgraph "测试工具"
        G[Mocha + Chai<br/>测试框架]
        H[Sinon<br/>模拟对象]
        I[@vscode/test-electron<br/>VS Code 环境]
    end
    
    A --> D
    B --> E
    C --> F
    
    D --> G
    E --> H
    F --> I
    
    style A fill:#e8f5e8
    style B fill:#fff3e0
    style C fill:#ffebee
```

## 组件依赖关系

```mermaid
graph TB
    subgraph "依赖关系图"
        CT[ContextTracker] --> |depends on| CM[ConfigurationManager]
        CT --> |depends on| FC[FileCollector]
        CT --> |depends on| OF[OutputFormatter]
        CT --> |depends on| EH[ErrorHandler]
        
        FC --> |depends on| FF[FileFilter]
        FF --> |depends on| CM
        
        subgraph "接口抽象层"
            IFC[IFileCollector]
            IFF[IFileFilter]
            IOF[IOutputFormatter]
            ICM[IConfigurationManager]
        end
        
        FC -.implements.- IFC
        FF -.implements.- IFF
        OF -.implements.- IOF
        CM -.implements.- ICM
    end
    
    style CT fill:#e1f5fe
    style IFC fill:#f1f8e9
    style IFF fill:#f1f8e9
    style IOF fill:#f1f8e9
    style ICM fill:#f1f8e9
```

## 测试数据流

```mermaid
flowchart LR
    subgraph "测试输入"
        TD1[测试配置文件]
        TD2[模拟文件数据]
        TD3[VS Code API Mock]
    end
    
    subgraph "测试执行"
        TE1[单元测试执行器]
        TE2[集成测试执行器]
        TE3[E2E测试执行器]
    end
    
    subgraph "测试输出"
        TO1[测试报告]
        TO2[覆盖率报告]
        TO3[性能指标]
    end
    
    TD1 --> TE1
    TD2 --> TE2
    TD3 --> TE3
    
    TE1 --> TO1
    TE2 --> TO2
    TE3 --> TO3
    
    style TD1 fill:#e8f5e8
    style TE1 fill:#fff3e0
    style TO1 fill:#ffebee
```

## 关键测试场景

```mermaid
mindmap
  root((集成测试场景))
    基础功能测试
      文件变更监听
      文件内容收集
      输出格式化
      配置读取
    异常处理测试
      文件读取失败
      权限不足
      磁盘空间不足
      配置错误
    性能测试
      大量文件处理
      内存使用监控
      响应时间测试
    用户场景测试
      多文件切换
      固定标签页过滤
      实时配置变更
      多输出格式
```

## 测试覆盖范围

```mermaid
pie title 测试覆盖目标分布
    "核心功能测试" : 40
    "集成流程测试" : 25
    "异常处理测试" : 20
    "性能稳定性测试" : 10
    "用户体验测试" : 5
```

---

**架构说明：**

1. **分层架构**: 清晰的职责分离，便于测试和维护
2. **接口抽象**: 支持依赖注入，便于模拟测试
3. **测试分级**: 从单元到端到端的完整测试体系
4. **数据驱动**: 配置化的输出格式和过滤规则

**测试策略重点：**

1. **渐进式测试**: 从简单到复杂，逐步构建测试体系
2. **真实环境**: 利用 VS Code 测试框架确保环境一致性
3. **全面覆盖**: 功能、集成、异常、性能多维度测试
4. **持续集成**: 自动化测试执行和质量监控