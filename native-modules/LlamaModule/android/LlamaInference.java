package com.localchatbot.llamamodule;

public class LlamaInference {
    // Cargar la biblioteca nativa
    static {
        System.loadLibrary("llama_inference_jni");
    }

    // Métodos nativos definidos en C++
    public native boolean loadModel(String modelPath);
    public native String generateText(String prompt, int maxTokens);
    public native void unloadModel();
} 