# ClaudeScope iOS 版本架构方案

> 基于 React Native 0.76+ 新架构最佳实践

## 1. 架构决策

### 1.1 选择 React Native CLI (非 Expo)

**原因**：
- 需要完整原生功能：Widget (WidgetKit)、后台刷新、深度 APNs 集成
- Widget 必须用 Swift/WidgetKit 原生编写
- 后台刷新需要原生 iOS Background Modes
- 更好的原生代码控制和调试能力

### 1.2 项目结构：Monorepo

```
claudescope/
├── frontend/              # 现有 Next.js Web 版本 (不变)
├── backend/               # 现有 FastAPI 后端 (不变)
├── packages/              # 共享代码
│   └── shared/            # 共享类型和工具
│       ├── types/         # TypeScript 类型定义
│       ├── api/           # API 客户端 (可复用)
│       └── utils/         # 工具函数
│
├── ios-app/               # 新增: React Native iOS 应用
│   ├── src/
│   │   ├── app/           # 应用入口
│   │   ├── screens/       # 页面组件
│   │   ├── components/    # UI 组件
│   │   ├── navigation/    # 导航配置
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── stores/        # 状态管理 (Zustand)
│   │   ├── services/      # API 服务层
│   │   └── theme/         # 主题配置
│   │
│   ├── ios/               # iOS 原生代码
│   │   ├── ClaudeScope/
│   │   ├── ClaudeScopeWidget/     # WidgetKit 扩展
│   │   └── NotificationService/   # 推送通知扩展
│   │
│   ├── specs/             # Turbo Module 规范
│   ├── package.json
│   └── tsconfig.json
│
└── package.json           # Monorepo 根配置
```

## 2. 技术栈选型

### 2.1 核心依赖

| 类别 | 库 | 版本 | 理由 |
|------|-----|------|------|
| **框架** | react-native | ^0.76 | 新架构默认启用 |
| **导航** | @react-navigation/native | ^7.x | 官方推荐，原生性能 |
| **导航栈** | @react-navigation/native-stack | ^7.x | UINavigationController |
| **标签导航** | @react-navigation/bottom-tabs | ^7.x | 底部导航 |
| **状态管理** | zustand | ^5.x | 轻量、与 Web 版一致 |
| **服务端状态** | @tanstack/react-query | ^5.x | 与 Web 版一致 |
| **样式** | nativewind | ^4.x | Tailwind-like 语法 |
| **动画** | react-native-reanimated | ^3.x | 高性能原生动画 |
| **手势** | react-native-gesture-handler | ^2.x | 原生手势识别 |
| **图表** | react-native-svg + d3 | 最新 | 自定义高质量图表 |
| **图标** | lucide-react-native | ^0.x | 与 Web 版一致 |
| **存储** | @react-native-async-storage | ^2.x | 本地数据持久化 |
| **安全存储** | react-native-keychain | ^9.x | API 密钥安全存储 |

### 2.2 原生功能依赖

| 功能 | 库/方案 | 说明 |
|------|---------|------|
| **推送通知** | @notifee/react-native | 功能最全、支持本地+远程 |
| **后台刷新** | 原生 Swift 模块 | 需自定义 Turbo Module |
| **Widget** | 原生 Swift WidgetKit | 通过 App Groups 共享数据 |

## 3. 原生功能实现方案

### 3.1 推送通知 (APNs)

#### 架构图
```
┌─────────────────┐      ┌──────────────┐      ┌─────────────┐
│  FastAPI 后端   │ ───▶ │   APNs 服务   │ ───▶ │  iOS 设备   │
│  (发送推送)     │      │              │      │  (接收推送) │
└─────────────────┘      └──────────────┘      └─────────────┘
```

#### 实现步骤
1. **Apple Developer 配置**：
   - 创建 APNs Key (.p8)
   - 配置 Bundle ID 和 Push Notifications capability

2. **后端集成**：
   ```python
   # backend/app/services/push_service.py
   from apns2.client import APNsClient
   from apns2.payload import Payload

   async def send_push(device_token: str, title: str, body: str):
       payload = Payload(alert={"title": title, "body": body})
       client.send_notification(device_token, payload, topic=BUNDLE_ID)
   ```

