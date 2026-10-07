import React, { useState, useEffect } from 'react';
import { Icons } from '../ui/AspirantIcons';

export default function EncryptedBackupModal({
  isOpen,
  mode = 'export', // 'export' | 'import'
  onClose,
  onExportConfirm,
  onImportConfirm,
  selectedFile = null
}) {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassphrase('');
      setConfirmPassphrase('');
      setShowPassword(false);
      setErrorMsg('');
      setIsProcessing(false);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!passphrase || passphrase.trim().length === 0) {
      setErrorMsg('Please enter an encryption passphrase.');
      return;
    }

    if (mode === 'export') {
      if (passphrase.length < 6) {
        setErrorMsg('Passphrase must be at least 6 characters for adequate security.');
        return;
      }
      if (passphrase !== confirmPassphrase) {
        setErrorMsg('Passphrases do not match. Please re-enter.');
        return;
      }

      try {
        setIsProcessing(true);
        await onExportConfirm(passphrase);
        onClose();
      } catch (err) {
        setErrorMsg(err?.message || 'Encryption failed. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      if (!selectedFile) {
        setErrorMsg('No backup file selected.');
        return;
      }
      try {
        setIsProcessing(true);
        await onImportConfirm(selectedFile, passphrase);
        onClose();
      } catch (err) {
        setErrorMsg(err?.message || 'Decryption failed. Please verify your passphrase.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)'
      }} 
      role="dialog" 
      aria-modal="true"
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(145deg, #0b1120, #0f172a)',
          color: '#f1f5f9',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(56, 189, 248, 0.12)',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle Top Accent Beam */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: mode === 'export' 
              ? 'linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)' 
              : 'linear-gradient(90deg, #34d399, #10b981, #059669)'
          }}
        />

        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: mode === 'export' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                color: mode === 'export' ? '#38bdf8' : '#34d399',
                border: mode === 'export' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(52, 211, 153, 0.3)'
              }}
            >
              <Icons.Shield size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em' }}>
                {mode === 'export' ? 'Export Encrypted Backup' : 'Restore Encrypted Backup'}
              </h2>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                {mode === 'export' ? 'AES-GCM 256-bit • Zero-Knowledge' : 'Client-Side Decryption & Verification'}
              </span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            title="Close"
          >
            <Icons.X size={16} />
          </button>
        </div>

        {/* Privacy & Security Callout */}
        <div style={{
          marginBottom: '18px',
          padding: '12px',
          borderRadius: '10px',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          fontSize: '11px',
          color: '#bae6fd',
          lineHeight: '1.5',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <div style={{ color: '#38bdf8', marginTop: '1px', flexShrink: 0 }}>
            <Icons.Lock size={14} />
          </div>
          <div>
            <strong>Zero-Knowledge Standard:</strong> Encrypted client-side via PBKDF2 (100,000 rounds) & AES-GCM 256. 
            Your passphrase never touches a server. If lost, encrypted files cannot be recovered.
          </div>
        </div>

        {mode === 'import' && selectedFile && (
          <div style={{
            marginBottom: '16px',
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11.5px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', color: '#e2e8f0' }}>
              <Icons.FileText size={14} color="#34d399" />
              <span style={{ fontFamily: 'monospace', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {selectedFile.name}
              </span>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '10.5px', flexShrink: 0, marginLeft: '8px' }}>
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#cbd5e1', marginBottom: '6px' }}>
              {mode === 'export' ? 'Create Encryption Passphrase' : 'Enter Backup Passphrase'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder={mode === 'export' ? 'Enter strong passphrase (min 6 chars)...' : 'Passphrase used during export...'}
                style={{
                  width: '100%',
                  padding: '10px 38px 10px 12px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                autoFocus
                disabled={isProcessing}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title={showPassword ? 'Hide passphrase' : 'Show passphrase'}
              >
                {showPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'export' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#cbd5e1', marginBottom: '6px' }}>
                Confirm Passphrase
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder="Re-enter passphrase..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                disabled={isProcessing}
              />
            </div>
          )}

          {errorMsg && (
            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Icons.AlertTriangle size={14} color="#f87171" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer'
              }}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#ffffff',
                border: 'none',
                cursor: isProcessing ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: mode === 'export'
                  ? 'linear-gradient(135deg, #0284c7, #2563eb)'
                  : 'linear-gradient(135deg, #059669, #10b981)',
                boxShadow: mode === 'export'
                  ? '0 4px 14px rgba(2, 132, 199, 0.4)'
                  : '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              {isProcessing ? (
                <span>{mode === 'export' ? 'Encrypting...' : 'Decrypting...'}</span>
              ) : (
                <>
                  {mode === 'export' ? <Icons.Download size={14} /> : <Icons.Unlock size={14} />}
                  <span>{mode === 'export' ? 'Download .enc Backup' : 'Decrypt & Restore'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
