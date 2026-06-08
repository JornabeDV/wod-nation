# WODNation — Documento Comercial & Técnico de Producto

> **Versión:** 1.0  
> **Fecha:** Junio 2026  
> **Estado:** MVP Funcional — Listo para validación de mercado  
> **One-liner:** *"Stripe + Excel + TV Leaderboard para competencias de CrossFit y fitness funcional, pero construido específicamente para el mundo del box."*

---

## 1. Resumen Ejecutivo

**WODNation** es una plataforma web todo-en-uno para organizar competencias de CrossFit y fitness funcional. Reemplaza el caos de spreadsheets, grupos de WhatsApp y pagos en efectivo con un sistema digital integrado que permite:

- Crear una competencia en menos de 5 minutos.
- Recibir inscripciones de atletas con pago online automático.
- Definir WODs con distintos tipos de scoring.
- Ingresar scores en tiempo real desde cualquier dispositivo.
- Mostrar un leaderboard público en vivo, proyectable en TV, con actualización en tiempo real vía SSE (Server-Sent Events).

El producto está construido sobre **Next.js 16 + React 19 + PostgreSQL**, con autenticación segura, pasarela de pagos **MercadoPago** integrada, y un motor de ranking automático que calcula posiciones al instante.

---

## 2. El Problema que Resolvemos

Hoy, un dueño de box de CrossFit que quiere organizar una competencia interna o local enfrenta este flujo:

1. **Spreadsheets** para registrar atletas — duplicados, errores, imposible de compartir.
2. **WhatsApp** para confirmar pagos — "¿Ya me depositaste?", "¿Cuánto te debo?", screenshots de transferencias.
3. **Efectivo o transferencias** — sin tracking, sin comprobantes, sin reportes.
4. **Papel o Google Sheets** para anotar scores — lento, propenso a errores, sin auditoría.
5. **No hay leaderboard en vivo** — los atletas preguntan "¿cómo voy?", el público no sabe qué pasa.

**WODNation elimina todo eso.** Un solo link. Un solo dashboard. Todo automatizado.

### Casos de uso principales

| Tipo de evento | Ejemplo | Cómo ayuda WODNation |
|----------------|---------|----------------------|
| Comp. interna del box | "Summer Throwdown" del box | Inscripción online, pago con tarjeta, leaderboard en vivo en la TV del box |
| Comp. local/inter-box | Torneo entre 3 boxes de la ciudad | Múltiples categorías (RX/Scaled), ranking automático, export de resultados |
| Evento benéfico | WOD por una causa | Fee de inscripción, tracking de ingresos, leaderboard público |
| Competencia online/híbrida | WODs subidos a video | Scoring por puntos, leaderboard global |

---

## 3. Usuarios y Flujos

### 3.1 Organizador (Dueño de Box / Juez Principal)

```
Landing → Registro/Login → Dashboard
                ↓
    Crear Competencia (DRAFT)
                ↓
    Agregar Categorías → Agregar WODs → Publicar
                ↓
    Compartir URL Pública → Atletas se inscriben y pagan
                ↓
    Día del evento → Entrada de Scores → Leaderboard en vivo
                ↓
    Finalizar Competencia → Descargar resultados (CSV/PDF)
```

**Tiempo estimado para poner una competencia en marcha:** < 10 minutos.

### 3.2 Atleta (Participante)

```
Recibe link (WhatsApp/Instagram/Email) → Página pública de la competencia
                ↓
    Ver detalles, WODs, categorías → "Inscribirme"
                ↓
    Completar formulario → Seleccionar categoría
                ↓
    Pagar inscripción (MercadoPago) o gratis
                ↓
    Confirmación + leaderboard en vivo el día del evento
```

**Tiempo estimado de inscripción:** < 3 minutos en mobile.

### 3.3 Espectador / Público

```
Recibe link del leaderboard → Abre en celular o TV
                ↓
    Selecciona categoría → Ve tabla en vivo con rankings
                ↓
    Top 3 destacados con podio animado
                ↓
    Actualiza automáticamente cada vez que un juez carga un score
```

---

