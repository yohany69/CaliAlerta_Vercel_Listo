# CaliAlerta — listo para Vercel

## Archivos

- `index.html`: aplicación web.
- `api/analyze.js`: función serverless segura para analizar imágenes.
- `vercel.json`: configuración de Vercel.
- `package.json`: scripts básicos.

## Variables de entorno

En Vercel configura:

- `ANTHROPIC_API_KEY`: tu API Key de Anthropic.
- `ANTHROPIC_MODEL`: modelo habilitado en tu cuenta, por ejemplo `claude-opus-4-5`.

## Despliegue

1. Sube esta carpeta a GitHub.
2. En Vercel, importa el repositorio.
3. Configura las variables de entorno.
4. Haz Deploy.

## Seguridad

La API Key que antes estaba en el HTML debe considerarse expuesta. Revócala y crea una nueva antes de publicar.
