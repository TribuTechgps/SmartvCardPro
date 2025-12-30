# Documentación de UI de Autenticación

## 📋 Descripción General

Esta documentación contiene el código completo y los estilos de un sistema de autenticación moderno y reutilizable con validación en tiempo real. La UI incluye tres formularios: Login, Registro y Cambio de Contraseña, todos con validación visual que cambia de rojo a verde cuando los campos son válidos.

**⭐ Característica Destacada: Validación de Contraseña con Colores Individuales**
- Cada requisito de contraseña cambia de color individualmente mientras el usuario escribe
- Las líneas "8-character password", "Include letters and numbers" y "Special characters/*-+" se colorean de verde una por una cuando se cumple cada condición
- Retroalimentación visual en tiempo real para una mejor experiencia de usuario

## ✨ Características Principales

- ✅ **Validación de contraseña avanzada** con cambio de color individual por cada requisito
- ✅ Validación en tiempo real con mensajes siempre visibles
- ✅ Mensajes de validación que cambian de rojo (inválido) a verde (válido)
- ✅ **Cada línea del mensaje de contraseña cambia de color individualmente** (rojo → verde)
- ✅ Toggle de visibilidad de contraseña (icono de ojo)
- ✅ Tres modos: Login, Registro y Cambio de Contraseña
- ✅ Diseño responsive y moderno
- ✅ Notificaciones toast integradas
- ✅ Loading states con spinner
- ✅ Transiciones suaves y efectos hover

## 📦 Dependencias Necesarias

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "styled-components": "^6.0.0",
  "react-toastify": "^9.0.0",
  "react-loader-spinner": "^5.0.0",
  "react-icons": "^4.0.0"
}
```

### Instalación

```bash
npm install styled-components react-toastify react-loader-spinner react-icons
# o
yarn add styled-components react-toastify react-loader-spinner react-icons
```

## 🎨 Paleta de Colores

```css
/* Colores principales */
--primary-blue: #2176ff;
--primary-blue-hover: #1a5bb8;
--background-gray: #f0f2f5;
--input-background: #f8f9fa;
--input-border: #e1e5e9;
--text-primary: #333;
--text-secondary: #6c757d;

/* Colores de validación */
--error-red: #dc3545;
--success-green: #28a745;

/* Sombra */
--box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
--button-shadow: 0 4px 12px rgba(33, 118, 255, 0.3);
```

**Nota**: Este proyecto utiliza una paleta de colores personalizada basada en el diseño existente:
- Primary: `#E91E63` (fucsia/rosa)
- Background: `linear-gradient(135deg, #5C4033 0%, #36454F 100%)`
- Text: `#F5F1EF`
- Success: `#28a745`
- Error: `#dc3545`

## 🔤 Tipografía

- **Fuente principal**: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Título**: 1.5rem, font-weight: 600
- **Inputs**: 1rem
- **Mensajes de validación**: 0.875rem
- **Links**: 0.9rem

## 📁 Estructura de Archivos

```
src/
  pages/
    Auth.js          # Componente principal
```

## 💻 Características de Validación

### Email
- Formato de email válido
- Mensaje: "Please enter a valid email" (rojo) → "Valid email" (verde)

### Username
- Mínimo 3 caracteres
- Máximo 20 caracteres
- Solo letras, números y guión bajo
- Mensaje: "Username must be at least 3 characters" (rojo) → "Valid username" (verde)

### Password ⭐ **FUNCIONALIDAD AVANZADA**

**Validación Individual con Colores en Tiempo Real**

La validación de contraseña incluye una característica única donde cada requisito cambia de color individualmente mientras el usuario escribe:

