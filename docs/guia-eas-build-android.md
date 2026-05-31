# Guía — Generar APK de Android con EAS Build

Guía paso a paso para generar un APK instalable de un proyecto Expo, conectado a tu backend (Supabase u otro), sin necesidad de tener el dev server corriendo. Pensada para reusar en cualquier proyecto Expo.

## ¿Qué te da esto?

Un APK firmado que:
- Se instala como cualquier app de Android.
- Funciona desde cualquier red (wifi, datos), sin depender de tu compu.
- Lleva tus variables de entorno (URL del backend, keys públicas) horneadas adentro.
- No usa Expo Go — es una app standalone.

---

## Prerrequisitos

- Proyecto Expo (SDK 50+).
- Node.js + npm.
- Cuenta en [expo.dev](https://expo.dev) (gratis).
- Android (en el celular) con permiso para instalar apps de fuentes desconocidas.

---

## Paso 1 — Instalar EAS CLI

```bash
npm install -g eas-cli
```

Verificar:
```bash
eas --version
```

## Paso 2 — Login en Expo

```bash
eas login
```

Te pide email/password de tu cuenta de Expo. Una vez logueado:
```bash
eas whoami
```

## Paso 3 — Configurar EAS en el proyecto

Desde la raíz del proyecto:

```bash
eas build:configure
```

Esto:
- Pregunta qué plataformas vas a buildear (Android, iOS o ambas).
- Crea **`eas.json`** en la raíz con perfiles `development`, `preview` y `production`.
- Agrega `extra.eas.projectId` en tu **`app.json`** (linkea tu proyecto local con el servicio de EAS).

## Paso 4 — Verificar campos requeridos en `app.json`

Para Android necesitás como mínimo:

```json
{
  "expo": {
    "name": "Nombre App",
    "slug": "slug-app",
    "version": "0.1.0",
    "android": {
      "package": "com.tudominio.app"
    }
  }
}
```

### ⚠️ Gotcha — Referencias a assets

Si tu `app.json` referencia paths de assets (`icon`, `splash.image`, `android.adaptiveIcon.foregroundImage`), esos archivos **tienen que existir**. En Expo Go no importaba porque usa íconos default, pero EAS Build corre `npx expo prebuild` real y falla si faltan.

Dos opciones:
- **Crear los archivos**: ej. un PNG de 1024x1024 en `assets/icon.png`.
- **Quitar las referencias**: si no tenés los assets aún, removelos del `app.json` y Expo usa íconos default.

Error típico cuando falta:
```
ENOENT: no such file or directory, open './assets/icon.png'
```

## Paso 5 — Ajustar `eas.json` para que `preview` genere APK

Por defecto, el perfil `preview` produce AAB (formato Play Store). Para instalación directa querés **APK**:

```json
{
  "cli": {
    "version": ">= 20.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

- `distribution: "internal"` → te genera un link de descarga directo (no requiere Play Store).
- `buildType: "apk"` → fuerza APK en lugar del AAB default.

## Paso 6 — Cargar env vars como EAS Secrets

El build corre en la nube de Expo y **no tiene acceso a tu `.env` local** (está gitignored, no se sube). Hay que registrar las variables en EAS una vez:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_NOMBRE_VAR --value "valor-real" --type string
```

### Ejemplo con Supabase

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxx.supabase.co" --type string

eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "sb_publishable_..." --type string
```

### ⚠️ Importante — Prefijo `EXPO_PUBLIC_`

Expo solo inyecta en el bundle del cliente las variables que **empiezan con `EXPO_PUBLIC_`**. Sin ese prefijo, tu código lee `undefined`. Los secrets sin prefijo siguen siendo útiles para scripts de build, pero no llegan al cliente.

### Comandos útiles de secrets

```bash
# Listar todos los secrets del proyecto
eas secret:list

# Sobreescribir un secret existente (rotar key, cambiar URL)
eas secret:create --force --scope project --name EXPO_PUBLIC_VAR --value "nuevo" --type string

# Borrar un secret
eas secret:delete --scope project --name EXPO_PUBLIC_VAR
```

## Paso 7 — Lanzar el build

```bash
eas build --platform android --profile preview
```

Qué pasa:

1. **Keystore (solo la primera vez)** — EAS te pregunta si querés que genere y maneje un keystore Android. Decí **Yes**. Es la clave criptográfica que firma el APK; EAS la guarda en su nube y la reusa en builds futuros del mismo perfil. Si firmás con la misma keystore, podés "actualizar" la app en el device sin desinstalarla.
2. **Upload + build** — sube el código y arranca el build en la nube. Vas a ver un link tipo `https://expo.dev/accounts/.../builds/...` para seguir el progreso en vivo.
3. **Tiempo** — ~10-15 min en plan gratuito (varía por la cola).
4. **Output** — al terminar, te imprime un **link de descarga del APK** en la consola.

## Paso 8 — Instalar en el celular

1. Abrí el link de descarga desde el navegador del celular (o transferí el link vía WhatsApp/email).
2. Descargá el `.apk`.
3. Android va a pedir permiso para **"Instalar apps desconocidas"** para el navegador desde el que descargaste. Autorizá.
4. Instalá. La app aparece en el launcher como cualquier otra.

## Paso 9 — Workflow de actualización

### Cambios de código
```bash
eas build --platform android --profile preview
```
Descargás el APK nuevo, lo instalás (Android reemplaza el viejo automáticamente — mismo package name + misma keystore).

### Cambios de env vars
```bash
eas secret:create --force --scope project --name EXPO_PUBLIC_VAR --value "nuevo" --type string
eas build --platform android --profile preview
```
Hay que rebuildear porque las env vars se inyectan al momento del build.

### Cambios de versión visible al usuario
Subí `version` en `app.json` (ej. `"0.1.0"` → `"0.2.0"`) antes del build.

---

## Errores comunes

### `ENOENT: no such file or directory, open './assets/icon.png'`
Estás referenciando un asset que no existe. Creá el archivo (1024x1024 PNG para `icon`) o quitá la referencia del `app.json`. Ver Paso 4.

### `auth.uid()` devuelve null en RLS aunque hay sesión (Supabase)
PostgREST no está validando el token. Chequear:
- Estás usando la **publishable key**, no la secret key.
- Hay sesión activa antes de la request (`supabase.auth.getSession()` devuelve sesión).
- `@supabase/supabase-js` está en versión reciente (`^2.45+` para el sistema nuevo de keys).
- La env var llegó bien al APK (el prefijo `EXPO_PUBLIC_` está, no `undefined`).

### Build falla porque un módulo nativo no compila
Para módulos del ecosistema Expo, casi nunca hace falta config extra. Si usás un paquete con código nativo custom (camera, BLE, etc.) podés necesitar `expo prebuild --clean` localmente para regenerar la carpeta `android/`. Para empezar, evitá librerías que requieran linkear nativo manualmente.

### El APK se descarga pero no instala ("App no instalada")
Casi siempre es porque ya tenés instalado un APK con el mismo package pero firmado con OTRA keystore. Desinstalá la versión vieja desde el celular y reintentá.

### Las env vars salen `undefined` en runtime
Tres causas:
- Olvidaste el prefijo `EXPO_PUBLIC_` en el nombre.
- El secret se creó después del último build → rebuildear.
- Las leíste con `process.env.X` pero en un contexto que no es JS de runtime (ej. archivo de config nativo).

---

## Opcional — Custom icon

1. Generá un PNG de **1024x1024** (Figma, Canva, ChatGPT image, etc.).
2. Creá la carpeta `assets/` en la raíz del proyecto.
3. Guardalo como `assets/icon.png`.
4. En `app.json`:
   ```json
   "icon": "./assets/icon.png"
   ```
5. Rebuild.

Para el **adaptive icon** (la pieza redondeada en Android 8+):
```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#FAF7F2"
  }
}
```

---

## Modelo mental

- **EAS Build** = servicio en la nube de Expo que compila tu app para Android/iOS.
- Tu código local se sube comprimido a EAS por cada build.
- EAS provisiona una máquina build (Linux para Android, macOS para iOS), corre `npx expo prebuild` para generar los proyectos nativos, y compila el APK/AAB.
- **Env vars** y **keystore** se manejan en la nube de EAS y se inyectan al momento del build.
- El resultado es un APK firmado **standalone** — no tiene nada de Expo Go adentro; corre como cualquier app nativa.

---

## Para producción (Play Store)

Esta guía cubre `preview` (APK de distribución interna). Para subir a Google Play Store hace falta el perfil `production` (AAB):

```bash
eas build --platform android --profile production
```

Y después `eas submit --platform android` para enviarlo automáticamente al Play Console (requiere setup adicional con cuenta de Google Play Developer).

## Referencias

- Docs de EAS Build: https://docs.expo.dev/build/introduction/
- EAS Secrets: https://docs.expo.dev/build-reference/variables/
- Env vars en Expo: https://docs.expo.dev/guides/environment-variables/
