```
/project-root
│
├── /public                # Archivos estáticos públicos (si aplica)
│   └── index.html         # Página principal del dashboard
│
├── /src                   # Código fuente JS, CSS y assets
│   ├── /api       
│   │   ├── authService.js   # Cliente API y servicios que consumen la API
│   │   ├── apiClient.js   # Wrapper genérico para fetch y configuración base
│   │   ├── usuariosService.js
│   │   ├── serviciosService.js
│   │   └── movimientosService.js
│   │
│   ├── /components        # Componentes reutilizables UI (tabla, cards, modales)
│   │   ├── table.js
│   │   ├── pagination.js
│   │   ├── alerts.js
│   │   └── modals.js
│   │
│   ├── /utils             # Funciones utilitarias (debounce, formateos)
│   │   ├── format.js
│   │   ├── session.js 
│   │   └── helpers.js
│   │
│   ├── /views             # Controladores/JS para cada sección o página
│   │   ├── usuarios.js
│   │   ├── servicios.js
│   │   ├── login.js
│   │   └── movimientos.js
│   │
│   ├── app.js             # Archivo principal que inicializa la app, router básico si hay
│   └── config.js          # Variables globales (base URL, roles, etc.)
│
├── /styles                # CSS propio si necesitas, aparte de Bootstrap
│   └── main.css
│
├── README.md
└── package.json (opcional, si usas npm para automatización o bundling)
```