## 4. Funcionalidades Detalladas

### 4.1 Landing Page de Conversión

Página de marketing con:
- **Hero** con headline orientado a resultados: *"Run Your CrossFit Competition Without the Spreadsheet Headache"*
- **Social proof** — logos de boxes, testimonios.
- **How it works** — 3 pasos visuales.
- **Feature highlights** — Pagos online, leaderboard en vivo, tracking de WODs, auto-inscripción.
- **Pricing teaser** — "Free during beta".
- **FAQ** + Footer con contacto.

> **Objetivo:** Convertir visitantes en organizadores registrados.

---

### 4.2 Sistema de Autenticación

- **Google OAuth** — login con un click.
- **Email + Password** — registro tradicional con hash bcrypt.
- **JWT sessions** — seguro, stateless.
- **Roles:** `ORGANIZER` (default), `ADMIN`.
- Al registrarse, se crea automáticamente un `OrganizerProfile` vinculado al usuario.

---

### 4.3 Dashboard del Organizador

Panel central con:
- **Stats cards animadas:**
  - Total de competencias creadas
  - Total de atletas inscritos
  - Competencias próximas
  - Ingresos generados
- **Quick Actions:** Crear competencia, gestionar existentes, ver analytics.
- **Lista de competencias recientes** con estado (badge visual), fecha, cantidad de atletas.

---

### 4.4 Gestión de Competencias

#### Creación (Wizard de 3 pasos)
1. **Detalles básicos:** Nombre, slug (auto-generado), fecha, ubicación, descripción, banner image (URL), fee de inscripción, deadline, máximo de atletas.
2. **Categorías:** RX Masculino, RX Femenino, Scaled, Masters, etc. Cada categoría tiene género, tipo de división, rango de edad, cupo máximo.
3. **WODs:** Nombre, descripción, tipo de scoring, time cap, estándares de movimiento.

#### Estados de una competencia
| Estado | Qué significa | Qué puede hacer el organizador |
|--------|---------------|-------------------------------|
| `DRAFT` | En construcción | Editar todo, agregar categorías/WODs |
| `PUBLISHED` | Visible públicamente | Compartir link, recibir inscripciones |
| `LIVE` | En curso | Entrar scores, leaderboard activo |
| `FINISHED` | Terminada | Leaderboard congelado, resultados finales |
| `CANCELLED` | Cancelada | Oculta del público |

---

### 4.5 Categorías y Divisiones

Sistema flexible de categorías:
- **Tipos predefinidos:** `RX`, `SCALED`, `ELITE`, `MASTER`, `CUSTOM`.
- **Género:** `MALE`, `FEMALE`, `MIXED`.
- **Rango de edad:** minAge / maxAge (útil para Masters 35+, 40+, etc.).
- **Cupo máximo** por categoría (waitlist automática post-MVP).
- **Orden personalizable** para mostrar en el leaderboard.

---

### 4.6 WODs (Workouts of the Day)

Cada WOD se define con:
- **Nombre** y descripción.
- **Tipo de scoring:**
  - `AMRAP` — más reps = mejor (descendente)
  - `FOR_TIME` — menos tiempo = mejor (ascendente)
  - `EMOM` — más rounds = mejor (descendente)
  - `MAX_WEIGHT` — más peso = mejor (descendente)
  - `POINTS` — más puntos = mejor (descendente)
- **Time cap** en minutos (opcional).
- **Standards** de movimiento (textarea).
- **Orden** de aparición en la competencia.

El sistema automáticamente interpreta scores en formato `MM:SS` (tiempo) o número plano (reps/peso/puntos).

---

### 4.7 Inscripción de Atletas (Público)

**Página pública** (`/competitions/[slug]/register`):
- Formulario: nombre, email, teléfono, género, fecha de nacimiento, box, categoría.
- Validación: no duplicados por email en la misma competencia, chequeo de cupo por categoría.
- Si `registrationFee > 0`:
  - Se genera una **preferencia de pago en MercadoPago**.
  - Redirección al checkout de MercadoPago.
  - Pago con tarjeta, saldo MP, PagoFácil, Rapipago (según configuración de MP).
  - Webhook confirma el pago y marca la inscripción como `PAID`.
