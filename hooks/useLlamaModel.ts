import { useState, useEffect, useCallback } from "react";
import { NativeModules, Platform } from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";

// Acceder al módulo nativo
const { LlamaModule } = NativeModules;

// Si no se encuentra el módulo nativo, lanzar un error
if (!LlamaModule) {
	throw new Error(
		"El módulo nativo LlamaModule no se encuentra disponible. Asegúrate de que el módulo nativo esté correctamente configurado.",
	);
}

interface UseLlamaModelProps {
	modelName?: string;
	autoLoad?: boolean;
}

interface GenerateTextOptions {
	maxTokens?: number;
}

export function useLlamaModel({
	modelName = "llama-2-7b-chat.Q5_K_M.gguf",
	autoLoad = false,
}: UseLlamaModelProps = {}) {
	const [isReady, setIsReady] = useState(false);

	// Mutación para cargar el modelo
	const loadModelMutation = useMutation({
		mutationFn: async (name: string) => {
			try {
				const result = await LlamaModule.loadModel(name);
				setIsReady(true);
				return result;
			} catch (error) {
				console.error("Error al cargar el modelo:", error);
				throw error;
			}
		},
	});

	// Mutación para descargar el modelo
	const unloadModelMutation = useMutation({
		mutationFn: async () => {
			try {
				const result = await LlamaModule.unloadModel();
				setIsReady(false);
				return result;
			} catch (error) {
				console.error("Error al descargar el modelo:", error);
				throw error;
			}
		},
	});

	// Mutación para generar texto
	const generateTextMutation = useMutation({
		mutationFn: async ({
			prompt,
			options = {},
		}: { prompt: string; options?: GenerateTextOptions }) => {
			if (!isReady) {
				throw new Error("El modelo no está cargado");
			}

			const { maxTokens = 512 } = options;

			try {
				return await LlamaModule.generateText(prompt, maxTokens);
			} catch (error) {
				console.error("Error al generar texto:", error);
				throw error;
			}
		},
	});

	// Cargar el modelo automáticamente si autoLoad es true
	useEffect(() => {
		if (autoLoad && modelName && !isReady && !loadModelMutation.isPending) {
			loadModelMutation.mutate(modelName);
		}
	}, [autoLoad, modelName, isReady, loadModelMutation]);

	// Método para generar texto
	const generateText = useCallback(
		(prompt: string, options: GenerateTextOptions = {}) => {
			return generateTextMutation.mutateAsync({ prompt, options });
		},
		[generateTextMutation],
	);

	// Método para cargar el modelo
	const loadModel = useCallback(
		(name: string = modelName) => {
			return loadModelMutation.mutateAsync(name);
		},
		[loadModelMutation, modelName],
	);

	// Método para descargar el modelo
	const unloadModel = useCallback(() => {
		return unloadModelMutation.mutateAsync();
	}, [unloadModelMutation]);

	return {
		isReady,
		isLoading: loadModelMutation.isPending,
		isGenerating: generateTextMutation.isPending,
		loadModel,
		unloadModel,
		generateText,
		error:
			loadModelMutation.error ||
			generateTextMutation.error ||
			unloadModelMutation.error,
	};
}
