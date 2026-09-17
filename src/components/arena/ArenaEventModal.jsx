import React, { useState } from 'react';
import { Icons } from '../AspirantIcons';
import { NodeEventIcon, AnimatedAetherIcon, AnimatedShieldHexIcon } from '../AnimatedCombatIcons';
import { AnimatedSparkleIcon } from '../AnimatedUiIcons';
import { ARENA_EVENTS } from '../../data/arenaGauntletData';
import { applyEventChoice, getAetherBalance } from '../../utils/arenaStorage';
import { playSoftClick, playSoftZenChime } from '../../utils/audioUtils';

export default function ArenaEventModal({ eventId = 'shrine_midnight', nodeId = null, onClose, onResolved }) {
  const [outcome, setOutcome] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const eventDef = ARENA_EVENTS[eventId] || ARENA_EVENTS['shrine_midnight'];
  const userAether = getAetherBalance();

  const handleChoice = (choice) => {
    playSoftClick();
    setErrorMessage('');

    if (choice.costAether && userAether < choice.costAether) {
      setErrorMessage(`Insufficient Aether: You need ${choice.costAether} Aether (Current: ${userAether})`);
      return;
    }

    const res = applyEventChoice(choice, nodeId);
    if (res.success) {
      playSoftZenChime();
      setOutcome(res.resultSummary);
    } else {
      setErrorMessage(res.reason || 'Decision could not be executed.');
    }
  };

  const handleFinishEvent = () => {
    playSoftClick();
    if (onResolved) onResolved();
    if (onClose) onClose();
  };

  return (
    <div className="battle-modal-overlay animate-fade-in" role="dialog" aria-modal="true">
      <div className="battle-dossier-modal event-modal cyber-card-base animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="dossier-modal-head">
          <div className="dossier-player-block">
            <div className="event-icon-badge">
              <NodeEventIcon size={32} />
            </div>
            <div>
              <span className="font-mono event-tag">UNKNOWN ENCOUNTER</span>
              <h3 className="font-display">{eventDef.title}</h3>
            </div>
          </div>
        </div>

        <div className="dossier-modal-content">
          {outcome ? (
            <div className="event-outcome-pane animate-scale-up">
              <div className="outcome-icon-pod">
                <AnimatedSparkleIcon size={36} color="#38bdf8" />
              </div>
              <span className="font-mono outcome-tag">CONSEQUENCE RECORDED</span>
              <h4 className="font-display outcome-title">Decision Executed</h4>
              <p className="font-mono outcome-desc">{outcome}</p>
              <div className="outcome-action-wrap">
                <button
                  type="button"
                  className="event-choice-btn cyber-card-base font-mono outcome-continue-btn"
                  onClick={handleFinishEvent}
                >
                  <span>CONTINUE EXPEDITION</span>
                  <Icons.ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="event-lore-text">{eventDef.lore}</p>

              {errorMessage && (
                <div className="event-error-banner font-mono">
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="event-choices-list">
                {eventDef.choices.map((choice, idx) => {
                  const cannotAfford = choice.costAether && userAether < choice.costAether;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`event-choice-btn cyber-card-base font-mono ${cannotAfford ? 'insufficient-cost' : ''}`}
                      onClick={() => handleChoice(choice)}
                      disabled={cannotAfford}
                    >
                      <div className="choice-indicator">{idx + 1}</div>
                      <div className="choice-body">
                        <span className="choice-text">{choice.text}</span>
                        {choice.costAether && (
                          <span className={`choice-cost ${cannotAfford ? 'cost-locked' : ''}`}>
                            <AnimatedAetherIcon size={14} />
                            <span>-{choice.costAether} Aether</span>
                            {cannotAfford && <span className="cost-needed-tag">(Need more Aether)</span>}
                          </span>
                        )}
                      </div>
                      <Icons.ChevronRight size={16} />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
