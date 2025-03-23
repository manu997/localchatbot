import React, { useState } from "react";
import {
	View,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface ChatInputProps {
	onSend: (message: string) => void;
	isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading = false }: ChatInputProps) {
	const [message, setMessage] = useState("");

	const handleSend = () => {
		if (message.trim() && !isLoading) {
			onSend(message);
			setMessage("");
		}
	};

	return (
		<View className="flex-row items-center border border-gray-300 rounded-full px-4 py-2 mb-4 mx-2">
			<TextInput
				className="flex-1 py-2 px-3 text-base"
				placeholder="Escribe un mensaje..."
				value={message}
				onChangeText={setMessage}
				multiline
				maxLength={1000}
				onSubmitEditing={handleSend}
				editable={!isLoading}
			/>
			<TouchableOpacity
				className="p-2 bg-blue-500 rounded-full"
				onPress={handleSend}
				disabled={isLoading || !message.trim()}
				activeOpacity={0.7}
			>
				{isLoading ? (
					<ActivityIndicator color="#fff" size="small" />
				) : (
					<FontAwesome name="send" size={20} color="#fff" />
				)}
			</TouchableOpacity>
		</View>
	);
}