3. **iOS 端**：
   ```typescript
   // ios-app/src/services/notifications.ts
   import notifee, { AuthorizationStatus } from '@notifee/react-native';

   export async function requestPermission() {
     const settings = await notifee.requestPermission();
     return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
   }

   export async function registerForPush() {
     const token = await notifee.getAPNSToken();
     // 发送到后端注册
     await api.registerDevice(token);
   }
   ```

### 3.2 后台刷新 (Background App Refresh)

#### 原生 Swift Turbo Module

```swift
// ios/ClaudeScope/BackgroundRefresh/RCTBackgroundRefresh.swift
import Foundation
import BackgroundTasks
import React

@objc(BackgroundRefresh)
class BackgroundRefresh: NSObject {

  @objc
  func scheduleAppRefresh() {
    let request = BGAppRefreshTaskRequest(identifier: "com.claudescope.refresh")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15分钟

    do {
      try BGTaskScheduler.shared.submit(request)
    } catch {
      print("Could not schedule app refresh: \(error)")
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
```

#### JavaScript 端调用
```typescript
// ios-app/src/services/backgroundRefresh.ts
import { NativeModules } from 'react-native';

const { BackgroundRefresh } = NativeModules;

export function scheduleBackgroundRefresh() {
  BackgroundRefresh.scheduleAppRefresh();
}
```

### 3.3 Widget (WidgetKit)

#### 架构设计
```
┌───────────────────────────────────────────────────────────┐
│                     App Group 共享容器                      │
│  ┌─────────────────┐           ┌─────────────────────┐   │
│  │  React Native   │  ──共享──▶ │   WidgetKit 扩展    │   │
│  │  主应用         │    数据     │   (纯 Swift)        │   │
│  └─────────────────┘           └─────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

#### Widget 数据共享
```swift
// ios/ClaudeScopeWidget/SharedData.swift
import Foundation
import WidgetKit

struct UsageData: Codable {
    let totalTokens: Int
    let usagePercent: Double
    let lastUpdate: Date
}

class SharedDataManager {
    static let shared = SharedDataManager()

    private let appGroup = "group.com.claudescope.app"

    var usageData: UsageData? {
        get {
            guard let defaults = UserDefaults(suiteName: appGroup),
                  let data = defaults.data(forKey: "usageData") else { return nil }
            return try? JSONDecoder().decode(UsageData.self, from: data)
        }
        set {
            guard let defaults = UserDefaults(suiteName: appGroup),
                  let data = try? JSONEncoder().encode(newValue) else { return }
            defaults.set(data, forKey: "usageData")
            WidgetCenter.shared.reloadAllTimelines()
        }
    }
}
```

#### Widget 视图
```swift
// ios/ClaudeScopeWidget/ClaudeScopeWidget.swift
import WidgetKit
import SwiftUI

struct UsageWidgetEntry: TimelineEntry {
    let date: Date
    let usage: UsageData?
}

struct UsageWidgetView: View {
    let entry: UsageWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Claude 使用量")
                .font(.headline)

            if let usage = entry.usage {
                ProgressView(value: usage.usagePercent)
                    .progressViewStyle(.linear)
                    .tint(usage.usagePercent > 0.8 ? .red : .purple)

                Text("\(Int(usage.usagePercent * 100))% 已使用")
                    .font(.caption)
            } else {
                Text("暂无数据")
                    .foregroundColor(.secondary)
            }
        }
        .padding()
    }
}

@main
struct ClaudeScopeWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: "UsageWidget",
            provider: UsageProvider()
        ) { entry in
            UsageWidgetView(entry: entry)
        }
        .configurationDisplayName("使用量监控")
        .description("实时查看 Claude 使用情况")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

#### RN 端更新 Widget 数据
```typescript
// ios-app/src/services/widgetBridge.ts
import { NativeModules } from 'react-native';

const { WidgetBridge } = NativeModules;

export interface UsageData {
  totalTokens: number;
  usagePercent: number;
  lastUpdate: string;
}

export function updateWidgetData(data: UsageData): void {
  WidgetBridge.updateUsageData(data);
}
```

