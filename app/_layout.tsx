import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Crear una instancia del cliente de React Query
const queryClient = new QueryClient();

// Componente personalizado para el encabezado
function HeaderTitle() {
	const { theme } = useTheme();
	const isDark = theme === "dark";

	return (
		<View className="flex-row items-center">
			<View className="dark:bg-blue-800 bg-blue-200 rounded-full p-1 mr-2">
				<FontAwesome
					name="comments"
					size={18}
					color={isDark ? "#c9e2ff" : "#619eff"}
				/>
			</View>
			<Text className="font-bold text-lg dark:text-blue-200 text-blue-800">
				Chat con GGUF
			</Text>
		</View>
	);
}

export default function RootLayout() {
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	// Inicializar NativeWind y establecer el tema oscuro
	const { setColorScheme } = useColorScheme();
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
			<ThemeProvider>
				<Stack
					screenOptions={{
						headerShown: true,
						headerStyle: {
							backgroundColor: "rgba(17, 24, 39, 0.9)", // bg-gray-900/90 para dark
						},
						headerShadowVisible: false,
						headerTitle: () => <HeaderTitle />,
						headerTitleAlign: "center",
					}}
				>
					<Stack.Screen name="index" />
				</Stack>
				<StatusBar style="light" />
			</ThemeProvider>
		</QueryClientProvider>
	);
}
