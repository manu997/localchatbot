# Local Chatbot con GGUF

Una aplicación de chat que utiliza modelos de lenguaje local GGUF para ejecutarse directamente en tu dispositivo sin necesidad de conexión a internet.

## Características

- Interfaz de chat moderna y atractiva
- Temas claro y oscuro
- Procesamiento de lenguaje natural local con modelos GGUF
- No requiere conexión a internet para funcionar
- Privacidad garantizada, toda la información se procesa en el dispositivo

## Requisitos previos

- Node.js 18 o superior
- Expo CLI
- Android Studio (para desarrollo Android)
- Xcode (para desarrollo iOS)

## Instalación

1. Clona este repositorio:
```bash
git clone https://github.com/tu-usuario/localchatbot.git
cd localchatbot
```

2. Instala las dependencias:
```bash
npm install
```

3. Añade un modelo GGUF:
   - Descarga un modelo GGUF compatible (recomendamos TinyLlama o Mistral Small) desde [HuggingFace](https://huggingface.co/)
   - Coloca el archivo GGUF en la carpeta `assets/models/` y nómbralo como `tinyllama-1.1b.gguf` (o actualiza el nombre en el código)

4. Inicia la aplicación:
```bash
npm run reset
```

## Estructura del proyecto

- `/app` - Pantallas y navegación de la aplicación
- `/components` - Componentes reutilizables
- `/context` - Proveedores de contexto (tema, etc.)
- `/hooks` - Hooks personalizados
- `/native-modules` - Módulos nativos para integración con el modelo GGUF
- `/assets` - Recursos estáticos (imágenes, fuentes, modelos)

## Módulos nativos

El proyecto utiliza módulos nativos para interactuar con los modelos GGUF:

- **LlamaModule**: Interfaz para cargar y ejecutar modelos GGUF
  - `loadModel(modelName)`: Carga un modelo desde la carpeta assets/models
  - `generateText(prompt, maxTokens)`: Genera texto basado en el prompt
  - `unloadModel()`: Descarga el modelo de la memoria

## Desarrollo

Para el desarrollo, se recomienda utilizar:

```bash
npm run reset
```

Este comando limpia la caché y reinicia el servidor de desarrollo, lo cual es útil después de cambios en los módulos nativos.

## Compilación

### Android

```bash
eas build -p android --profile development
```

### iOS

```bash
eas build -p ios --profile development
```

## Notas sobre los modelos

- Los modelos GGUF deben ser optimizados para dispositivos móviles (se recomiendan modelos pequeños)
- El rendimiento depende del dispositivo y el tamaño del modelo
- Se recomienda utilizar modelos de menos de 2GB para un rendimiento óptimo en la mayoría de dispositivos

## Licencia

MIT
