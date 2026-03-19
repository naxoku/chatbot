# Montar contenedor

Ejecutar desde la raíz del repositorio.

Para construir y levantar los servicios en segundo plano:

```
docker compose up --build -d
```

Si solo quieres construir las imágenes:

```
docker compose build
```

Para detener y eliminar contenedores y redes creadas:

```
docker compose down
```

## Backend

El servidor backend escucha en el puerto `3000`.

## Frontend

La aplicación frontend sirve en el puerto `8080`:

```
http://localhost:8080/
```

Autenticación: ingresar con credenciales institucionales.