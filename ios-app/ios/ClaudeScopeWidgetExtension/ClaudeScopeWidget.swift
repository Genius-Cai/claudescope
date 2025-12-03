//
//  ClaudeScopeWidget.swift
//  ClaudeScopeWidgetExtension
//
//  ClaudeScope iOS Widget - Displays Claude usage statistics
//

import WidgetKit
import SwiftUI

// MARK: - Data Models

struct ClaudeUsageData: Codable {
    let totalTokens: Int
    let inputTokens: Int
    let outputTokens: Int
    let sessionsCount: Int
    let healthScore: Int
    let healthGrade: String
    let lastUpdated: Date

    static let placeholder = ClaudeUsageData(
        totalTokens: 125000,
        inputTokens: 75000,
        outputTokens: 50000,
        sessionsCount: 42,
        healthScore: 85,
        healthGrade: "A",
        lastUpdated: Date()
    )
}

// MARK: - Timeline Provider

struct ClaudeScopeProvider: TimelineProvider {
    typealias Entry = ClaudeScopeEntry

    func placeholder(in context: Context) -> ClaudeScopeEntry {
        ClaudeScopeEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (ClaudeScopeEntry) -> Void) {
        let entry = ClaudeScopeEntry(date: Date(), data: loadCachedData() ?? .placeholder)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ClaudeScopeEntry>) -> Void) {
        let data = loadCachedData() ?? .placeholder
        let entry = ClaudeScopeEntry(date: Date(), data: data)

        // Update every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func loadCachedData() -> ClaudeUsageData? {
        // Load from shared App Group UserDefaults
        guard let sharedDefaults = UserDefaults(suiteName: "group.com.claudescope.app") else {
            return nil
        }

        guard let jsonData = sharedDefaults.data(forKey: "widgetData") else {
            return nil
        }

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try? decoder.decode(ClaudeUsageData.self, from: jsonData)
    }
}

// MARK: - Timeline Entry

struct ClaudeScopeEntry: TimelineEntry {
    let date: Date
    let data: ClaudeUsageData
}

// MARK: - Widget Views

struct ClaudeScopeWidgetEntryView: View {
    var entry: ClaudeScopeProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(data: entry.data)
        case .systemMedium:
            MediumWidgetView(data: entry.data)
        case .systemLarge:
            LargeWidgetView(data: entry.data)
        default:
            SmallWidgetView(data: entry.data)
        }
    }
}

// MARK: - Small Widget

struct SmallWidgetView: View {
    let data: ClaudeUsageData

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color(hex: "7c3aed"), Color(hex: "a855f7")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 8) {
                // Header
                HStack {
                    Image(systemName: "binoculars.fill")
                        .font(.system(size: 16, weight: .bold))
                    Text("ClaudeScope")
                        .font(.system(size: 12, weight: .bold))
                }
                .foregroundColor(.white.opacity(0.9))

                Spacer()

                // Health Score
                HStack(alignment: .bottom, spacing: 4) {
                    Text("\(data.healthScore)")
                        .font(.system(size: 36, weight: .bold))
                    Text(data.healthGrade)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(gradeColor)
                        .padding(.bottom, 4)
                }
                .foregroundColor(.white)

                Text("Health Score")
                    .font(.system(size: 10))
                    .foregroundColor(.white.opacity(0.7))
            }
            .padding(12)
        }
    }

    var gradeColor: Color {
        switch data.healthGrade {
        case "A": return Color(hex: "4ade80")
        case "B": return Color(hex: "60a5fa")
        case "C": return Color(hex: "facc15")
        case "D": return Color(hex: "fb923c")
        default: return Color(hex: "f87171")
        }
    }
}

// MARK: - Medium Widget

struct MediumWidgetView: View {
    let data: ClaudeUsageData

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "1e1b4b"), Color(hex: "312e81"), Color(hex: "3730a3")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            HStack(spacing: 16) {
                // Left: Health Score
                VStack(spacing: 8) {
                    ZStack {
                        Circle()
                            .stroke(Color.white.opacity(0.2), lineWidth: 6)
                        Circle()
                            .trim(from: 0, to: CGFloat(data.healthScore) / 100)
                            .stroke(
                                LinearGradient(
                                    colors: [Color(hex: "7c3aed"), Color(hex: "a855f7")],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                ),
                                style: StrokeStyle(lineWidth: 6, lineCap: .round)
                            )
                            .rotationEffect(.degrees(-90))

                        VStack(spacing: 0) {
                            Text("\(data.healthScore)")
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(.white)
                            Text(data.healthGrade)
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(gradeColor)
                        }
                    }
                    .frame(width: 70, height: 70)

                    Text("Health")
                        .font(.system(size: 10))
                        .foregroundColor(.white.opacity(0.6))
                }

                // Right: Stats
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Image(systemName: "binoculars.fill")
                            .font(.system(size: 14))
                        Text("ClaudeScope")
                            .font(.system(size: 14, weight: .bold))
                    }
                    .foregroundColor(.white)

                    StatRow(icon: "bolt.fill", label: "Total Tokens", value: formatNumber(data.totalTokens), color: Color(hex: "facc15"))
                    StatRow(icon: "bubble.left.fill", label: "Sessions", value: "\(data.sessionsCount)", color: Color(hex: "4ade80"))
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(16)
        }
    }

    var gradeColor: Color {
        switch data.healthGrade {
        case "A": return Color(hex: "4ade80")
        case "B": return Color(hex: "60a5fa")
        case "C": return Color(hex: "facc15")
        case "D": return Color(hex: "fb923c")
        default: return Color(hex: "f87171")
        }
    }
}

