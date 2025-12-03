/**
 * Native Widget Module
 *
 * TypeScript wrapper for the native iOS WidgetDataModule
 * Used to share data with the iOS Widget Extension via App Groups
 */

import {NativeModules, Platform} from 'react-native';

interface WidgetDataModuleInterface {
  updateWidgetData(
    totalTokens: number,
    inputTokens: number,
    outputTokens: number,
    sessionsCount: number,
    healthScore: number,
    healthGrade: string,
  ): Promise<{success: boolean}>;

  getWidgetData(): Promise<{
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    sessionsCount: number;
    healthScore: number;
    healthGrade: string;
    lastUpdated: string;
  } | null>;

  reloadWidgets(): Promise<{success: boolean}>;

  clearWidgetData(): Promise<{success: boolean}>;
}

const {WidgetDataModule} = NativeModules;

/**
 * Widget Data Interface
 */
export interface WidgetData {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  sessionsCount: number;
  healthScore: number;
  healthGrade: string;
}

/**
 * Update the iOS widget with new statistics data
 * This writes to App Group shared UserDefaults and triggers widget refresh
 */
export async function updateWidgetData(data: WidgetData): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    console.log('Widgets are only supported on iOS');
    return false;
  }

  // Check if native module is available (may not be linked yet)
  if (!WidgetDataModule) {
    console.log('WidgetDataModule not available - native module not linked');
    return false;
  }

  try {
    const module = WidgetDataModule as WidgetDataModuleInterface;
    await module.updateWidgetData(
      data.totalTokens,
      data.inputTokens,
      data.outputTokens,
      data.sessionsCount,
      data.healthScore,
      data.healthGrade,
    );
    return true;
  } catch (error) {
    console.error('Failed to update widget data:', error);
    return false;
  }
}

/**
 * Get current widget data from shared storage
 */
export async function getWidgetData(): Promise<WidgetData | null> {
  if (Platform.OS !== 'ios') {
    return null;
  }

  if (!WidgetDataModule) {
    return null;
  }

  try {
    const module = WidgetDataModule as WidgetDataModuleInterface;
    const data = await module.getWidgetData();
    return data;
  } catch (error) {
    console.error('Failed to get widget data:', error);
    return null;
  }
}

/**
 * Force reload all widget timelines
 */
export async function reloadWidgets(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  if (!WidgetDataModule) {
    return false;
  }

  try {
    const module = WidgetDataModule as WidgetDataModuleInterface;
    await module.reloadWidgets();
    return true;
  } catch (error) {
    console.error('Failed to reload widgets:', error);
    return false;
  }
}

/**
 * Clear all widget data
 */
export async function clearWidgetData(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  if (!WidgetDataModule) {
    return false;
  }

  try {
    const module = WidgetDataModule as WidgetDataModuleInterface;
    await module.clearWidgetData();
    return true;
  } catch (error) {
    console.error('Failed to clear widget data:', error);
    return false;
  }
}

export default {
  updateWidgetData,
  getWidgetData,
  reloadWidgets,
  clearWidgetData,
};
