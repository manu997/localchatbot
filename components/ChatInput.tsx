import React, { useState } from "react";
import {
	View,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

type ThemeType = "light" | "dark";

interface ChatInputProps {
	onSend: (message: string) => void;
	isLoading?: boolean;
	theme?: ThemeType;
	value?: string;
	onChangeText?: (text: string) => void;
}

// Colores para temas claro y oscuro
const inputColors = {
	light: {
		container: {
			background: "rgba(255, 255, 255, 0.8)",
			border: "#E5E7EB",
		},
		input: {
			background: "rgba(255, 255, 255, 0.7)",
			text: "#1F2937",
			placeholder: "#9CA3AF",
		},
		button: {
			active: "#3B82F6",
			inactive: "#9CA3AF",
			text: "#FFFFFF",
		},
	},
	dark: {
		container: {
			background: "rgba(31, 41, 55, 0.7)",
			border: "#374151",
		},
		input: {
			background: "rgba(55, 65, 81, 0.7)",
			text: "#E5E7EB",
			placeholder: "#9CA3AF",
		},
		button: {
			active: "#2563EB",
			inactive: "#4B5563",
			text: "#FFFFFF",
		},
	},
};

export function ChatInput({
	onSend,
	isLoading = false,
	theme = "light",
	value,
	onChangeText,
}: ChatInputProps) {
	const [message, setMessage] = useState("");
	const colors = inputColors[theme];

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

	const buttonColor =
		currentMessage.trim() && !isLoading
			? colors.button.active
			: colors.button.inactive;

	return (
		<View
			className="mb-2 rounded-2xl overflow-hidden mx-3 border"
			style={[
				styles.container,
				{
					backgroundColor: colors.container.background,
					borderColor: colors.container.border,
				},
			]}
		>
			<View className="flex-row items-center p-3">
				<TextInput
					className="flex-1 py-2 px-4 text-base rounded-full mx-1"
					style={[
						styles.input,
						{
							backgroundColor: colors.input.background,
							color: colors.input.text,
						},
					]}
					placeholder="Escribe un mensaje..."
					placeholderTextColor={colors.input.placeholder}
					value={currentMessage}
					onChangeText={handleChangeText}
					multiline
					maxLength={1000}
					onSubmitEditing={handleSend}
					editable={!isLoading}
				/>
				<TouchableOpacity
					className="p-3 rounded-full mx-1"
					style={[styles.button, { backgroundColor: buttonColor }]}
					onPress={handleSend}
					disabled={isLoading || !currentMessage.trim()}
					activeOpacity={0.7}
				>
					{isLoading ? (
						<ActivityIndicator color={colors.button.text} size="small" />
					) : (
						<FontAwesome
							name="paper-plane"
							size={20}
							color={colors.button.text}
						/>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	input: {
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	button: {
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 3,
	},
});
