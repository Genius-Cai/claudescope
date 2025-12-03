//
//  WidgetDataModule.swift
//  ClaudeScopeIOS
//
//  Native module to share data with the Widget Extension via App Groups
//

import Foundation
import WidgetKit

@objc(WidgetDataModule)
class WidgetDataModule: NSObject {

    private let appGroupId = "group.com.claudescope.app"

    @objc
    static func moduleName() -> String! {
        return "WidgetDataModule"
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }

    /// Update widget data in shared UserDefaults
    @objc
    func updateWidgetData(
        _ totalTokens: Int,
        inputTokens: Int,
        outputTokens: Int,
        sessionsCount: Int,
        healthScore: Int,
        healthGrade: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let sharedDefaults = UserDefaults(suiteName: appGroupId) else {
            reject("ERROR", "Failed to access App Group UserDefaults", nil)
            return
        }

        let data: [String: Any] = [
            "totalTokens": totalTokens,
            "inputTokens": inputTokens,
            "outputTokens": outputTokens,
            "sessionsCount": sessionsCount,
            "healthScore": healthScore,
            "healthGrade": healthGrade,
            "lastUpdated": ISO8601DateFormatter().string(from: Date())
        ]

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: data)
            sharedDefaults.set(jsonData, forKey: "widgetData")
            sharedDefaults.synchronize()

            // Reload widget timelines
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }

            resolve(["success": true])
        } catch {
            reject("ERROR", "Failed to serialize widget data: \(error.localizedDescription)", error)
        }
    }

    /// Get current widget data from shared UserDefaults
    @objc
    func getWidgetData(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let sharedDefaults = UserDefaults(suiteName: appGroupId) else {
            reject("ERROR", "Failed to access App Group UserDefaults", nil)
            return
        }

        guard let jsonData = sharedDefaults.data(forKey: "widgetData") else {
            resolve(nil)
            return
        }

        do {
            let data = try JSONSerialization.jsonObject(with: jsonData)
            resolve(data)
        } catch {
            reject("ERROR", "Failed to deserialize widget data: \(error.localizedDescription)", error)
        }
    }

    /// Force reload all widget timelines
    @objc
    func reloadWidgets(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
            resolve(["success": true])
        } else {
            reject("ERROR", "Widgets are only available on iOS 14+", nil)
        }
    }

    /// Clear widget data
    @objc
    func clearWidgetData(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let sharedDefaults = UserDefaults(suiteName: appGroupId) else {
            reject("ERROR", "Failed to access App Group UserDefaults", nil)
            return
        }

        sharedDefaults.removeObject(forKey: "widgetData")
        sharedDefaults.synchronize()

        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        resolve(["success": true])
    }
}
