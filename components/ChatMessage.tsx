import React from "react";
import { View, Text } from "react-native";
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
					intensity={isDark ? 70 : 20}
					tint={isDark ? "dark" : "light"}
					className={`
						py-3 px-4 rounded-2xl rounded-tl-sm max-w-[85%]
						${isDark ? "bg-gray-800/80" : "bg-white/70"}
						shadow-sm
					`}
				>
					<Text
						className={`
						text-base
						${isDark ? "text-gray-100" : "text-gray-800"}
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
					py-3 px-4 rounded-2xl rounded-tl-sm max-w-[85%]
					${isDark ? "bg-gray-800/90" : "bg-gray-100/90"}
					shadow-sm
				`}
				>
					<Text
						className={`
						text-base
						${isDark ? "text-gray-100" : "text-gray-800"}
					`}
					>
						{content}
					</Text>
				</View>
			</View>
		);
	}
}
