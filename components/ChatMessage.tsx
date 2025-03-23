import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../context/ThemeContext";

type MessageRole = "user" | "assistant";

interface ChatMessageProps {
	role: MessageRole;
	content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
	const { theme } = useTheme();
	const isDark = theme === "dark";

	if (role === "user") {
		return (
			<View className="mb-3 items-end">
				<View
					className={`
					py-3 px-4 rounded-2xl rounded-tr-sm max-w-[85%]
					${isDark ? "bg-blue-700" : "bg-blue-500"}
					shadow-md
				`}
				>
					<Text className="text-white text-base">{content}</Text>
				</View>
			</View>
		);
	}

	// El mensaje del asistente intenta usar BlurView si es posible, pero cae de nuevo a un View regular
	try {
		return (
			<View className="mb-3 items-start">
				<BlurView
					intensity={isDark ? 40 : 20}
					tint={isDark ? "dark" : "light"}
					className="py-3 px-4 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm"
					style={isDark ? styles.darkAssistantBg : styles.lightAssistantBg}
				>
					<Text
						className={`
						text-base
						${isDark ? "text-white" : "text-gray-800"}
					`}
					>
						{content}
					</Text>
				</BlurView>
			</View>
		);
	} catch (e) {
		// Fallback si BlurView causa problemas
		return (
			<View className="mb-3 items-start">
				<View
					className={`
					py-3 px-4 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm
					${isDark ? "bg-gray-600/90" : "bg-gray-100/90"}
				`}
				>
					<Text
						className={`
						text-base
						${isDark ? "text-white" : "text-gray-800"}
					`}
					>
						{content}
					</Text>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	darkAssistantBg: {
		backgroundColor: "rgba(75, 85, 99, 0.8)", // Equivalente a bg-gray-600/80
	},
	lightAssistantBg: {
		backgroundColor: "rgba(255, 255, 255, 0.7)", // Equivalente a bg-white/70
	},
});