- Si `registrationFee = 0`:
  - Inscripción inmediata como `FREE`.
- Página de éxito post-registro.

**Manual Registration Override:** El organizador puede agregar atletas manualmente desde el dashboard (por ejemplo, atletas que pagan en efectivo el día del evento).

---

### 4.8 Pagos con MercadoPago

Integración completa:
- **Preference API** — crea un item de pago vinculado a la inscripción.
- **Back URLs** — success, failure, pending.
- **Auto-return** — el atleta vuelve automáticamente a WODNation.
- **Webhook** (`/api/mercadopago/webhook`) — recibe notificaciones de pago y actualiza el estado en tiempo real.
- **External reference** — vincula el pago con la inscripción exacta.
- **Moneda:** ARS (Argentina) por defecto, extensible a otras.

---

### 4.9 Entrada de Scores

**Página del organizador** (`/dashboard/competitions/[id]/scores`):
- Select de WOD + Select de Categoría.
- Tabla con todos los atletas inscritos en esa categoría.
- Input por atleta: score crudo (ej: "150" o "10:23").
- Conversión automática a valor numérico para ranking:
  - `"10:23"` → `623` segundos
  - `"150"` → `150` reps/puntos/kg
- Guardado con **Enter** o botón Save.
- Toast de confirmación/error.
- Al guardar, el score se propaga **inmediatamente** al leaderboard vía SSE.

---

### 4.10 Motor de Ranking y Leaderboard

#### Cálculo de rankings (en tiempo real)

1. **Por WOD:** Se ordenan los scores según el `scoringType` del WOD:
   - Ascendente para `FOR_TIME` (menor tiempo = mejor).
   - Descendente para el resto (mayor valor = mejor).
2. **Asignación de puntos:** 1er lugar = 1 punto, 2do = 2 puntos, etc.
3. **Empates:** Atletas con el mismo score comparten el mismo rank y los mismos puntos.
4. **Overall:** Suma de puntos de todos los WODs. Menor total = mejor posición.
5. **Rank general:** Orden ascendente por total de puntos, con manejo de empates.

#### Leaderboard Público (`/competitions/[slug]/leaderboard`)

- **Actualización en tiempo real** vía SSE (Server-Sent Events) + fallback de polling cada 10 segundos.
- **Podio animado** para el Top 3 con medallas y colores distintivos.
- **Tabla completa** con: Rank | Atleta | Box | WOD 1 | WOD 2 | ... | Total Puntos.
- **Selector de categorías** con tabs animados.
- **Modo fullscreen** para proyectar en TV.
- **Modo print-friendly** — se ve bien al imprimir o exportar.
- **Indicador LIVE** — luz verde parpadeante cuando hay conexión SSE activa.
- **Exportación:**
  - **CSV** — descarga directa del ranking completo.
  - **PDF** — generación con html2canvas + jsPDF, con fondo oscuro y tipografía clara.

---

### 4.11 Exportación de Resultados

Desde el leaderboard, cualquier usuario puede exportar:
- **CSV:** Formato plano, compatible con Excel/Google Sheets.
- **PDF:** Formato presentable para compartir resultados oficiales.

El organizador puede usar esto para entregar resultados finales, subir a redes sociales, o enviar a patrocinadores.

---

### 4.12 Página de Juez (Móvil/Tablet)

Ruta dedicada `/competitions/[slug]/judge` para que jueces independientes puedan:
- Ver los WODs activos.
- Ingresar scores desde su propio dispositivo.
- Acceso simplificado sin necesidad de cuenta de organizador.

---

## 5. Arquitectura Técnica

