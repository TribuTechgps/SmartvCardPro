# Guía de Gestión de Imágenes

## Descripción General

Se ha implementado un sistema completo de gestión de imágenes que permite a los usuarios subir, visualizar y administrar sus imágenes en la nube, similar al sistema de autenticación existente.

## Características Implementadas

### 1. Componente ImageUpload (`src/components/ImageUpload.js`)

Permite a los usuarios subir imágenes con las siguientes características:

- **Validación de Archivos**:
  - Solo acepta archivos de imagen
  - Tamaño máximo: 5MB

- **Campos del Formulario**:
  - Título (requerido)
  - Descripción (opcional)
  - Categoría (logo-ai, profile, banner, product, other)
  - Visibilidad (pública/privada)

- **Características**:
  - Vista previa de la imagen antes de subir
  - Conversión automática a base64
  - Indicador de carga durante la subida
  - Notificaciones de éxito/error

### 2. Componente ImageGallery (`src/components/ImageGallery.js`)

Muestra todas las imágenes del usuario en formato de galería:

- **Visualización**:
  - Grid responsivo (1-3 columnas según el tamaño de pantalla)
  - Tarjetas con información de cada imagen
  - Animaciones de hover

- **Acciones Disponibles**:
  - Ver imagen en tamaño completo
  - Descargar imagen
  - Eliminar imagen
  - Ver detalles (categoría, fecha, tamaño, etc.)

- **Modal de Vista Previa**:
  - Imagen en tamaño completo
  - Información detallada (descripción, categoría, tipo, tamaño, visibilidad, fechas)
  - Botones de descarga y eliminación

### 3. Integración en Dashboard (`src/pages/Dashboard.js`)

El Dashboard ahora incluye:

- **Sistema de Pestañas**:
  - "Mis Tarjetas": Lista de tarjetas de visita digitales
  - "Mis Imágenes": Galería de imágenes y formulario de subida

- **Actualización Automática**:
  - La galería se actualiza automáticamente después de subir una imagen
  - Sistema de refresh mediante triggers

## API Integration

### Endpoint de Imágenes

**Base URL**: `https://startapp360.com/api/v1/userimage/`

#### Estructura de Datos

```json
{
  "id": 553,
  "user": 13,
  "username": "yyy",
  "user_email": "yy@yy.yy",
  "title": "Logo 3",
  "description": "AI Generated Logo",
  "image": "https://startapp360.com/media/user_images/logo_3_OVUZXNM.png",
  "image_base64": "...",
  "image_type": "png",
  "file_size": 53735,
  "category": "logo-ai",
  "is_public": true,
  "tags": [],
  "created_at": "2025-12-17T13:15:04.605026Z",
  "updated_at": "2025-12-17T13:15:04.605051Z"
}
```

#### Operaciones Disponibles

1. **GET** `/userimage/` - Listar todas las imágenes del usuario
   - Headers: `Authorization: Bearer {token}`

2. **POST** `/userimage/` - Subir nueva imagen
   - Headers:
     - `Authorization: Bearer {token}`
     - `Content-Type: application/json`
   - Body:
     ```json
     {
       "title": "Nombre de la imagen",
       "description": "Descripción",
       "image_base64": "base64_string",
       "image_type": "png",
       "category": "logo-ai",
       "is_public": true,
       "tags": []
     }
     ```

3. **DELETE** `/userimage/{id}/` - Eliminar imagen
   - Headers: `Authorization: Bearer {token}`

## Flujo de Uso

### Para Subir una Imagen:

1. Usuario inicia sesión
2. Navega al Dashboard
3. Selecciona la pestaña "Mis Imágenes"
4. Hace clic en "Seleccionar Imagen" o arrastra un archivo
5. Completa el formulario (título, descripción, categoría, visibilidad)
6. Hace clic en "Subir Imagen"
7. La imagen se sube automáticamente y aparece en la galería

### Para Gestionar Imágenes:

1. En la pestaña "Mis Imágenes", se muestran todas las imágenes del usuario
2. Al hacer hover sobre una imagen, aparecen los botones de acción
3. Opciones disponibles:
   - **Ver**: Abre modal con detalles completos
   - **Descargar**: Descarga la imagen original
   - **Eliminar**: Elimina la imagen (con confirmación)

## Autenticación

El sistema utiliza el mismo mecanismo de autenticación JWT que el login:

- El token se almacena en `localStorage` como `'token'`
- Se valida en cada petición a la API
- Si el token expira, redirige al usuario a `/auth`

## Manejo de Errores

- **401 Unauthorized**: Token expirado o inválido → Redirige a login
- **400 Bad Request**: Datos inválidos → Muestra mensaje de error
- **500 Server Error**: Error del servidor → Muestra mensaje genérico

## Estilos y Diseño

Todos los componentes utilizan el sistema de diseño existente:

- Clases de utilidad de Tailwind CSS
- Colores del tema: fucsia, turquesa, chocolate, carbon
- Efectos de brillo y sombras personalizados
- Animaciones de transición suaves

## Mejoras Futuras Sugeridas

1. **Edición de Imágenes**:
   - Crop/recorte
   - Filtros
   - Redimensionamiento

2. **Organización**:
   - Carpetas/álbumes
   - Búsqueda y filtrado
   - Ordenamiento (por fecha, nombre, tamaño)

3. **Compartir**:
   - Generación de enlaces públicos
   - Integración con redes sociales
   - QR codes para imágenes

4. **Optimización**:
   - Lazy loading
   - Compresión automática
   - Thumbnails para vista de galería

## Notas de Desarrollo

- Todos los componentes son funcionales usando React Hooks
- Se utilizan Toast notifications para feedback del usuario
- Los componentes son totalmente responsivos
- El código sigue las convenciones del proyecto existente
