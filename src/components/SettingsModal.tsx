import React from 'react';

interface SettingsModalProps {
  onClose: () => void;
  isOpen: boolean;
  dealerHitSoft17: boolean;
  onToggleDealerHitSoft17: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  onClose, 
  isOpen, 
  dealerHitSoft17, 
  onToggleDealerHitSoft17 
}) => {

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#2d2d2d',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
        padding: '20px',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #444',
          paddingBottom: '10px'
        }}>
          <h2 style={{ 
            color: 'gold', 
            margin: 0,
            fontSize: '1.5rem' 
          }}>Game Settings</h2>
          <button 
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ color: 'white' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px'
          }}>
            <div>
              <div style={{ marginBottom: '5px' }}>Dealer hits on soft 17</div>
              <div style={{ 
                fontSize: '0.8rem', 
                opacity: 0.7,
                maxWidth: '300px' 
              }}>
                When enabled, the dealer will hit on soft 17 (A-6 or equivalent).
                When disabled, the dealer will stand on all 17s.
              </div>
            </div>
            <label style={{ 
              position: 'relative',
              display: 'inline-block',
              width: '44px',
              height: '24px'
            }}>
              <input 
                type="checkbox" 
                checked={dealerHitSoft17}
                onChange={onToggleDealerHitSoft17}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: dealerHitSoft17 ? '#d4af37' : '#ccc',
                transition: '0.4s',
                borderRadius: '34px'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '18px',
                  width: '18px',
                  left: dealerHitSoft17 ? '20px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%'
                }}></span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;