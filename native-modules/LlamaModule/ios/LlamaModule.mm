#import "LlamaModule.h"
#import "LlamaInference.h"

@implementation LlamaModule {
    LlamaInference *_llamaInference;
    dispatch_queue_t _queue;
}

RCT_EXPORT_MODULE()

- (instancetype)init {
    self = [super init];
    if (self) {
        _llamaInference = nil;
        _queue = dispatch_queue_create("com.localchatbot.LlamaModuleQueue", DISPATCH_QUEUE_SERIAL);
    }
    return self;
}

- (dispatch_queue_t)methodQueue {
    return _queue;
}

RCT_EXPORT_METHOD(loadModel:(NSString *)modelName
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(_queue, ^{
        NSString *modelPath = [self getModelPath:modelName];
        if (!modelPath) {
            reject(@"MODEL_NOT_FOUND", @"El modelo no se encontró", nil);
            return;
        }
        
        if (!_llamaInference) {
            _llamaInference = [[LlamaInference alloc] init];
        }
        
        BOOL success = [_llamaInference loadModel:modelPath];
        if (success) {
            resolve(@"Modelo cargado exitosamente");
        } else {
            reject(@"LOAD_ERROR", @"Error al cargar el modelo", nil);
        }
    });
}

RCT_EXPORT_METHOD(generateText:(NSString *)prompt
                  maxTokens:(NSInteger)maxTokens
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(_queue, ^{
        if (!_llamaInference) {
            reject(@"MODEL_NOT_LOADED", @"El modelo no ha sido cargado", nil);
            return;
        }
        
        NSString *response = [_llamaInference generateText:prompt maxTokens:(int)maxTokens];
        resolve(response);
    });
}

RCT_EXPORT_METHOD(unloadModel:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    dispatch_async(_queue, ^{
        if (_llamaInference) {
            [_llamaInference unloadModel];
            _llamaInference = nil;
            resolve(@"Modelo descargado correctamente");
        } else {
            resolve(@"No hay modelo cargado");
        }
    });
}

- (NSString *)getModelPath:(NSString *)modelName {
    // Primero intentamos buscar en el bundle
    NSString *bundlePath = [[NSBundle mainBundle] pathForResource:modelName ofType:nil];
    if (bundlePath) {
        return bundlePath;
    }
    
    // Si no está en el bundle, buscamos en documentos
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    NSString *filePath = [documentsDirectory stringByAppendingPathComponent:modelName];
    
    if ([[NSFileManager defaultManager] fileExistsAtPath:filePath]) {
        return filePath;
    }
    
    return nil;
}

@end 