// MARK: - Large Widget

struct LargeWidgetView: View {
    let data: ClaudeUsageData

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "1e1b4b"), Color(hex: "312e81")],
                startPoint: .top,
                endPoint: .bottom
            )

            VStack(spacing: 16) {
                // Header
                HStack {
                    Image(systemName: "binoculars.fill")
                        .font(.system(size: 20, weight: .bold))
                    Text("ClaudeScope")
                        .font(.system(size: 18, weight: .bold))
                    Spacer()
                    Text(data.healthGrade)
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(gradeColor)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 4)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(8)
                }
                .foregroundColor(.white)

                // Health Score Ring
                ZStack {
                    Circle()
                        .stroke(Color.white.opacity(0.1), lineWidth: 10)
                    Circle()
                        .trim(from: 0, to: CGFloat(data.healthScore) / 100)
                        .stroke(
                            LinearGradient(
                                colors: [Color(hex: "7c3aed"), Color(hex: "a855f7"), Color(hex: "c084fc")],
                                startPoint: .leading,
                                endPoint: .trailing
                            ),
                            style: StrokeStyle(lineWidth: 10, lineCap: .round)
                        )
                        .rotationEffect(.degrees(-90))

                    VStack(spacing: 2) {
                        Text("\(data.healthScore)")
                            .font(.system(size: 42, weight: .bold))
                            .foregroundColor(.white)
                        Text("Health Score")
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
                .frame(width: 120, height: 120)

                // Token Stats Grid
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    TokenStatCard(
                        icon: "bolt.fill",
                        label: "Total Tokens",
                        value: formatNumber(data.totalTokens),
                        colors: [Color(hex: "7c3aed"), Color(hex: "a855f7")]
                    )
                    TokenStatCard(
                        icon: "arrow.down.circle.fill",
                        label: "Input",
                        value: formatNumber(data.inputTokens),
                        colors: [Color(hex: "1d4ed8"), Color(hex: "3b82f6")]
                    )
                    TokenStatCard(
                        icon: "arrow.up.circle.fill",
                        label: "Output",
                        value: formatNumber(data.outputTokens),
                        colors: [Color(hex: "15803d"), Color(hex: "22c55e")]
                    )
                    TokenStatCard(
                        icon: "bubble.left.and.bubble.right.fill",
                        label: "Sessions",
                        value: "\(data.sessionsCount)",
                        colors: [Color(hex: "c2410c"), Color(hex: "f97316")]
                    )
                }

                // Last Updated
                Text("Updated: \(timeAgo(data.lastUpdated))")
                    .font(.system(size: 10))
                    .foregroundColor(.white.opacity(0.4))
            }
            .padding(16)
        }
    }

    var gradeColor: Color {
        switch data.healthGrade {
        case "A": return Color(hex: "4ade80")
        case "B": return Color(hex: "60a5fa")
        case "C": return Color(hex: "facc15")
        case "D": return Color(hex: "fb923c")
        default: return Color(hex: "f87171")
        }
    }
}

// MARK: - Helper Views

struct StatRow: View {
    let icon: String
    let label: String
    let value: String
    let color: Color

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 12))
                .foregroundColor(color)
            Text(label)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.6))
            Spacer()
            Text(value)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(.white)
        }
    }
}

struct TokenStatCard: View {
    let icon: String
    let label: String
    let value: String
    let colors: [Color]

    var body: some View {
        ZStack {
            LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing)
                .opacity(0.3)

            VStack(alignment: .leading, spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.8))
                Text(value)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
                Text(label)
                    .font(.system(size: 10))
                    .foregroundColor(.white.opacity(0.6))
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(10)
        }
        .cornerRadius(12)
    }
}

// MARK: - Helper Functions

func formatNumber(_ number: Int) -> String {
    if number >= 1_000_000 {
        return String(format: "%.1fM", Double(number) / 1_000_000)
    } else if number >= 1_000 {
        return String(format: "%.1fK", Double(number) / 1_000)
    }
    return "\(number)"
}

func timeAgo(_ date: Date) -> String {
    let formatter = RelativeDateTimeFormatter()
    formatter.unitsStyle = .abbreviated
    return formatter.localizedString(for: date, relativeTo: Date())
}

// MARK: - Color Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Widget Configuration

@main
struct ClaudeScopeWidget: Widget {
    let kind: String = "ClaudeScopeWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ClaudeScopeProvider()) { entry in
            ClaudeScopeWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("ClaudeScope")
        .description("View your Claude usage statistics at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Previews

#Preview(as: .systemSmall) {
    ClaudeScopeWidget()
} timeline: {
    ClaudeScopeEntry(date: .now, data: .placeholder)
}

#Preview(as: .systemMedium) {
    ClaudeScopeWidget()
} timeline: {
    ClaudeScopeEntry(date: .now, data: .placeholder)
}

#Preview(as: .systemLarge) {
    ClaudeScopeWidget()
} timeline: {
    ClaudeScopeEntry(date: .now, data: .placeholder)
}
