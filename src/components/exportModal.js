let modalInstance = null;

export function initExportModal({ onExport, viewType = 'movimientos' }) {
    // Eliminar modal existente si hay uno
    const existingModal = document.getElementById('modalExportar');
    if (existingModal) {
        existingModal.remove();
    }

    // Configuración de campos por tipo de vista
    const viewConfig = {
        movimientos: {
            title: 'Exportar Movimientos',
            fields: [
                {
                    type: 'date',
                    id: 'filtroFechaInicio',
                    name: 'fecha_inicio',
                    label: 'Fecha Inicio',
                    required: false
                },
                {
                    type: 'date',
                    id: 'filtroFechaFin',
                    name: 'fecha_fin',
                    label: 'Fecha Fin',
                    required: false
                },
                {
                    type: 'select',
                    id: 'filtroMedioPago',
                    name: 'medio_pago',
                    label: 'Medio de Pago',
                    options: [
                        { value: '', label: 'Todos' },
                        { value: 'EFECTIVO', label: 'Efectivo' },
                        { value: 'TARJETA', label: 'Tarjeta' }
                    ]
                },
                {
                    type: 'select',
                    id: 'filtroCaja',
                    name: 'numero_caja',
                    label: 'Caja',
                    options: [{ value: '', label: 'Todas' }], // Opción vacía por defecto
                    dynamic: true
                },
                {
                    type: 'select',
                    id: 'filtroUsuario',
                    name: 'id_usuario',
                    label: 'Usuario',
                    options: [{ value: '', label: 'Todos' }], // Opción vacía por defecto
                    dynamic: true
                }
            ]
        },
        cierres: {
            title: 'Exportar Aperturas/Cierres',
            fields: [
                {
                    type: 'select',
                    id: 'filtroCaja',
                    name: 'numero_caja',
                    label: 'Caja',
                    options: [{ value: '', label: 'Todas' }], // Opción vacía por defecto
                    dynamic: true
                },
                {
                    type: 'select',
                    id: 'filtroUsuarioApertura',
                    name: 'id_usuario_apertura',
                    label: 'Usuario Apertura',
                    options: [{ value: '', label: 'Todos' }], // Opción vacía por defecto
                    dynamic: true
                },
                {
                    type: 'select',
                    id: 'filtroUsuarioCierre',
                    name: 'id_usuario_cierre',
                    label: 'Usuario Cierre',
                    options: [{ value: '', label: 'Todos' }], // Opción vacía por defecto
                    dynamic: true
                },
                {
                    type: 'select',
                    id: 'filtroEstado',
                    name: 'estado',
                    label: 'Estado',
                    options: [
                        { value: '', label: 'Todos' },
                        { value: 'abierta', label: 'Abierta' },
                        { value: 'cerrada', label: 'Cerrada' }
                    ]
                }
            ]
        }
    };

    const config = viewConfig[viewType] || viewConfig.movimientos;

    // Generar HTML de los campos dinámicamente
    const fieldsHtml = config.fields.map(field => {
        if (field.type === 'date') {
            return `
                <div class="mb-3" data-field="${field.id}">
                    <label for="${field.id}" class="form-label">${field.label}</label>
                    <input type="date" id="${field.id}" name="${field.name}" class="form-control" ${field.required ? 'required' : ''} />
                </div>
            `;
        } else if (field.type === 'select') {
            const optionsHtml = field.options
                .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
                .join('');

            return `
                <div class="mb-3" data-field="${field.id}">
                    <label for="${field.id}" class="form-label">${field.label}</label>
                    <select id="${field.id}" name="${field.name}" class="form-select">
                        ${optionsHtml}
                    </select>
                </div>
            `;
        }
        return '';
    }).join('');

    // Crear el modal
    const modalHTML = `
    <div class="modal fade" id="modalExportar" tabindex="-1" aria-labelledby="modalExportarLabel" aria-hidden="true">
        <div class="modal-dialog">
            <form id="formExportar" class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalExportarLabel">${config.title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    ${fieldsHtml}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Exportar</button>
                </div>
            </form>
        </div>
    </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalHTML.trim();
    document.body.appendChild(wrapper.firstChild);

    // Inicializar modal de Bootstrap
    const modalElement = document.getElementById('modalExportar');
    modalInstance = new bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true
    });

    // Función para poblar selects dinámicos
    const populateDynamicSelects = async (metadata) => {
        const dynamicFields = config.fields.filter(f => f.dynamic);

        for (const field of dynamicFields) {
            const selectElement = document.getElementById(field.id);
            if (selectElement) {
                // Limpiar todas las opciones excepto la primera (que es la vacía)
                while (selectElement.options.length > 1) {
                    selectElement.remove(1);
                }

                // Determinar qué datos usar según el campo
                let options = [];
                if (field.id === 'filtroCaja' && metadata.cajas) {
                    options = metadata.cajas.map(c => ({
                        value: c.numero_caja,
                        label: `${c.nombre} (${c.numero_caja})`
                    }));
                } else if ((field.id === 'filtroUsuario' || field.id === 'filtroUsuarioApertura' || field.id === 'filtroUsuarioCierre') && metadata.usuarios) {
                    options = metadata.usuarios.map(u => ({
                        value: u.id,
                        label: u.nombre
                    }));
                }

                // Añadir nuevas opciones
                options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.label;
                    selectElement.appendChild(option);
                });

                // Seleccionar la opción vacía por defecto
                selectElement.value = '';
            }
        }

        // Resetear también los campos no dinámicos
        config.fields.forEach(field => {
            if (!field.dynamic) {
                const element = document.getElementById(field.id);
                if (element) {
                    if (field.type === 'select') {
                        element.value = '';
                    } else if (field.type === 'date') {
                        element.value = '';
                    }
                }
            }
        });
    };

    // Configurar el formulario
    document.getElementById('formExportar').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const filters = Object.fromEntries(data.entries());

        // Eliminar filtros vacíos
        const cleanFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== '')
        );

        try {
            await onExport(cleanFilters);
            modalInstance.hide();
        } catch (error) {
            console.error('Error al exportar:', error);
        }
    });

    return {
        show: async (metadata) => {
            await populateDynamicSelects(metadata);
            modalInstance.show();
        },
        hide: () => modalInstance.hide(),
        setViewType: (newViewType) => {
            if (viewConfig[newViewType]) {
                viewType = newViewType;
            }
        }
    };
}