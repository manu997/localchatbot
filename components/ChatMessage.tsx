import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

type MessageRole = "user" | "assistant";
type ThemeType = "light" | "dark";

interface ChatMessageProps {
	role: MessageRole;
	content: string;
	theme?: ThemeType;
}

// Colores para temas claro y oscuro
const messageColors = {
	light: {
		user: {
			background: "#3b82f6",
			text: "#FFFFFF",
		},
		assistant: {
			background: "rgba(255, 255, 255, 0.7)",
			text: "#1F2937",
		},
	},
	dark: {
		user: {
			background: "#2563EB",
			text: "#FFFFFF",
		},
		assistant: {
			background: "rgba(31, 41, 55, 0.8)",
			text: "#E5E7EB",
		},
	},
};

export function ChatMessage({
	role,
	content,
	theme = "light",
}: ChatMessageProps) {
	const colors = messageColors[theme][role];

	if (role === "user") {
		return (
			<View className="mb-3 items-end">
				<View
					className="py-3 px-4 rounded-2xl rounded-tr-sm max-w-[85%]"
					style={[styles.userMessage, { backgroundColor: colors.background }]}
				>
					<Text style={{ color: colors.text }} className="text-base">
						{content}
					</Text>
				</View>
			</View>
		);
	}

	// El mensaje del asistente intenta usar BlurView si es posible, pero cae de nuevo a un View regular
	try {
		return (
			<View className="mb-3 items-start">
				<BlurView
					intensity={theme === "dark" ? 70 : 20}
					tint={theme === "dark" ? "dark" : "light"}
					className="py-3 px-4 rounded-2xl rounded-tl-sm max-w-[85%]"
					style={[
						styles.assistantMessage,
						{ backgroundColor: colors.background },
					]}
				>
					<Text style={{ color: colors.text }} className="text-base">
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
					className="py-3 px-4 rounded-2xl rounded-tl-sm max-w-[85%]"
					style={[
						styles.assistantMessage,
						{ backgroundColor: colors.background },
					]}
				>
					<Text style={{ color: colors.text }} className="text-base">
						{content}
					</Text>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	userMessage: {
		elevation: 3,
		shadowColor: "#1d4ed8",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
	},
	assistantMessage: {
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
	},
});
