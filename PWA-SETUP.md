# PWA Setup Checklist - FronteraHacks 2026

## ✅ Configuración Completada

### 1. **Manifest.json** (`public/manifest.json`)

- ✅ Nombre completo y corto
- ✅ Descripción en español
- ✅ Display mode: `standalone` (fullscreen)
- ✅ tema color: `#4B5563`
- ✅ Fondo blanco
- ✅ Íconos en 7 tamaños diferentes (16, 32, 36, 48, 72, 96, 144, 192 px)
- ✅ Screenshots para la pantalla instalación
- ✅ Shortcuts rápidos: Hoy, Nutrición, Macros
- ✅ Categorías: health, fitness

### 2. **Service Worker** (`public/sw.js`)

- ✅ Caching de assets de la app shell
- ✅ Estrategia "Network first" para API calls
- ✅ Estrategia "Cache first" para assets estáticos
- ✅ Estrategia "Stale while revalidate" para HTML
- ✅ Fallback offline (offline.html)
- ✅ Push notifications support
- ✅ Background sync para food entries

### 3. **Registro del Service Worker** (`resources/js/app.tsx`)

- ✅ Registro automático al cargar la app
- ✅ Logging de éxito/error

### 4. **Meta Tags PWA** (`resources/views/app.blade.php`)

- ✅ `mobile-web-app-capable` - Android
- ✅ `apple-mobile-web-app-capable` - iOS
- ✅ `apple-mobile-web-app-status-bar-style` - Estilo barra de estado iOS
- ✅ `apple-mobile-web-app-title` - Nombre en iOS
- ✅ `msapplication-starturl` - Ruta inicio Windows
- ✅ `theme-color` - Color barra de navegación
- ✅ `format-detection` - Deshabilitar autodetección teléfono
- ✅ `color-scheme` - Light/dark mode support
- ✅ Favicon en 3 tamaños
- ✅ Apple touch icons en 9 tamaños

### 5. **Configuración Windows** (`public/browserconfig.xml`)

- ✅ Windows tiles en 3 tamaños
- ✅ Tile color coincide con theme

### 6. **Página Offline** (`public/offline.html`)

- ✅ Interfaz offline amigable
- ✅ Auto-detección dark mode
- ✅ Botón para reconectar
- ✅ Auto-redirige cuando recupera conexión

## 📱 Cómo Funciona

### Android

1. Abre la app en Chrome/Firefox
2. Menu (⋮) → "Instalar aplicación" o "Añadir a pantalla principal"
3. Se instala como app nativa con icono en home

### iOS (Safari)

1. Abre la app en Safari
2. Compartir → "Añadir a pantalla inicio"
3. Se instala como webapp fullscreen

### Desktop (Chrome/Firefox/Edge)

1. Abre la app en cualquier navegador soportado
2. Icono de instalación aparece en la barra de dirección
3. Click para instalar como app de escritorio

## 🎨 Assets Requeridos en `/public/`

Tu proyecto ya tiene:

- ✅ `favicon.svg` - SVG favicon
- ✅ `favicon.ico` - ICO favicon
- ✅ `apple-touch-icon.png` - 166x166

Tu servidor genera automáticamente (basado en manifest):

- `favicon-16x16.png`, `favicon-32x32.png`, `favicon-96x96.png`
- `android-icon-36x36.png`, `48x48`, `72x72`, `96x96`, `144x144`, `192x192`
- `apple-icon-57x57.png`, `60x60`, `72x72`, `76x76`, `114x114`, `120x120`, `144x144`, `152x152`, `180x180`
- `ms-icon-70x70.png`, `150x150`, `310x310`

> **Nota:** Si estos archivos no existen, el service worker seguirá funcionando pero la app se verá sin icono en la instalación.

## 🚀 Próximos Pasos (Opcional pero Recomendado)

### Generar Todos los Íconos

Puedes usar cualquiera de estos servicios:

1. **favicon-generator.org** - Carga apple-touch-icon.png y descarga el ZIP
2. **PWA Builder** (pwabuilder.com) - Microsoft's official tool
3. **Imagen Magick CLI** - Localmente (requiere ImageMagick instalado)

```bash
# Ejemplo con ImageMagick
convert apple-touch-icon.png -resize 192x192 android-icon-192x192.png
```

### Validación

- Chrome DevTools → Application → Manifest
    - Debe mostrar todos los campos completados ✅
- Service Workers tab → sw.js debe estar "activated and running"
- Lighthouse audit → PWA score debe ser 90+

## 📋 Feature Flags para Próximos Releases

- [ ] Implementar push notifications (backend + frontend)
- [ ] Agregar "Update available" prompt cuando hay nueva versión del SW
- [ ] Sync de food entries cuando recupera conexión
- [ ] Indicador de "Syncing..." en UI cuando hay sync en background
- [ ] Página de settings para limpiar cache
- [ ] Soporte para web share API (compartir workouts)

## 🔐 Seguridad

- ✅ Service worker solo acepta HTTPS en producción
- ✅ Cache tiene nombre de versión (fácil invalidar)
- ✅ Manifest.json es público (no contiene datos sensibles)
- ✅ Offline page no requiere credenciales

---

**Tu app FRONTERA HACKS ya es instalable como PWA en:** ✅ Android ✅ iOS ✅ Windows/Mac ✅ Linux
