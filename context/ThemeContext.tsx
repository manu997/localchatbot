import React, {
	createContext,
	useContext,
	useEffect,
	type ReactNode,
} from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";
import { useColorScheme } from "nativewind";

// Tipos para el contexto
type ThemeType = "light" | "dark";
type ThemeContextType = {
	theme: ThemeType;
	toggleTheme: () => void;
	setTheme: (theme: ThemeType) => void;
};

// Crear el contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Proveedor del contexto
export function ThemeProvider({ children }: { children: ReactNode }) {
	// Obtener el esquema de color del dispositivo
	const deviceColorScheme = useDeviceColorScheme();

	// Obtener y establecer el esquema de color de NativeWind
	const { colorScheme, setColorScheme } = useColorScheme();

	// Forzar el tema oscuro (esto se puede cambiar para usar el tema del sistema)
	useEffect(() => {
		setColorScheme(deviceColorScheme || "dark");
	}, [deviceColorScheme, setColorScheme]);

	// Función para alternar entre temas
	const toggleTheme = () => {
		setColorScheme(colorScheme === "dark" ? "light" : "dark");
	};

	// Función para establecer un tema específico
	const setTheme = (theme: ThemeType) => {
		setColorScheme(theme);
	};

	// Valor del contexto
	const contextValue: ThemeContextType = {
		theme: (colorScheme || "dark") as ThemeType,
		toggleTheme,
		setTheme,
	};

	return (
		<ThemeContext.Provider value={contextValue}>
			{children}
		</ThemeContext.Provider>
	);
}

// Hook personalizado para usar el contexto del tema
export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
