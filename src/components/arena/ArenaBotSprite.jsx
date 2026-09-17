import React from 'react';

/**
 * ArenaBotSprite.jsx
 * Comprehensive Vector SVG Artwork for the 24 Japanese Folklore Yokai & Legends.
 * Stylized, high-contrast, atmospheric Japanese ink & anime aesthetic.
 * 
 * Strict Zero-Emoji Compliance.
 */
export default function ArenaBotSprite({
  botId = '',
  tier = 'minion',
  isAttacking = false,
  isHit = false,
  isStunned = false,
  size = 260
}) {
  const normId = (botId || '').toLowerCase();
  const hitFilter = isHit
    ? 'brightness(2.2) drop-shadow(0 0 20px #ef4444)'
    : 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.85))';

  // ================= 1. GASHADOKURO (餓者髑髏 - ACT 1 SUMMIT BOSS) ================= //
  if (normId.includes('gashadokuro') || normId.includes('behemoth')) {
    const bossSize = Math.max(size, 270);
    return (
      <svg
        width={bossSize}
        height={bossSize}
        viewBox="0 0 240 240"
        className={`bot-sprite gashadokuro-titan grand-boss ${isAttacking ? 'attacking' : ''} ${isHit ? 'hit' : ''} ${isStunned ? 'stunned' : ''}`}
        style={{ filter: isHit ? 'brightness(2.4) drop-shadow(0 0 30px #ef4444)' : 'drop-shadow(0 25px 40px rgba(0,0,0,0.95)) drop-shadow(0 0 25px rgba(239, 68, 68, 0.3))' }}
      >
        <defs>
          <radialGradient id="boneGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>
          <radialGradient id="eyeFire" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>
        </defs>

        {/* Ambient Dark Ghost Smoke */}
        <circle cx="120" cy="120" r="105" fill="#090d16" opacity="0.6" filter="blur(15px)" />

        {/* Massive Skeletal Ribcage Emerging from Ground */}
        <g opacity="0.85">
          <path d="M70,165 C60,175 40,195 45,225" stroke="#94a3b8" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M170,165 C180,175 200,195 195,225" stroke="#94a3b8" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M75,185 C65,195 50,210 60,235" stroke="#64748b" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M165,185 C175,195 190,210 180,235" stroke="#64748b" strokeWidth="8" strokeLinecap="round" fill="none" />
          {/* Spine Column */}
          <rect x="112" y="150" width="16" height="85" rx="5" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />
        </g>

        {/* Clutched Skeletal Hands on Flanks */}
        <g transform="translate(18, 140) rotate(-15)">
          <path d="M10,0 L25,45 M20,0 L32,48 M30,5 L38,50 M-5,15 L12,42" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
        </g>
        <g transform="translate(200, 140) rotate(15)">
          <path d="M-10,0 L-25,45 M-20,0 L-32,48 M-30,5 L-38,50 M5,15 L-12,42" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* Colossal Cranium (Skull) */}
        <path
          d="M120,25 C65,25 55,65 58,115 C62,135 75,155 92,158 C98,162 105,168 112,168 L128,168 C135,168 142,162 148,158 C165,155 178,135 182,115 C185,65 175,25 120,25 Z"
          fill="url(#boneGlow)"
          stroke="#334155"
          strokeWidth="3"
        />

        {/* Hollow Temple Depressions */}
        <ellipse cx="68" cy="95" rx="6" ry="14" fill="#1e293b" opacity="0.6" />
        <ellipse cx="172" cy="95" rx="6" ry="14" fill="#1e293b" opacity="0.6" />

        {/* Deep Skeletal Eye Sockets with Ghostfire */}
        <ellipse cx="88" cy="98" rx="17" ry="21" fill="#020617" />
        <ellipse cx="152" cy="98" rx="17" ry="21" fill="#020617" />
        <circle cx="88" cy="98" r="9" fill="url(#eyeFire)" filter="drop-shadow(0 0 8px #ef4444)" />
        <circle cx="152" cy="98" r="9" fill="url(#eyeFire)" filter="drop-shadow(0 0 8px #ef4444)" />
        <circle cx="86" cy="95" r="3" fill="#ffffff" />
        <circle cx="150" cy="95" r="3" fill="#ffffff" />

        {/* Inverted Heart Nasal Cavity */}
        <path d="M120,118 L114,136 C117,138 123,138 126,136 Z" fill="#090d16" />

        {/* Chattering Jaw Teeth */}
        <g transform="translate(0, 5)">
          <path d="M88,145 L152,145 L144,172 L96,172 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
          {/* Vertical tooth dividing lines */}
          <line x1="98" y1="145" x2="98" y2="172" stroke="#334155" strokeWidth="1.8" />
          <line x1="108" y1="145" x2="108" y2="172" stroke="#334155" strokeWidth="1.8" />
          <line x1="120" y1="145" x2="120" y2="172" stroke="#334155" strokeWidth="2.2" />
          <line x1="132" y1="145" x2="132" y2="172" stroke="#334155" strokeWidth="1.8" />
          <line x1="142" y1="145" x2="142" y2="172" stroke="#334155" strokeWidth="1.8" />
          <line x1="88" y1="158" x2="152" y2="158" stroke="#1e293b" strokeWidth="2" />
        </g>
      </svg>
    );
  }

  // ================= 2. TAMAMO-NO-MAE: NINE-TAILED FOX (九尾の狐 - ACT 2 BOSS) ================= //
  if (normId.includes('kitsune') || normId.includes('mind-flayer') || normId.includes('tamamo')) {
    const bossSize = Math.max(size, 270);
    return (
      <svg
        width={bossSize}
        height={bossSize}
        viewBox="0 0 240 240"
        className={`bot-sprite kitsune-empress grand-boss ${isAttacking ? 'attacking' : ''} ${isHit ? 'hit' : ''} ${isStunned ? 'stunned' : ''}`}
        style={{ filter: isHit ? 'brightness(2.4) drop-shadow(0 0 30px #f59e0b)' : 'drop-shadow(0 20px 35px rgba(0,0,0,0.9)) drop-shadow(0 0 30px rgba(245, 158, 11, 0.4))' }}
      >
        <defs>
          <linearGradient id="foxGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>
          <radialGradient id="foxfireBlue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>
        </defs>

        {/* Nine Sweeping Celestial Tails Fanned in Background */}
        <g className="kitsune-nine-tails">
          {[-60, -45, -30, -15, 0, 15, 30, 45, 60].map((deg, idx) => (
            <path
              key={`tail-${idx}`}
              d="M120,170 C100,140 70,80 80,40 C95,55 125,110 120,170 Z"
              fill="url(#foxGold)"
              stroke="#ea580c"
              strokeWidth="1.5"
              transform={`rotate(${deg} 120 170)`}
              opacity="0.9"
            />
          ))}
          {/* White Fur Tips on Tails */}
          {[-60, -45, -30, -15, 0, 15, 30, 45, 60].map((deg, idx) => (
            <path
              key={`tip-${idx}`}
              d="M78,40 C85,30 92,30 98,40 C90,48 85,48 78,40 Z"
              fill="#ffffff"
              transform={`rotate(${deg} 120 170)`}
            />
          ))}
        </g>

        {/* Floating Sapphire Kitsunebi Orbs */}
        <circle cx="45" cy="80" r="10" fill="url(#foxfireBlue)" filter="drop-shadow(0 0 10px #38bdf8)" />
        <circle cx="195" cy="80" r="10" fill="url(#foxfireBlue)" filter="drop-shadow(0 0 10px #38bdf8)" />
        <circle cx="120" cy="20" r="12" fill="url(#foxfireBlue)" filter="drop-shadow(0 0 12px #38bdf8)" />

        {/* Slender Fox Empress Body in Shrine Robes */}
        <path d="M95,140 L80,225 L160,225 L145,140 Z" fill="#991b1b" stroke="#fef08a" strokeWidth="2" />
        <path d="M105,140 L120,225 L135,140 Z" fill="#ffffff" />
        <rect x="90" y="165" width="60" height="15" rx="3" fill="#d97706" stroke="#fde047" strokeWidth="1.5" />

        {/* Elegant Fox Masked Head */}
        <polygon points="120,85 85,130 155,130" fill="#ffffff" stroke="#e11d48" strokeWidth="2" />
        {/* Fox Ears with Crimson Interior */}
        <polygon points="92,95 70,40 105,75" fill="#f59e0b" stroke="#ea580c" strokeWidth="2" />
        <polygon points="90,88 78,50 100,75" fill="#dc2626" />
        <polygon points="148,95 170,40 135,75" fill="#f59e0b" stroke="#ea580c" strokeWidth="2" />
        <polygon points="150,88 162,50 140,75" fill="#dc2626" />

        {/* Crimson Shrine Mask Markings & Slit Eyes */}
        <path d="M96,110 Q106,105 112,112" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M144,110 Q134,105 128,112" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="104" cy="112" rx="5" ry="2" fill="#ef4444" transform="rotate(-15 104 112)" />
        <ellipse cx="136" cy="112" rx="5" ry="2" fill="#ef4444" transform="rotate(15 136 112)" />
        <polygon points="120,126 116,122 124,122" fill="#1e293b" />
      </svg>
    );
  }

  // ================= 3. SHUTEN-DOJI (酒呑童子 - ACT 3 CLIMAX FINAL BOSS) ================= //
  if (normId.includes('shuten') || normId.includes('cat_titan') || normId.includes('apex')) {
    const bossSize = Math.max(size, 280);
    return (
      <svg
        width={bossSize}
        height={bossSize}
        viewBox="0 0 240 240"
        className={`bot-sprite shuten-warlord grand-boss ${isAttacking ? 'attacking' : ''} ${isHit ? 'hit' : ''} ${isStunned ? 'stunned' : ''}`}
        style={{ filter: isHit ? 'brightness(2.5) drop-shadow(0 0 35px #dc2626)' : 'drop-shadow(0 25px 40px rgba(0,0,0,0.95)) drop-shadow(0 0 35px rgba(220, 38, 38, 0.45))' }}
      >
        <defs>
          <linearGradient id="shutenSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>
          <linearGradient id="ironKanabo" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>

        {/* Crimson Eclipse Halo */}
        <circle cx="120" cy="110" r="105" fill="none" stroke="#dc2626" strokeWidth="4" strokeDasharray="16 8" opacity="0.65" />

        {/* Massive Spiked Iron Kanabo Leaning Across Back */}
        <g transform="translate(180, 40) rotate(22)">
          <rect x="-14" y="0" width="28" height="180" rx="6" fill="url(#ironKanabo)" stroke="#94a3b8" strokeWidth="2" />
          {/* Steel Spikes protruding from club */}
          {[-12, 12].map(x => (
            [30, 60, 90, 120, 150].map((y, i) => (
              <polygon key={`spike-${x}-${i}`} points={`${x},${y} ${x > 0 ? x + 10 : x - 10},${y + 4} ${x},${y + 8}`} fill="#f8fafc" stroke="#334155" strokeWidth="1" />
            ))
          ))}
        </g>

        {/* Broad Muscular Crimson Oni Torso */}
        <path
          d="M60,110 C45,130 50,180 65,225 L175,225 C190,180 195,130 180,110 C160,105 80,105 60,110 Z"
          fill="url(#shutenSkin)"
          stroke="#450a0a"
          strokeWidth="3"
        />

        {/* Wild Fiery White/Silver Mane */}
        <path
          d="M120,20 C60,20 40,65 35,130 C50,120 65,110 75,125 C85,75 155,75 165,125 C175,110 190,120 205,130 C200,65 180,20 120,20 Z"
          fill="#f8fafc"
          stroke="#94a3b8"
          strokeWidth="2"
        />

        {/* Terrifying Curved Golden Oni Horns */}
        <path d="M85,55 C70,25 45,15 25,25 C35,45 60,55 75,65 Z" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
        <path d="M155,55 C170,25 195,15 215,25 C205,45 180,55 165,65 Z" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />

        {/* Fierce Oni Visage */}
        <polygon points="120,50 85,85 92,125 148,125 155,85" fill="url(#shutenSkin)" stroke="#7f1d1d" strokeWidth="2" />

        {/* Piercing Glowing Amber Eyes */}
        <ellipse cx="102" cy="85" rx="8" ry="5" fill="#fde047" stroke="#dc2626" strokeWidth="2" />
        <circle cx="102" cy="85" r="3" fill="#020617" />
        <ellipse cx="138" cy="85" rx="8" ry="5" fill="#fde047" stroke="#dc2626" strokeWidth="2" />
        <circle cx="138" cy="85" r="3" fill="#020617" />

        {/* Snarling Fanged Jaw with Protruding Lower Tusks */}
        <path d="M96,105 Q120,115 144,105 Q120,108 96,105 Z" fill="#180508" stroke="#450a0a" strokeWidth="2" />
        <polygon points="104,112 108,98 112,112" fill="#ffffff" stroke="#334155" strokeWidth="1" />
        <polygon points="128,112 132,98 136,112" fill="#ffffff" stroke="#334155" strokeWidth="1" />

        {/* Cursed Crimson Sake Gourd slung across chest */}
        <g transform="translate(65, 145) rotate(-30)">
          <circle cx="20" cy="15" r="14" fill="#92400e" stroke="#fde047" strokeWidth="2" />
          <circle cx="20" cy="35" r="22" fill="#92400e" stroke="#fde047" strokeWidth="2.5" />
          <rect x="16" y="-3" width="8" height="8" rx="2" fill="#d97706" />
          <path d="M12,15 Q20,22 28,15" stroke="#dc2626" strokeWidth="3" fill="none" />
        </g>
      </svg>
    );
  }

  // ================= 4. SOJOBO: TENGU KING (鞍馬天狗 - ACT 2 ALTERNATE BOSS) ================= //
  if (normId.includes('tengu') || normId.includes('karasu')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`bot-sprite tengu-swordsman ${isAttacking ? 'attacking' : ''} ${isHit ? 'hit' : ''} ${isStunned ? 'stunned' : ''}`}
        style={{ filter: hitFilter }}
      >
        <defs>
          <linearGradient id="tenguFeathers" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>

        {/* Crow Wings Spread Wide */}
        <g className="tengu-wings">
          <path d="M95,80 C60,40 20,40 10,70 C30,85 55,100 85,115 Z" fill="url(#tenguFeathers)" stroke="#475569" strokeWidth="1.5" />
          <path d="M105,80 C140,40 180,40 190,70 C170,85 145,100 115,115 Z" fill="url(#tenguFeathers)" stroke="#475569" strokeWidth="1.5" />
        </g>

        {/* Martial Robes & Yamabushi Tokin Cap */}
        <polygon points="80,100 120,100 140,190 60,190" fill="#047857" stroke="#064e3b" strokeWidth="2" />
        <circle cx="100" cy="40" r="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />

        {/* Avian Crow Beak / Long Tengu Nose */}
        <polygon points="100,55 80,75 120,75" fill="#0f172a" />
        <polygon points="92,72 100,98 108,72" fill="#ea580c" stroke="#7c2d12" strokeWidth="1.5" />

        {/* Golden Piercing Eyes */}
        <circle cx="86" cy="68" r="5" fill="#fde047" stroke="#000" strokeWidth="1" />
        <circle cx="114" cy="68" r="5" fill="#fde047" stroke="#000" strokeWidth="1" />

        {/* Feather Fan (Hauchiwa) in Hand */}
        <g transform="translate(45, 120) rotate(-25)">
          <path d="M15,0 C5,-25 25,-40 35,-25 C45,-40 65,-25 55,0 Z" fill="#f8fafc" stroke="#047857" strokeWidth="1.5" />
          <line x1="35" y1="0" x2="35" y2="40" stroke="#78350f" strokeWidth="3" />
        </g>
      </svg>
    );
  }

  // ================= 5. RED ONI OF THE CRAG (赤鬼 - ELITE) ================= //
  if (normId.includes('oni') || normId.includes('marking')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`bot-sprite oni-brute ${isAttacking ? 'attacking' : ''} ${isHit ? 'hit' : ''} ${isStunned ? 'stunned' : ''}`}
        style={{ filter: hitFilter }}
      >
        <path d="M60,95 L140,95 L150,190 L50,190 Z" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2" />
        {/* Wild hair */}
        <path d="M100,25 C60,25 50,55 55,85 C70,75 130,75 145,85 C150,55 140,25 100,25 Z" fill="#1e293b" />
        {/* Dual Horns */}
        <polygon points="75,45 60,15 85,35" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
        <polygon points="125,45 140,15 115,35" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
        {/* Face */}
        <polygon points="100,50 70,80 75,115 125,115 130,80" fill="#dc2626" />
        <ellipse cx="86" cy="80" rx="6" ry="4" fill="#fde047" />
        <ellipse cx="114" cy="80" rx="6" ry="4" fill="#fde047" />
        {/* Spiked Kanabo Club */}
        <rect x="150" y="70" width="16" height="110" rx="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="158" cy="85" r="3" fill="#ffffff" />
        <circle cx="158" cy="115" r="3" fill="#ffffff" />
      </svg>
    );
  }

  // ================= 6. YUKI-ONNA (雪女 - ELITE) ================= //
  if (normId.includes('yuki') || normId.includes('sloth')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`bot-sprite yuki-onna ${isAttacking ? 'attacking' : ''} ${isHit ? 'hit' : ''} ${isStunned ? 'stunned' : ''}`}
        style={{ filter: hitFilter }}
      >
        {/* Trailing Snow Robes */}
        <path d="M100,50 C80,65 60,110 50,195 L150,195 C140,110 120,65 100,50 Z" fill="#f8fafc" stroke="#38bdf8" strokeWidth="1.5" />
        <path d="M100,75 L80,195 L120,195 Z" fill="#e0f2fe" opacity="0.6" />
        {/* Long Jet Black Hair */}
        <path d="M100,30 C75,30 65,65 68,140 C75,100 85,85 100,85 C115,85 125,100 132,140 C135,65 125,30 100,30 Z" fill="#090d16" />
        {/* Pale Face & Cold Cyan Eyes */}
        <ellipse cx="100" cy="65" rx="14" ry="18" fill="#ffffff" />
        <ellipse cx="94" cy="64" rx="3" ry="2" fill="#0284c7" />
        <ellipse cx="106" cy="64" rx="3" ry="2" fill="#0284c7" />
        {/* Snowflakes floating */}
        <path d="M40,60 L50,60 M45,55 L45,65" stroke="#38bdf8" strokeWidth="2" />
        <path d="M155,75 L165,75 M160,70 L160,80" stroke="#38bdf8" strokeWidth="2" />
      </svg>
    );
  }

  // ================= 7. KODAMA SPRITE (木霊) ================= //
  if (normId.includes('kodama') || normId.includes('imp')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`bot-sprite kodama-spirit ${isAttacking ? 'attacking' : ''} ${isHit ? 'hit' : ''} ${isStunned ? 'stunned' : ''}`}
        style={{ filter: hitFilter }}
      >
        {/* Pale Round Bobbing Head */}
        <ellipse cx="100" cy="85" rx="38" ry="42" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
        {/* Three Dark Hollow Holes (Eyes and Mouth) */}
        <ellipse cx="86" cy="80" rx="7" ry="11" fill="#090d16" />
        <ellipse cx="114" cy="80" rx="7" ry="11" fill="#090d16" />
        <ellipse cx="100" cy="104" rx="6" ry="8" fill="#090d16" />
        {/* Slender Branch Body */}
        <path d="M96,127 L88,185 M104,127 L112,185" stroke="#cbd5e1" strokeWidth="7" strokeLinecap="round" />
        {/* Little Green Cedar Sprout on Head */}
        <path d="M100,43 Q90,25 80,30 Q92,38 100,43 Q110,25 120,30 Q108,38 100,43 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.2" />
      </svg>
    );
  }

  // ================= 8. CHOCHIN-OBAKE (提灯お化け) ================= //
  if (normId.includes('chochin') || normId.includes('lantern') || normId.includes('doomscroll')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`bot-sprite chochin-lantern ${isAttacking ? 'attacking' : ''} ${isHit ? 'hit' : ''} ${isStunned ? 'stunned' : ''}`}
        style={{ filter: hitFilter }}
      >
        {/* Bamboo Lantern Ribs */}
        <rect x="65" y="45" width="70" height="110" rx="35" fill="#fef08a" stroke="#b45309" strokeWidth="2.5" />
        {[65, 85, 105, 125, 145].map((y, idx) => (
          <line key={`rib-${idx}`} x1="68" y1={y} x2="132" y2={y} stroke="#78350f" strokeWidth="1.5" />
        ))}
        {/* Top/Bottom Wooden Rims */}
        <rect x="75" y="38" width="50" height="9" rx="2" fill="#451a03" />
        <rect x="75" y="152" width="50" height="9" rx="2" fill="#451a03" />
        {/* Giant Single Eye */}
        <ellipse cx="100" cy="80" rx="16" ry="16" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
        <circle cx="100" cy="80" r="7" fill="#ef4444" />
        {/* Split Fanged Mouth & Lolling Tongue */}
        <path d="M75,115 Q100,125 125,115" stroke="#000" strokeWidth="3" fill="none" />
        <path d="M92,120 C92,145 108,160 102,175 C95,160 102,145 102,120 Z" fill="#f43f5e" stroke="#be123c" strokeWidth="1.5" />
      </svg>
    );
  }

  // ================= 9. KASA-OBAKE (傘お化け) ================= //
  if (normId.includes('kasa') || normId.includes('umbrella') || normId.includes('formula')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`bot-sprite kasa-umbrella ${isAttacking ? 'attacking' : ''} ${isHit ? 'hit' : ''} ${isStunned ? 'stunned' : ''}`}
        style={{ filter: hitFilter }}
      >
        {/* Triangular Paper Umbrella Body */}
        <polygon points="100,30 45,130 155,130" fill="#4338ca" stroke="#312e81" strokeWidth="2.5" />
        {/* Umbrella Ribs */}
        <line x1="100" y1="30" x2="100" y2="130" stroke="#818cf8" strokeWidth="1.5" />
        <line x1="100" y1="30" x2="72" y2="130" stroke="#818cf8" strokeWidth="1.5" />
        <line x1="100" y1="30" x2="128" y2="130" stroke="#818cf8" strokeWidth="1.5" />
        {/* Giant Centered Eye */}
        <ellipse cx="100" cy="90" rx="14" ry="14" fill="#ffffff" stroke="#000" strokeWidth="1.5" />
        <circle cx="100" cy="90" r="6" fill="#f59e0b" />
        {/* Lolling Tongue */}
        <path d="M94,120 Q100,148 108,145 Q104,130 104,120 Z" fill="#ef4444" />
        {/* Single Leg with Wooden Geta Clog */}
        <line x1="100" y1="130" x2="100" y2="175" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
        <rect x="85" y="175" width="30" height="8" rx="2" fill="#451a03" />
        <rect x="90" y="183" width="6" height="6" fill="#451a03" />
        <rect x="104" y="183" width="6" height="6" fill="#451a03" />
      </svg>
    );
  }

  // ================= 10. NEKOMATA (猫又) ================= //
  if (normId.includes('nekomata') || normId.includes('cat')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`bot-sprite nekomata ${isAttacking ? 'attacking' : ''} ${isHit ? 'hit' : ''} ${isStunned ? 'stunned' : ''}`}
        style={{ filter: hitFilter }}
      >
        {/* Split Twin Tails with Blue Ghost Fire */}
        <path d="M100,140 Q60,110 50,60" stroke="#1e293b" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="60" r="8" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
        <path d="M100,140 Q140,110 150,60" stroke="#1e293b" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="150" cy="60" r="8" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
        {/* Standing Bipedal Feline Body */}
        <ellipse cx="100" cy="140" rx="28" ry="38" fill="#0f172a" stroke="#334155" strokeWidth="2" />
        {/* Cat Head */}
        <circle cx="100" cy="85" r="24" fill="#0f172a" stroke="#334155" strokeWidth="2" />
        <polygon points="80,72 70,45 92,60" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
        <polygon points="120,72 130,45 108,60" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
        {/* Slanted Golden Cat Eyes */}
        <ellipse cx="92" cy="82" rx="4" ry="3" fill="#fde047" transform="rotate(-15 92 82)" />
        <ellipse cx="108" cy="82" rx="4" ry="3" fill="#fde047" transform="rotate(15 108 82)" />
      </svg>
    );
  }

  // ================= 11. GENERAL / FALLBACK JAPANESE YOKAI SPRITE ================= //
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`bot-sprite yokai-generic ${isAttacking ? 'attacking' : ''} ${isHit ? 'hit' : ''} ${isStunned ? 'stunned' : ''}`}
      style={{ filter: hitFilter }}
    >
      <circle cx="100" cy="100" r="65" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2.5" />
      <polygon points="100,45 80,85 120,85" fill="#4338ca" />
      <ellipse cx="88" cy="100" rx="7" ry="5" fill="#ef4444" />
      <ellipse cx="112" cy="100" rx="7" ry="5" fill="#ef4444" />
      <circle cx="88" cy="100" r="2" fill="#ffffff" />
      <circle cx="112" cy="100" r="2" fill="#ffffff" />
      <path d="M85,125 Q100,135 115,125" stroke="#f43f5e" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
