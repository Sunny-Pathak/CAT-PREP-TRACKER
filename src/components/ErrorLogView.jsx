import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icons } from './AspirantIcons';
import SmoothCaretInput from './animations/SmoothCaretInput';
import AnimatedInputBar from './AnimatedInputBar';
import StackedChips from './StackedChips';
import MistakeLogModal from './MistakeLogModal';
import { tactileClick } from '../utils/gsapAnimations';
import {
  getStoredMistakes,
  saveStoredMistakes,
  exportMistakesToMarkdown,
  downloadFile
} from '../utils/mistakeVaultStorage';
import {
  isFileSystemSupported,
  pickVaultDirectory,
  getSavedVaultDirectoryHandle,
  verifyPermission,
  writeVaultFile,
  readVaultFile
} from '../utils/localVault';

export default function ErrorLogView({ state, onDayClick, onOpenTimer }) {
  // Mistake Cards State
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Quick Scratchpad & Local File Vault State
  const [isSupported, setIsSupported] = useState(true);
  const [vaultDirHandle, setVaultDirHandle] = useState(null);
  const [vaultDirName, setVaultDirName] = useState('');
  const [scratchpadText, setScratchpadText] = useState('');
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isTypingScratchpad, setIsTypingScratchpad] = useState(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const scratchpadStats = useMemo(() => {
    const text = scratchpadText.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = scratchpadText.length;
    return { words, chars };
  }, [scratchpadText]);

  const handleScratchpadChange = (e) => {
    setScratchpadText(e.target.value);
    setIsTypingScratchpad(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingScratchpad(false);
    }, 700);
  };

  // Load cards from storage on mount
  useEffect(() => {
    const loaded = getStoredMistakes();
    setCards(loaded);
  }, []);

  // Restore scratchpad text from local storage
  useEffect(() => {
    setIsSupported(isFileSystemSupported());
    try {
      const cached = localStorage.getItem('catalyze_local_vault_notes');
      if (cached) setScratchpadText(cached);
    } catch (e) {}

    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }

    async function initVault() {
      try {
        const savedHandle = await getSavedVaultDirectoryHandle();
        if (savedHandle) {
          setVaultDirHandle(savedHandle);
          setVaultDirName(savedHandle.name);
          const hasPerm = await verifyPermission(savedHandle, false);
          if (hasPerm) {
            const content = await readVaultFile(savedHandle, 'cat_notes.txt');
            if (content !== null) {
              setScratchpadText(content);
              setStatusMessage(`Auto-loaded notes from ${savedHandle.name}/cat_notes.txt`);
            }
          }
        }
      } catch (err) {
        console.warn('Vault auto-reconnect error:', err);
      }
    }
    initVault();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('catalyze_local_vault_notes', scratchpadText);
    } catch (e) {}
  }, [scratchpadText]);

  // Handlers for Cards
  const handleSaveCard = (card) => {
    setCards(prev => {
      const index = prev.findIndex(c => c.id === card.id);
      let updated;
      if (index >= 0) {
        updated = [...prev];
        updated[index] = card;
      } else {
        updated = [card, ...prev];
      }
      saveStoredMistakes(updated);
      return updated;
    });
  };

  const handleDeleteCard = (id) => {
    setCards(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveStoredMistakes(updated);
      return updated;
    });
  };

  const handleExportMarkdown = () => {
    const md = exportMistakesToMarkdown(cards);
    downloadFile('cat_notes.md', md);
  };

  const handleSaveScratchpadToPC = async () => {
    if (vaultDirHandle) {
      try {
        setSaveStatus('saving');
        const hasPerm = await verifyPermission(vaultDirHandle, true);
        if (hasPerm) {
          await writeVaultFile(vaultDirHandle, 'cat_notes.txt', scratchpadText);
          setSaveStatus('saved');
          setStatusMessage(`Saved to ${vaultDirName}/cat_notes.txt at ${new Date().toLocaleTimeString()}`);
          return;
        }
      } catch (err) {
        console.warn('Direct folder write failed, falling back:', err);
      }
    }

    try {
      setSaveStatus('saving');
      downloadFile('cat_notes.txt', scratchpadText, 'text/plain;charset=utf-8');
      setSaveStatus('saved');
      setStatusMessage(`Downloaded cat_notes.txt at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      setSaveStatus('error');
      setStatusMessage(`Save failed: ${err.message}`);
    }
  };

  const handleOpenFileFromPC = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setScratchpadText(content);
        setShowScratchpad(true);
        setStatusMessage(`Loaded ${file.name} from your PC`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      const text = `${c.title || ''} ${c.content || ''} ${c.takeawayRule || ''} ${c.source || ''}`.toLowerCase();
      const matchesSearch = !searchTerm || text.includes(searchTerm.toLowerCase());
      const matchesSubject = selectedSubject === 'All' || c.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [cards, searchTerm, selectedSubject]);

  return (
    <div>
      {/* Hidden File Input for PC Loading */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".txt,.md"
        style={{ display: 'none' }}
        onChange={handleOpenFileFromPC}
      />

      {/* 1. Theme-Consistent Minimal Hero Section */}
      <div className="minimal-hero-section">
        <div className="minimal-hero-tag">ERROR LOG &amp; NOTES</div>
        <div className="minimal-hero-main">
          <div className="minimal-hero-titles">
            <h1 className="minimal-headline">
              ERROR LOG <span className="minimal-headline-italic">&amp; Insights</span>
            </h1>
            <p className="minimal-subtext">
              Record tricky question traps, mental models, and key formulas across sessions. Backed up locally to your PC.
            </p>
          </div>

          <div className="minimal-hero-actions">
            {/* Primary Action: Direct New Note Card Creation */}
            <button
              type="button"
              className="minimal-btn-primary"
              onClick={(e) => {
                tactileClick(e);
                setEditingCard(null);
                setIsModalOpen(true);
              }}
              title="Create a new study note or error reflection card"
            >
              <Icons.Plus size={14} />
              <span>New Note Card</span>
            </button>

            {/* Quick Scratchpad Disk Vault Toggle */}
            <button
              type="button"
              className={`minimal-btn-secondary ${showScratchpad ? 'active' : ''}`}
              onClick={(e) => {
                tactileClick(e);
                setShowScratchpad(prev => !prev);
              }}
              title="Toggle disk scratchpad"
            >
              <Icons.FileText size={14} />
              <span>{showScratchpad ? 'Hide Scratchpad' : 'Scratchpad'}</span>
            </button>

            {/* Export Markdown */}
            <button
              type="button"
              className="minimal-btn-secondary"
              onClick={(e) => {
                tactileClick(e);
                handleExportMarkdown();
              }}
              title="Download notes as printable Markdown"
            >
              <Icons.Download size={14} />
              <span>Export (.md)</span>
            </button>

            {/* Secondary navigation to Zen Timer */}
            {onOpenTimer && (
              <button
                type="button"
                className="minimal-btn-secondary"
                onClick={(e) => {
                  tactileClick(e);
                  onOpenTimer();
                }}
                title="Enter Zen Study Sanctuary directly"
                style={{ opacity: 0.8 }}
              >
                <Icons.Clock size={13} />
                <span>Zen Study Space</span>
                <span className="btn-arrow" style={{ fontSize: '11px' }}>↗</span>
              </button>
            )}
          </div>
        </div>

        {/* 3-Metric Horizon Strip */}
        <div className="minimal-horizon-strip">
          <div className="horizon-stat-item">
            <span className="horizon-stat-lbl">TOTAL SAVED NOTES</span>
            <span className="horizon-stat-val">
              {cards.length} <span className="horizon-unit">{cards.length === 1 ? 'Card' : 'Cards'}</span>
            </span>
          </div>
          <div className="horizon-divider"></div>
          <div className="horizon-stat-item">
            <span className="horizon-stat-lbl">ACTIVE FOCUS SECTION</span>
            <span className="horizon-stat-val">
              {selectedSubject === 'All' ? 'All Sections' : selectedSubject}
            </span>
          </div>
          <div className="horizon-divider"></div>
          <div className="horizon-stat-item">
            <span className="horizon-stat-lbl">HARD DRIVE PERSISTENCE</span>
            <span className="horizon-stat-val" style={{ color: 'var(--accent-color, #c084fc)', fontSize: '13px', fontWeight: 600 }}>
              Protected Local Storage
            </span>
          </div>
        </div>
      </div>

      {/* Reacticx Animated Input Bar Scratchpad */}
      {showScratchpad && (
        <div style={{ marginBottom: '24px' }}>
          <AnimatedInputBar
            value={scratchpadText}
            onChange={handleScratchpadChange}
            placeholders={[
              'Capture tricky question traps & error patterns...',
              'Jot formulas, mental models, or shortcuts...',
              'Paste problem text or diagnostic notes here...',
              'Auto-saved locally to your hard drive in real-time...',
              'Document revision notes for mock exam review...'
            ]}
            minHeight={110}
            maxHeight={300}
            onSaveToPC={handleSaveScratchpadToPC}
            onOpenFile={() => fileInputRef.current?.click()}
            onStartFocusSession={onOpenTimer}
            saveStatus={isTypingScratchpad ? 'saving' : 'saved'}
          />
        </div>
      )}

      {/* 2. Theme-Consistent Filter Row with Smooth Caret Input */}
      <div className="filter-row" style={{ alignItems: 'flex-end', gap: '14px', marginBottom: '20px' }}>
        <div className="filter-group" style={{ flex: '1.5', minWidth: '240px' }}>
          <label className="filter-label">Search Notes &amp; Traps</label>
          <SmoothCaretInput
            type="text"
            className="filter-input"
            placeholder="Type to search notes and formulas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Section Filter</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'Quant', 'LRDI', 'VARC', 'General'].map(s => (
              <button
                key={s}
                type="button"
                className={selectedSubject === s ? 'minimal-btn-primary' : 'minimal-btn-secondary'}
                style={{ padding: '7px 14px', fontSize: '12px', borderRadius: 'var(--radius-sm)' }}
                onClick={(e) => {
                  tactileClick(e);
                  setSelectedSubject(s);
                }}
              >
                <span>{s}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Theme-Consistent Cards Grid */}
      <div className="notes-vault-grid">
        {filteredCards.length > 0 ? (
          filteredCards.map(c => {
            const contentText = c.content || c.takeawayRule || c.whatHappened || '';

            return (
              <div key={c.id} className="notes-vault-card">
                <div>
                  {/* Card Head: Section Badge & Actions */}
                  <div className="notes-vault-card-head">
                    <span className="notes-vault-badge">
                      {c.subject || 'General'}
                    </span>

                    <div className="notes-vault-card-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCard(c);
                          setIsModalOpen(true);
                        }}
                        title="Edit note"
                      >
                        <Icons.Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDeleteCard(c.id)}
                        title="Delete note"
                      >
                        <Icons.Close size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Card Title */}
                  <h3 className="notes-vault-card-title">
                    {c.title}
                  </h3>

                  {/* Card Body */}
                  <p className="notes-vault-card-content">
                    {contentText}
                  </p>
                </div>

                {/* Card Footer: Source */}
                {c.source && (
                  <div className="notes-vault-card-footer">
                    <span className="notes-vault-card-source">
                      Source: {c.source}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div
            className="empty-state"
            style={{
              gridColumn: '1 / -1',
              padding: '54px 24px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ color: '#a855f7', marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
              <Icons.BookOpen size={32} />
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {cards.length === 0 ? 'Your Study Vault is Empty' : 'No matching notes found'}
            </h4>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.5' }}>
              {cards.length === 0
                ? 'Record tricky question traps, mental models, or key formulas to review before mocks.'
                : 'Try adjusting your search query or section filter.'}
            </p>
            {cards.length === 0 && (
              <button
                type="button"
                className="minimal-btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
                onClick={(e) => {
                  tactileClick(e);
                  setEditingCard(null);
                  setIsModalOpen(true);
                }}
              >
                <Icons.Plus size={15} />
                <span>Create Your First Note Card</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Clean Card Modal with Smooth Caret Input */}
      <MistakeLogModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        editingMistake={editingCard}
      />
    </div>
  );
}
