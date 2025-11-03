# 🔧 Actualizaciones del Flujo n8n para Selección de Documentos

## 📊 **Resumen de Cambios**

### 1. **Webhook Input Modificado**
- **Endpoint**: `POST https://skynet.uct.cl/webhook/chat-streaming`
- **Nuevo Campo**: `documentosSeleccionados` (array de objetos)

### 2. **Estructura del Request**
```json
{
  "user_id": "string",
  "pregunta": "string",
  "documentosSeleccionados": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "category": "string",
      "type": "string",
      "url": "string",
      "keywords": ["array", "de", "strings"]
    }
  ]
}
```

## 🎯 **Modificaciones Requeridas en n8n**

### **1. Webhook Node - "chat-streaming"**

Actualizar el webhook para recibir `documentosSeleccionados`:

```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "chat-streaming",
    "responseMode": "streaming",
    "options": {
      "allowedOrigins": "*"
    }
  }
}
```

### **2. AI Agent - System Message Actualizado**

**Prompt Original:**
```javascript
"systemMessage": "=1. Recoger el mensaje del usuario.  \n2. Analizar cuidadosamente el contenido y contexto del mensaje.  \n3. Responder siguiendo **exactamente** las instrucciones o solicitudes del usuario.  \n4. Priorizar claridad, concreción y exactitud en la respuesta.  \n5. Evitar información irrelevante o suposiciones no solicitadas.  \n6. Mantener un estilo natural, amable y comprensible, pero profesional.  \n7. **IMPORTANTE:** Utiliza la herramienta 'Supabase Vector Store' para buscar documentos cuando sea necesario.  \n   Si el usuario pide información respaldada o referencias, revisa la base de datos y menciona los documentos relevantes de forma natural en la respuesta.  \n8. Siempre verifica que tu respuesta cumpla con el objetivo del usuario antes de enviarla.  \n9. Siempre revisa bien los metadatos y la información para no confundir documentos con nombres similares.  \n10. Si te piden un resumen general de lo que conoces, entrega una lista resumida de los documentos o temas disponibles, presentada de forma clara e inteligente."
```

**Prompt Actualizado:**
```javascript
"systemMessage": "=📋 CONTEXTO DE DOCUMENTOS SELECCIONADOS:
{{ $json.documentosSeleccionados.length > 0 ? 
'Has recibido ' + $json.documentosSeleccionados.length + ' documento(s) seleccionado(s) por el usuario como contexto prioritario:' + 
$json.documentosSeleccionados.map(d => '- ' + d.title + ': ' + d.description).join('\n') : 
'No tienes documentos seleccionados del usuario.' }}

🎯 INSTRUCCIONES PRIORITARIAS:
1. **CONTEXTO PRINCIPAL**: Si hay documentos seleccionados, úsalos como **FUENTE PRIMARIA** de información antes que cualquier búsqueda automática.

2. **DOCUMENTOS SELECCIONADOS**: Cuando respondas, haz referencia específica a los documentos proporcionados:
   - Cita el título exacto: 'Según el documento \"[título]\"...'
   - Menciona el contexto relevante de cada documento
   - Si la información está en múltiples documentos, combínala coherentemente

3. **BÚSQUEDA SUPLEMENTARIA**: Solo usa el Vector Store Supabase para:
   - Información adicional que no esté en los documentos seleccionados
   - Contexto general cuando no hay documentos seleccionados
   - Verificación de información importante

4. **ESTRUCTURA DE RESPUESTA**: Cuando uses documentos seleccionados:
   - Comenzar con: "Basándome en los documentos que seleccionaste:"
   - Organizar por documento o tema
   - Finalizar con referencias específicas

5. **CALIDAD DE RESPUESTA**:
   - Priorizar claridad, precisión y relevancia
   - Mantener estilo profesional pero accesible
   - Evitar información innecesaria

6. **VALIDACIÓN**: Siempre verificar que tu respuesta aborde completamente la pregunta del usuario."
```

### **3. Lógica de Flujo Condicional**

Agregar un **Code Node** después del Webhook para procesar los documentos:

```javascript
// Code Node: "Process Selected Documents"
const input = $input.all()[0].json;

// Combinar documentos seleccionados con búsqueda automática
const documentosSeleccionados = input.documentosSeleccionados || [];

return [{
  json: {
    ...input,
    documentosSeleccionados,
    tieneDocumentosSeleccionados: documentosSeleccionados.length > 0,
    contextoDocumentos: documentosSeleccionados.map(doc => ({
      titulo: doc.title,
      descripcion: doc.description,
      categoria: doc.category,
      url: doc.url
    }))
  }
}];
```

### **4. Flujo Condicional al Vector Store**

Agregar una **Conditional Router** después del procesamiento:

```
Si documentosSeleccionados.length > 0:
  → Usar documentos como contexto + búsqueda limitada
Else:
  → Usar Vector Store normal para búsqueda completa
```

### **5. Memory Buffer Actualizado**

Actualizar la memoria para incluir contexto de documentos:

```json
{
  "parameters": {
    "sessionIdType": "customKey",
    "sessionKey": "={{ $json.user_id }}"
  }
}
```

## 🔧 **Implementación Paso a Paso**

### **Paso 1: Actualizar Webhook**
- El webhook ya está configurado correctamente
- Solo necesita validar el nuevo campo `documentosSeleccionados`

### **Paso 2: Modificar AI Agent**
- Cambiar el `systemMessage` según la plantilla proporcionada
- Asegurar que el prompt considere los documentos como fuente primaria

### **Paso 3: Agregar Code Node**
- Insertar después del Webhook
- Procesar documentos seleccionados
- Crear contexto estructurado

### **Paso 4: Ajustar Vector Store**
- Opcional: crear lógica para usar documentos seleccionados primero
- Mantener búsqueda automática como fallback

### **Paso 5: Testing**
- Probar con documentos seleccionados
- Verificar que la respuesta cite los documentos
- Validar que el comportamiento sea consistente

## 📝 **Ejemplo de Request de Prueba**

```bash
curl -X POST https://skynet.uct.cl/webhook/chat-streaming \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "pregunta": "¿Qué dice el reglamento sobre incendios?",
    "documentosSeleccionados": [
      {
        "id": "1",
        "title": "Reglamento de Seguridad.pdf",
        "description": "Documento con normas de seguridad y procedimientos de emergencia",
        "category": "Reglamentos",
        "type": "reglamento",
        "url": "https://example.com/reglamento.pdf",
        "keywords": ["seguridad", "incendios", "emergencia"]
      }
    ]
  }'
```

## 🎯 **Resultado Esperado**

El AI debe responder priorizando la información del documento "Reglamento de Seguridad.pdf" sobre cualquier búsqueda automática en la base de datos vectorial.

## ⚠️ **Consideraciones Importantes**

1. **Performance**: Los documentos seleccionados aumentan el contexto del prompt
2. **Costo**: Mayor uso de tokens cuando se incluyen documentos
3. **Calidad**: El AI debe citar específicamente los documentos proporcionados
4. **Fallback**: Si no hay documentos seleccionados, mantener comportamiento original

## 🔄 **Versionado**

- **Versión Original**: Solo búsqueda semántica automática
- **Versión Actualizada**: Documentos seleccionados + búsqueda semántica
- **Futuro**: Posible integración con RAG híbrido