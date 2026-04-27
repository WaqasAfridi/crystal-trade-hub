// TOOLBAR REPLACEMENT - Lines 933-1019 of SpotTrading.tsx
// Copy everything between the ===START=== and ===END=== markers

// ===START===
        {/* ── Left Drawing Toolbar ───────────────────────────────────────────────── */}
        {showLeftBar ? (
        <div
          ref={leftBarRef}
          className="flex-shrink-0 flex flex-col items-center relative"
          style={{ width: 48, background: "#0c0c0f", borderRight: "1px solid #222230", zIndex: 30 }}
          onMouseLeave={() => { setHoveredToolIdx(null); setOpenSubMenu(null); }}
        >
          {/* ── TOOL 0 : Lines ── */}
          {(() => {
            const idx = 0;
            const isHov = hoveredToolIdx === idx;
            const isOpen = openSubMenu === idx;
            const items = [
              {
                label: 'Horizontal Straight Line',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><path d="M12.41465,11L18.5,11C18.7761,11,19,11.22386,19,11.5C19,11.77614,18.7761,12,18.5,12L12.41465,12C12.20873,12.5826,11.65311,13,11,13C10.34689,13,9.79127,12.5826,9.58535,12L3.5,12C3.223857,12,3,11.77614,3,11.5C3,11.22386,3.223857,11,3.5,11L9.58535,11C9.79127,10.417404,10.34689,10,11,10C11.65311,10,12.20873,10.417404,12.41465,11Z"/></svg>
              },
              {
                label: 'Horizontal Ray Line',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="4" cy="11.5" r="1.5"/><rect x="5.5" y="11" width="13.5" height="1" rx="0.5"/><path d="M18,10.2l2,1.3l-2,1.3z"/></svg>
              },
              {
                label: 'Horizontal Segment',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="4" cy="11.5" r="1.5"/><rect x="5.5" y="11" width="11" height="1" rx="0.5"/><circle cx="18" cy="11.5" r="1.5"/></svg>
              },
              {
                label: 'Vertical Straight Line',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><path d="M11,3.5L11,9.58535C10.4174,9.79127,10,10.34689,10,11C10,11.65311,10.4174,12.20873,11,12.41465L11,18.5C11,18.7761,11.2239,19,11.5,19C11.7761,19,12,18.7761,12,18.5L12,12.41465C12.5826,12.20873,13,11.65311,13,11C13,10.34689,12.5826,9.79127,12,9.58535L12,3.5C12,3.223857,11.7761,3,11.5,3C11.2239,3,11,3.223857,11,3.5Z"/></svg>
              },
              {
                label: 'Vertical Ray Line',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="11.5" cy="4" r="1.5"/><rect x="11" y="5.5" width="1" height="13.5" rx="0.5"/><path d="M10.2,18l1.3,2l1.3-2z"/></svg>
              },
              {
                label: 'Vertical Segment',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="11.5" cy="4" r="1.5"/><rect x="11" y="5.5" width="1" height="11" rx="0.5"/><circle cx="11.5" cy="18" r="1.5"/></svg>
              },
              {
                label: 'Straight Line',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><path d="M13.5607,9.43934C13.9512,9.82986,13.9512,10.4630,13.5607,10.8536L10.8536,13.5607C10.4630,13.9512,9.82986,13.9512,9.43934,13.5607C9.04882,13.1701,9.04882,12.5370,9.43934,12.1465L12.1465,9.43934C12.5370,9.04882,13.1701,9.04882,13.5607,9.43934ZM4.56066,16.4393L3.5,17.5L4.5,18.5L5.56066,17.4393ZM16.4393,4.56066L17.5,3.5L18.5,4.5L17.4393,5.56066ZM3.5,17.5L3,18L4,19L4.5,18.5ZM17.5,3.5L18,3L19,4L18.5,4.5Z"/><circle cx="11" cy="11" r="1.8"/><path d="M3.87868,16.1213L4.93934,15.0607C4.54882,14.6701,4.54882,14.037,4.93934,13.6465L7.64645,10.9393C8.03697,10.5488,8.67013,10.5488,9.06066,10.9393" fill="none" stroke="currentColor" strokeWidth="1" opacity="0"/><line x1="4" y1="18" x2="18" y2="4" stroke="currentColor" strokeWidth="1" strokeDasharray="0"/></svg>
              },
              {
                label: 'Ray Line',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="4.5" cy="17.5" r="1.5"/><path d="M5.56066,16.4393L17.5,4.5" stroke="currentColor" strokeWidth="1" fill="none"/><path d="M17.5,3.2L18.8,4.5L17.5,5.8z"/></svg>
              },
              {
                label: 'Segment',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="4.5" cy="17.5" r="1.5"/><path d="M5.56066,16.4393L16.4393,5.56066" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="17.5" cy="4.5" r="1.5"/></svg>
              },
              {
                label: 'Arrow',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="4.5" cy="17.5" r="1.5"/><path d="M5.56066,16.4393L14.5,7.5" stroke="currentColor" strokeWidth="1" fill="none"/><path d="M14.5,5.5L17.5,4.5L16.5,7.5z"/></svg>
              },
              {
                label: 'Price Line',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><rect x="3" y="10.75" width="11" height="1.5" rx="0.5"/><circle cx="8.5" cy="11.5" r="1.5"/><rect x="14" y="9" width="6" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
              },
            ];
            return (
              <div style={{ position: 'relative', width: '100%' }}
                onMouseEnter={() => setHoveredToolIdx(idx)}
              >
                <button
                  className="w-full flex items-center justify-center transition-colors"
                  style={{ height: 46, color: isHov || isOpen ? '#ffffff' : '#606070', background: isOpen ? 'rgba(255,255,255,0.07)' : 'transparent', position: 'relative' }}
                  onClick={() => setOpenSubMenu(isOpen ? null : idx)}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
                    <path d="M12.41465,11L18.5,11C18.7761,11,19,11.22386,19,11.5C19,11.77614,18.7761,12,18.5,12L12.41465,12C12.20873,12.5826,11.65311,13,11,13C10.34689,13,9.79127,12.5826,9.58535,12L3.5,12C3.223857,12,3,11.77614,3,11.5C3,11.22386,3.223857,11,3.5,11L9.58535,11C9.79127,10.417404,10.34689,10,11,10C11.65311,10,12.20873,10.417404,12.41465,11Z"/>
                  </svg>
                  {(isHov || isOpen) && (
                    <span style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', color: '#aaa', display: 'flex', alignItems: 'center' }}>
                      <svg viewBox="0 0 4 6" width="5" height="7" fill="#aaaaaa"><path d="M1.07298,0.159458C0.827521,-0.0531526,0.429553,-0.0531526,0.184094,0.159458C-0.0613648,0.372068,-0.0613648,0.716778,0.184094,0.929388L2.61275,3.03303L0.260362,5.07061C0.0149035,5.28322,0.0149035,5.62793,0.260362,5.84054C0.505822,6.05315,0.903789,6.05315,1.14925,5.84054L3.81591,3.53075C4.01812,3.3556,4.05374,3.0908,3.92279,2.88406C3.93219,2.73496,3.87113,2.58315,3.73964,2.46925L1.07298,0.159458Z"/></svg>
                    </span>
                  )}
                </button>
                {isOpen && (
                  <div style={{ position: 'absolute', left: 48, top: 0, background: '#1a1a26', border: '1px solid #2a2a3e', borderRadius: 4, zIndex: 200, minWidth: 220, boxShadow: '4px 4px 16px rgba(0,0,0,0.5)', padding: '4px 0' }}>
                    {items.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 px-3 cursor-pointer" style={{ height: 36, color: '#b0b0c0' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setOpenSubMenu(null)}
                      >
                        <span style={{ width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.svg}</span>
                        <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── TOOL 1 : Parallel/Channel Lines ── */}
          {(() => {
            const idx = 1;
            const isHov = hoveredToolIdx === idx;
            const isOpen = openSubMenu === idx;
            const items = [
              {
                label: 'Price Channel Line',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="3.5" cy="15" r="1.5"/><circle cx="14.5" cy="4" r="1.5"/><path d="M4.56,14.44L13.44,4.56" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="7.5" cy="19" r="1.5"/><circle cx="18.5" cy="8" r="1.5"/><path d="M8.56,18.44L17.44,8.56" stroke="currentColor" strokeWidth="1" fill="none"/></svg>
              },
              {
                label: 'Parallel Straight Line',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><path d="M3.146447,14.178126C2.9511847,13.982826,2.9511847,13.666226,3.146447,13.470926L13.470926,3.146447C13.666226,2.9511847,13.982826,2.9511847,14.178126,3.146447C14.373326,3.341709,14.373326,3.658291,14.178126,3.853554L3.853554,14.178126C3.658291,14.373326,3.341709,14.373326,3.146447,14.178126ZM7.67736,19.18853C7.4821,18.99323,7.4821,18.67663,7.67736,18.48143L18.48143,7.67736C18.67663,7.4821,18.99323,7.4821,19.18853,7.67736C19.38383,7.87262,19.38383,8.1892,19.18853,8.38446L8.38446,19.18853C8.1892,19.38383,7.87262,19.38383,7.67736,19.18853Z"/></svg>
              },
            ];
            return (
              <div style={{ position: 'relative', width: '100%' }}
                onMouseEnter={() => setHoveredToolIdx(idx)}
              >
                <button
                  className="w-full flex items-center justify-center transition-colors"
                  style={{ height: 46, color: isHov || isOpen ? '#ffffff' : '#606070', background: isOpen ? 'rgba(255,255,255,0.07)' : 'transparent', position: 'relative' }}
                  onClick={() => setOpenSubMenu(isOpen ? null : idx)}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
                    <path d="M3.146447,14.178126C2.9511847,13.982826,2.9511847,13.666226,3.146447,13.470926L7.39146,9.225966C7.35417,9.095106,7.33421,8.956946,7.33421,8.814116C7.33421,7.985696,8.00578,7.314116,8.834209,7.314116C8.97703,7.314116,9.11519,7.334086,9.24605,7.371366L13.753,2.864373C13.9483,2.669110,14.2649,2.669110,14.4602,2.864373C14.6554,3.059635,14.6554,3.376217,14.4602,3.571479L10.06916,7.962476C10.23631,8.204386,10.334209,8.497826,10.334209,8.814116C10.334209,9.642546,9.66264,10.314116,8.834209,10.314116C8.51791,10.314116,8.22448,10.216226,7.98256,10.049076L3.853554,14.178126C3.658291,14.373326,3.341709,14.373326,3.146447,14.178126ZM7.67736,19.18853C7.4821,18.99323,7.4821,18.67663,7.67736,18.48143L9.9804,16.17833C9.88669,15.98253,9.834209,15.76323,9.834209,15.53163C9.834209,14.70323,10.50578,14.03163,11.33421,14.03163C11.56579,14.03163,11.78511,14.08413,11.98093,14.17783L13.9804,12.17836C13.8867,11.98254,13.8342,11.76322,13.8342,11.53164C13.8342,10.70321,14.5058,10.03164,15.3342,10.03164C15.5658,10.03164,15.7851,10.08412,15.9809,10.17783L18.284,7.87480C18.4792,7.67954,18.7958,7.67954,18.9911,7.87480C19.1863,8.07006,19.1863,8.38664,18.9911,8.58191L16.688,10.88494C16.7817,11.08076,16.8342,11.30007,16.8342,11.53164C16.8342,12.36007,16.1626,13.03163,15.3342,13.03163C15.1026,13.03163,14.8833,12.97913,14.6875,12.88543L12.68803,14.88493C12.78174,15.08073,12.83421,15.30003,12.83421,15.53163C12.83421,16.36003,12.16264,17.03163,11.33421,17.03163C11.10264,17.03163,10.88333,16.97913,10.68751,16.88543L8.38446,19.18853C8.1892,19.38373,7.87262,19.38373,7.67736,19.18853Z"/>
                  </svg>
                  {(isHov || isOpen) && (
                    <span style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                      <svg viewBox="0 0 4 6" width="5" height="7" fill="#aaaaaa"><path d="M1.07298,0.159458C0.827521,-0.0531526,0.429553,-0.0531526,0.184094,0.159458C-0.0613648,0.372068,-0.0613648,0.716778,0.184094,0.929388L2.61275,3.03303L0.260362,5.07061C0.0149035,5.28322,0.0149035,5.62793,0.260362,5.84054C0.505822,6.05315,0.903789,6.05315,1.14925,5.84054L3.81591,3.53075C4.01812,3.3556,4.05374,3.0908,3.92279,2.88406C3.93219,2.73496,3.87113,2.58315,3.73964,2.46925L1.07298,0.159458Z"/></svg>
                    </span>
                  )}
                </button>
                {isOpen && (
                  <div style={{ position: 'absolute', left: 48, top: 0, background: '#1a1a26', border: '1px solid #2a2a3e', borderRadius: 4, zIndex: 200, minWidth: 220, boxShadow: '4px 4px 16px rgba(0,0,0,0.5)', padding: '4px 0' }}>
                    {items.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 px-3 cursor-pointer" style={{ height: 36, color: '#b0b0c0' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setOpenSubMenu(null)}
                      >
                        <span style={{ width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.svg}</span>
                        <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── TOOL 2 : Shapes ── */}
          {(() => {
            const idx = 2;
            const isHov = hoveredToolIdx === idx;
            const isOpen = openSubMenu === idx;
            const items = [
              {
                label: 'Circle',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><ellipse cx="10.5" cy="11.5" rx="1.5" ry="1.5"/><ellipse cx="17.5" cy="11.5" rx="1.5" ry="1.5"/><ellipse cx="10.5" cy="11.5" rx="7" ry="7" fillOpacity="0" stroke="currentColor" strokeWidth="1"/></svg>
              },
              {
                label: 'Rectangle',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><rect x="4" y="6" width="14" height="10" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="4" cy="6" r="1.5"/><circle cx="18" cy="6" r="1.5"/><circle cx="18" cy="16" r="1.5"/><circle cx="4" cy="16" r="1.5"/></svg>
              },
              {
                label: 'Parallelogram',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><polygon points="7,16 15,6 19,6 11,16" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="7" cy="16" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="19" cy="6" r="1.5"/><circle cx="11" cy="16" r="1.5"/></svg>
              },
              {
                label: 'Triangle',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><polygon points="11,4 19,18 3,18" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="11" cy="4" r="1.5"/><circle cx="19" cy="18" r="1.5"/><circle cx="3" cy="18" r="1.5"/></svg>
              },
            ];
            return (
              <div style={{ position: 'relative', width: '100%' }}
                onMouseEnter={() => setHoveredToolIdx(idx)}
              >
                <button
                  className="w-full flex items-center justify-center transition-colors"
                  style={{ height: 46, color: isHov || isOpen ? '#ffffff' : '#606070', background: isOpen ? 'rgba(255,255,255,0.07)' : 'transparent', position: 'relative' }}
                  onClick={() => setOpenSubMenu(isOpen ? null : idx)}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
                    <ellipse cx="10.5" cy="11.5" rx="1.5" ry="1.5" strokeOpacity="0" stroke="none"/>
                    <ellipse cx="17.5" cy="11.5" rx="1.5" ry="1.5" strokeOpacity="0" stroke="none"/>
                    <ellipse cx="10.5" cy="11.5" rx="7" ry="7" fillOpacity="0" fill="none" strokeOpacity="1" strokeWidth="1" stroke="currentColor"/>
                  </svg>
                  {(isHov || isOpen) && (
                    <span style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                      <svg viewBox="0 0 4 6" width="5" height="7" fill="#aaaaaa"><path d="M1.07298,0.159458C0.827521,-0.0531526,0.429553,-0.0531526,0.184094,0.159458C-0.0613648,0.372068,-0.0613648,0.716778,0.184094,0.929388L2.61275,3.03303L0.260362,5.07061C0.0149035,5.28322,0.0149035,5.62793,0.260362,5.84054C0.505822,6.05315,0.903789,6.05315,1.14925,5.84054L3.81591,3.53075C4.01812,3.3556,4.05374,3.0908,3.92279,2.88406C3.93219,2.73496,3.87113,2.58315,3.73964,2.46925L1.07298,0.159458Z"/></svg>
                    </span>
                  )}
                </button>
                {isOpen && (
                  <div style={{ position: 'absolute', left: 48, top: 0, background: '#1a1a26', border: '1px solid #2a2a3e', borderRadius: 4, zIndex: 200, minWidth: 200, boxShadow: '4px 4px 16px rgba(0,0,0,0.5)', padding: '4px 0' }}>
                    {items.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 px-3 cursor-pointer" style={{ height: 36, color: '#b0b0c0' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setOpenSubMenu(null)}
                      >
                        <span style={{ width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.svg}</span>
                        <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── TOOL 3 : Fibonacci ── */}
          {(() => {
            const idx = 3;
            const isHov = hoveredToolIdx === idx;
            const isOpen = openSubMenu === idx;
            const items = [
              {
                label: 'Fibonacci Retracement Line',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><line x1="3" y1="5" x2="19" y2="5" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="3" cy="5" r="1.2"/><line x1="3" y1="9" x2="19" y2="9" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="3" cy="9" r="1.2"/><line x1="3" y1="13" x2="19" y2="13" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="3" cy="13" r="1.2"/><line x1="3" y1="17" x2="19" y2="17" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="19" cy="17" r="1.2"/></svg>
              },
              {
                label: 'Fibonacci Retracement Segment',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><line x1="3" y1="5" x2="19" y2="5" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="3" cy="5" r="1.2"/><circle cx="19" cy="5" r="1.2"/><line x1="3" y1="9" x2="19" y2="9" stroke="currentColor" strokeWidth="1" fill="none"/><line x1="3" y1="13" x2="19" y2="13" stroke="currentColor" strokeWidth="1" fill="none"/><line x1="3" y1="17" x2="19" y2="17" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="3" cy="17" r="1.2"/><circle cx="19" cy="17" r="1.2"/></svg>
              },
              {
                label: 'Fibonacci Circle',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="7" cy="14" r="1.5"/><circle cx="15" cy="14" r="1.5"/><circle cx="11" cy="14" rx="4" ry="4" r="4" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="11" cy="14" r="7" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="11" cy="14" r="2" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
              },
              {
                label: 'Fibonacci Spiral',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><path d="M11,11 Q11,5,17,5 Q20,5,20,11 Q20,18,11,18 Q4,18,4,11 Q4,7,8,7 Q11,7,11,11" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="11" cy="11" r="1.5"/></svg>
              },
              {
                label: 'Fibonacci Speed Resistance Fan',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="4" cy="18" r="1.5"/><line x1="4" y1="18" x2="19" y2="4" stroke="currentColor" strokeWidth="1" fill="none"/><line x1="4" y1="18" x2="19" y2="9" stroke="currentColor" strokeWidth="1" fill="none"/><line x1="4" y1="18" x2="19" y2="14" stroke="currentColor" strokeWidth="1" fill="none"/><line x1="4" y1="18" x2="19" y2="18" stroke="currentColor" strokeWidth="1" fill="none"/></svg>
              },
              {
                label: 'Fibonacci Trend Extension',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="4" cy="16" r="1.5"/><circle cx="12" cy="7" r="1.5"/><line x1="4" y1="16" x2="12" y2="7" stroke="currentColor" strokeWidth="1" fill="none"/><line x1="12" y1="7" x2="19" y2="10" stroke="currentColor" strokeWidth="1" fill="none"/><line x1="4" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2,2" fill="none"/><line x1="4" y1="13" x2="19" y2="13" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2,2" fill="none"/><line x1="4" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2,2" fill="none"/></svg>
              },
              {
                label: 'Gann Box',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><rect x="3" y="4" width="16" height="14" fill="none" stroke="currentColor" strokeWidth="1"/><line x1="3" y1="9" x2="19" y2="9" stroke="currentColor" strokeWidth="0.7" fill="none"/><line x1="3" y1="14" x2="19" y2="14" stroke="currentColor" strokeWidth="0.7" fill="none"/><line x1="8" y1="4" x2="8" y2="18" stroke="currentColor" strokeWidth="0.7" fill="none"/><line x1="14" y1="4" x2="14" y2="18" stroke="currentColor" strokeWidth="0.7" fill="none"/><circle cx="3" cy="4" r="1.5"/><circle cx="19" cy="18" r="1.5"/></svg>
              },
            ];
            const mainSvg = (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
                <path d="M3.5,7L19.5,7C19.7761,7,20,7.22386,20,7.5C20,7.77614,19.7761,8,19.5,8L3.5,8C3.22386,8,3,7.77614,3,7.5C3,7.22386,3.22386,7,3.5,7ZM3.5,10.75L19.5,10.75C19.7761,10.75,20,10.9739,20,11.25C20,11.5261,19.7761,11.75,19.5,11.75L3.5,11.75C3.22386,11.75,3,11.5261,3,11.25C3,10.9739,3.22386,10.75,3.5,10.75ZM3.5,14.5L19.5,14.5C19.7761,14.5,20,14.7239,20,15C20,15.2761,19.7761,15.5,19.5,15.5L3.5,15.5C3.22386,15.5,3,15.2761,3,15C3,14.7239,3.22386,14.5,3.5,14.5ZM3,4L4,4L4,18L3,18ZM18,4L19,4L19,18L18,18Z"/>
              </svg>
            );
            return (
              <div style={{ position: 'relative', width: '100%' }} onMouseEnter={() => setHoveredToolIdx(idx)}>
                <button
                  className="w-full flex items-center justify-center transition-colors"
                  style={{ height: 46, color: isHov || isOpen ? '#ffffff' : '#606070', background: isOpen ? 'rgba(255,255,255,0.07)' : 'transparent', position: 'relative' }}
                  onClick={() => setOpenSubMenu(isOpen ? null : idx)}
                >
                  {mainSvg}
                  {(isHov || isOpen) && (
                    <span style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                      <svg viewBox="0 0 4 6" width="5" height="7" fill="#aaaaaa"><path d="M1.07298,0.159458C0.827521,-0.0531526,0.429553,-0.0531526,0.184094,0.159458C-0.0613648,0.372068,-0.0613648,0.716778,0.184094,0.929388L2.61275,3.03303L0.260362,5.07061C0.0149035,5.28322,0.0149035,5.62793,0.260362,5.84054C0.505822,6.05315,0.903789,6.05315,1.14925,5.84054L3.81591,3.53075C4.01812,3.3556,4.05374,3.0908,3.92279,2.88406C3.93219,2.73496,3.87113,2.58315,3.73964,2.46925L1.07298,0.159458Z"/></svg>
                    </span>
                  )}
                </button>
                {isOpen && (
                  <div style={{ position: 'absolute', left: 48, top: 0, background: '#1a1a26', border: '1px solid #2a2a3e', borderRadius: 4, zIndex: 200, minWidth: 240, boxShadow: '4px 4px 16px rgba(0,0,0,0.5)', padding: '4px 0' }}>
                    {items.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 px-3 cursor-pointer" style={{ height: 36, color: '#b0b0c0' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setOpenSubMenu(null)}
                      >
                        <span style={{ width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.svg}</span>
                        <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── TOOL 4 : Wave Patterns ── */}
          {(() => {
            const idx = 4;
            const isHov = hoveredToolIdx === idx;
            const isOpen = openSubMenu === idx;
            const items = [
              {
                label: 'XABCD Pattern',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="3" cy="12" r="1.5"/><circle cx="7" cy="5" r="1.5"/><circle cx="11" cy="10" r="1.5"/><circle cx="15" cy="4" r="1.5"/><circle cx="19" cy="15" r="1.5"/><polyline points="3,12 7,5 11,10 15,4 19,15" fill="none" stroke="currentColor" strokeWidth="1"/><line x1="3" y1="12" x2="19" y2="15" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2,2" fill="none"/><line x1="7" y1="5" x2="19" y2="15" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2,2" fill="none"/><line x1="11" y1="10" x2="19" y2="15" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2,2" fill="none"/><line x1="15" y1="4" x2="3" y2="12" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2,2" fill="none"/></svg>
              },
              {
                label: 'ABCD Pattern',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="4" cy="5" r="1.5"/><circle cx="10" cy="16" r="1.5"/><circle cx="14" cy="7" r="1.5"/><circle cx="19" cy="17" r="1.5"/><polyline points="4,5 10,16 14,7 19,17" fill="none" stroke="currentColor" strokeWidth="1"/><line x1="4" y1="5" x2="14" y2="7" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2,2" fill="none"/><line x1="10" y1="16" x2="19" y2="17" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2,2" fill="none"/></svg>
              },
              {
                label: 'Three Waves',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="3" cy="16" r="1.3"/><circle cx="7" cy="6" r="1.3"/><circle cx="11" cy="14" r="1.3"/><circle cx="15" cy="5" r="1.3"/><circle cx="19" cy="14" r="1.3"/><polyline points="3,16 7,6 11,14 15,5 19,14" fill="none" stroke="currentColor" strokeWidth="1"/><text x="6" y="20" fontSize="5" fill="currentColor">1</text><text x="14" y="20" fontSize="5" fill="currentColor">3</text></svg>
              },
              {
                label: 'Five Waves',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="2" cy="15" r="1.2"/><circle cx="5" cy="6" r="1.2"/><circle cx="8" cy="13" r="1.2"/><circle cx="12" cy="5" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="17" cy="7" r="1.2"/><circle cx="20" cy="15" r="1.2"/><polyline points="2,15 5,6 8,13 12,5 15,12 17,7 20,15" fill="none" stroke="currentColor" strokeWidth="1"/><text x="4" y="20" fontSize="4" fill="currentColor">1</text><text x="11" y="20" fontSize="4" fill="currentColor">3</text><text x="18" y="20" fontSize="4" fill="currentColor">5</text></svg>
              },
              {
                label: 'Eight Waves',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="2" cy="14" r="1.1"/><circle cx="4" cy="7" r="1.1"/><circle cx="6" cy="13" r="1.1"/><circle cx="8.5" cy="6" r="1.1"/><circle cx="11" cy="12" r="1.1"/><circle cx="13" cy="8" r="1.1"/><circle cx="15" cy="14" r="1.1"/><circle cx="17" cy="10" r="1.1"/><circle cx="20" cy="16" r="1.1"/><polyline points="2,14 4,7 6,13 8.5,6 11,12 13,8 15,14 17,10 20,16" fill="none" stroke="currentColor" strokeWidth="1"/><text x="3" y="20" fontSize="4" fill="currentColor">1</text><text x="19" y="20" fontSize="4" fill="currentColor">8</text></svg>
              },
              {
                label: 'Any Waves',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="3" cy="15" r="1.3"/><circle cx="7" cy="7" r="1.3"/><circle cx="11" cy="13" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="19" cy="13" r="1.3"/><polyline points="3,15 7,7 11,13 15,6 19,13" fill="none" stroke="currentColor" strokeWidth="1"/><text x="3" y="21" fontSize="5" fill="currentColor">1</text><text x="16" y="21" fontSize="5" fill="currentColor">∞</text></svg>
              },
            ];
            const mainSvg = (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
                <path d="M2,18L4,18L4,16C4,14.3431,5.3431,13,7,13L9,13C10.1046,13,11,12.1046,11,11L11,7C11,5.3431,12.3431,4,14,4L18,4L18,6L14,6C13.4477,6,13,6.4477,13,7L13,11C13,13.2091,11.2091,15,9,15L7,15C6.4477,15,6,15.4477,6,16L6,18L20,18L20,20L2,20L2,18Z"/>
                <circle cx="7" cy="13" r="1.5"/><circle cx="15" cy="4" r="1.5"/>
              </svg>
            );
            return (
              <div style={{ position: 'relative', width: '100%' }} onMouseEnter={() => setHoveredToolIdx(idx)}>
                <button
                  className="w-full flex items-center justify-center transition-colors"
                  style={{ height: 46, borderBottom: '1px solid #222230', color: isHov || isOpen ? '#ffffff' : '#606070', background: isOpen ? 'rgba(255,255,255,0.07)' : 'transparent', position: 'relative' }}
                  onClick={() => setOpenSubMenu(isOpen ? null : idx)}
                >
                  {mainSvg}
                  {(isHov || isOpen) && (
                    <span style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                      <svg viewBox="0 0 4 6" width="5" height="7" fill="#aaaaaa"><path d="M1.07298,0.159458C0.827521,-0.0531526,0.429553,-0.0531526,0.184094,0.159458C-0.0613648,0.372068,-0.0613648,0.716778,0.184094,0.929388L2.61275,3.03303L0.260362,5.07061C0.0149035,5.28322,0.0149035,5.62793,0.260362,5.84054C0.505822,6.05315,0.903789,6.05315,1.14925,5.84054L3.81591,3.53075C4.01812,3.3556,4.05374,3.0908,3.92279,2.88406C3.93219,2.73496,3.87113,2.58315,3.73964,2.46925L1.07298,0.159458Z"/></svg>
                    </span>
                  )}
                </button>
                {isOpen && (
                  <div style={{ position: 'absolute', left: 48, top: 0, background: '#1a1a26', border: '1px solid #2a2a3e', borderRadius: 4, zIndex: 200, minWidth: 200, boxShadow: '4px 4px 16px rgba(0,0,0,0.5)', padding: '4px 0' }}>
                    {items.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 px-3 cursor-pointer" style={{ height: 36, color: '#b0b0c0' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setOpenSubMenu(null)}
                      >
                        <span style={{ width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.svg}</span>
                        <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── TOOL 5 : Magnet ── */}
          {(() => {
            const idx = 5;
            const isHov = hoveredToolIdx === idx;
            const isOpen = openSubMenu === idx;
            const items = [
              {
                label: 'Weak Magnet',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><path d="M11,13C8.2386,13,6,10.7614,6,8L6,4L8,4L8,8C8,9.6569,9.3431,11,11,11C12.6569,11,14,9.6569,14,8L14,4L16,4L16,8C16,10.7614,13.7614,13,11,13ZM5,3L9,3L9,4L5,4ZM13,3L17,3L17,4L13,4ZM8.5,13L8.5,16L9.5,16L9.5,13ZM12.5,13L12.5,16L13.5,16L13.5,13ZM7,17L15,17L15,18L7,18Z" strokeOpacity="0" stroke="none"/></svg>
              },
              {
                label: 'Strong Magnet',
                svg: <svg viewBox="0 0 22 22" fill="currentColor"><path d="M11,13C8.2386,13,6,10.7614,6,8L6,4L8,4L8,8C8,9.6569,9.3431,11,11,11C12.6569,11,14,9.6569,14,8L14,4L16,4L16,8C16,10.7614,13.7614,13,11,13ZM5,3L9,3L9,4L5,4ZM13,3L17,3L17,4L13,4ZM8.5,13L8.5,16L9.5,16L9.5,13ZM12.5,13L12.5,16L13.5,16L13.5,13ZM7,17L15,17L15,18L7,18Z"/><circle cx="18" cy="6" r="2.5" fill="currentColor"/></svg>
              },
            ];
            const mainSvg = (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
                <path d="M11,13C8.2386,13,6,10.7614,6,8L6,4L8,4L8,8C8,9.6569,9.3431,11,11,11C12.6569,11,14,9.6569,14,8L14,4L16,4L16,8C16,10.7614,13.7614,13,11,13ZM5,3L9,3L9,4L5,4ZM13,3L17,3L17,4L13,4ZM8.5,13L8.5,16L9.5,16L9.5,13ZM12.5,13L12.5,16L13.5,16L13.5,13ZM7,17L15,17L15,18L7,18Z" strokeOpacity="0" stroke="none"/>
              </svg>
            );
            return (
              <div style={{ position: 'relative', width: '100%' }} onMouseEnter={() => setHoveredToolIdx(idx)}>
                <button
                  className="w-full flex items-center justify-center transition-colors"
                  style={{ height: 46, color: isHov || isOpen ? '#2d7ef7' : '#606070', background: isOpen ? 'rgba(45,126,247,0.12)' : 'transparent', position: 'relative' }}
                  onClick={() => setOpenSubMenu(isOpen ? null : idx)}
                >
                  {mainSvg}
                  {(isHov || isOpen) && (
                    <span style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                      <svg viewBox="0 0 4 6" width="5" height="7" fill="#aaaaaa"><path d="M1.07298,0.159458C0.827521,-0.0531526,0.429553,-0.0531526,0.184094,0.159458C-0.0613648,0.372068,-0.0613648,0.716778,0.184094,0.929388L2.61275,3.03303L0.260362,5.07061C0.0149035,5.28322,0.0149035,5.62793,0.260362,5.84054C0.505822,6.05315,0.903789,6.05315,1.14925,5.84054L3.81591,3.53075C4.01812,3.3556,4.05374,3.0908,3.92279,2.88406C3.93219,2.73496,3.87113,2.58315,3.73964,2.46925L1.07298,0.159458Z"/></svg>
                    </span>
                  )}
                </button>
                {isOpen && (
                  <div style={{ position: 'absolute', left: 48, top: 0, background: '#1a1a26', border: '1px solid #2a2a3e', borderRadius: 4, zIndex: 200, minWidth: 190, boxShadow: '4px 4px 16px rgba(0,0,0,0.5)', padding: '4px 0' }}>
                    {items.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 px-3 cursor-pointer" style={{ height: 36, color: '#b0b0c0' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        onClick={() => setOpenSubMenu(null)}
                      >
                        <span style={{ width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.svg}</span>
                        <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── TOOL 6 : Lock (no submenu) ── */}
          <div style={{ width: '100%' }} onMouseEnter={() => setHoveredToolIdx(6)} onMouseLeave={() => setHoveredToolIdx(null)}>
            <button
              className="w-full flex items-center justify-center transition-colors"
              style={{ height: 46, color: hoveredToolIdx === 6 ? '#ffffff' : '#606070', background: 'transparent' }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
                <path d="M15,9L15,7C15,4.7909,13.2091,3,11,3C8.7909,3,7,4.7909,7,7L7,9L6,9C5.4477,9,5,9.4477,5,10L5,18C5,18.5523,5.4477,19,6,19L16,19C16.5523,19,17,18.5523,17,18L17,10C17,9.4477,16.5523,9,16,9ZM9,7C9,5.8954,9.8954,5,11,5C12.1046,5,13,5.8954,13,7L13,9L9,9ZM7,17L7,11L15,11L15,17Z" strokeOpacity="0" stroke="none"/>
              </svg>
            </button>
          </div>

          {/* ── TOOL 7 : Eye / Visibility (no submenu) ── */}
          <div style={{ width: '100%' }} onMouseEnter={() => setHoveredToolIdx(7)} onMouseLeave={() => setHoveredToolIdx(null)}>
            <button
              className="w-full flex items-center justify-center transition-colors"
              style={{ height: 46, borderBottom: '1px solid #222230', color: hoveredToolIdx === 7 ? '#ffffff' : '#606070', background: 'transparent' }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
                <path d="M11,5C7.1340,5,3.7854,7.4052,2.1972,10.8662C2.0722,11.1393,2.0722,11.4537,2.1972,11.7267C3.7854,15.1879,7.1340,17.5931,11,17.5931C14.8660,17.5931,18.2146,15.1879,19.8028,11.7267C19.9278,11.4537,19.9278,11.1393,19.8028,10.8662C18.2146,7.4052,14.8660,5,11,5ZM11,15.5C8.5147,15.5,6.5,13.4853,6.5,11C6.5,8.5147,8.5147,6.5,11,6.5C13.4853,6.5,15.5,8.5147,15.5,11C15.5,13.4853,13.4853,15.5,11,15.5ZM11,8.5C9.6193,8.5,8.5,9.6193,8.5,11C8.5,12.3807,9.6193,13.5,11,13.5C12.3807,13.5,13.5,12.3807,13.5,11C13.5,9.6193,12.3807,8.5,11,8.5Z" strokeOpacity="0" stroke="none"/>
              </svg>
            </button>
          </div>

          {/* ── TOOL 8 : Delete (no submenu) ── */}
          <div style={{ width: '100%' }} onMouseEnter={() => setHoveredToolIdx(8)} onMouseLeave={() => setHoveredToolIdx(null)}>
            <button
              className="w-full flex items-center justify-center transition-colors"
              style={{ height: 46, color: hoveredToolIdx === 8 ? '#ffffff' : '#606070', background: 'transparent' }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
                <path d="M8,4L8,5L4,5L4,7L5,7L5,18C5,18.5523,5.4477,19,6,19L16,19C16.5523,19,17,18.5523,17,18L17,7L18,7L18,5L14,5L14,4ZM10,4L12,4L12,5L10,5ZM7,7L15,7L15,17L7,17ZM9,9L9,15L10,15L10,9ZM12,9L12,15L13,15L13,9Z" strokeOpacity="0" stroke="none"/>
              </svg>
            </button>
          </div>

        </div>
        ) : null}
// ===END===
