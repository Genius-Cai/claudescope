/**
 * Widget Service
 *
 * Handles synchronization between app data and iOS Widget
 */

import {updateWidgetData, type WidgetData} from '../native/WidgetModule';

interface StatisticsData {
  tokens?: {
    total_tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
  };
  sessions_count?: number;
}

interface HealthData {
  overall_score?: number;
  grade?: string;
}

/**
 * Sync statistics and health data to the iOS Widget
 * Call this after fetching updated data from the API
 */
export async function syncWidgetData(
  stats: StatisticsData | undefined,
  health: HealthData | undefined,
): Promise<void> {
  if (!stats && !health) {
    return;
  }

  const widgetData: WidgetData = {
    totalTokens: stats?.tokens?.total_tokens ?? 0,
    inputTokens: stats?.tokens?.input_tokens ?? 0,
    outputTokens: stats?.tokens?.output_tokens ?? 0,
    sessionsCount: stats?.sessions_count ?? 0,
    healthScore: health?.overall_score ?? 0,
    healthGrade: health?.grade ?? '-',
  };

  try {
    await updateWidgetData(widgetData);
    console.log('Widget data synced successfully');
  } catch (error) {
    console.error('Failed to sync widget data:', error);
  }
}

export default {
  syncWidgetData,
};
