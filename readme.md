# JS Studios — E-Commerce de Gorras Premium

Proyecto final de la materia Programación Web (71.38) — ITBA 2026.
Tienda e-commerce full-stack con catálogo, carrito, autenticación, órdenes persistentes y panel de administración.

##  Deploy

[pw-e-commerce-bapy.vercel.app](https://pw-e-commerce-bapy.vercel.app)

##  Stack tecnológico

| Componente | Tecnología |
|---|---|
| Frontend | Next.js (App Router) + React |
| Estilos | CSS propio (sin Tailwind) |
| Lenguaje | JavaScript puro (sin TypeScript) |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| CI/CD | GitHub Actions + Vercel |
| Pagos | Mercado Pago sandbox |

##  Funcionalidades

- Catálogo con búsqueda por nombre y filtros por categoría
- Carrito de compras persistente
- Registro, login y logout con Supabase Auth
- Checkout que crea órdenes reales en Supabase
- Vista de órdenes del usuario en /mis-ordenes
- Panel de administración en /admin con CRUD completo de productos y gestión de órdenes
- Integración con Mercado Pago sandbox

##  Base de datos

4 tablas en Supabase con RLS activado:
- `products` — catálogo de gorras
- `profiles` — datos de usuario
- `orders` — órdenes de compra
- `order_items` — items de cada orden

##  Correr localmente

```bash
npm install
npm run dev
```

Crear `.env.local` con:
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_key

##  Uso de IA

Este proyecto fue desarrollado con asistencia de Claude (Anthropic) como herramienta de generación de prompts y código. Los prompts utilizados fueron documentados a lo largo del desarrollo como parte del requisito de la materia.