# 🚀 Cómo Probar la Integración shadcn/ui + MCP

## 📋 Requisitos Previos

✅ **Servidor Corriendo**: Asegúrate de que el servidor está funcionando en `http://localhost:3000`
✅ **Dependencias Instaladas**: Todas las dependencias de shadcn/ui y MCP ya están instaladas
✅ **MCP Server Disponible**: El servidor MCP avanzado está configurado y listo

## 🎯 Paso a Paso para Probar el Demo

### 1️⃣ **Abrir la Página de Demo Principal**

Navega a:

```
http://localhost:3000/demo-mcp-integration.html
```

Esta es la nueva página mejorada que no tiene problemas de CSP.

### 2️⃣ **Conectar con MCP**

1. **Haz clic en el botón** "🔌 Conectar con MCP" en la parte superior
2. **Espera la conexión** - Verás el estado cambiar a:
   - 🔄 Conectando con servidor MCP...
   - ✅ Conectado con MCP - Herramientas disponibles

### 3️⃣ **Explorar las Herramientas MCP Disponibles**

Una vez conectado, verás las 8 herramientas disponibles:

🛠️ **Herramientas MCP:**

- 🌹 **recommend_flowers** - Recomendaciones personalizadas
- 💬 **florist_chat** - Chat con experto florista
- 🧠 **analyze_sentiment** - Análisis de sentimiento
- ✍️ **generate_content** - Generador de contenido
- 🔍 **search_products** - Búsqueda de productos
- 📈 **predict_sales** - Predicción de ventas
- 💰 **optimize_price** - Optimización de precios
- 📊 **get_analytics** - Análisis avanzado

### 4️⃣ **Probar Cada Herramienta**

Haz clic en los botones de prueba para cada herramienta:

#### 🌹 **Probar Recomendaciones**

- **Qué hace**: Recomienda flores basadas en ocasión, presupuesto y estilo
- **Ejemplo**: Recomendaciones para aniversario con presupuesto de $50

#### 💬 **Probar Chat Experto**

- **Qué hace**: Responde preguntas sobre flores y cuidados
- **Ejemplo**: "¿Qué flores duran más tiempo?"

#### 🧠 **Probar Análisis de Sentimiento**

- **Qué hace**: Analiza emociones en texto de clientes
- **Ejemplo**: "Estoy muy feliz con mi compra"

#### ✍️ **Probar Generador de Contenido**

- **Qué hace**: Crea descripciones de productos con IA
- **Ejemplo**: Descripciones de ramos de rosas

#### 🔍 **Probar Búsqueda de Productos**

- **Qué hace**: Busca en el catálogo de productos
- **Ejemplo**: Buscar "rosas" en categoría flores

### 5️⃣ **Ver Resultados en Tiempo Real**

Los resultados de cada prueba aparecerán en la sección **"📋 Resultados de Pruebas"** con:

- ✅ Estado de éxito/errores
- 🕐 Timestamp de cada prueba
- 📄 Respuesta completa del servidor MCP
- 🎨 Formato JSON legible

### 6️⃣ **Interactuar con el Chatbot**

En la esquina inferior derecha aparecerá el chatbot de FloresYa:

- 💬 Haz clic en el botón flotante 🌹
- 🤖 Prueba preguntas como:
  - "¿Qué flores me recomiendas para un aniversario?"
  - "¿Cómo cuido mis rosas para que duren más?"
  - "¿Cuánto cuesta un ramo de tulipanes?"

## 🎨 Otras Páginas de Demo

También puedes probar las otras páginas:

### **Demo Básico**

```
http://localhost:3000/test-shadcn-mcp.html
```

- Demo simple con componentes shadcn/ui básicos
- Conexión MCP directa

### **Demo Avanzado**

```
http://localhost:3000/mcp-demo-avanzado.html
```

- Explicación técnica detallada
- Documentación de herramientas

### **FloresYa con MCP**

```
http://localhost:3000/floresya-con-mcp.html
```

- Integración completa en el sitio de FloresYa
- Chatbot integrado

## 🔧 Si Hay Problemas

### **❌ Error de Conexión**

- **Solución**: Espera unos segundos y vuelve a intentar
- **Causa**: El servidor MCP puede tardar en iniciar

### **❌ Herramientas No Disponibles**

- **Solución**: Refresca la página y vuelve a conectar
- **Causa**: La conexión MCP puede haberse perdido

### **❌ Scripts No Cargan**

- **Solución**: Revisa la consola del navegador (F12)
- **Causa**: Errores de red o CORS

## 📱 Tips para Pruebas

✅ **Usa el Navegador en Modo Incógnito** para evitar caché
✅ **Abre la Consola del Navegador** (F12) para ver logs detallados
✅ **Prueba Todas las Herramientas** para ver diferentes capacidades
✅ **Usa el Chatbot** para experiencia conversacional completa

## 🎉 ¡Disfruta la Demo!

Esta integración demuestra:

- 🎨 **Componentes Modernos**: shadcn/ui con Tailwind CSS
- 🤖 **IA Conversacional**: 8 herramientas MCP especializadas
- ⚡ **Tiempo Real**: Respuestas inmediatas del servidor
- 📱 **Responsive**: Funciona en todos los dispositivos
- 🔒 **Seguro**: Configuración CSP apropiada

---

**¿Listo para probar?** 🚀
Abrir: `http://localhost:3000/demo-mcp-integration.html`
