```
.
└── FRONT-MANTENEDOR-BANOS/
    ├── public/
    │   ├── dashboard.html -------------------------- (usa app.js) dashboard principal
    │   └── index.html ------------------------------ (usa src/views/login.js) login
    ├── src/
    │   ├── api/
    │   │   ├── aperturasCierresService.js ---------- (usa apiClient) servicio de api de aperturas y cierres 
    │   │   ├── apiClient.js ------------------------ servicio de api general, valida token
    │   │   ├── authService.js ---------------------- (usa apiClient) servicio de api de autenticación 
    │   │   ├── cajasService.js --------------------- (usa apiClient) servicio de api de cajas 
    │   │   ├── helpersService.js ------------------- (usa apiClient) servicio de api de helpers 
    │   │   ├── movimientosService.js --------------- (usa apiClient) servicio de api de movimientos 
    │   │   ├── serviciosService.js ----------------- (usa apiClient) servicio de api de servicios 
    │   │   └── usuariosService.js ------------------ (usa apiClient) servicio de api de usuarios 
    │   ├── components/ ----------------------------- componentes reutilizables
    │   │   ├── alerts.js
    │   │   ├── exportModal.js
    │   │   └── charts.js
    │   ├── config/ 
    │   │   └── config.js --------------------------- configuración de la url
    │   ├── styles/ --------------------------------- estilos
    │   │   ├── dashboard.css
    │   │   └── login.css
    │   ├── utils/
    │   │   ├── export.js --------------------------- exportación de csv
    │   │   ├── helpers.js -------------------------- formatear fecha, numeros, etc.
    │   │   └── session.js -------------------------- manejo de sesión
    │   └── views/ ---------------------------------- (usa components, utils, servicios)
    │       ├── cajas.js ---------------------------- logica de la vista de cajas
    │       ├── cierres.js -------------------------- logica de la vista de aperturas y cierres de caja
    │       ├── dashboard.js ------------------------ logica de la vista de dashboard y resumen
    │       ├── login.js ---------------------------- logica de login
    │       ├── movimientos.js ---------------------- logica de la vista de movimientos
    │       ├── servicios.js ------------------------ logica de la vista de servicios
    │       └── usuarios.js ------------------------- logica de la vista de usuarios
    ├── app.js -------------------------------------- (usa utils/session y views) script principal
    ├── .gitignore
    └── readme.md
```
