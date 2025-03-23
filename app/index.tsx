import React, { useRef, useEffect, useState, useCallback } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
	SafeAreaView,
	Alert,
} from "react-native";
import { ChatMessage } from "../components/ChatMessage";
import { ChatInput } from "../components/ChatInput";
import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useLlamaModel } from "../hooks/useLlamaModel";
import "../globals.css";

// Tipo de mensaje
type Message = {
	id: string;
	role: "user" | "assistant";
	content: string;
};

// Generar ID único para mensajes
const generateMessageId = (): string => {
	return Date.now().toString() + Math.random().toString(36).substring(2, 9);
};

// Pantalla principal de chat
export default function ChatScreen() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputText, setInputText] = useState("");
	const scrollViewRef = useRef<ScrollView>(null);
	const { theme } = useTheme();
	const isDark = theme === "dark";

	// Usar el hook useLlamaModel
	const { isReady, isLoading, isGenerating, generateText, loadModel, error } =
		useLlamaModel({
			modelName: "tinyllama-1.1b.gguf",
			autoLoad: true,
		});

	// Mostrar errores del modelo
	useEffect(() => {
		if (error) {
			Alert.alert("Error con el modelo", String(error), [
				{ text: "OK", onPress: () => {} },
			]);
		}
	}, [error]);

	// Scroll automático cuando hay nuevos mensajes
	useEffect(() => {
		if (messages.length > 0) {
			setTimeout(() => {
				scrollViewRef.current?.scrollToEnd({ animated: true });
			}, 100);
		}
	}, [messages]);

	// Iniciar conversación
	const startConversation = useCallback(
		(welcomeMessage = "Hola, ¿en qué puedo ayudarte hoy?") => {
			setMessages([
				{
					id: generateMessageId(),
					role: "assistant",
					content: welcomeMessage,
				},
			]);
		},
		[],
	);

	// Manejar el envío de mensajes
	const handleSend = useCallback(async () => {
		if (inputText.trim() && !isGenerating) {
			// Agregar el mensaje del usuario
			const userMessage = {
				id: generateMessageId(),
				role: "user" as const,
				content: inputText.trim(),
			};

			const newMessages = [...messages, userMessage];
			setMessages(newMessages);
			setInputText("");

			try {
				// Verificar si el modelo está listo
				if (!isReady && !isLoading) {
					await loadModel();
				}

				// Generar respuesta
				const response = await generateText(userMessage.content, {
					maxTokens: 512,
				});

				if (response) {
					// Agregar respuesta del asistente
					const assistantMessage = {
						id: generateMessageId(),
						role: "assistant" as const,
						content: response.trim(),
					};

					setMessages([...newMessages, assistantMessage]);
				}
			} catch (err) {
				console.error("Error al generar respuesta:", err);
			}
		}
	}, [
		inputText,
		messages,
		isReady,
		isLoading,
		isGenerating,
		generateText,
		loadModel,
	]);

	// Obtener estado del modelo
	const getModelStatusText = () => {
		if (isLoading) return "Cargando modelo...";
		if (isReady) return "Modelo listo";
		if (error) return "Error en el modelo";
		return "Modelo no cargado";
	};

	const isProcessing = isLoading || isGenerating;

	return (
		<SafeAreaView
			className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-100"}`}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
				keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
			>
				<View className="flex-1">
					{/* Estado del modelo */}
					{!isReady && (
						<View
							className={`py-1 px-4 ${error ? "bg-red-700" : "bg-blue-700"}`}
						>
							<Text className="text-white text-center text-sm">
								{getModelStatusText()}
							</Text>
						</View>
					)}

					<ScrollView
						ref={scrollViewRef}
						className="flex-1"
						contentContainerStyle={{ padding: 16, flexGrow: 1 }}
					>
						{messages.length === 0 ? (
							// Pantalla de bienvenida cuando no hay mensajes
							<View className="flex-1 justify-center items-center p-6">
								<View
									className={`rounded-full p-5 mb-6 ${isDark ? "bg-gray-800" : "bg-blue-50"}`}
								>
									<FontAwesome
										name="comments"
										size={40}
										className={isDark ? "text-blue-300" : "text-blue-500"}
										color={isDark ? "#93C5FD" : "#3B82F6"}
									/>
								</View>
								<Text
									className={`text-xl font-bold text-center mb-2 ${isDark ? "text-white" : "text-gray-800"}`}
								>
									Bienvenido a Chat con GGUF
								</Text>
								<Text
									className={`text-center mb-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}
								>
									Un asistente basado en un modelo de lenguaje local que corre
									en tu dispositivo.
								</Text>
								<Text
									className={`text-center text-xs mb-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}
								>
									Estado: {getModelStatusText()}
								</Text>
								<TouchableOpacity
									onPress={() =>
										startConversation("Hola, ¿en qué puedo ayudarte hoy?")
									}
									className={`py-3 px-6 rounded-full ${isDark ? "bg-blue-600" : "bg-blue-500"}`}
									disabled={isLoading}
								>
									<Text className="font-bold text-white">
										Iniciar conversación
									</Text>
								</TouchableOpacity>
							</View>
						) : (
							// Lista de mensajes
							messages.map((message) => (
								<ChatMessage
									key={message.id}
									role={message.role}
									content={message.content}
								/>
							))
						)}
						{isProcessing && (
							<View className="p-4 flex items-center">
								<ActivityIndicator
									size="small"
									color={isDark ? "#93C5FD" : "#3B82F6"}
								/>
							</View>
						)}
					</ScrollView>
					{messages.length > 0 && (
						<View className="w-full">
							<ChatInput
								value={inputText}
								onChangeText={setInputText}
								onSend={handleSend}
								isLoading={isProcessing}
							/>
						</View>
					)}
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
