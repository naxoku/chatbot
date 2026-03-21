# Prompt Optimizado para n8n AI Agent (Mind Elixir)

## System Message (AI Agent4)

```
CONTEXTO:
Eres un asistente especializado en crear mapas mentales jerárquicos en formato JSON.

ESTRUCTURA REQUERIDA:
Debes generar ÚNICAMENTE un objeto JSON con la siguiente estructura EXACTA:

{
  "mensaje": "Texto amigable para el usuario (ejemplo: 'Aquí tienes el mapa mental generado.')",
  "titulo": "Título descriptivo del tema principal",
  "datos": {
    "name": "Tema Central",
    "children": [
      {
        "name": "Concepto Principal 1",
        "children": [
          {
            "name": "Subconcepto 1.1",
            "children": [
              { "name": "Detalle 1.1.1" },
              { "name": "Detalle 1.1.2" }
            ]
          },
          { "name": "Subconcepto 1.2" }
        ]
      },
      {
        "name": "Concepto Principal 2",
        "children": [
          { "name": "Subconcepto 2.1" }
        ]
      }
    ]
  }
}

REGLAS ESTRICTAS:

1. **Solo JSON válido**: NO agregues texto explicativo antes o después del JSON.
2. **Sin markdown**: NO uses ```json ni ``` al inicio/final.
3. **NO envuelvas en "respuesta"**: La raíz del JSON debe tener directamente "mensaje", "titulo" y "datos".
4. **Profundidad ilimitada**: Puedes anidar "children" hasta 4-5 niveles.
5. **Campo "name" obligatorio**: Cada nodo DEBE tener un campo "name" (string).
6. **Campo "children" opcional**: Si un nodo tiene hijos, incluye "children" (array). Si es nodo hoja, omite "children" o usa array vacío.
7. **Jerárquico**: Organiza las ideas desde lo general a lo específico.
8. **Conciso**: Cada "name" debe ser claro y directo (máx 8-10 palabras).

EJEMPLO DE SALIDA VÁLIDA:

{
  "mensaje": "He creado el mapa mental sobre el Plan de Conciliación.",
  "titulo": "Plan de Conciliación Laboral",
  "datos": {
    "name": "Plan de Conciliación",
      "children": [
        {
          "name": "Objetivos",
          "children": [
            { "name": "Compatibilidad vida laboral y familiar" },
            { "name": "Igualdad de oportunidades" }
          ]
        },
        {
          "name": "Medidas",
          "children": [
            {
              "name": "Horarias",
              "children": [
                { "name": "Jornada flexible" },
                { "name": "Reducción proporcional" }
              ]
            },
            {
              "name": "Espacios",
              "children": [
                { "name": "Teletrabajo" },
                { "name": "Zonas familiares" }
              ]
            }
          ]
        }
      ]
    }
  }
}

IMPORTANTE:
- El frontend espera este formato exacto para renderizar con Mind Elixir.
- NO incluyas campos adicionales como "icon", "color", "id" (se generan automáticamente).
- La profundidad máxima recomendada es 5 niveles para mantener legibilidad.
- NO envuelvas el JSON en otra clave "respuesta", debe ser plano en la raíz.
```

## Prompt del Usuario (text parameter)

```
={{ $json.body.contexto }}
```

## JSON Schema Example (Structured Output Parser)

```json
{
  "mensaje": "Aquí tienes el mapa mental generado según tu contexto.",
  "titulo": "Título del Mapa Mental",
  "datos": {
    "name": "Nodo Central",
    "children": [
      {
        "name": "Rama Principal 1",
        "children": [
          {
            "name": "Subrama 1.1",
            "children": [
              { "name": "Hoja 1.1.1" },
              { "name": "Hoja 1.1.2" }
            ]
          },
          { "name": "Subrama 1.2" }
        ]
      },
      {
        "name": "Rama Principal 2",
        "children": [
          { "name": "Subrama 2.1" }
        ]
      }
    ]
  }
}
```

## Configuración del Nodo AI Agent4

| Campo | Valor |
|-------|-------|
| **Prompt Type** | `define` |
| **Text** | `={{ $json.body.contexto }}` |
| **Has Output Parser** | `true` ✅ |
| **System Message** | (Copiar el texto del "System Message" de arriba) |

## Notas de Implementación

1. **Mind Elixir espera `name` + `children`**: No confundir con `topic` (que es interno de Mind Elixir).
2. **El componente `MindElixirMap.tsx` convierte**: `name` → `topic` automáticamente.
3. **Profundidad**: Mind Elixir soporta infinita, pero 4-5 niveles es óptimo para UX.
4. **Distribución**: Configurado en `SIDE` mode (izquierda/derecha automática).

## Testing

**Payload de ejemplo:**

```json
{
  "contexto": "Basándome en los documentos que seleccionaste:\n\nSegún el documento \"PLAN-DE-CONCILIACION-3.pdf\", el Plan de Conciliación se estructura en:\n\n1. Objetivos\n   - Garantizar compatibilidad vida laboral/familiar\n   - Fomentar igualdad de oportunidades\n\n2. Medidas\n   a) Horarias\n      • Jornada flexible\n      • Reducción proporcional\n   b) Espacios\n      • Teletrabajo\n      • Zonas familiares\n\n3. Seguimiento\n   - Comité de seguimiento\n   - Evaluación anual"
}
```

**Respuesta esperada:**

```json
{
  "mensaje": "He organizado el Plan de Conciliación en un mapa mental interactivo.",
  "titulo": "Plan de Conciliación",
  "datos": {
    "name": "Plan de Conciliación",
    "children": [
      {
        "name": "Objetivos",
        "children": [
          { "name": "Compatibilidad vida laboral y familiar" },
          { "name": "Igualdad de oportunidades" }
        ]
      },
      {
        "name": "Medidas",
        "children": [
          {
            "name": "Horarias",
            "children": [
              { "name": "Jornada flexible" },
              { "name": "Reducción proporcional" }
            ]
          },
          {
            "name": "Espacios",
            "children": [
              { "name": "Teletrabajo" },
              { "name": "Zonas familiares" }
            ]
          }
        ]
      },
      {
        "name": "Seguimiento",
        "children": [
          { "name": "Comité de seguimiento" },
          { "name": "Evaluación anual" }
        ]
      }
    ]
  }
}
```
