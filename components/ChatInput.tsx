import React, { useState } from "react";
import {
	View,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface ChatInputProps {
	onSend: (message: string) => void;
	isLoading?: boolean;
	value?: string;
	onChangeText?: (text: string) => void;
}

export function ChatInput({
	onSend,
	isLoading = false,
	value,
	onChangeText,
}: ChatInputProps) {
	const [message, setMessage] = useState("");
	const { theme } = useTheme();
	const isDark = theme === "dark";

	// Estado local o props según lo que se proporcione
	const currentMessage = value !== undefined ? value : message;
	const handleChangeText = (text: string) => {
		if (onChangeText) {
			onChangeText(text);
		} else {
			setMessage(text);
		}
	};

	const handleSend = () => {
		if (currentMessage.trim() && !isLoading) {
			onSend(currentMessage);
			// Solo limpiar el estado local si no se proporciona value desde fuera
			if (value === undefined) {
				setMessage("");
			}
		}
	};

	const hasText = currentMessage.trim().length > 0;

	return (
		<View
			className={`
			mb-2 rounded-2xl overflow-hidden mx-3 border
			${isDark ? "bg-gray-800/70 border-gray-700" : "bg-white/80 border-gray-200"} 
			shadow-lg
		`}
		>
			<View className="flex-row items-center p-3">
				<TextInput
					className={`
						flex-1 py-2 px-4 text-base rounded-full mx-1
						${isDark ? "bg-gray-700/70 text-gray-100" : "bg-white/70 text-gray-800"}
					`}
					placeholder="Escribe un mensaje..."
					placeholderTextColor={isDark ? "#9CA3AF" : "#9CA3AF"}
					value={currentMessage}
					onChangeText={handleChangeText}
					multiline
					maxLength={1000}
					onSubmitEditing={handleSend}
					editable={!isLoading}
				/>
				<TouchableOpacity
					className={`
						p-3 rounded-full mx-1
						${
							hasText && !isLoading
								? isDark
									? "bg-blue-700"
									: "bg-blue-500"
								: isDark
									? "bg-gray-600"
									: "bg-gray-400"
						}
					`}
					onPress={handleSend}
					disabled={isLoading || !hasText}
					activeOpacity={0.7}
				>
					{isLoading ? (
						<ActivityIndicator color="#FFFFFF" size="small" />
					) : (
						<FontAwesome name="paper-plane" size={20} color="#FFFFFF" />
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
}