- ✅ **Mínimo 8 caracteres**: La línea "8-character password" se vuelve verde cuando se alcanzan 8+ caracteres
- ✅ **Letras y números**: La línea "Include letters and numbers" se vuelve verde cuando hay al menos una letra Y un número
- ✅ **Caracteres especiales**: La línea "Special characters/*-+" se vuelve verde cuando hay al menos un carácter especial (/*-+ o cualquier otro carácter especial)

**Cómo funciona:**
1. Inicialmente todas las líneas aparecen en **rojo** (#dc3545)
2. Mientras el usuario escribe, cada línea cambia a **verde** (#28a745) cuando se cumple su requisito específico
3. Cuando todos los requisitos se cumplen, se muestra "Valid password" en verde
4. La validación se actualiza en tiempo real con cada tecla presionada

**Requisitos validados:**
- Mínimo 8 caracteres
- Al menos una letra (a-z, A-Z)
- Al menos un número (0-9)
- Al menos un carácter especial (/*-+!@#$%^&*(), etc.)

**Ejemplo visual:**
```
8-character password          ← Verde cuando tiene 8+ caracteres
Include letters and numbers   ← Verde cuando tiene letras Y números
Special characters/*-+        ← Verde cuando tiene caracteres especiales
```

### Confirm Password
- Debe coincidir con la contraseña
- Misma validación individual que password
- Cada requisito cambia de color individualmente
- Cambia a "Valid password" (verde) cuando todos los requisitos se cumplen Y coincide con la contraseña principal
- Muestra mensaje adicional: "Passwords match ✓" cuando coinciden

## 🔐 Integración con API

El componente está integrado con la API de `https://startapp360.com/api/v1/`:

### Endpoints utilizados:

1. **Login**: `POST /api/v1/token/`
   ```javascript
   {
     email: string,
     password: string
   }
   ```

2. **Registro**: `POST /api/v1/register/`
   ```javascript
   {
     email: string,
     username: string,
     password: string,
     password2: string
   }
   ```

3. **Cambio de contraseña**: `PUT /api/v1/register/{id}/`
   ```javascript
   {
     email: string,
     username: string,
     password: string,
     password2: string
   }
   ```

## 🎨 Estados de Loading

Los estados de loading están integrados con `react-loader-spinner`. El spinner de tipo `ThreeDots` se muestra automáticamente cuando `loading` es `true`.

## 📝 Notas Importantes

1. **ToastContainer**: Asegúrate de importar los estilos de react-toastify:
   ```jsx
   import 'react-toastify/dist/ReactToastify.css';
   ```

2. **Iconos**: Los iconos de ojo usan react-icons. El componente usa `FaEye` y `FaEyeSlash` de `react-icons/fa`.

3. **Validación**: La validación de contraseña es avanzada con validación individual por cada requisito.

4. **Accesibilidad**: Considera agregar labels y aria-labels para mejor accesibilidad.

5. **Token Management**: El token se guarda en `localStorage` y se verifica automáticamente en el componente.

## 🐛 Solución de Problemas

### Los mensajes no se muestran
- Verifica que los estados iniciales tengan valores vacíos o valores por defecto
- Asegúrate de que `ValidationMessage` siempre se renderice cuando hay contenido en el input

### Los colores no cambian
- Verifica que `isValid` se actualice correctamente en las funciones de validación
- Revisa que el prop `isValid` se pase correctamente al componente `ValidationMessage`

### ⭐ Los requisitos de contraseña no cambian de color individualmente
- **Verifica que los estados `passwordChecks` y `password2Checks` se estén actualizando** en las funciones `validatePassword` y `validatePassword2`
- Asegúrate de que el componente `PasswordValidationMessage` reciba el prop `checks` correctamente
- Revisa que `setPasswordChecks` y `setPassword2Checks` se llamen con el objeto correcto: `{ length, lettersNumbers, special }`
- Verifica que las expresiones regulares para validar letras, números y caracteres especiales estén correctas:
  - Letras y números: `/[a-zA-Z]/.test(pass) && /[0-9]/.test(pass)`
  - Caracteres especiales: `/[/*\-+!@#$%^&*(),.?":{}|<>]/.test(pass)`

### El formulario no es responsive
- Verifica que el `Container` tenga `padding: 20px`
- Asegúrate de que `max-width: 28rem` esté en `AuthBox`
- El componente usa `width: 100%` en los inputs para adaptarse al contenedor

### El visor de contraseña no está bien posicionado
- El icono está posicionado con `top: 28px` y `right: 16px`
- El `PasswordInput` tiene `padding-right: 48px` para dar espacio al icono
- Si necesitas ajustar, modifica estos valores en los styled components

### El botón está deshabilitado incorrectamente
- El botón se deshabilita cuando:
  - `loading` es `true`
  - Los campos requeridos no son válidos (según el modo: login, registro, cambio de contraseña)
- En registro y cambio de contraseña, se requiere que `passwordValid`, `password2Valid` y `passwordMatch` sean `true`

## 🚀 Uso Básico

### 1. Importar el componente

```jsx
import Auth from './pages/Auth';
```

### 2. Usar en tu aplicación

El componente ya está integrado en las rutas de la aplicación:

```jsx
<Route path="/auth" element={<Auth />} />
```

### 3. Navegación entre modos

El componente tiene tres modos internos:
- **Login**: Modo por defecto
- **Registro**: Se activa con `setIsRegistering(true)`
- **Cambio de Contraseña**: Se activa con `setIsChangingPassword(true)`

Los usuarios pueden cambiar entre modos usando los enlaces en la parte inferior del formulario.

## 🔧 Personalización

### Cambiar Colores

Para cambiar los colores principales, modifica las siguientes constantes en los styled-components:

```jsx
// Color primario (botones, links)
background: linear-gradient(135deg, #E91E63 0%, #DB2777 100%);  // Cambia estos valores
color: #00BCD4;              // Para links

// Color de hover
background: linear-gradient(135deg, #DB2777 0%, #BE185D 100%);   // Cambia estos valores

// Colores de validación
color: #dc3545;  // Rojo (error)
color: #28a745;  // Verde (éxito)
```

### Cambiar Mensajes de Validación

Modifica los mensajes en las funciones de validación:

```jsx
// En validateEmail
setEmailError('Your custom message');

// En validateUsername
setUsernameError('Your custom message');

// Los mensajes de contraseña están en el componente PasswordValidationMessage
```

### Cambiar Tamaños

```jsx
// Tamaño del contenedor
max-width: 28rem;  // Ancho máximo del formulario

// Padding del contenedor
padding: 2.5rem;   // Espaciado interno

// Tamaño de fuente del título
font-size: 1.5rem;  // Título
font-size: 1rem;    // Inputs
font-size: 0.875rem; // Mensajes
```

### Modificar Requisitos de Contraseña

Para cambiar los requisitos de contraseña, modifica la función `validatePassword`:

```jsx
const validatePassword = (pass) => {
    const checks = {
        length: pass.length >= 8,  // Cambia el número mínimo
        lettersNumbers: /[a-zA-Z]/.test(pass) && /[0-9]/.test(pass),
        special: /[/*\-+!@#$%^&*(),.?":{}|<>]/.test(pass)  // Modifica los caracteres especiales
    };
    // ...
};
```

Y actualiza los mensajes en `PasswordValidationMessage`:

```jsx
<ValidationLine isValid={checks.length}>
    8-character password  // Cambia este mensaje
</ValidationLine>
```

## 📱 Responsive Design

El componente es responsive por defecto. El contenedor se adapta automáticamente:

- **Desktop**: Máximo 28rem (448px)
- **Tablet/Mobile**: 100% del ancho disponible con padding de 20px

El componente usa:
- `min-height: 100vh` para ocupar toda la altura de la pantalla
- `padding: 20px` en el contenedor para espaciado en móviles
- `width: 100%` en los inputs para adaptarse al contenedor
- `max-width: 28rem` para limitar el ancho en pantallas grandes

## 🔒 Seguridad

1. **Tokens**: Los tokens se almacenan en `localStorage`. Considera implementar almacenamiento más seguro para producción.

2. **Validación del lado del cliente**: La validación del lado del cliente es para UX. La validación real debe hacerse en el servidor.

3. **HTTPS**: Asegúrate de usar HTTPS en producción para proteger las credenciales durante la transmisión.

## 📊 Estados del Componente

El componente maneja los siguientes estados:

```javascript
// Estados de formulario
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [username, setUsername] = useState('');
const [password2, setPassword2] = useState('');

// Estados de modo
const [isRegistering, setIsRegistering] = useState(false);
const [isChangingPassword, setIsChangingPassword] = useState(false);

// Estados de UI
const [showPassword, setShowPassword] = useState(false);
const [showPassword2, setShowPassword2] = useState(false);
const [loading, setLoading] = useState(false);

// Estados de validación
const [emailValid, setEmailValid] = useState(false);
const [emailError, setEmailError] = useState('');
const [usernameValid, setUsernameValid] = useState(false);
const [usernameError, setUsernameError] = useState('');
const [passwordChecks, setPasswordChecks] = useState({ length: false, lettersNumbers: false, special: false });
const [passwordValid, setPasswordValid] = useState(false);
const [password2Checks, setPassword2Checks] = useState({ length: false, lettersNumbers: false, special: false });
const [password2Valid, setPassword2Valid] = useState(false);
const [passwordMatch, setPasswordMatch] = useState(false);
```

## 🎯 Mejores Prácticas

1. **Validación en tiempo real**: La validación se ejecuta en cada cambio de input para proporcionar retroalimentación inmediata.

2. **Deshabilitar botones**: Los botones se deshabilitan cuando los campos requeridos no son válidos, previniendo envíos incorrectos.

3. **Mensajes claros**: Los mensajes de error son específicos y accionables.

4. **Feedback visual**: El cambio de color de rojo a verde proporciona feedback visual inmediato.

5. **Reset de estados**: Al cambiar entre modos, se resetean todos los estados para evitar confusión.

## 📄 Licencia

Este código es libre de usar y modificar según tus necesidades.

---

**Versión**: 1.0.0  
**Última actualización**: 2024  
**Ubicación**: `src/pages/Auth.js`

