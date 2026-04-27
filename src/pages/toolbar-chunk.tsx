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
              { label: 'Horizontal Straight Line', svg: <svg viewBox="0 0 22 22" fill="currentColor"><path d="M12.41465,11L18.5,11C18.7761,11,19,11.22386,19,11.5C19,11.77614,18.7761,12,18.5,12L12.41465,12C12.20873,12.5826,11.65311,13,11,13C10.34689,13,9.79127,12.5826,9.58535,12L3.5,12C3.223857,12,3,11.77614,3,11.5C3,11.22386,3.223857,11,3.5,11L9.58535,11C9.79127,10.417404,10.34689,10,11,10C11.65311,10,12.20873,10.417404,12.41465,11Z"/></svg> },
              { label: 'Horizontal Ray Line', svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="4" cy="11.5" r="1.5"/><rect x="5.5" y="11" width="13.5" height="1" rx="0.5"/><path d="M18,10.2l2,1.3l-2,1.3z"/></svg> },
              { label: 'Horizontal Segment', svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="4" cy="11.5" r="1.5"/><rect x="5.5" y="11" width="11" height="1" rx="0.5"/><circle cx="18" cy="11.5" r="1.5"/></svg> },
              { label: 'Vertical Straight Line', svg: <svg viewBox="0 0 22 22" fill="currentColor"><path d="M11,3.5L11,9.58535C10.4174,9.79127,10,10.34689,10,11C10,11.65311,10.4174,12.20873,11,12.41465L11,18.5C11,18.7761,11.2239,19,11.5,19C11.7761,19,12,18.7761,12,18.5L12,12.41465C12.5826,12.20873,13,11.65311,13,11C13,10.34689,12.5826,9.79127,12,9.58535L12,3.5C12,3.223857,11.7761,3,11.5,3C11.2239,3,11,3.223857,11,3.5Z"/></svg> },
              { label: 'Vertical Ray Line', svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="11.5" cy="4" r="1.5"/><rect x="11" y="5.5" width="1" height="13.5" rx="0.5"/><path d="M10.2,18l1.3,2l1.3-2z"/></svg> },
              { label: 'Vertical Segment', svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="11.5" cy="4" r="1.5"/><rect x="11" y="5.5" width="1" height="11" rx="0.5"/><circle cx="11.5" cy="18" r="1.5"/></svg> },
              { label: 'Straight Line', svg: <svg viewBox="0 0 22 22" fill="currentColor"><line x1="4" y1="18" x2="18" y2="4" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="4" cy="18" r="1.5"/><circle cx="18" cy="4" r="1.5"/></svg> },
              { label: 'Ray Line', svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="4.5" cy="17.5" r="1.5"/><path d="M5.56066,16.4393L17.5,4.5" stroke="currentColor" strokeWidth="1" fill="none"/><path d="M17.5,3.2L18.8,4.5L17.5,5.8z"/></svg> },
              { label: 'Segment', svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="4.5" cy="17.5" r="1.5"/><path d="M5.56,16.44L16.44,5.56" stroke="currentColor" strokeWidth="1" fill="none"/><circle cx="17.5" cy="4.5" r="1.5"/></svg> },
              { label: 'Arrow', svg: <svg viewBox="0 0 22 22" fill="currentColor"><circle cx="4.5" cy="17.5" r="1.5"/><path d="M5.56,16.44L14.5,7.5" stroke="currentColor" strokeWidth="1" fill="none"/><path d="M14.5,5.5L17.5,4.5L16.5,7.5z"/></svg> },
              { label: 'Price Line', svg: <svg viewBox="0 0 22 22" fill="currentColor"><rect x="3" y="10.75" width="11" height="1.5" rx="0.5"/><circle cx="8.5" cy="11.5" r="1.5"/><rect x="14" y="9" width="6" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="1"/></svg> },
            ];
            return (
              <div style={{ position: 'relative', width: '100%' }} onMouseEnter={() => setHoveredToolIdx(idx)}>
                <button className="w-full flex items-center justify-center transition-colors" style={{ height: 46, color: isHov || isOpen ? '#ffffff' : '#606070', background: isOpen ? 'rgba(255,255,255,0.07)' : 'transparent', position: 'relative' }} onClick={() => setOpenSubMenu(isOpen ? null : idx)}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor"><path d="M12.41465,11L18.5,11C18.7761,11,19,11.22386,19,11.5C19,11.77614,18.7761,12,18.5,12L12.41465,12C12.20873,12.5826,11.65311,13,11,13C10.34689,13,9.79127,12.5826,9.58535,12L3.5,12C3.223857,12,3,11.77614,3,11.5C3,11.22386,3.223857,11,3.5,11L9.58535,11C9.79127,10.417404,10.34689,10,11,10C11.65311,10,12.20873,10.417404,12.41465,11Z"/></svg>
                  {(isHov || isOpen) && <span style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}><svg viewBox="0 0 4 6" width="5" height="7" fill="#aaaaaa"><path d="M1.07298,0.159458C0.827521,-0.0531526,0.429553,-0.0531526,0.184094,0.159458C-0.0613648,0.372068,-0.0613648,0.716778,0.184094,0.929388L2.61275,3.03303L0.260362,5.07061C0.0149035,5.28322,0.0149035,5.62793,0.260362,5.84054C0.505822,6.05315,0.903789,6.05315,1.14925,5.84054L3.81591,3.53075C4.01812,3.3556,4.05374,3.0908,3.92279,2.88406C3.93219,2.73496,3.87113,2.58315,3.73964,2.46925L1.07298,0.159458Z"/></svg></span>}
                </button>
                {isOpen && (
                  <div style={{ position: 'absolute', left: 48, top: 0, background: '#1a1a26', border: '1px solid #2a2a3e', borderRadius: 4, zIndex: 200, minWidth: 220, boxShadow: '4px 4px 16px rgba(0,0,0,0.5)', padding: '4px 0' }}>
                    {items.map((item) => (
                      <div key={item.label} className="flex items-center gap-2 px-3 cursor-pointer" style={{ height: 36, color: '#b0b0c0' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} onClick={() => setOpenSubMenu(null)}>
                        <span style={{ width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.svg}</span>
                        <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
