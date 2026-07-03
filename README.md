# G-Learning

Aplicación web para aprender **guitarra eléctrica**: escalas, acordes y modos con visualización en el diapasón, tablatura y **reproducción con audio real**, además de un módulo para que cada usuario **cree y guarde sus propias escalas**, gestión de cuenta y un panel de administración.

> **Live App:** [mauriciobarriosb.github.io/glearning](https://mauriciobarriosb.github.io/glearning)

Este documento describe en detalle las características, la arquitectura y las convenciones del frontend.

---

## Índice

1. [Tech stack](#tech-stack)
2. [Puesta en marcha](#puesta-en-marcha)
3. [Variables de entorno](#variables-de-entorno)
4. [Scripts](#scripts)
5. [Características de la aplicación](#características-de-la-aplicación)
6. [Rutas](#rutas)
7. [Arquitectura](#arquitectura)
8. [Capa de datos y seguridad](#capa-de-datos-y-seguridad)
9. [Motor de audio](#motor-de-audio)
10. [Teoría musical (helpers)](#teoría-musical-helpers)
11. [Estructura del proyecto](#estructura-del-proyecto)
12. [Alias de importación](#alias-de-importación)
13. [Integración con el backend](#integración-con-el-backend)
14. [Convenciones](#convenciones)

---

## 1. Tech stack

| Área | Tecnología |
|------|------------|
| UI | React 19 + TypeScript 5.9 |
| Bundler | Vite 7 |
| Estilos | Tailwind CSS 4 |
| Estado servidor | TanStack React Query 5 |
| HTTP | Axios 1.7 |
| Ruteo | React Router 7 |
| Audio | Tone.js 15 |
| Iconos | lucide-react |
| Animación | framer-motion |

La app se sirve bajo la ruta base **`/glearning/`** (ver `vite.config.ts`).

---

## 2. Puesta en marcha

```bash
npm install
cp env.example .env      # ajusta los valores (ver más abajo)
npm run dev
```

Requisitos:

- El **backend** (CodeIgniter 4 + SQL, en `../backend`) debe estar en ejecución, ya que la data es procesada mediante API.
- `VITE_APP_API_URL` debe apuntar a la API, y las credenciales de firma HMAC (`VITE_APP_API_CLIENT_ID` / `VITE_APP_API_CLIENT_SECRET`) deben **coincidir** con las del backend (`api.apiClientId` / `api.apiClientSecret`).

---

## 3. Variables de entorno

Todas las variables usan el prefijo `VITE_APP_` y se inyectan en tiempo de build/arranque (reinicia Vite si las cambias).

| Variable | Descripción |
|----------|-------------|
| `VITE_APP_API_URL` | Base URL de la API |
| `VITE_APP_ACCESS_TOKEN` | Clave de localStorage JWT |
| `VITE_APP_REFRESH_TOKEN` | Clave de localStorage del refresh token. |
| `VITE_APP_USER` | Clave de localStorage del usuario cacheado (JSON). |
| `VITE_APP_API_CLIENT_ID` | Identificador de cliente para la firma HMAC. Debe coincidir con el backend. |
| `VITE_APP_API_CLIENT_SECRET` | Secreto HMAC. Viaja en el bundle: **anti-scraping**. Debe coincidir con el backend. |

---

## 4. Scripts

| Script | Acción |
|--------|--------|
| `npm run dev` | Servidor de desarrollo (Vite). |
| `npm run build` | Typecheck (`tsc -b`) + build de producción. |
| `npm run preview` | Previsualiza el build. |
| `npm run lint` | ESLint. |
| `npm run format` | Prettier. |

---

## 5. Características de la aplicación

### 🏠 Home
Página de aterrizaje, llamadas a la acción (explorar escalas / crear escala), tarjetas de cada módulo (Escalas, Acordes, Modos, Mis escalas) y una sección de "todo lo que puedes hacer" con iconografía.

### 🎵 Escalas (`/scales`)
- Catálogo de escalas agrupadas por familia (pentatónicas y blues, modos griegos, menor melódica, armónica, simétricas, exóticas, bebop…) en un acordeón.
- Selección de **tónica** y **afinación** (6 y 7 cuerdas).
- Dos modos de patrón: **caja** (por posición) y **3 notas por cuerda**.
- Visualización en **diapasón** (SVG) y en **tablatura** (SVG).
- Reproducción con audio: **BPM**, dirección (ascendente / descendente / ida y vuelta), **repetir** y **metrónomo**; la nota que suena se resalta en tiempo real.
- Alternar entre nombres de nota y **grados**.

### 🎸 Acordes (`/chords`)
- Formas de acorde por familia (mayores, menores, power chords, dominantes, maj7, m7, etc.).
- Diagramas de digitación y acordes abiertos; transposición de formas móviles a cualquier tónica y adaptación a la afinación seleccionada.
- Reproducción del acorde (rasgueo) con audio.

### 🎼 Modos (`/modes`)
- Los siete modos griegos y otras familias modales, con su metadata educativa (carácter, nota característica, acorde sugerido, "mood").
- Reutiliza el diapasón, la tablatura y el reproductor de escalas.

### ✨ Mis escalas (`/custom-scales`) — requiere sesión
Módulo para que el usuario **cree sus propias escalas** como una **secuencia de notas en la tablatura**:

- **Página lista** (`/custom-scales`): tarjetas con las escalas guardadas del usuario (nombre, afinación, nº de notas, dificultad). Al hacer clic se abre el detalle.
- **Página detalle/editor** (`/custom-scales/new` y `/custom-scales/:id`):
  - **Tablatura interactiva**: grilla cuerdas × trastes (0–24). Al hacer clic en una celda se agrega/quita esa nota. El badge indica el **paso de reproducción**.
  - Elección de **afinación** (al cambiarla se descartan notas de cuerdas inexistentes), nombre, descripción y dificultad.
  - **Reproducción**: las notas suenan **en orden de traste** (izquierda→derecha); las notas que comparten traste en distintas cuerdas suenan **a la vez** (acorde). Controles de BPM, dirección, repetir y metrónomo.
  - Tablatura de solo lectura ("Secuencia") con las notas apiladas por columna/traste.
  - Guardar, actualizar y eliminar.
- **Aislamiento por usuario**: cada usuario solo ve y edita sus propias escalas.

### 👤 Mi cuenta (`/account`) — requiere sesión
- Editar **datos de perfil** (nombre y email); el cambio se refleja de inmediato en la app (nombre del navbar).
- **Cambiar contraseña** (requiere la contraseña actual; validación de largo y confirmación).

### 🔐 Autenticación (`/login`, `/register`)
- Registro e inicio de sesión con JWT. La sesión se cachea en `localStorage` y se restaura al recargar. **Refresh token** automático ante un 401.

### 🛠️ Administración — requiere rol admin
- **Usuarios** (`/admin`): CRUD de usuarios con búsqueda, paginación, activar/desactivar y borrado lógico.
- **Escalas de usuarios** (`/admin/custom-scales`): listado global (de **todos** los usuarios) con búsqueda, paginación y modal de detalle que renderiza la tablatura guardada.

---

## 6. Rutas

| Ruta | Página | Protección | Contenido |
|------|--------|------------|-----------|
| `/`, `/home` | Home | Pública | — |
| `/login`, `/register` | Login / Register | Pública | — |
| `/account` | Mi cuenta | `RequireAuth` | — |
| `/scales` | Escalas | Pública | `ContentProvider` |
| `/modes` | Modos | Pública | `ContentProvider` |
| `/chords` | Acordes | Pública | `ContentProvider` |
| `/custom-scales` | Lista de mis escalas | `RequireAuth` | `ContentProvider` |
| `/custom-scales/new` | Crear escala | `RequireAuth` | `ContentProvider` |
| `/custom-scales/:id` | Editar escala | `RequireAuth` | `ContentProvider` |
| `/admin` | Usuarios | `RequireAdmin` | — |
| `/admin/custom-scales` | Escalas de usuarios | `RequireAdmin` | — |

- **`ContentLayout`** monta el `ContentProvider` una sola vez y lo mantiene montado al navegar entre las páginas que necesitan el catálogo (afinaciones/escalas/acordes/modos), evitando recargas.
- Todas las páginas se cargan con `lazy()` + `Suspense`.

---

## 7. Arquitectura

### Providers
```
<BrowserRouter basename="/glearning">
  <AuthProvider>            ← sesión (user, isAuthenticated, isAdmin, login/register/logout/updateUser)
    <Layout>                ← navbar + menú responsivo + footer
      <Suspense>
        <Routes>
          … rutas de contenido dentro de <ContentLayout> → <ContentProvider>
```

> React Query (`QueryClientProvider`) se monta en `main.tsx`.

### Contextos
- **`AuthContext`**: expone `user`, `isAuthenticated`, `isAdmin`, `login`, `register`, `logout` y `updateUser`. Persiste tokens y usuario en `localStorage` con las claves definidas por las variables de entorno.
- **`ContentContext`**: carga en paralelo (React Query, `staleTime: Infinity`) las afinaciones, escalas, acordes y modos. Muestra loader mientras carga y un estado de error con reintento; solo entonces expone la data vía `useContent()`.

### Guards
- **`RequireAuth`**: redirige a `/login` si no hay sesión.
- **`RequireAdmin`**: redirige a `/login` (sin sesión) o a `/` (autenticado no-admin).

---

## 8. Capa de datos y seguridad

Cliente Axios central en `services/apiConfig.ts`:

- **Bearer token**: adjunta `Authorization: Bearer <accessToken>`.
- **Firma HMAC**: **toda** petición se firma (`services/sign.ts`) con las cabeceras `X-Client-Id`, `X-Timestamp`, `X-Nonce`, `X-Signature`. La cadena canónica es `clientId + "\n" + METHOD + "\n" + /api{path} + "\n" + timestamp + "\n" + nonce` y debe coincidir con el `ClientAuthFilter` del backend.
- **Refresh automático**: ante un `401` (fuera de endpoints de auth) intenta **un** refresh del token y reintenta la petición; colapsa 401 concurrentes en un solo round-trip. Si falla, limpia la sesión y redirige a `/login`.
- **Normalización de errores**: convierte cualquier error al envelope `{ code, message, userMessage }` y notifica a los listeners (toasts vía `ApiErrorNotification`). Usa `getErrorMessage()` para mostrar mensajes al usuario.

Envelope estándar de la API: éxito `{ success, data }`, error `{ error, code, message, userMessage, timestamp }`.

Servicios de dominio:
- `authApi.ts` — login, register, me, logout, `updateProfile`, `updatePassword`.
- `contentApi.ts` — afinaciones, escalas, acordes, modos.
- `usersApi.ts` — CRUD de usuarios (admin).
- `customScalesApi.ts` — CRUD de escalas propias + listado/detalle admin.

---

## 9. Motor de audio

`modules/scales/hooks/useScalePlayer.ts` (Tone.js):

- Sonido de cuerda pulsada (**PluckSynth**, Karplus-Strong) + metrónomo (**MembraneSynth**).
- Scheduling exacto con el **Transport** de Tone.js en *ticks* musicales, de modo que el **tempo** y el **metrónomo** se cambian en vivo sin reprogramar.
- **Pool de 8 voces**: una secuencia monofónica usa una sola voz (cada nota corta la anterior); un **acorde** reparte sus notas en voces distintas para que suenen a la vez. Por eso `PlayEvent.pitch` acepta `string | string[]`.
- Resalta la columna/nota activa durante la reproducción.

Los acordes se aprovechan en **Mis escalas** (notas en el mismo traste = mismo paso) y en el módulo de **acordes** (rasgueo).

---

## 10. Teoría musical (helpers)

`helpers/music.ts` — utilidades puras:
- `CHROMATIC`, `DEGREE_LABELS`, `STANDARD_TUNING`.
- `transpose`, `notesFromIntervals`, `noteAtFret`.
- Tonos con octava: `pitchToMidi`, `pitchAtFret`, `pitchClassAtFret`.
- Diapasón y patrones: `getFretboardNotes`, `positionCount`, `getBoxPattern`, `get3npsPattern`.

`helpers/chords.ts` — construcción/transposición de acordes y adaptación a afinaciones.

Componentes de visualización reutilizables (`modules/scales/components`):
- **`Fretboard`** — diapasón SVG (notas, grados, raíz, nota característica, resaltado).
- **`TabStaff`** — tablatura SVG; soporta `columns` para apilar varias notas en la misma columna (acordes).

---

## 11. Estructura del proyecto

```
src/
├── App.tsx                      # rutas + providers de layout
├── main.tsx                     # bootstrap (React Query, HeroUI, router)
├── components/
│   ├── Layout.tsx               # navbar + menú responsivo + dropdown de usuario
│   ├── PageLoader.tsx
│   ├── DifficultyChip.tsx
│   ├── ApiErrorNotification.tsx # toasts de error de API
│   ├── guards/                  # RequireAuth, RequireAdmin
│   └── icons/                   # ElectricGuitar, …
├── config/
│   └── music.ts                 # orden de familias, defaults de UI
├── context/
│   ├── AuthContext.tsx
│   └── ContentContext.tsx
├── helpers/                     # music.ts, chords.ts, number.ts
├── services/                    # apiConfig, sign, authApi, contentApi, usersApi, customScalesApi
├── types/
│   └── index.ts                 # tipos de dominio compartidos
└── modules/
    ├── home/pages/Home.tsx
    ├── scales/                  # ScalesPage + Fretboard, TabStaff, useScalePlayer
    ├── modes/pages/ModesPage.tsx
    ├── chords/                  # ChordsPage + ChordDiagram, useChordPlayer
    ├── customscales/            # ← escalas propias
    │   ├── pages/CustomScalesListPage.tsx      # lista (cards)
    │   ├── pages/CustomScalesDetailPage.tsx    # crear/editar
    │   ├── pages/AdminCustomScales.tsx         # listado admin
    │   ├── components/TabEditor.tsx            # tablatura editable
    │   ├── components/CustomScaleEditor.tsx    # editor + reproducción
    │   └── hooks/useCustomScales.ts            # React Query
    ├── user/                    # Login, Register, AccountPage
    └── admin/                   # AdminUsers + UserFormModal + useAdminUsers
```

Convención de módulo: `pages/`, `components/`, `hooks/` y, cuando aplica, servicios propios.

---

## 12. Alias de importación

Definidos en `vite.config.ts` (y en `tsconfig`):

| Alias | Ruta |
|-------|------|
| `@/…` | `src/…` |
| `@components/…` | `src/components/…` |
| `@modules/…` | `src/modules/…` |
| `@services/…` | `src/services/…` |
| `@types/…` | `src/types/…` |

---

## 13. Integración con el backend

El backend (CodeIgniter 4 + SQL) expone la API bajo `/api`. 

Todas las rutas pasan por los filtros globales del backend: `throttle` y `clientAuth` (firma HMAC), las autenticadas añaden `jwtAuth` y, si aplica, `adminAuth`.

### Modelo de "escala personalizada"
Una escala propia se guarda como una **secuencia de notas** sobre una afinación, no como intervalos:

```jsonc
{
  "name": "Mi escala",
  "tuningId": "e-standard",
  "tuningName": "Mi estándar",
  "strings": ["E2","A2","D3","G3","B3","E4"],   // afinación denormalizada
  "notes": [ { "string": 0, "fret": 3 }, { "string": 1, "fret": 5 } ],
  "description": "…",
  "difficulty": "beginner"
}
```

La afinación se guarda denormalizada para poder renderizar la tablatura de forma autónoma (p. ej. en el panel admin, sin cargar el catálogo).

---

## 14. Convenciones

- **TypeScript estricto**; tipos de dominio en `src/types/index.ts` (forma camelCase que espeja `formatPublic` del backend).
- **Estado de servidor** con React Query (queries con `queryKey`, mutaciones que invalidan la query correspondiente).
- **UI** con componentes y utilidades de Tailwind 4 (tokens `primary`, `content1`, `default-*`, etc.). El `important` de Tailwind 4 usa sufijo (`flex-row!`).
- **Errores** siempre vía `getErrorMessage()` + `addToast` (o el estado local del formulario en las páginas de auth).
- Referencias a archivos/código: rutas relativas desde la raíz del workspace.
