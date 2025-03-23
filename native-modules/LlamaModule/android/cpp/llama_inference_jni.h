#ifndef LLAMA_INFERENCE_JNI_H
#define LLAMA_INFERENCE_JNI_H

#include <jni.h>

#ifdef __cplusplus
extern "C" {
#endif

JNIEXPORT jboolean JNICALL
Java_com_localchatbot_llamamodule_LlamaInference_loadModel(JNIEnv *env, jobject thiz, jstring model_path);

JNIEXPORT jstring JNICALL
Java_com_localchatbot_llamamodule_LlamaInference_generateText(JNIEnv *env, jobject thiz, jstring prompt, jint max_tokens);

JNIEXPORT void JNICALL
Java_com_localchatbot_llamamodule_LlamaInference_unloadModel(JNIEnv *env, jobject thiz);

#ifdef __cplusplus
}
#endif

#endif // LLAMA_INFERENCE_JNI_H 