# Implementación de Basic Authentication para API 360

## Problema Detectado

El endpoint `/userimage/` de la API 360 requiere **Basic Authentication** (credenciales email:password en base64), no Bearer Token (JWT).

### Error Original:
```json
{
  "detail": "Authentication credentials were not provided."
}
```

## Comparación con el Repositorio `crea_tu_QR`

### crea_tu_QR (✅ Funcionando):
- **Método de autenticación**: Basic Auth
- **Header**: `Authorization: Basic ${btoa(email:password)}`
- **Almacenamiento**: `auth_username` y `auth_password` en localStorage
- **Interceptor**: Agrega automáticamente Basic Auth a TODAS las peticiones

### SmartvCardPro (❌ Antes de la corrección):
- **Método de autenticación**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer ${token}`
- **Almacenamiento**: Solo `token` en localStorage
- **Problema**: El endpoint `/userimage/` no acepta JWT

## Solución Implementada

Se creó un sistema **híbrido** que mantiene compatibilidad con ambos métodos:

### 1. Nuevo Servicio API (`src/lib/apiService.js`)

Creado un servicio similar al de `crea_tu_QR` con:

- **Interceptor de Axios** que agrega automáticamente Basic Auth
- **Gestión de credenciales** en localStorage
- **Métodos específicos** para imágenes (getAllImages, createImage, deleteImage)

```javascript
// Interceptor que agrega Basic Auth automáticamente
this.api.interceptors.request.use((config) => {
  const { username, password } = this.getCredentials();
  if (username && password) {
    const token = btoa(`${username}:${password}`);
    config.headers.Authorization = `Basic ${token}`;
  }
  return config;
});
```

### 2. Actualización de Auth.js

Modificado para guardar **TANTO** el JWT como las credenciales:

```javascript
// Antes
localStorage.setItem('token', access);

// Ahora
localStorage.setItem('token', access);
localStorage.setItem('auth_username', email);
localStorage.setItem('auth_password', password);
```

### 3. Actualización de ImageUpload.js

Reemplazado `axios` directo por `apiService`:

```javascript
// Antes
const response = await axios.post(
  'https://startapp360.com/api/v1/userimage/',
  payload,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

// Ahora
const response = await apiService.createImage(payload);
```

### 4. Actualización de ImageGallery.js

Reemplazado `axios` directo por `apiService`:

```javascript
// Antes
const response = await axios.get('https://startapp360.com/api/v1/userimage/', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// Ahora
const data = await apiService.getAllImages();
```

### 5. Actualización de Dashboard.js

Modificado logout para limpiar TODAS las credenciales:

```javascript
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('auth_username');
  localStorage.removeItem('auth_password');
  toast.success('Sesión cerrada correctamente');
  window.location.href = '/';
};
```

## Ventajas de esta Implementación

1. **Compatibilidad Dual**:
   - JWT para endpoints que lo requieran
   - Basic Auth para `/userimage/` y otros endpoints similares

2. **Interceptores Automáticos**:
   - No necesitas agregar headers manualmente
   - El interceptor los agrega automáticamente a cada petición

3. **Código más limpio**:
   - Menos repetición de código
   - Centralización de la lógica de autenticación

4. **Manejo de errores consistente**:
   - Redirección automática en caso de 401
   - Limpieza de credenciales cuando expiran

## Flujo de Autenticación Completo

### Login:
1. Usuario ingresa email y password
2. Se llama a `/token/` para obtener JWT
3. Se guardan **3 valores** en localStorage:
   - `token`: JWT para futuros usos
   - `auth_username`: Email del usuario
   - `auth_password`: Contraseña del usuario

### Peticiones a /userimage/:
1. El interceptor detecta que hay credenciales
2. Genera el token Basic Auth: `btoa("email:password")`
3. Agrega el header: `Authorization: Basic ${token}`
4. La petición se ejecuta exitosamente

### Logout:
1. Se eliminan las 3 credenciales de localStorage
2. Redirección a la página de login

## Pruebas Recomendadas

1. **Login**:
   - Inicia sesión con credenciales válidas
   - Verifica que se guarden los 3 valores en localStorage

2. **Subir Imagen**:
   - Ve a Dashboard → Mis Imágenes
   - Selecciona una imagen
   - Completa el formulario
   - Haz clic en "Subir Imagen"
   - Debería subir exitosamente

3. **Ver Galería**:
   - Debería mostrar todas tus imágenes
   - Filtradas por tu email

4. **Eliminar Imagen**:
   - Haz clic en eliminar
   - Confirma
   - Debería eliminarse exitosamente

5. **Logout**:
   - Cierra sesión
   - Verifica que se limpien todas las credenciales

## Endpoints de la API 360

### Con Basic Auth:
- `GET /userimage/` - Listar imágenes
- `POST /userimage/` - Crear imagen
- `DELETE /userimage/{id}/` - Eliminar imagen
- `GET /qr/` - Listar QR codes
- `POST /qr/` - Crear QR code

### Con JWT (Bearer Token):
- `POST /token/` - Login
- Otros endpoints específicos (si existen)

## Notas de Seguridad

⚠️ **IMPORTANTE**: Este sistema guarda la contraseña en localStorage en texto plano.

### Recomendaciones para Producción:
1. Usar httpOnly cookies en lugar de localStorage
2. Implementar refresh tokens
3. Usar HTTPS obligatorio
4. Implementar rate limiting
5. Agregar timeout de sesión

## Archivos Modificados

- ✅ `src/lib/apiService.js` - **NUEVO**
- ✅ `src/pages/Auth.js` - Actualizado
- ✅ `src/pages/Dashboard.js` - Actualizado
- ✅ `src/components/ImageUpload.js` - Actualizado
- ✅ `src/components/ImageGallery.js` - Actualizado

## Referencias

- Repositorio de referencia: `C:\Users\estep\Desktop\crea_tu_QR`
- Documentación del repositorio: `AUTHENTICATION_SYSTEM.md`
- Archivo principal de API: `src/lib/api.js`