### 5.1 Stack Completo

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.7 |
| Frontend | React | 19.2.4 |
| Lenguaje | TypeScript | 5.x |
| Estilos | Tailwind CSS | 4.x |
| UI Components | shadcn/ui + Radix UI | Latest |
| Animaciones | Framer Motion | 12.x |
| ORM | Prisma | 7.8.0 |
| Database | PostgreSQL | 15+ |
| Auth | NextAuth.js (Auth.js v4) | 4.24.14 |
| Pagos | MercadoPago SDK | 3.1.0 |
| Data Fetching | SWR | 2.4.1 |
| Real-time | SSE (Server-Sent Events) | Nativo |
| PDF Export | jsPDF + html2canvas | 4.2.1 / 1.4.1 |
| QR Codes | qrcode.react | 4.2.0 |
| PWA | next-pwa | 10.2.9 |

### 5.2 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Infraestructura (Railway)                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js 16 App Router                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │  │
│  │  │   Routes    │  │  API Routes │  │  Server Actions│  │  │
│  │  │  (SSR/SC)   │  │  (REST)     │  │  (mutations)  │  │  │
│  │  └─────────────┘  └─────────────┘  └───────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Prisma ORM + PostgreSQL                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  NextAuth v4  │  MercadoPago SDK  │  SSE Events       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Patrones Arquitectónicos

- **Server Components by default** — Next.js 15+ App Router. Los datos se fetchean directamente en server components vía Prisma.
- **Server Actions** para mutaciones — formularios, score entry. No hace falta un API REST para cada operación.
- **API Routes** solo para:
  - Auth.js handlers (`/api/auth/[...nextauth]`)
  - MercadoPago webhook (`/api/mercadopago/webhook`)
  - Public leaderboard JSON (`/api/competitions/[id]/leaderboard`)
  - SSE events stream (`/api/competitions/[id]/events`)
- **SWR** para client-side fetching donde se necesita interactividad (leaderboard polling).
- **SSE (Server-Sent Events)** para actualizaciones en tiempo real del leaderboard sin la complejidad de Socket.IO o WebSockets.
- **No hay backend separado** — toda la lógica de negocio vive en Next.js.

### 5.4 Modelo de Datos (Prisma Schema)

**Entidades principales:**

```
User (Auth.js)
  └── OrganizerProfile (1:1)
          └── Competition[] (1:N)
                  ├── Category[] (1:N)
                  ├── WOD[] (1:N)
                  ├── Registration[] (1:N)
                  │       └── Athlete (N:1)
                  └── Score[] (1:N)
                          └── Athlete (N:1)
```

**Tablas detalladas:**

| Tabla | Propósito |
|-------|-----------|
| `User` | Cuentas de organizadores (OAuth + credenciales) |
| `OrganizerProfile` | Perfil extendido: teléfono, box, bio, redes |
| `Competition` | Eventos: nombre, slug, fechas, fee, estado |
| `Category` | Divisiones: RX/Scaled/Masters, género, edad, cupo |
| `WOD` | Workouts: nombre, descripción, scoring type, time cap |
| `Athlete` | Datos del atleta: nombre, email, género, box, edad |
| `Registration` | Inscripción vinculada: competencia + categoría + atleta + estado de pago |
| `Score` | Score por WOD: valor numérico, score crudo, notas, juez |

**Índices críticos para performance:**
- `Athlete(email)` — deduplicación.
- `Registration(competitionId, categoryId)` — filtrado rápido.
- `Score(competitionId, categoryId, wodId)` — queries de leaderboard.
- `Competition(slug)` — lookups públicos.
- `Category(competitionId, name)` — unicidad.

### 5.5 API Endpoints

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | Público | Auth.js handler |
| GET | `/api/competitions/slug/[slug]` | Público | Detalle de competencia por slug |
| POST | `/api/competitions/register` | Público | Inscripción de atleta + creación de pago |
| GET | `/api/competitions/[id]/categories` | Público | Lista de categorías |
| GET | `/api/competitions/[id]/wods` | Público | Lista de WODs |
| GET | `/api/competitions/[id]/registrations` | Público | Lista de inscripciones |
| GET | `/api/competitions/[id]/leaderboard` | Público | Leaderboard JSON por categoría |
| GET | `/api/competitions/[id]/events` | Público | SSE stream de eventos en tiempo real |
| POST | `/api/mercadopago/webhook` | Público | Recepción de notificaciones de pago |

### 5.6 Server Actions (mutaciones seguras)

