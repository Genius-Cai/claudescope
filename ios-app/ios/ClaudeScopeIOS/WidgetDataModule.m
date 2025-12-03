//
//  WidgetDataModule.m
//  ClaudeScopeIOS
//
//  Objective-C bridge for WidgetDataModule Swift class
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetDataModule, NSObject)

RCT_EXTERN_METHOD(
  updateWidgetData:(int)totalTokens
  inputTokens:(int)inputTokens
  outputTokens:(int)outputTokens
  sessionsCount:(int)sessionsCount
  healthScore:(int)healthScore
  healthGrade:(NSString *)healthGrade
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getWidgetData:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  reloadWidgets:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  clearWidgetData:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

@end
