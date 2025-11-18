import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { serviciosAPI, reservasAPI } from '../services/api';
import '../styles/ReservaModal.css';

function ReservaModal({ oferente, isOpen, onClose, onSuccess }) {
  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(true);
  const [formData, setFormData] = useState({
    id_servicio: '',
    fecha: '',
    hora: '',
    numero_personas: 2,
    notas: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  useEffect(() => {
    if (isOpen && oferente?.id_oferente) {
      fetchServicios();
    }
  }, [isOpen, oferente]);

  const fetchServicios = async () => {
    try {
      setLoadingServicios(true);
      const response = await serviciosAPI.getByOferenteId(oferente.id_oferente);
      
      // Filtrar solo servicios activos
      const serviciosActivos = (response.servicios || []).filter(s => s.estatus === 1);
      setServicios(serviciosActivos);
      
      // Auto-seleccionar el primer servicio si solo hay uno
      if (serviciosActivos.length === 1) {
        setFormData(prev => ({ ...prev, id_servicio: serviciosActivos[0].id_servicio }));
      }
    } catch (err) {
      console.error('Error fetching servicios:', err);
      setError('Error al cargar servicios disponibles');
    } finally {
      setLoadingServicios(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.id_servicio) {
      errors.id_servicio = 'Selecciona un servicio';
    }
    
    if (!formData.fecha) {
      errors.fecha = 'Selecciona una fecha';
    } else {
      // Verificar que la fecha sea futura
      const fechaSeleccionada = new Date(formData.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaSeleccionada < hoy) {
        errors.fecha = 'La fecha debe ser futura';
      }
    }
    
    if (!formData.hora) {
      errors.hora = 'Selecciona una hora';
    }
    
    if (!formData.numero_personas || formData.numero_personas < 1) {
      errors.numero_personas = 'Mínimo 1 persona';
    }
    
    // Verificar capacidad del servicio seleccionado
    if (formData.id_servicio) {
      const servicioSeleccionado = servicios.find(s => s.id_servicio == formData.id_servicio);
      if (servicioSeleccionado && formData.numero_personas > servicioSeleccionado.capacidad) {
        errors.numero_personas = `Máximo ${servicioSeleccionado.capacidad} personas`;
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Debes iniciar sesión para hacer una reserva');
      return;
    }
    
    if (!validate()) {
      setError('Por favor corrige los errores en el formulario');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const reservaData = {
        id_usuario: currentUser.id_usuario,
        id_servicio: parseInt(formData.id_servicio),
        fecha: formData.fecha,
        hora: formData.hora,
        numero_personas: parseInt(formData.numero_personas),
        notas: formData.notas.trim(),
      };
      
      await reservasAPI.create(reservaData);
      
      // Reset form
      setFormData({
        id_servicio: '',
        fecha: '',
        hora: '',
        numero_personas: 2,
        notas: '',
      });
      
      onSuccess?.();
      onClose();
      
      alert('¡Reserva creada exitosamente!');
      
    } catch (err) {
      console.error('Error creating reserva:', err);
      setError(err.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>🍽️ Hacer Reservación</h2>
            <p className="modal-subtitle">{oferente.nombre_negocio}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="modal-body">
          
          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          {loadingServicios ? (
            <div className="loading-state">Cargando servicios disponibles...</div>
          ) : servicios.length === 0 ? (
            <div className="empty-state">
              <p>No hay servicios disponibles en este momento.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="reserva-form">
              
              {/* Servicio */}
              <div className="form-group">
                <label htmlFor="id_servicio">
                  Servicio <span className="required">*</span>
                </label>
                <select
                  id="id_servicio"
                  name="id_servicio"
                  value={formData.id_servicio}
                  onChange={handleChange}
                  className={fieldErrors.id_servicio ? 'error' : ''}
                  required
                >
                  <option value="">Selecciona un servicio</option>
                  {servicios.map(servicio => (
                    <option key={servicio.id_servicio} value={servicio.id_servicio}>
                      {servicio.nombre} - {servicio.rango_precio} (hasta {servicio.capacidad} personas)
                    </option>
                  ))}
                </select>
                {fieldErrors.id_servicio && (
                  <span className="field-error">{fieldErrors.id_servicio}</span>
                )}
              </div>
              
              {/* Descripción del servicio seleccionado */}
              {formData.id_servicio && (
                <div className="servicio-info">
                  <p>
                    {servicios.find(s => s.id_servicio == formData.id_servicio)?.descripcion}
                  </p>
                </div>
              )}
              
              {/* Fecha y Hora */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fecha">
                    Fecha <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="fecha"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    min={getMinDate()}
                    className={fieldErrors.fecha ? 'error' : ''}
                    required
                  />
                  {fieldErrors.fecha && (
                    <span className="field-error">{fieldErrors.fecha}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="hora">
                    Hora <span className="required">*</span>
                  </label>
                  <input
                    type="time"
                    id="hora"
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    className={fieldErrors.hora ? 'error' : ''}
                    required
                  />
                  {fieldErrors.hora && (
                    <span className="field-error">{fieldErrors.hora}</span>
                  )}
                </div>
              </div>
              
              {/* Número de Personas */}
              <div className="form-group">
                <label htmlFor="numero_personas">
                  Número de Personas <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="numero_personas"
                  name="numero_personas"
                  value={formData.numero_personas}
                  onChange={handleChange}
                  min="1"
                  max={formData.id_servicio 
                    ? servicios.find(s => s.id_servicio == formData.id_servicio)?.capacidad 
                    : 100}
                  className={fieldErrors.numero_personas ? 'error' : ''}
                  required
                />
                {fieldErrors.numero_personas && (
                  <span className="field-error">{fieldErrors.numero_personas}</span>
                )}
              </div>
              
              {/* Notas */}
              <div className="form-group">
                <label htmlFor="notas">Notas Adicionales (Opcional)</label>
                <textarea
                  id="notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  rows="3"
                  maxLength="500"
                  placeholder="Alergias, preferencias, ocasión especial..."
                />
              </div>
              
              {/* Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || servicios.length === 0}
                >
                  {loading ? 'Reservando...' : '✓ Confirmar Reserva'}
                </button>
              </div>
              
            </form>
          )}
          
        </div>
      </div>
    </div>
  );
}

export default ReservaModal;