- `registerUser(data)` — Registro con hash de password.
- `createCompetition(data)` — Creación con slug único auto-generado.
- `updateCompetition(id, data)` — Edición completa.
- `deleteCompetition(id)` — Eliminación en cascada.
- `createCategory(data)` / `deleteCategory(id)`
- `createWOD(data)` / `deleteWOD(id)`
- `submitScore(data)` — Upsert de score + broadcast SSE.
- `createManualRegistration(data)` — Inscripción manual por el organizador.

---

## 6. Características Técnicas Diferenciadoras

### 6.1 Leaderboard en Tiempo Real (SSE)

A diferencia de la mayoría de las plataformas de competencias que usan polling manual o refresco de página, WODNation implementa **Server-Sent Events** para empujar actualizaciones al leaderboard instantáneamente cuando un juez ingresa un score.

- Latencia: < 1 segundo desde que se guarda un score hasta que aparece en el leaderboard.
- Fallback automático: si SSE falla, SWR hace polling cada 10 segundos.
- Escalable: en producción multi-instancia, reemplazable por Redis Pub/Sub sin cambiar la API del frontend.

### 6.2 Motor de Ranking Inteligente

El sistema entiende los distintos tipos de scoring del CrossFit:

| Tipo de WOD | Input del juez | Interpretación | Ranking |
|-------------|----------------|----------------|---------|
| AMRAP | "150" | 150 reps | Descendente |
| FOR TIME | "10:23" | 623 segundos | Ascendente |
| EMOM | "12" | 12 rounds | Descendente |
| MAX WEIGHT | "85" | 85 kg | Descendente |
| POINTS | "45" | 45 puntos | Descendente |

Maneja empates automáticamente y calcula el overall ranking en tiempo real.

### 6.3 PWA (Progressive Web App)

Gracias a `@ducanh2912/next-pwa`, la aplicación puede:
- Instalarse en el home screen de iOS/Android.
- Funcionar offline para ciertas vistas (leaderboard cacheado).
- Sentirse como una app nativa sin el costo de desarrollo de una.

### 6.4 Exportación Profesional de Resultados

No solo muestra el leaderboard — permite:
- Exportar CSV para análisis en Excel.
- Exportar PDF con branding oscuro y profesional para compartir resultados oficiales.
- Modo de impresión optimizado (print CSS).

### 6.5 Internacionalización (i18n) preparada

Estructura de diccionarios para múltiples idiomas:
- Español (es) — completo
- Inglés (en) — preparado

Extensible a otros idiomas sin modificar componentes.

---

## 7. Seguridad

| Aspecto | Implementación |
|---------|---------------|
| Autenticación | NextAuth.js con JWT sessions |
| Passwords | bcrypt con salt rounds = 12 |
| CSRF | Protegido por Next.js App Router + Server Actions |
| SQL Injection | Imposible — Prisma ORM con queries parametrizadas |
| XSS | Mitigado — React escapa output por defecto |
| Pagos | Webhook verificado por MercadoPago; nunca se procesa tarjeta en nuestros servidores |
| HTTPS | Forzado en producción |

---

## 8. Modelo de Negocio / Monetización

### Escenario actual (MVP)
- **Gratis durante beta** — para validar product-market fit.
- La plataforma cobra una **comisión por transacción** sobre cada inscripción pagada.
- Ejemplo: Atleta paga $10.000 ARS → plataforma retiene 5-10% → organizador recibe el resto.

### Escenarios futuros (Post-MVP)

| Plan | Precio | Features |
|------|--------|----------|
| **Free** | $0/mes | Hasta 1 competencia activa, 50 atletas, branding WODNation |
| **Pro** | $29/mes | Competencias ilimitadas, 500 atletas, leaderboard sin branding, analytics básicos |
| **Box** | $79/mes | Todo ilimitado, múltiples organizadores, API access, soporte prioritario, white-label |

### Métricas de validación actuales
- Meta: 10+ competencias creadas en los primeros 30 días.
- Meta: 3+ competencias pagas con >70% de conversión de pago.
- Meta: NPS > 30 post-evento.

---

## 9. Roadmap de Producto

