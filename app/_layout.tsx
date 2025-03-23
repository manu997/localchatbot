import React from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { View, Text, useColorScheme } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Crear una instancia del cliente de React Query
const queryClient = new QueryClient();

// Colores para temas claro y oscuro
const headerColors = {
	light: {
		background: "rgba(237, 242, 247, 0.85)",
		icon: "#3B82F6",
		iconBackground: "#93C5FD",
		text: "#1E40AF",
	},
	dark: {
		background: "rgba(17, 24, 39, 0.9)",
		icon: "#DBEAFE",
		iconBackground: "#1E40AF",
		text: "#93C5FD",
	},
};

// Componente personalizado para el encabezado
function HeaderTitle() {
	// Forzar el tema oscuro
	const theme = "dark";
	const colors = headerColors[theme];

	return (
		<View className="flex-row items-center">
			<View
				style={{ backgroundColor: colors.iconBackground }}
				className="rounded-full p-1 mr-2"
			>
				<FontAwesome name="comments" size={18} color={colors.icon} />
			</View>
			<Text style={{ color: colors.text }} className="font-bold text-lg">
				Chat con GGUF
			</Text>
		</View>
	);
}

export default function RootLayout() {
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	// Forzar el tema oscuro
	const theme = "dark";
	const colors = headerColors[theme];

	// Inicializar NativeWind
	const { setColorScheme } = useNativeWindColorScheme();
	useEffect(() => {
		setColorScheme("dark");
	}, [setColorScheme]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<QueryClientProvider client={queryClient}>
			<Stack
				screenOptions={{
					headerShown: true,
					headerStyle: {
						backgroundColor: colors.background,
					},
					headerShadowVisible: false,
					headerTitle: () => <HeaderTitle />,
					headerTitleAlign: "center",
				}}
			>
				<Stack.Screen name="index" />
			</Stack>
			<StatusBar style="light" />
		</QueryClientProvider>
	);
}
