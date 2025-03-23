package com.localchatbot.llamamodule;

import android.content.res.AssetManager;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@ReactModule(name = LlamaModule.NAME)
public class LlamaModule extends ReactContextBaseJavaModule {
    public static final String NAME = "LlamaModule";
    private static final String TAG = "LlamaModule";
    private final ReactApplicationContext reactContext;
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();
    private LlamaInference llamaInference;

    public LlamaModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void loadModel(String modelName, Promise promise) {
        executorService.execute(() -> {
            try {
                // Copiar el modelo desde assets a un archivo temporal si es necesario
                File modelFile = copyModelFromAssetsIfNeeded(modelName);
                
                // Inicializar el motor de inferencia si aún no está inicializado
                if (llamaInference == null) {
                    llamaInference = new LlamaInference();
                }
                
                // Cargar el modelo
                boolean success = llamaInference.loadModel(modelFile.getAbsolutePath());
                
                if (success) {
                    promise.resolve("Modelo cargado exitosamente");
                } else {
                    promise.reject("LOAD_ERROR", "Error al cargar el modelo");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error loading model", e);
                promise.reject("LOAD_ERROR", "Error al cargar el modelo: " + e.getMessage());
            }
        });
    }

    @ReactMethod
    public void generateText(String prompt, int maxTokens, Promise promise) {
        if (llamaInference == null) {
            promise.reject("MODEL_NOT_LOADED", "El modelo no ha sido cargado");
            return;
        }

        executorService.execute(() -> {
            try {
                String response = llamaInference.generateText(prompt, maxTokens);
                promise.resolve(response);
            } catch (Exception e) {
                Log.e(TAG, "Error generating text", e);
                promise.reject("GENERATION_ERROR", "Error al generar texto: " + e.getMessage());
            }
        });
    }

    private File copyModelFromAssetsIfNeeded(String modelName) throws IOException {
        File modelsDir = new File(reactContext.getFilesDir(), "models");
        if (!modelsDir.exists()) {
            modelsDir.mkdirs();
        }

        File modelFile = new File(modelsDir, modelName);

        // Si el archivo ya existe, no hace falta copiarlo
        if (modelFile.exists()) {
            return modelFile;
        }

        // Copiar desde assets
        AssetManager assetManager = reactContext.getAssets();
        try (InputStream in = assetManager.open("models/" + modelName);
             OutputStream out = new FileOutputStream(modelFile)) {
            byte[] buffer = new byte[1024];
            int read;
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
        }

        return modelFile;
    }

    @ReactMethod
    public void unloadModel(Promise promise) {
        if (llamaInference != null) {
            llamaInference.unloadModel();
            llamaInference = null;
            promise.resolve("Modelo descargado correctamente");
        } else {
            promise.resolve("No hay modelo cargado");
        }
    }
} 