
# Guía de Despliegue en Render.com (Link Único)

Esta guía explica cómo desplegar la aplicación "Joan's Fix" en Render para cumplir con el requisito de tener un frontend y backend servidos desde una única URL.

## 1. Preparación del Proyecto (Ya realizado)

Hemos configurado el proyecto para que el servidor Backend (Express) también sirva los archivos estáticos del Frontend (React).
- Se ha añadido el script `"build"` en el `package.json` principal.
- Se ha configurado `app.js` para servir la carpeta `frontend/dist`.
- Se ha configurado una ruta "comodín" (`*`) para manejar el routing de React.

## 2. Pasos para Desplegar en Render

1.  Crea una cuenta en [Render.com](https://render.com) si no tienes una.
2.  Haz clic en el botón **"New +"** y selecciona **"Web Service"**.
3.  Conecta tu repositorio de GitHub donde está este código.
4.  Configura el servicio con los siguientes datos:

| Campo | Valor |
| :--- | :--- |
| **Name** | `joan-fix-app` (o el nombre que prefieras) |
| **Region** | `Oregon` (o la más cercana) |
| **Branch** | `main` (o tu rama principal) |
| **Root Directory** | `.` (déjalo vacío o pon un punto) |
| **Runtime** | `Node` |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |

5.  **Variables de Entorno (Environment Variables)**:
    Añade las siguientes variables haciendo clic en "Add Environment Variable":

    *   `NODE_ENV`: `production`
    *   `JWT_SECRET`: (Inventa una clave secreta larga y segura)
    *   `PORT`: `10000` (Render asignará un puerto, pero es bueno definirlo)

6.  Haz clic en **"Create Web Service"**.

## 3. Resultado

Render clonará tu repositorio, ejecutará el comando de `build` (que instalará todo y compilará el frontend React) y luego iniciará el servidor.

Una vez finalizado, te dará una URL única (ej: `https://joan-fix-app.onrender.com`).
*   Al entrar a esa URL, verás tu página de inicio (Landing Page).
*   El frontend se comunicará internamente con `/api`, `/products`, etc., sin problemas de CORS ni puertos.

¡Listo!
