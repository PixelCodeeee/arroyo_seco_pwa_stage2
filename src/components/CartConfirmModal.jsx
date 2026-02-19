import React from 'react';
import { X } from 'lucide-react';
import '../styles/ReservaModal.css'; // Reuse modal styles

function CartConfirmModal({ isOpen, onClose, onConfirm, currentOferente, newOferente }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        
        <div className="modal-header">
          <div>
            <h2>🛒 Cambiar de Oferente</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <span>⚠️</span>
            <span>Tu carrito contiene productos de otro oferente</span>
          </div>

          <p style={{ color: '#ccc', marginBottom: '16px', lineHeight: '1.6' }}>
            Tu carrito actual tiene productos de <strong style={{ color: '#fff' }}>{currentOferente}</strong>.
          </p>
          
          <p style={{ color: '#ccc', marginBottom: '24px', lineHeight: '1.6' }}>
            Para agregar productos de <strong style={{ color: '#ff69b4' }}>{newOferente}</strong>, 
            necesitas vaciar tu carrito actual.
          </p>

          <p style={{ color: '#999', fontSize: '14px', marginBottom: '24px' }}>
            ¿Deseas continuar? Esto eliminará todos los productos actuales de tu carrito.
          </p>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onConfirm}
            >
              Sí, vaciar carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartConfirmModal;