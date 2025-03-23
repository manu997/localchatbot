#include "llama_inference_jni.h"
#include <string>
#include <vector>
#include <memory>
#include <android/log.h>

// Incluir la biblioteca llama.cpp
#include "llama.h"

#define LLAMA_LOG_TAG "LlamaInferenceJNI"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LLAMA_LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LLAMA_LOG_TAG, __VA_ARGS__)

// Variables globales para almacenar el contexto del modelo
struct LlamaContext {
    llama_model* model;
    llama_context* ctx;
    bool is_loaded;
    
    LlamaContext() : model(nullptr), ctx(nullptr), is_loaded(false) {}
    
    ~LlamaContext() {
        if (is_loaded) {
            llama_free(ctx);
            llama_free_model(model);
        }
    }
};

static std::unique_ptr<LlamaContext> g_llama_context;

extern "C" {

JNIEXPORT jboolean JNICALL
Java_com_localchatbot_llamamodule_LlamaInference_loadModel(JNIEnv *env, jobject thiz, jstring model_path) {
    const char *model_path_cstr = env->GetStringUTFChars(model_path, nullptr);
    if (model_path_cstr == nullptr) {
        return JNI_FALSE;
    }
    
    bool success = false;
    
    try {
        LOGI("Loading model: %s", model_path_cstr);
        
        // Crear nuevo contexto si no existe
        if (!g_llama_context) {
            g_llama_context = std::make_unique<LlamaContext>();
        } else if (g_llama_context->is_loaded) {
            // Si ya hay un modelo cargado, liberarlo primero
            llama_free(g_llama_context->ctx);
            llama_free_model(g_llama_context->model);
            g_llama_context->is_loaded = false;
        }
        
        // Inicializar llama.cpp
        llama_backend_init(false);
        
        // Configurar parámetros del modelo
        llama_model_params model_params = llama_model_default_params();
        g_llama_context->model = llama_load_model_from_file(model_path_cstr, model_params);
        
        if (g_llama_context->model == nullptr) {
            LOGE("Failed to load model");
            env->ReleaseStringUTFChars(model_path, model_path_cstr);
            return JNI_FALSE;
        }
        
        // Configurar parámetros del contexto
        llama_context_params ctx_params = llama_context_default_params();
        ctx_params.n_ctx = 2048; // Tamaño del contexto
        ctx_params.n_batch = 512; // Tamaño del lote
        ctx_params.n_threads = 4; // Número de hilos
        
        g_llama_context->ctx = llama_new_context_with_model(g_llama_context->model, ctx_params);
        
        if (g_llama_context->ctx == nullptr) {
            LOGE("Failed to create context");
            llama_free_model(g_llama_context->model);
            env->ReleaseStringUTFChars(model_path, model_path_cstr);
            return JNI_FALSE;
        }
        
        g_llama_context->is_loaded = true;
        success = true;
        
        LOGI("Model loaded successfully");
    } catch (const std::exception& e) {
        LOGE("Error loading model: %s", e.what());
    }
    
    env->ReleaseStringUTFChars(model_path, model_path_cstr);
    return success ? JNI_TRUE : JNI_FALSE;
}

JNIEXPORT jstring JNICALL
Java_com_localchatbot_llamamodule_LlamaInference_generateText(JNIEnv *env, jobject thiz, jstring prompt, jint max_tokens) {
    if (!g_llama_context || !g_llama_context->is_loaded) {
        return env->NewStringUTF("Error: Model not loaded");
    }
    
    const char *prompt_cstr = env->GetStringUTFChars(prompt, nullptr);
    if (prompt_cstr == nullptr) {
        return env->NewStringUTF("Error: Failed to get prompt string");
    }
    
    std::string result;
    
    try {
        LOGI("Generating text for prompt: %s", prompt_cstr);
        
        // Tokenizar el prompt
        std::vector<llama_token> tokens(max_tokens);
        int n_tokens = llama_tokenize(g_llama_context->model, prompt_cstr, -1, tokens.data(), tokens.size(), true, false);
        if (n_tokens < 0) {
            LOGE("Failed to tokenize prompt");
            env->ReleaseStringUTFChars(prompt, prompt_cstr);
            return env->NewStringUTF("Error: Failed to tokenize prompt");
        }
        
        tokens.resize(n_tokens);
        
        // Generar texto
        llama_batch batch = llama_batch_init(tokens.size(), 0, 1);
        for (int i = 0; i < tokens.size(); i++) {
            llama_batch_add(batch, tokens[i], i, { 0 }, false);
        }
        
        if (llama_decode(g_llama_context->ctx, batch) != 0) {
            LOGE("Failed to decode prompt");
            llama_batch_free(batch);
            env->ReleaseStringUTFChars(prompt, prompt_cstr);
            return env->NewStringUTF("Error: Failed to decode prompt");
        }
        
        // Generar respuesta token por token
        result = prompt_cstr;
        result += "\n\n";
        
        for (int i = 0; i < max_tokens; i++) {
            llama_token token_id = llama_sample_token(g_llama_context->ctx);
            
            if (token_id == llama_token_eos(g_llama_context->model)) {
                break;
            }
            
            // Convertir token a texto
            char buffer[8];
            int n_chars = llama_token_to_piece(g_llama_context->model, token_id, buffer, sizeof(buffer));
            if (n_chars > 0) {
                result.append(buffer, n_chars);
            }
            
            // Decodificar el siguiente token
            llama_batch next_batch = llama_batch_init(1, 0, 1);
            llama_batch_add(next_batch, token_id, tokens.size() + i, { 0 }, false);
            
            if (llama_decode(g_llama_context->ctx, next_batch) != 0) {
                LOGE("Failed to decode token");
                llama_batch_free(next_batch);
                break;
            }
            
            llama_batch_free(next_batch);
        }
        
        llama_batch_free(batch);
        LOGI("Text generated successfully");
    } catch (const std::exception& e) {
        LOGE("Error generating text: %s", e.what());
        result = std::string("Error: ") + e.what();
    }
    
    env->ReleaseStringUTFChars(prompt, prompt_cstr);
    return env->NewStringUTF(result.c_str());
}

JNIEXPORT void JNICALL
Java_com_localchatbot_llamamodule_LlamaInference_unloadModel(JNIEnv *env, jobject thiz) {
    try {
        if (g_llama_context && g_llama_context->is_loaded) {
            llama_free(g_llama_context->ctx);
            llama_free_model(g_llama_context->model);
            
            g_llama_context->ctx = nullptr;
            g_llama_context->model = nullptr;
            g_llama_context->is_loaded = false;
            
            // Liberar recursos de llama.cpp
            llama_backend_free();
            
            LOGI("Model unloaded successfully");
        }
    } catch (const std::exception& e) {
        LOGE("Error unloading model: %s", e.what());
    }
}

} // extern "C" 