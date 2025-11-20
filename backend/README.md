# Backend - Asistente Virtual UCT

Servidor Express.js para el chatbot de la Universidad Católica de Temuco.

## Configuración

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```

   Edita el archivo `.env` con tus valores reales.

3. **Variables de entorno requeridas:**

   | Variable | Descripción | Ejemplo |
   |----------|-------------|---------|
   | `DB_HOST` | Host de la base de datos PostgreSQL | `aws-1-us-east-2.pooler.supabase.com` |
   | `DB_PORT` | Puerto de la base de datos | `5432` |
   | `DB_USER` | Usuario de la base de datos | `postgres.xxxxx` |
   | `DB_PASSWORD` | Contraseña de la base de datos | `tu_password_seguro` |
   | `DB_NAME` | Nombre de la base de datos | `postgres` |
   | `DB_SSL` | Configuración SSL | `require` |
   | `SESSION_SECRET` | Clave secreta para sesiones | `cadena_aleatoria_segura` |
   | `CORS_ORIGINS` | Dominios permitidos separados por comas | `http://localhost:5173,https://tu-dominio.com` |
   | `NODE_ENV` | Entorno de ejecución | `development` o `production` |

4. **Iniciar el servidor:**
   ```bash
   npm start
   # o para desarrollo
   npm run dev
   ```

## API Endpoints

- `POST /auth/login` - Autenticación LDAP
- `GET/POST /api/chat` - Chat con el bot
- `GET/POST /api/conversaciones` - Gestión de conversaciones
- `GET/POST /api/documentos` - Gestión de documentos
- `GET/POST /api/mapas-mentales` - Mapas mentales
- `GET /api/status` - Estado del sistema

## Logging

El sistema utiliza logging coloreado y modular:
- `[APP]` - Servidor principal
- `[CHAT]` - Endpoints de chat
- `[AUTH]` - Autenticación
- `[DB]` - Base de datos
- `[CONV]` - Conversaciones
- `[DOCS]` - Documentos
- `[MAPS]` - Mapas mentales
- `[STATUS]` - Estado del sistema

## Docker

Para ejecutar con Docker:
```bash
docker-compose up --build
```