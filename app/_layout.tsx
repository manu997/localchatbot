import React from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect } from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Crear una instancia del cliente de React Query
const queryClient = new QueryClient();

export default function RootLayout() {
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

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
			<Stack screenOptions={{ headerShown: true }}>
				<Stack.Screen
					name="index"
					options={{
						headerTitle: "Chat con GGUF",
						headerTitleStyle: { fontWeight: "bold" },
					}}
				/>
			</Stack>
			<StatusBar style="auto" />
		</QueryClientProvider>
	);
}