## 4. 页面迁移策略

### 4.1 优先级排序

| 优先级 | 页面 | 复杂度 | 迁移策略 |
|--------|------|--------|---------|
| P0 | Dashboard | 高 | 简化动画，移除粒子效果 |
| P1 | Statistics | 高 | 使用 react-native-svg 重构图表 |
| P1 | Health Report | 中 | 直接迁移，调整布局 |
| P2 | Anti-patterns | 中 | 列表虚拟化优化 |
| P2 | AI Insights | 高 | 保持核心功能 |
| P3 | Settings | 低 | 直接迁移 |

### 4.2 组件迁移映射

| Web 组件 | RN 组件 | 说明 |
|----------|---------|------|
| `div` | `View` | 布局容器 |
| `p/span` | `Text` | 文本 |
| `img` | `Image` | 图片 |
| `button` | `Pressable` | 可按压元素 |
| `input` | `TextInput` | 输入框 |
| Recharts | SVG + Path | 自定义绘制 |
| GSAP | Reanimated | 动画库替换 |
| Tailwind | NativeWind | 样式语法兼容 |

## 5. 代码复用策略

### 5.1 可完全复用 (90%+)

- **TypeScript 类型定义** (`packages/shared/types/`)
- **API 响应结构**
- **业务逻辑 Hooks** (去除 Web 特定 API)
- **Zustand Store 逻辑**
- **工具函数** (非 DOM 相关)

### 5.2 部分复用 (50-70%)

- **React Query Hooks** (需调整 fetch 为 axios)
- **数据处理逻辑**

### 5.3 需重写

- **UI 组件** (JSX 语法相同，但元素和样式不同)
- **动画** (GSAP → Reanimated)
- **图表** (Recharts → SVG)
- **导航** (Next.js Router → React Navigation)

## 6. 开发时间线

### Phase 1: 基础设施 (第1-2周)
- [ ] 初始化 React Native 项目
- [ ] 配置 Monorepo (Turborepo)
- [ ] 设置 NativeWind + Reanimated
- [ ] 实现 React Navigation 导航结构
- [ ] 配置 React Query + Zustand
- [ ] 创建基础 UI 组件库

### Phase 2: 核心页面 (第3-4周)
- [ ] Dashboard 页面迁移
- [ ] Statistics 页面 + 图表组件
- [ ] Health Report 页面
- [ ] Settings 页面

### Phase 3: 原生功能 (第5-6周)
- [ ] APNs 推送通知集成
- [ ] 后台刷新 Turbo Module
- [ ] WidgetKit 扩展开发
- [ ] App Groups 数据共享

### Phase 4: 优化与测试 (第7-8周)
- [ ] 性能优化 (FlatList 虚拟化等)
- [ ] 动画细节调整
- [ ] 单元测试 + E2E 测试
- [ ] TestFlight 测试分发

## 7. 关键风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Widget 数据同步延迟 | 用户体验 | 使用 App Groups + Timeline reload |
| 后台刷新被系统限制 | 数据实时性 | 结合推送通知触发 |
| 图表性能问题 | 流畅度 | 使用 react-native-skia 替代 |
| 新架构兼容性 | 第三方库 | 验证所有依赖库支持新架构 |

## 8. 质量保证

### 8.1 性能指标

- **首屏加载**: < 2秒
- **页面切换**: < 300ms
- **图表渲染**: 60fps
- **内存占用**: < 150MB

### 8.2 测试策略

- **单元测试**: Jest + React Native Testing Library
- **E2E 测试**: Detox
- **性能测试**: Flipper Performance Plugin
- **真机测试**: iPhone 12+ 覆盖

---

## 9. 确认：不影响现有版本

✅ **Web 版本 (frontend/)**: 完全独立，无任何修改
✅ **后端 (backend/)**: 仅新增推送通知 API 端点
✅ **代码隔离**: iOS 应用在独立目录 `ios-app/`
✅ **共享代码**: 通过 `packages/shared/` 实现，不影响现有代码

---

*文档版本: v1.0*
*最后更新: 2025-12-03*
