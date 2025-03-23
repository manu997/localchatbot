#import <Foundation/Foundation.h>

@interface LlamaInference : NSObject

- (BOOL)loadModel:(NSString *)modelPath;
- (NSString *)generateText:(NSString *)prompt maxTokens:(int)maxTokens;
- (void)unloadModel;

@end 