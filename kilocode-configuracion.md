# Guía Completa de Configuración para KiloCode CLI

## Tabla de Contenidos

1. [Introducción a KiloCode CLI](#introducción)
2. [Instalación Paso a Paso](#instalación)
3. [Configuración de Modelos de IA](#configuracion-modelos)
   - [OpenAI (GPT-4, GPT-3.5)](#configuracion-openai)
   - [Anthropic (Claude)](#configuracion-anthropic)
   - [Modelos Personalizados (Moonshot, otros)](#configuracion-personalizados)
   - [Configuración de Modelos Personalizados (Ejemplo: Spectre)](#configuracion-spectre)
4. [Ejemplos Prácticos de Configuración](#ejemplos-configuracion)
5. [Cambio entre Modelos](#cambio-modelos)
6. [Mejores Prácticas y Seguridad](#mejores-practicas)

---

## <a name="introducción"></a>1. Introducción a KiloCode CLI

KiloCode CLI es una herramienta de línea de comandos diseñada para mejorar la productividad de desarrolladores mediante el uso de modelos de inteligencia artificial. Permite interactuar con diferentes modelos de IA como OpenAI GPT, Anthropic Claude y modelos personalizados para tareas como:

- Generación y refactorización de código
- Análisis de arquitectura
- Revisión de código y detección de errores
- Creación de documentación técnica
- Optimización de rendimiento

KiloCode CLI se integra perfectamente en flujos de trabajo de desarrollo modernos, soportando múltiples patrones de diseño y arquitecturas como Clean Architecture, MVC y microservicios.

---

## <a name="instalación"></a>2. Instalación Paso a Paso

### Requisitos Previos

- Node.js v20.0.0 o superior
- npm v10.0.0 o superior
- Sistema operativo: Windows 10+, macOS 10.15+, o Linux (Ubuntu 18.04+)

### Instalación Global

```bash
# Instalar KiloCode CLI globalmente
npm install -g kilocode-cli

# Verificar instalación
kilocode --version
```

### Instalación Local (Recomendada para proyectos)

```bash
# Instalar como dependencia de desarrollo
npm install --save-dev kilocode-cli

# Agregar script a package.json
"scripts": {
  "kc": "kilocode"
}
```

### Configuración Inicial

```bash
# Inicializar configuración en el proyecto
kilocode init

# O crear manualmente el archivo de configuración
touch .kilocode.json
```

---

## <a name="configuracion-modelos"></a>3. Configuración de Modelos de IA

### <a name="configuracion-openai"></a>3.1 Configuración para OpenAI (GPT-4, GPT-3.5)

#### Obtener API Key

1. Visita [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Inicia sesión o crea una cuenta
3. Genera una nueva API key
4. Copia y guarda la key de forma segura

#### Configuración Básica

```json
{
  "model": "openai",
  "openai": {
    "apiKey": "sk-your-api-key-here",
    "model": "gpt-4",
    "maxTokens": 4096,
    "temperature": 0.7,
    "baseUrl": "https://api.openai.com/v1"
  }
}
```

#### Configuración Avanzada

```json
{
  "model": "openai",
  "openai": {
    "apiKey": "${OPENAI_API_KEY}",
    "model": "gpt-4-turbo",
    "maxTokens": 8192,
    "temperature": 0.3,
    "topP": 0.9,
    "frequencyPenalty": 0.1,
    "presencePenalty": 0.1,
    "baseUrl": "https://api.openai.com/v1",
    "timeout": 60000,
    "retries": 3,
    "organization": "org-your-organization-id"
  }
}
```

#### Variables de Entorno

```bash
# En archivo .env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_ORGANIZATION=org-your-organization-id

# O en variables de entorno del sistema
export OPENAI_API_KEY="sk-your-api-key-here"
export OPENAI_ORGANIZATION="org-your-organization-id"
```

### <a name="configuracion-anthropic"></a>3.2 Configuración para Anthropic (Claude)

#### Obtener API Key

1. Visita [https://console.anthropic.com/](https://console.anthropic.com/)
2. Crea una cuenta o inicia sesión
3. Genera una API key en la sección de API Keys
4. Copia y guarda la key de forma segura

#### Configuración Básica

```json
{
  "model": "anthropic",
  "anthropic": {
    "apiKey": "sk-ant-api03-your-api-key-here",
    "model": "claude-3-sonnet-20240229",
    "maxTokens": 4096,
    "temperature": 0.7
  }
}
```

#### Configuración Avanzada

```json
{
  "model": "anthropic",
  "anthropic": {
    "apiKey": "${ANTHROPIC_API_KEY}",
    "model": "claude-3-opus-20240229",
    "maxTokens": 8192,
    "temperature": 0.3,
    "topP": 0.9,
    "topK": 40,
    "baseUrl": "https://api.anthropic.com",
    "timeout": 60000,
    "retries": 3,
    "headers": {
      "anthropic-version": "2023-06-01"
    }
  }
}
```

#### Variables de Entorno

```bash
# En archivo .env
ANTHROPIC_API_KEY=sk-ant-api03-your-api-key-here

# O en variables de entorno del sistema
export ANTHROPIC_API_KEY="sk-ant-api03-your-api-key-here"
```

### <a name="configuracion-personalizados"></a>3.3 Configuración para Modelos Personalizados (Moonshot, otros)

#### Configuración para Moonshot AI

```json
{
  "model": "moonshot",
  "moonshot": {
    "apiKey": "${MOONSHOT_API_KEY}",
    "model": "moonshot-v1-8k",
    "maxTokens": 4096,
    "temperature": 0.7,
    "baseUrl": "https://api.moonshot.cn/v1"
  }
}
```

#### Configuración para Modelos Personalizados Genéricos

```json
{
  "model": "custom",
  "custom": {
    "name": "mi-modelo-personalizado",
    "apiKey": "${CUSTOM_API_KEY}",
    "model": "custom-model-v1",
    "maxTokens": 4096,
    "temperature": 0.7,
    "baseUrl": "https://api.custom-provider.com/v1",
    "headers": {
      "Custom-Header": "value",
      "Authorization": "Bearer ${CUSTOM_API_KEY}"
    },
    "requestFormat": "openai-compatible",
    "timeout": 60000,
    "retries": 3
  }
}
```

#### Configuración para Modelos Locales (Ollama, Llama.cpp)

```json
{
  "model": "local",
  "local": {
    "baseUrl": "http://localhost:11434",
    "model": "llama2",
    "maxTokens": 4096,
    "temperature": 0.7,
    "timeout": 120000,
    "format": "ollama"
  }
}
```

### <a name="configuracion-spectre"></a>3.4 Configuración de Modelos Personalizados (Ejemplo: Spectre)

#### Nota Importante sobre Spectre

**Spectre no es un modelo oficialmente soportado por KiloCode CLI**. La siguiente sección es un ejemplo educativo que demuestra cómo configurar modelos personalizados o experimentales que podrían no estar incluidos en la lista oficial de proveedores soportados.

#### Configuración General para Modelos Personalizados

Para agregar cualquier modelo personalizado a KiloCode CLI, sigue estos pasos:

1. **Verificar compatibilidad**: Asegúrate de que el modelo sea compatible con la API de OpenAI o tenga un formato de solicitud bien documentado
2. **Obtener credenciales**: Consigue las API keys o tokens de autenticación necesarios
3. **Configurar el endpoint**: Identifica la URL base del API del modelo
4. **Probar la conexión**: Verifica que la configuración funciona antes de usarla en producción

#### Ejemplo de Configuración para Spectre (Hipotético)

```json
{
  "model": "spectre",
  "spectre": {
    "apiKey": "${SPECTRE_API_KEY}",
    "model": "spectre-v1-7b",
    "maxTokens": 4096,
    "temperature": 0.7,
    "topP": 0.9,
    "baseUrl": "https://api.spectre.ai/v1",
    "headers": {
      "X-Spectre-Version": "2024-01",
      "Authorization": "Bearer ${SPECTRE_API_KEY}"
    },
    "requestFormat": "openai-compatible",
    "timeout": 60000,
    "retries": 3,
    "contextWindow": 8192,
    "supportedFeatures": ["chat", "completion", "embedding"]
  }
}
```

#### Configuración Avanzada para Spectre

```json
{
  "model": "spectre",
  "spectre": {
    "apiKey": "${SPECTRE_API_KEY}",
    "model": "spectre-v1-13b",
    "maxTokens": 8192,
    "temperature": 0.3,
    "topP": 0.95,
    "topK": 50,
    "repetitionPenalty": 1.1,
    "baseUrl": "https://api.spectre.ai/v1",
    "headers": {
      "X-Spectre-Version": "2024-01",
      "Authorization": "Bearer ${SPECTRE_API_KEY}",
      "X-Custom-Header": "spectre-integration"
    },
    "requestFormat": "openai-compatible",
    "timeout": 120000,
    "retries": 5,
    "contextWindow": 16384,
    "supportedFeatures": ["chat", "completion", "embedding", "function-calling"],
    "functionCalling": {
      "enabled": true,
      "maxFunctions": 10,
      "maxArguments": 1024
    },
    "streaming": {
      "enabled": true,
      "chunkSize": 512
    }
  }
}
```

#### Variables de Entorno para Spectre

```bash
# En archivo .env
SPECTRE_API_KEY=sk-spectre-your-api-key-here
SPECTRE_BASE_URL=https://api.spectre.ai/v1

# O en variables de entorno del sistema
export SPECTRE_API_KEY="sk-spectre-your-api-key-here"
export SPECTRE_BASE_URL="https://api.spectre.ai/v1"
```

#### Consideraciones Especiales para Modelos No Oficiales

1. **Compatibilidad Limitada**: Los modelos no oficiales pueden no ser compatibles con todas las características de KiloCode CLI

2. **Riesgos de Seguridad**:

   ```json
   {
     "security": {
       "validateInput": true,
       "sanitizeOutput": true,
       "rateLimit": {
         "requestsPerMinute": 60,
         "tokensPerMinute": 60000
       }
     }
   }
   ```

3. **Manejo de Errores Específico**:

   ```json
   {
     "errorHandling": {
       "customErrors": {
         "spectre_rate_limit": {
           "retry": true,
           "retryDelay": 5000,
           "maxRetries": 3
         },
         "spectre_model_unavailable": {
           "fallbackModel": "openai",
           "notifyUser": true
         }
       }
     }
   }
   ```

4. **Validación de Respuestas**:
   ```json
   {
     "validation": {
       "enabled": true,
       "strictMode": true,
       "requiredFields": ["content", "finish_reason"],
       "allowedFinishReasons": ["stop", "length", "function_call"]
     }
   }
   ```

#### Integración con Perfiles Existentes

```json
{
  "defaultModel": "openai",
  "models": {
    "openai": {
      "apiKey": "${OPENAI_API_KEY}",
      "model": "gpt-4",
      "maxTokens": 4096,
      "temperature": 0.7
    },
    "spectre": {
      "apiKey": "${SPECTRE_API_KEY}",
      "model": "spectre-v1-7b",
      "maxTokens": 4096,
      "temperature": 0.7,
      "baseUrl": "https://api.spectre.ai/v1",
      "requestFormat": "openai-compatible"
    }
  },
  "profiles": {
    "development": {
      "model": "spectre",
      "temperature": 0.8,
      "maxTokens": 2048
    },
    "production": {
      "model": "openai",
      "temperature": 0.3,
      "maxTokens": 8192
    },
    "experimental": {
      "model": "spectre",
      "temperature": 0.9,
      "maxTokens": 4096,
      "features": ["function-calling", "streaming"]
    }
  }
}
```

#### Comandos de Uso para Spectre

```bash
# Usar Spectre para un comando específico
kilocode --model spectre "generar código para una API REST"

# Usar perfil experimental con Spectre
kilocode --profile experimental "crear tests unitarios"

# Probar configuración de Spectre
kilocode test-connection --model spectre

# Validar configuración de Spectre
kilocode validate --model spectre --strict
```

---

## <a name="ejemplos-configuracion"></a>4. Ejemplos Prácticos de Archivos de Configuración

### Configuración Multi-Modelo

```json
{
  "defaultModel": "openai",
  "models": {
    "openai": {
      "apiKey": "${OPENAI_API_KEY}",
      "model": "gpt-4",
      "maxTokens": 4096,
      "temperature": 0.7
    },
    "anthropic": {
      "apiKey": "${ANTHROPIC_API_KEY}",
      "model": "claude-3-sonnet-20240229",
      "maxTokens": 4096,
      "temperature": 0.7
    },
    "moonshot": {
      "apiKey": "${MOONSHOT_API_KEY}",
      "model": "moonshot-v1-8k",
      "maxTokens": 4096,
      "temperature": 0.7
    }
  },
  "profiles": {
    "development": {
      "model": "openai",
      "temperature": 0.8,
      "maxTokens": 2048
    },
    "production": {
      "model": "anthropic",
      "temperature": 0.3,
      "maxTokens": 8192
    },
    "testing": {
      "model": "moonshot",
      "temperature": 0.5,
      "maxTokens": 1024
    }
  }
}
```

### Configuración para Proyecto Específico

```json
{
  "project": {
    "name": "FloresYa E-commerce",
    "type": "nodejs-express",
    "architecture": "clean-architecture"
  },
  "model": "anthropic",
  "anthropic": {
    "apiKey": "${ANTHROPIC_API_KEY}",
    "model": "claude-3-opus-20240229",
    "maxTokens": 8192,
    "temperature": 0.3
  },
  "prompts": {
    "codeReview": "./prompts/code-review.md",
    "architecture": "./prompts/architecture.md",
    "testing": "./prompts/testing.md"
  },
  "output": {
    "format": "markdown",
    "directory": "./docs",
    "includeTimestamp": true
  },
  "security": {
    "sanitizeInput": true,
    "validateOutput": true,
    "logRequests": true
  }
}
```

### Configuración con Integración CI/CD

```json
{
  "model": "openai",
  "openai": {
    "apiKey": "${OPENAI_API_KEY}",
    "model": "gpt-4",
    "maxTokens": 4096,
    "temperature": 0.3
  },
  "ci": {
    "enabled": true,
    "maxRetries": 3,
    "timeout": 300000,
    "failOnError": true
  },
  "hooks": {
    "preCommit": "code-review",
    "prePush": "security-scan",
    "postMerge": "documentation-update"
  },
  "reporting": {
    "format": "json",
    "output": "./reports/kilocode-report.json",
    "includeMetrics": true
  }
}
```

---

## <a name="cambio-modelos"></a>5. Instrucciones para Cambiar entre Diferentes Modelos

### Cambio Temporal (Por Comando)

```bash
# Usar OpenAI para un comando específico
kilocode --model openai "revisar este código"

# Usar Claude para análisis de arquitectura
kilocode --model anthropic --profile architecture "analizar la estructura del proyecto"

# Usar modelo personalizado
kilocode --model custom --config ./custom-config.json "generar tests"
```

### Cambio Permanente (Configuración Global)

```bash
# Establecer modelo por defecto
kilocode config set model anthropic

# Ver configuración actual
kilocode config get

# Restablecer a valores por defecto
kilocode config reset
```

### Uso de Perfiles

```bash
# Cambiar a perfil de desarrollo
kilocode --profile development

# Cambiar a perfil de producción
kilocode --profile production

# Crear perfil personalizado
kilocode profile create testing --model moonshot --temperature 0.5
```

### Configuración Dinámica (Programática)

```javascript
// kilocode.config.js
module.exports = {
  model: process.env.NODE_ENV === 'production' ? 'anthropic' : 'openai',
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    maxTokens: process.env.NODE_ENV === 'production' ? 8192 : 4096
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-opus-20240229',
    maxTokens: 8192
  }
}
```

---

## <a name="mejores-practicas"></a>6. Mejores Prácticas y Consejos de Seguridad

### Seguridad de API Keys

1. **Nunca exponer API Keys en el código**

   ```json
   // ❌ MAL
   {
     "apiKey": "sk-your-actual-api-key-here"
   }

   // ✅ BIEN
   {
     "apiKey": "${OPENAI_API_KEY}"
   }
   ```

2. **Usar variables de entorno**

   ```bash
   # Archivo .env (agregar a .gitignore)
   OPENAI_API_KEY=sk-your-api-key-here
   ANTHROPIC_API_KEY=sk-ant-api03-your-api-key-here
   ```

3. **Rotación regular de API Keys**
   ```bash
   # Script para rotación de keys
   kilocode config rotate-key openai
   ```

### Optimización de Costos

1. **Configurar límites de tokens**

   ```json
   {
     "openai": {
       "maxTokens": 2048,
       "temperature": 0.3
     }
   }
   ```

2. **Usar modelos más económicos para tareas simples**

   ```json
   {
     "profiles": {
       "simple-tasks": {
         "model": "openai",
         "model": "gpt-3.5-turbo",
         "maxTokens": 1024
       },
       "complex-tasks": {
         "model": "anthropic",
         "model": "claude-3-opus-20240229",
         "maxTokens": 8192
       }
     }
   }
   ```

3. **Monitoreo de uso**

   ```bash
   # Ver estadísticas de uso
   kilocode stats --month

   # Configurar alertas de uso
   kilocode config set alerts.monthlyLimit 100
   ```

### Mejores Prácticas de Desarrollo

1. **Configuración por entorno**

   ```json
   {
     "development": {
       "model": "openai",
       "temperature": 0.8,
       "maxTokens": 2048
     },
     "staging": {
       "model": "anthropic",
       "temperature": 0.5,
       "maxTokens": 4096
     },
     "production": {
       "model": "anthropic",
       "temperature": 0.3,
       "maxTokens": 8192
     }
   }
   ```

2. **Validación de configuración**

   ```bash
   # Validar configuración antes de usar
   kilocode validate --strict

   # Probar conexión con el modelo
   kilocode test-connection
   ```

3. **Manejo de errores y reintentos**
   ```json
   {
     "errorHandling": {
       "maxRetries": 3,
       "retryDelay": 1000,
       "exponentialBackoff": true,
       "fallbackModel": "openai"
     }
   }
   ```

### Consideraciones de Rendimiento

1. **Caching de respuestas**

   ```json
   {
     "cache": {
       "enabled": true,
       "ttl": 3600,
       "maxSize": "100MB",
       "directory": "./.kilocode-cache"
     }
   }
   ```

2. **Paralelización de solicitudes**

   ```bash
   # Procesamiento por lotes
   kilocode batch --input ./files --concurrent 5
   ```

3. **Optimización de timeouts**
   ```json
   {
     "timeouts": {
       "connection": 10000,
       "read": 60000,
       "write": 30000
     }
   }
   ```

### Registro y Auditoría

1. **Configurar logging detallado**

   ```json
   {
     "logging": {
       "level": "info",
       "file": "./logs/kilocode.log",
       "maxSize": "10MB",
       "rotate": true,
       "includeTimestamp": true,
       "includeTokens": true
     }
   }
   ```

2. **Auditoría de uso**

   ```bash
   # Generar reporte de auditoría
   kilocode audit --start 2024-01-01 --end 2024-12-31

   # Exportar datos de uso
   kilocode export --format csv --output usage-report.csv
   ```

### Integración con Herramientas Existentes

1. **Configuración para Git Hooks**

   ```json
   {
     "gitHooks": {
       "preCommit": {
         "enabled": true,
         "commands": ["code-review", "lint-check"]
       },
       "prePush": {
         "enabled": true,
         "commands": ["security-scan", "test-coverage"]
       }
     }
   }
   ```

2. **Integración con CI/CD**
   ```yaml
   # .github/workflows/kilocode.yml
   name: KiloCode Analysis
   on: [push, pull_request]
   jobs:
     analyze:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Run KiloCode Analysis
           run: |
             kilocode --profile ci --output ./reports
             kilocode validate --strict
   ```

---

## Conclusión

Esta guía completa proporciona toda la información necesaria para configurar y utilizar KiloCode CLI de manera efectiva y segura. Siguiendo estas mejores prácticas, podrás maximizar la productividad mientras mantienes la seguridad y optimizas los costos.

Para más información y documentación actualizada, visita el repositorio oficial de KiloCode CLI o consulta la documentación en línea.

## Recursos Adicionales

- [Documentación Oficial](https://kilocode.dev/docs)
- [Repositorio GitHub](https://github.com/kilocode/kilocode-cli)
- [Comunidad Discord](https://discord.gg/kilocode)
- [Blog de Mejores Prácticas](https://blog.kilocode.dev)
