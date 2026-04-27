        {/* Left Drawing Toolbar */}
        {showLeftBar ? (
        <div
          ref={leftBarRef}
          className="flex-shrink-0 flex flex-col items-center"
          style={{ width: 48, background: "#0c0c0f", borderRight: "1px solid #222230", position: 'relative', zIndex: 30 }}
        >
          {/* Submenu popup */}
          {openSubMenu !== null && subMenuPos && (() => {
            const subMenuGroups: { label: string; icon: React.ReactNode }[][] = [
              [
                { label: 'Horizontal Straight Line', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.2"><line x1="2" y1="11" x2="20" y2="11"/></svg> },
                { label: 'Horizontal Ray Line', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><line x1="3" y1="11" x2="18" y2="11"/><polygon points="18,9 21,11 18,13" stroke="none"/></svg> },
                { label: 'Horizontal Segment', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><line x1="4" y1="11" x2="18" y2="11"/><circle cx="4" cy="11" r="1.5" stroke="none"/><circle cx="18" cy="11" r="1.5" stroke="none"/></svg> },
                { label: 'Vertical Straight Line', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.2"><line x1="11" y1="2" x2="11" y2="20"/></svg> },
                { label: 'Vertical Ray Line', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><line x1="11" y1="19" x2="11" y2="5"/><polygon points="9,5 11,2 13,5" stroke="none"/></svg> },
                { label: 'Vertical Segment', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><line x1="11" y1="4" x2="11" y2="18"/><circle cx="11" cy="4" r="1.5" stroke="none"/><circle cx="11" cy="18" r="1.5" stroke="none"/></svg> },
                { label: 'Straight Line', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.2"><line x1="3" y1="19" x2="19" y2="3"/></svg> },
                { label: 'Ray Line', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><line x1="4" y1="18" x2="18" y2="4"/><polygon points="16,3 19,4 18,7" stroke="none"/></svg> },
                { label: 'Segment', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><line x1="4" y1="18" x2="18" y2="4"/><circle cx="4" cy="18" r="1.5" stroke="none"/><circle cx="18" cy="4" r="1.5" stroke="none"/></svg> },
                { label: 'Arrow', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><line x1="4" y1="18" x2="16" y2="6"/><polygon points="14,4 19,5 17,10" stroke="none"/></svg> },
                { label: 'Price Line', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.2"><line x1="2" y1="11" x2="15" y2="11" strokeDasharray="3,2"/><rect x="15" y="8" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.25" stroke="currentColor"/></svg> },
              ],
              [
                { label: 'Price Channel Line', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><line x1="3" y1="16" x2="19" y2="6"/><line x1="3" y1="19" x2="19" y2="9"/><circle cx="3" cy="16" r="1.5" stroke="none"/><circle cx="19" cy="6" r="1.5" stroke="none"/></svg> },
                { label: 'Parallel Straight Line', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.2"><line x1="2" y1="8" x2="20" y2="8"/><line x1="2" y1="14" x2="20" y2="14"/></svg> },
              ],
              [
                { label: 'Circle', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><circle cx="11" cy="11" r="8" fill="none"/><circle cx="11" cy="11" r="1.5" stroke="none"/><circle cx="19" cy="11" r="1.5" stroke="none"/></svg> },
                { label: 'Rectangle', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="5" width="16" height="12" fill="none"/><circle cx="3" cy="5" r="1.5" stroke="none"/><circle cx="19" cy="17" r="1.5" stroke="none"/></svg> },
                { label: 'Parallelogram', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><polygon points="5,17 19,17 17,5 3,5" fill="none"/><circle cx="5" cy="17" r="1.5" stroke="none"/><circle cx="19" cy="17" r="1.5" stroke="none"/><circle cx="17" cy="5" r="1.5" stroke="none"/></svg> },
                { label: 'Triangle', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><polygon points="11,3 20,18 2,18" fill="none"/><circle cx="11" cy="3" r="1.5" stroke="none"/><circle cx="20" cy="18" r="1.5" stroke="none"/><circle cx="2" cy="18" r="1.5" stroke="none"/></svg> },
              ],
              [
                { label: 'Fibonacci Retracement Line', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1"><line x1="3" y1="5" x2="19" y2="5" fill="none"/><line x1="3" y1="9" x2="19" y2="9" fill="none"/><line x1="3" y1="13" x2="19" y2="13" fill="none"/><line x1="3" y1="17" x2="19" y2="17" fill="none"/><circle cx="3" cy="5" r="1.5" stroke="none"/><circle cx="19" cy="17" r="1.5" stroke="none"/></svg> },
                { label: 'Fibonacci Retracement Segment', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1"><line x1="5" y1="5" x2="17" y2="5" fill="none"/><line x1="5" y1="9" x2="17" y2="9" fill="none"/><line x1="5" y1="13" x2="17" y2="13" fill="none"/><line x1="5" y1="17" x2="17" y2="17" fill="none"/><circle cx="5" cy="5" r="1.5" stroke="none"/><circle cx="5" cy="17" r="1.5" stroke="none"/></svg> },
                { label: 'Fibonacci Circle', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1"><circle cx="6" cy="14" r="3" fill="none"/><circle cx="6" cy="14" r="6" fill="none"/><circle cx="6" cy="14" r="9" fill="none"/><circle cx="6" cy="14" r="1.5" stroke="none"/><circle cx="12" cy="14" r="1.5" stroke="none"/></svg> },
                { label: 'Fibonacci Spiral', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M11,11 Q11,5 17,5 Q20,5 20,11 Q20,17 11,17 Q4,17 4,9 Q4,3 13,3"/><circle cx="11" cy="11" r="1.5" fill="currentColor" stroke="none"/></svg> },
                { label: 'Fibonacci Speed Resistance Fan', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1"><line x1="3" y1="19" x2="19" y2="3"/><line x1="3" y1="19" x2="19" y2="9"/><line x1="3" y1="19" x2="19" y2="13"/><line x1="3" y1="19" x2="19" y2="19"/><circle cx="3" cy="19" r="1.5" fill="currentColor" stroke="none"/></svg> },
                { label: 'Fibonacci Trend Extension', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><line x1="3" y1="15" x2="11" y2="7"/><line x1="11" y1="7" x2="19" y2="12" strokeDasharray="3,2"/><circle cx="3" cy="15" r="1.5" stroke="none"/><circle cx="11" cy="7" r="1.5" stroke="none"/><circle cx="19" cy="12" r="1.5" stroke="none"/></svg> },
                { label: 'Gann Box', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="16" height="16"/><line x1="3" y1="11" x2="19" y2="11"/><line x1="11" y1="3" x2="11" y2="19"/><line x1="3" y1="3" x2="19" y2="19"/><circle cx="3" cy="3" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="19" r="1.5" fill="currentColor" stroke="none"/></svg> },
              ],
              [
                { label: 'XABCD Pattern', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><polyline points="3,18 7,6 11,14 15,4 19,10" fill="none"/><circle cx="3" cy="18" r="1.3" stroke="none"/><circle cx="7" cy="6" r="1.3" stroke="none"/><circle cx="11" cy="14" r="1.3" stroke="none"/><circle cx="15" cy="4" r="1.3" stroke="none"/><circle cx="19" cy="10" r="1.3" stroke="none"/></svg> },
                { label: 'ABCD Pattern', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><polyline points="4,18 9,5 14,14 19,4" fill="none"/><circle cx="4" cy="18" r="1.3" stroke="none"/><circle cx="9" cy="5" r="1.3" stroke="none"/><circle cx="14" cy="14" r="1.3" stroke="none"/><circle cx="19" cy="4" r="1.3" stroke="none"/></svg> },
                { label: 'Three Waves', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.2"><polyline points="3,16 7,6 11,13 15,6 19,13" fill="none"/><circle cx="3" cy="16" r="1.3" stroke="none"/><circle cx="7" cy="6" r="1.3" stroke="none"/><circle cx="11" cy="13" r="1.3" stroke="none"/><circle cx="15" cy="6" r="1.3" stroke="none"/><circle cx="19" cy="13" r="1.3" stroke="none"/></svg> },
                { label: 'Five Waves', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1"><polyline points="2,15 5,7 8,13 11,6 14,12 17,5 20,12" fill="none"/><circle cx="2" cy="15" r="1.2" stroke="none"/><circle cx="5" cy="7" r="1.2" stroke="none"/><circle cx="8" cy="13" r="1.2" stroke="none"/><circle cx="11" cy="6" r="1.2" stroke="none"/><circle cx="14" cy="12" r="1.2" stroke="none"/><circle cx="17" cy="5" r="1.2" stroke="none"/><circle cx="20" cy="12" r="1.2" stroke="none"/></svg> },
                { label: 'Eight Waves', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1"><polyline points="2,16 4,9 6,14 8,7 10,13 12,6 14,13 16,7 20,13" fill="none"/><circle cx="2" cy="16" r="1" stroke="none"/><circle cx="6" cy="14" r="1" stroke="none"/><circle cx="10" cy="13" r="1" stroke="none"/><circle cx="14" cy="13" r="1" stroke="none"/><circle cx="20" cy="13" r="1" stroke="none"/></svg> },
                { label: 'Any Waves', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3,14 Q5,8 8,12 Q11,16 14,6 Q17,10 20,8"/><circle cx="3" cy="14" r="1.3" fill="currentColor" stroke="none"/><circle cx="14" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="20" cy="8" r="1.3" fill="currentColor" stroke="none"/></svg> },
              ],
              [
                { label: 'Weak Magnet', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M5,16 L5,10 Q5,4 11,4 Q17,4 17,10 L17,16"/><line x1="3" y1="16" x2="7" y2="16" strokeWidth="1.5"/><line x1="15" y1="16" x2="19" y2="16" strokeWidth="1.5"/></svg> },
                { label: 'Strong Magnet', icon: <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor" stroke="currentColor" strokeLinecap="round"><path d="M5,16 L5,9 Q5,3 11,3 Q17,3 17,9 L17,16" fill="none" strokeWidth="2"/><line x1="3" y1="14" x2="7" y2="14" strokeWidth="2.5"/><line x1="15" y1="14" x2="19" y2="14" strokeWidth="2.5"/><circle cx="5" cy="16" r="2" stroke="none"/><circle cx="17" cy="16" r="2" stroke="none"/></svg> },
              ],
            ];
            const items = subMenuGroups[openSubMenu] || [];
            return (
              <div
                style={{
                  position: 'fixed',
                  top: subMenuPos.top,
                  left: subMenuPos.left,
                  background: '#1a1a2e',
                  border: '1px solid #2a2a44',
                  borderRadius: 4,
                  zIndex: 1000,
                  minWidth: 220,
                  boxShadow: '2px 4px 16px rgba(0,0,0,0.7)',
                  padding: '4px 0',
                }}
                onMouseLeave={() => setOpenSubMenu(null)}
              >
                {items.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '7px 14px', cursor: 'pointer',
                      color: '#c8c8d8', fontSize: 13,
                      fontFamily: "'Roboto Mono', monospace",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#2a2a44'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    onClick={() => setOpenSubMenu(null)}
                  >
                    <span style={{ flexShrink: 0, opacity: 0.85 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Click-outside overlay */}
          {openSubMenu !== null && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setOpenSubMenu(null)} />
          )}

          {/* Tool Buttons 1-6 (with arrow) */}
          {([
            {
              title: 'Lines',
              icon: (
                <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor">
                  <path d="M12.41465,11L18.5,11C18.7761,11,19,11.22386,19,11.5C19,11.77614,18.7761,12,18.5,12L12.41465,12C12.20873,12.5826,11.65311,13,11,13C10.34689,13,9.79127,12.5826,9.58535,12L3.5,12C3.223857,12,3,11.77614,3,11.5C3,11.22386,3.223857,11,3.5,11L9.58535,11C9.79127,10.417404,10.34689,10,11,10C11.65311,10,12.20873,10.417404,12.41465,11Z" strokeOpacity="0" stroke="none"/>
                </svg>
              ),
            },
            {
              title: 'Parallel Lines',
              icon: (
                <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor">
                  <path d="M3.146447,14.178126C2.9511847,13.982826,2.9511847,13.666226,3.146447,13.470926L7.39146,9.225966C7.35417,9.095106,7.33421,8.956946,7.33421,8.814116C7.33421,7.985696,8.00578,7.314116,8.83421,7.314116C8.97703,7.314116,9.11519,7.334086,9.24605,7.371366L13.753,2.864373C13.9483,2.669110,14.2649,2.669110,14.4602,2.864373C14.6554,3.059635,14.6554,3.376217,14.4602,3.571479L10.06916,7.962476C10.23631,8.204386,10.33421,8.497826,10.33421,8.814116C10.33421,9.642546,9.66264,10.314116,8.83421,10.314116C8.51791,10.314116,8.22448,10.216226,7.98256,10.049076L3.853554,14.178126C3.658291,14.373326,3.341709,14.373326,3.146447,14.178126ZM7.67736,19.188526C7.4821,18.993226,7.4821,18.676626,7.67736,18.481426L9.9804,16.178326C9.88669,15.982526,9.83421,15.763226,9.83421,15.531626C9.83421,14.703226,10.50578,14.031626,11.33421,14.031626C11.56579,14.031626,11.78511,14.084126,11.98093,14.177826L13.9804,12.178356C13.8867,11.982536,13.8342,11.763216,13.8342,11.531636C13.8342,10.703206,14.5058,10.031636,15.3342,10.031636C15.5658,10.031636,15.7851,10.084116,15.9809,10.177826L18.284,7.874796C18.4792,7.679536,18.7958,7.679536,18.9911,7.874796C19.1863,8.070056,19.1863,8.386636,18.9911,8.581906L16.688,10.884936C16.7817,11.080756,16.8342,11.300066,16.8342,11.531636C16.8342,12.360066,16.1626,13.031626,15.3342,13.031626C15.1026,13.031626,14.8833,12.979126,14.6875,12.885426L12.68803,14.884926C12.78174,15.080726,12.83421,15.300026,12.83421,15.531626C12.83421,16.360026,12.16264,17.031626,11.33421,17.031626C11.10264,17.031626,10.88333,16.979126,10.68751,16.885426L8.38446,19.188526C8.1892,19.383726,7.87262,19.383726,7.67736,19.188526Z" strokeOpacity="0" stroke="none"/>
                </svg>
              ),
            },
            {
              title: 'Shapes',
              icon: (
                <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor">
                  <ellipse cx="10.5" cy="11.5" rx="1.5" ry="1.5" strokeOpacity="0" stroke="none"/>
                  <ellipse cx="17.5" cy="11.5" rx="1.5" ry="1.5" strokeOpacity="0" stroke="none"/>
                  <ellipse cx="10.5" cy="11.5" rx="7" ry="7" fillOpacity="0" fill="none" strokeOpacity="1" strokeWidth="1" stroke="currentColor"/>
                </svg>
              ),
            },
            {
              title: 'Fibonacci',
              icon: (
                <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor">
                  <path d="M13.1889,6C12.98303,6.5826,12.42741,7,11.7743,7C11.12119,7,10.56557,6.5826,10.35965,6L3.5,6C3.223857,6,3,5.77614,3,5.5C3,5.22386,3.223857,5,3.5,5L10.35965,5C10.56557,4.417404,11.12119,4,11.7743,4C12.42741,4,12.98303,4.417404,13.1889,5L18.5,5C18.7761,5,19,5.22386,19,5.5C19,5.77614,18.7761,6,18.5,6L13.1889,6ZM3,8.5C3,8.22386,3.223857,8,3.5,8L18.5,8C18.7761,8,19,8.22386,19,8.5C19,8.77614,18.7761,9,18.5,9L3.5,9C3.223857,9,3,8.77614,3,8.5ZM3.278549,11.5C3.278549,11.22386,3.502407,11,3.778549,11L18.7785,11C19.0547,11,19.2785,11.22386,19.2785,11.5C19.2785,11.77614,19.0547,12,18.7785,12L3.778549,12C3.502407,12,3.278549,11.77614,3.278549,11.5ZM3.139267,14.5C3.139267,14.2239,3.363124,14,3.639267,14L18.6393,14C18.9154,14,19.1393,14.2239,19.1393,14.5C19.1393,14.7761,18.9154,15,18.6393,15L3.639267,15C3.363124,15,3.139267,14.7761,3.139267,14.5ZM13.1889,18C12.98303,18.5826,12.42741,19,11.7743,19C11.12119,19,10.56557,18.5826,10.35965,18L3.778549,18C3.502407,18,3.278549,17.7761,3.278549,17.5C3.278549,17.2239,3.502407,17,3.778549,17L10.35965,17C10.56557,16.4174,11.12119,16,11.7743,16C12.42741,16,12.98303,16.4174,13.1889,17L18.7785,17C19.0547,17,19.2785,17.2239,19.2785,17.5C19.2785,17.7761,19.0547,18,18.7785,18L13.1889,18Z" strokeOpacity="0" stroke="none"/>
                </svg>
              ),
            },
            {
              title: 'Patterns',
              icon: (
                <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor">
                  <path d="M5.92159,5.93994C6.04014,5.90529,6.15262,5.85639,6.25704,5.79523L9.12729,9.89437C9.04545,10.07959,9,10.28449,9,10.5C9,10.79522,9.08529,11.07053,9.23257,11.30262L4.97573,16.7511L5.92159,5.93994ZM4.92259,5.88484C4.38078,5.65866,4,5.1238,4,4.5C4,3.671573,4.67157,3,5.5,3C6.2157,3,6.81433,3.50124,6.96399,4.17183L15.1309,4.88634C15.3654,4.36387,15.8902,4,16.5,4C17.3284,4,18,4.67157,18,5.5C18,6.08983,17.6596,6.60015,17.1645,6.84518L18.4264,14.0018C18.4508,14.0006,18.4753,14,18.5,14C19.3284,14,20,14.6716,20,15.5C20,16.3284,19.3284,17,18.5,17C17.9325,17,17.4386,16.6849,17.1838,16.22L5.99686,18.5979C5.94643,19.3807,5.29554,20,4.5,20C3.671573,20,3,19.3284,3,18.5C3,17.8693,3.389292,17.3295,3.94071,17.1077L4.92259,5.88484ZM5.72452,17.6334C5.69799,17.596,5.6698,17.5599,5.64004,17.5251L10.01843,11.92103C10.16958,11.97223,10.33155,12,10.5,12C10.80059,12,11.08052,11.91158,11.31522,11.75934L17.0606,15.0765C17.0457,15.1271,17.0335,15.1789,17.0239,15.2317L5.72452,17.6334ZM11.92855,10.95875L17.4349,14.1379L16.1699,6.96356C15.9874,6.92257,15.8174,6.8483,15.6667,6.74746L11.99771,10.4165C11.99923,10.44414,12,10.47198,12,10.5C12,10.66,11.97495,10.81416,11.92855,10.95875ZM10.5,9C10.25983,9,10.03285,9.05644,9.83159,9.15679L7.04919,5.1831L15.0493,5.88302C15.054,5.90072,15.059,5.91829,15.0643,5.93573L11.56066,9.43934C11.28921,9.16789,10.91421,9,10.5,9Z" strokeOpacity="0" fillRule="evenodd" fillOpacity="1"/>
                </svg>
              ),
            },
            {
              title: 'Magnet',
              icon: (
                <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor">
                  <path d="M4.72722,8.00800L9.97385,2.76295C10.16728,2.56968,10.48073,2.56968,10.67417,2.76295L13.22333,5.31176C13.41693,5.50524,13.41693,5.81899,13.22333,6.01247L7.97713,11.25791C7.37986,11.85518,7.40761,12.90940,8.03381,13.53560C8.66041,14.16260,9.71385,14.19000,10.31113,13.59190L15.55693,8.34607C15.75043,8.15253,16.06423,8.15253,16.25763,8.34607L18.80653,10.89527C19.00003,11.08875,19.00003,11.40250,18.80653,11.59598L13.56063,16.84180C11.16562,19.23720,7.19715,19.19920,4.78350,16.78550C2.36984,14.37190,2.33140,10.40342,4.72722,8.00800ZM12.17230,5.66211L10.32381,3.81362L5.42872,8.70910C3.42289,10.71454,3.45500,14.05520,5.48500,16.08480C7.51461,18.11480,10.85529,18.14650,12.86072,16.14110L15.46563,13.53580L14.09093,12.16076L14.79163,11.46044L16.16623,12.83500L17.75583,11.24523L15.90773,9.39674L11.01184,14.29260C10.04281,15.26240,8.41825,15.24380,7.40602,14.30650L7.33310,14.23630C6.32760,13.23080,6.28401,11.55040,7.27642,10.55759L9.88220,7.95203L8.50108,6.57091L9.20179,5.87019L10.58294,7.25134L12.17230,5.66211Z" strokeOpacity="0" fillRule="evenodd" fillOpacity="1"/>
                </svg>
              ),
            },
          ] as { title: string; icon: React.ReactNode }[]).map((tool, idx) => (
            <div
              key={tool.title}
              title={tool.title}
              style={{
                width: '100%', height: 46, display: 'flex', alignItems: 'center',
                justifyContent: 'center', position: 'relative', cursor: 'pointer',
                color: hoveredToolIdx === idx || openSubMenu === idx ? '#ffffff' : '#606070',
                background: openSubMenu === idx ? 'rgba(255,255,255,0.07)' : 'transparent',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={() => setHoveredToolIdx(idx)}
              onMouseLeave={() => setHoveredToolIdx(null)}
              onClick={(e) => {
                if (openSubMenu === idx) { setOpenSubMenu(null); return; }
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                setSubMenuPos({ top: rect.top, left: rect.right + 4 });
                setOpenSubMenu(idx);
              }}
            >
              {tool.icon}
              {(hoveredToolIdx === idx || openSubMenu === idx) && (
                <div style={{ position: 'absolute', right: 2, bottom: 4, lineHeight: 0 }}>
                  <svg viewBox="0 0 4 6" width="5" height="7" fill="#aaaacc">
                    <path d="M1.07298,0.159458C0.827521,-0.0531526,0.429553,-0.0531526,0.184094,0.159458C-0.0613648,0.372068,-0.0613648,0.716778,0.184094,0.929388L2.61275,3.03303L0.260362,5.07061C0.0149035,5.28322,0.0149035,5.62793,0.260362,5.84054C0.505822,6.05315,0.903789,6.05315,1.14925,5.84054L3.81591,3.53075C4.01812,3.3556,4.05374,3.0908,3.92279,2.88406C3.93219,2.73496,3.87113,2.58315,3.73964,2.46925L1.07298,0.159458Z" stroke="none" strokeOpacity="0"/>
                  </svg>
                </div>
              )}
            </div>
          ))}

          {/* Separator */}
          <div style={{ width: '80%', height: 1, background: '#222230', margin: '2px 0', flexShrink: 0 }} />

          {/* Lock */}
          <div
            title="Lock / Unlock"
            style={{ width: '100%', height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: hoveredToolIdx === 6 ? '#ffffff' : '#606070', transition: 'color 0.15s' }}
            onMouseEnter={() => setHoveredToolIdx(6)}
            onMouseLeave={() => setHoveredToolIdx(null)}
          >
            <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor">
              <defs><clipPath id="lbar_lock_clip"><rect x="0" y="0" width="22" height="22" rx="0"/></clipPath></defs>
              <g clipPath="url(#lbar_lock_clip)">
                <path d="M8.38461,9.76923L15.6538,9.76923C16.6538,9.76923,17.4615,10.57692,17.4615,11.57692L17.4615,17.1923C17.4615,18.1923,16.6538,19,15.6538,19L5.80769,19C4.80769,19,4,18.1923,4,17.1923L4,11.57692C4,10.57692,4.80769,9.76923,5.80769,9.76923L7.23077,9.76923L7.23077,7.57692C7.23077,5.61538,8.88462,4,10.88462,4C12.46154,4,13.84615,4.96154,14.3462,6.42308C14.4615,6.73077,14.3077,7.03846,14,7.15385C13.69231,7.26923,13.38461,7.11538,13.26923,6.80769C12.92308,5.80769,11.96154,5.15385,10.88462,5.15385C9.5,5.15385,8.38461,6.23077,8.38461,7.57692L8.38461,9.76923ZM15.6538,17.8462C16,17.8462,16.3077,17.5385,16.3077,17.1923L16.3077,11.57692C16.3077,11.23077,16,10.92308,15.6538,10.92308L5.80769,10.92308C5.46154,10.92308,5.15385,11.23077,5.15385,11.57692L5.15385,17.1923C5.15385,17.5385,5.46154,17.8462,5.80769,17.8462L15.6538,17.8462ZM10.15384,12.65385C10.15384,12.34615,10.42307,12.07692,10.73076,12.07692C11.03846,12.07692,11.30769,12.34615,11.30769,12.65385L11.30769,14.5769C11.30769,14.8846,11.03846,15.1538,10.73076,15.1538C10.42307,15.1538,10.15384,14.8846,10.15384,14.5769L10.15384,12.65385Z" strokeOpacity="0" fillRule="evenodd" fillOpacity="1"/>
              </g>
            </svg>
          </div>

          {/* Eye */}
          <div
            title="Show / Hide"
            style={{ width: '100%', height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: hoveredToolIdx === 7 ? '#ffffff' : '#606070', transition: 'color 0.15s', borderBottom: '1px solid #222230' }}
            onMouseEnter={() => setHoveredToolIdx(7)}
            onMouseLeave={() => setHoveredToolIdx(null)}
          >
            <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor">
              <path d="M11,17C5.80945,17,3.667717,12.85,3.113386,11.575C2.9622047,11.2,2.9622047,10.8,3.113386,10.425C3.667717,9.15,5.80945,5,11,5C16.1654,5,18.3323,9.15,18.8866,10.425C19.0378,10.8,19.0378,11.2,18.8866,11.575C18.3323,12.85,16.1654,17,11,17ZM4.04567,10.8C3.995276,10.925,3.995276,11.05,4.04567,11.175C4.52441,12.325,6.43937,16,11,16C15.5606,16,17.4756,12.325,17.9543,11.2C18.0047,11.075,18.0047,10.95,17.9543,10.825C17.4756,9.675,15.5606,6,11,6C6.43937,6,4.52441,9.675,4.04567,10.8ZM11,13.5C9.61417,13.5,8.48032,12.375,8.48032,11C8.48032,9.625,9.61417,8.5,11,8.5C12.38583,8.5,13.5197,9.625,13.5197,11C13.5197,12.375,12.38583,13.5,11,13.5ZM11,9.5C10.1685,9.5,9.48819,10.175,9.48819,11C9.48819,11.825,10.1685,12.5,11,12.5C11.8315,12.5,12.51181,11.825,12.51181,11C12.51181,10.175,11.8315,9.5,11,9.5Z" strokeOpacity="0" fillOpacity="1"/>
            </svg>
          </div>

          {/* Delete */}
          <div
            title="Delete"
            style={{ width: '100%', height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: hoveredToolIdx === 8 ? '#ffffff' : '#606070', transition: 'color 0.15s' }}
            onMouseEnter={() => setHoveredToolIdx(8)}
            onMouseLeave={() => setHoveredToolIdx(null)}
          >
            <svg viewBox="0 0 22 22" width="22" height="22" fill="currentColor">
              <path d="M16.9669,8.67144C16.6669,8.67144,16.4247,8.91558,16.4247,9.21802L16.4247,16.6315C16.4247,17.322,16.0072,17.9068,15.5139,17.9068L13.93072,17.9068L13.93072,9.2162C13.93072,8.91741,13.68675,8.67144,13.38855,8.67144C13.09036,8.67144,12.84639,8.91741,12.84639,9.21802L12.84639,17.9068L10.15181,17.9068L10.15181,9.21802C10.15181,8.91741,9.90783,8.67144,9.60964,8.67144C9.31145,8.67144,9.06747,8.91741,9.06747,9.21985L9.06747,17.9068L7.48614,17.9068C6.99277,17.9068,6.5753,17.322,6.5753,16.6315L6.5753,9.21802C6.5753,8.91558,6.33313,8.67144,6.03313,8.67144C5.73313,8.67144,5.49096,8.91558,5.49096,9.21802L5.49096,16.6315C5.49096,17.9378,6.38554,19,7.48614,19L15.512,19C16.6127,19,17.509,17.9378,17.509,16.6315L17.509,9.21802C17.509,8.91558,17.2669,8.67144,16.9669,8.67144ZM18.4578,6.21183L4.54217,6.21183C4.24398,6.21183,4,6.45779,4,6.75841C4,7.05903,4.24398,7.30499,4.54217,7.30499L18.4578,7.30499C18.756,7.30499,19,7.05903,19,6.75841C19,6.45779,18.756,6.21183,18.4578,6.21183ZM8.68072,5.10045L14.3193,5.10045C14.6175,5.10045,14.8614,4.852666,14.8614,4.550225C14.8614,4.247783,14.6175,4,14.3193,4L8.68072,4C8.38253,4,8.13855,4.247783,8.13855,4.550225C8.13855,4.852666,8.38253,5.10045,8.68072,5.10045Z" strokeOpacity="0" fillOpacity="1"/>
            </svg>
          </div>
        </div>
        ) : null}