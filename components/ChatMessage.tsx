import React from "react";
import { View, Text } from "react-native";

type MessageRole = "user" | "assistant";

interface ChatMessageProps {
	role: MessageRole;
	content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
	return (
		<View
			className={`p-3 mb-2 rounded-lg ${role === "user" ? "bg-blue-100 self-end" : "bg-gray-100 self-start"}`}
		>
			<Text
				className={`text-base ${role === "user" ? "text-blue-900" : "text-gray-900"}`}
			>
				{content}
			</Text>
		</View>
	);
}
