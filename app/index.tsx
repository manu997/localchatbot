import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	SafeAreaView,
	ActivityIndicator,
	Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";

import { ChatInput } from "../components/ChatInput";
import { ChatMessage } from "../components/ChatMessage";
import { useLlamaModel } from "../hooks/useLlamaModel";

type Message = {
	id: string;
	content: string;
	role: "user" | "assistant";
};

export default function ChatScreen() {
	const [messages, setMessages] = useState<Message[]>([]);
	const scrollViewRef = useRef<ScrollView>(null);

	// Simulamos el hook de useLlamaModel, ya que aún no está implementado
	const { isReady, isLoading, isGenerating, generateText } = {
		isReady: true,
		isLoading: false,
		isGenerating: false,
		generateText: async (prompt: string) => `Respuesta a: ${prompt}`,
	};

	// Mutación para generar respuestas
	const generateResponseMutation = useMutation({
		mutationFn: async (prompt: string) => {
			return await generateText(prompt);
		},
		onSuccess: (response) => {
			// Añadir la respuesta del asistente
			setMessages((prev) => [
				...prev,
				{ id: Date.now().toString(), content: response, role: "assistant" },
			]);
		},
		onError: (error) => {
			// Mostrar error
			Alert.alert(
				"Error",
				"No se pudo generar una respuesta. Por favor, inténtalo de nuevo.",
				[{ text: "OK" }],
			);
			console.error("Error generando respuesta:", error);
		},
	});

	// Manejar el envío de mensajes
	const handleSendMessage = (content: string) => {
		// Añadir mensaje del usuario
		const newMessage: Message = {
			id: Date.now().toString(),
			content,
			role: "user",
		};

		setMessages((prev) => [...prev, newMessage]);

		// Generar respuesta
		generateResponseMutation.mutate(content);
	};

	// Desplazarse hacia abajo al añadir nuevos mensajes
	useEffect(() => {
		if (scrollViewRef.current) {
			scrollViewRef.current.scrollToEnd({ animated: true });
		}
	});

	// Mensajes de bienvenida y carga
	let statusMessage = "";
	if (isLoading) {
		statusMessage = "Cargando modelo...";
	} else if (!isReady) {
		statusMessage = "El modelo no está listo. Por favor, espera...";
	}

	return (
		<SafeAreaView className="flex-1 bg-white">
			<View className="flex-1 p-4">
				{statusMessage ? (
					<View className="flex-1 justify-center items-center">
						<ActivityIndicator size="large" color="#0000ff" />
						<Text className="mt-4 text-gray-600">{statusMessage}</Text>
					</View>
				) : (
					<>
						{messages.length === 0 ? (
							<View className="flex-1 justify-center items-center">
								<View className="p-6 rounded-full bg-blue-100 mb-4">
									<FontAwesome name="comments" size={40} color="#3b82f6" />
								</View>
								<Text className="text-xl font-bold mb-2">
									¡Bienvenido al Chatbot GGUF!
								</Text>
								<Text className="text-center text-gray-600 mb-6">
									Este chatbot funciona completamente en tu dispositivo usando
									un modelo GGUF.
								</Text>
								<TouchableOpacity
									className="bg-blue-500 py-3 px-6 rounded-full"
									onPress={() => handleSendMessage("Hola, ¿cómo estás?")}
								>
									<Text className="text-white font-bold">
										Iniciar conversación
									</Text>
								</TouchableOpacity>
							</View>
						) : (
							<ScrollView
								ref={scrollViewRef}
								className="flex-1"
								contentContainerStyle={{ paddingBottom: 16 }}
							>
								{messages.map((message) => (
									<ChatMessage
										key={message.id}
										role={message.role}
										content={message.content}
									/>
								))}
								{isGenerating && (
									<View className="self-start p-3 bg-gray-100 rounded-lg mb-2">
										<ActivityIndicator size="small" color="#3b82f6" />
									</View>
								)}
							</ScrollView>
						)}
					</>
				)}
			</View>

			<ChatInput
				onSend={handleSendMessage}
				isLoading={isGenerating || isLoading || !isReady}
			/>
		</SafeAreaView>
	);
}