### Fase 1 — MVP Actual (Semanas 1-6) ✅
- [x] Landing page
- [x] Auth (Google + Email)
- [x] CRUD de competencias
- [x] Categorías y WODs
- [x] Inscripción pública con MercadoPago
- [x] Webhook de pagos
- [x] Entrada de scores
- [x] Leaderboard en vivo con SSE
- [x] Export CSV/PDF

### Fase 2 — Escalabilidad (Mes 2-3)
- [ ] White-label / custom domains
- [ ] Team management (equipos de 2-4)
- [ ] Múltiples jueces con cuentas individuales
- [ ] Heat / wave scheduling
- [ ] Push notifications
- [ ] Multi-moneda (CLP, MXN, USD)

### Fase 3 — Diferenciación (Mes 4-6)
- [ ] AI/OCR para lectura de scores desde foto de pizarra
- [ ] Social feed / perfil público de atletas
- [ ] Ranking ELO histórico por atleta
- [ ] Integración con livestream
- [ ] Mobile app nativa (iOS/Android)

### Fase 4 — Plataforma (Mes 7-12)
- [ ] Marketplace de competencias (atletas descubren eventos)
- [ ] Affiliate verification (CrossFit ID)
- [ ] Patrocinadores y publicidad en leaderboard
- [ ] API pública para integraciones

---

## 10. Ventajas Competitivas

1. **Construido específicamente para CrossFit** — No es un "event management genérico". Entiende WODs, AMRAP, FOR_TIME, RX vs Scaled.

2. **Leaderboard en tiempo real** — La mayoría de las soluciones actuales requieren refrescar la página. WODNation empuja actualizaciones instantáneas.

3. **Pagos integrados** — MercadoPago es el estándar en LATAM. No hay competidor local que combine inscripción + pago + leaderboard.

4. **Sin fricción para atletas** — No requieren crear cuenta. Solo llenan el formulario y pagan.

5. **Tiempo de setup ridículamente bajo** — Una competencia lista en < 10 minutos vs. horas/días con spreadsheets.

6. **Stack moderno y mantenible** — Next.js 16, React 19, TypeScript. Fácil de escalar y contratar developers.

---

## 11. Inversión y Escalabilidad

### Infraestructura actual
- **Railway** — PostgreSQL + Next.js en un solo proyecto.
- **Costo estimado:** $5-20/mes en escala MVP.
- **Escalación horizontal:** Next.js es stateless; SSE puede migrar a Redis Pub/Sub.

### Performance
- Leaderboard calculado on-read (no materializado) — para < 500 atletas y < 10 WODs, es instantáneo.
- Índices de DB optimizados para las queries más frecuentes.
- SWR cachea datos en el cliente reduciendo llamadas al servidor.

### Equipo necesario para escalar
- 1x Full-stack developer (Next.js/TypeScript) — mantenimiento + features
- 1x Growth/CM — outreach a boxes, contenido, soporte
- 1x Designer (part-time) — mejoras UI/UX, white-label

---

## 12. Contacto y Próximos Pasos

### Demo en vivo
1. Ir a la landing page.
2. Crear una cuenta con Google.
3. Crear una competencia de prueba.
4. Compartir el link público.
5. Inscribir un atleta de prueba.
6. Ingresar scores y ver el leaderboard actualizarse.

### Para inversores / compradores
- **Codebase:** TypeScript full-stack, 87 archivos, arquitectura limpia.
- **Database:** PostgreSQL con Prisma — fácil de migrar, auditar, escalar.
- **Pagos:** MercadoPago ya integrado y funcionando.
- **Real-time:** SSE implementado y probado.
- **PWA:** Listo para instalar en móviles.
- **i18n:** Preparado para expansión internacional.

### Repositorio
- Estructura modular: `app/`, `components/`, `lib/`, `prisma/`.
- Seed script para datos de prueba.
- `.env.example` con todas las variables documentadas.

---

*Documento preparado para presentaciones de venta, due diligence técnico, y onboarding de nuevos desarrolladores.*

**WODNation — El futuro de las competencias de fitness funcional.**
