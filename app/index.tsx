import React, { useState, useRef, useCallback } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
	SafeAreaView,
} from "react-native";
import { ChatMessage } from "../components/ChatMessage";
import { ChatInput } from "../components/ChatInput";
import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
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
	const [isProcessing, setIsProcessing] = useState(false);
	const scrollViewRef = useRef<ScrollView>(null);
	const { theme } = useTheme();
	const isDark = theme === "dark";

	// Manejar el envío de mensajes
	const handleSend = useCallback(() => {
		if (inputText.trim() && !isProcessing) {
			// Agregar el mensaje del usuario a los mensajes
			const newMessages = [
				...messages,
				{
					id: generateMessageId(),
					role: "user" as const,
					content: inputText.trim(),
				},
			];
			setMessages(newMessages);
			setInputText("");
			setIsProcessing(true);

			// Desplazar la vista de desplazamiento hacia abajo
			setTimeout(() => {
				scrollViewRef.current?.scrollToEnd({ animated: true });
			}, 100);

			// Aquí es donde se integraría el modelo GGUF en el futuro
			// Por ahora, simplemente simulamos que el procesamiento ha terminado después de un tiempo
			setTimeout(() => {
				setIsProcessing(false);
			}, 500);
		}
	}, [inputText, messages, isProcessing]);

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
									className={`text-center mb-8 ${isDark ? "text-gray-300" : "text-gray-600"}`}
								>
									Un asistente basado en un modelo de lenguaje local que corre
									en tu dispositivo.
								</Text>
								<TouchableOpacity
									onPress={() => {
										const welcomePrompt = "Hola, ¿en qué puedo ayudarte hoy?";
										const initialMessage = {
											id: generateMessageId(),
											role: "user" as const,
											content: welcomePrompt,
										};
										setMessages([initialMessage]);
									}}
									className={`py-3 px-6 rounded-full ${isDark ? "bg-blue-600" : "bg-blue-500"}`}
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
