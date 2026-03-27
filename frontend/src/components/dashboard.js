import React, { useState } from "react";
import "../exbosHome.css";
 
/* ── SVG Icons ── */
const IcoSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IcoArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IcoBack = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IcoPin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const IcoTransit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003DA5" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
  </svg>
);
const IcoGps = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>
);
 
/* ── Boston Subway Map ── */
const BostonMap = () => (
  <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="300" fill="#E8EDF4"/>
    {/* Water */}
    <path d="M375 0 Q415 40 445 80 Q475 120 495 160 Q515 200 535 250 L600 250 L600 0Z" fill="#C5D8F0" opacity=".7"/>
    <path d="M0 215 Q50 200 100 205 Q145 210 170 220 L170 300 L0 300Z" fill="#C5D8F0" opacity=".5"/>
    {/* Road grid */}
    <line x1="0" y1="148" x2="600" y2="148" stroke="white" strokeWidth="3.5" opacity=".55"/>
    <line x1="215" y1="0"  x2="265" y2="300" stroke="white" strokeWidth="3.5" opacity=".55"/>
    <line x1="0"   y1="88" x2="600" y2="208" stroke="white" strokeWidth="2.5" opacity=".4"/>
    {[60,120,170,310,370,430,490].map(x=>(
      <line key={x} x1={x} y1="0" x2={x+15} y2="300" stroke="white" strokeWidth="1" opacity=".25"/>
    ))}
    {[40,90,180,230].map(y=>(
      <line key={y} x1="0" y1={y} x2="600" y2={y+15} stroke="white" strokeWidth="1" opacity=".25"/>
    ))}
    {/* Green Line */}
    <path d="M38 157 Q88 152 143 147 Q193 142 243 145 Q283 146 313 143 Q353 140 383 135" stroke="#00843D" strokeWidth="5" fill="none" strokeLinecap="round"/>
    {/* Red Line */}
    <path d="M68 208 Q123 193 173 173 Q213 155 256 148 Q296 144 336 136 Q366 130 398 118" stroke="#DA291C" strokeWidth="5" fill="none" strokeLinecap="round"/>
    {/* Orange Line */}
    <path d="M213 258 Q220 228 223 198 Q226 166 224 146 Q222 121 219 96 Q216 71 211 46" stroke="#ED8B00" strokeWidth="5" fill="none" strokeLinecap="round"/>
    {/* Blue Line */}
    <path d="M256 146 Q286 135 313 121 Q340 107 365 96 Q390 86 420 81" stroke="#003DA5" strokeWidth="5" fill="none" strokeLinecap="round"/>
 
    {/* Park Street stop (white circle) */}
    <circle cx="256" cy="146" r="7" fill="white" stroke="#444" strokeWidth="2"/>
    <rect x="266" y="156" width="80" height="20" rx="4" fill="white" stroke="#ddd" strokeWidth="1"/>
    <text x="306" y="170" fontSize="10" fontWeight="bold" fill="#333" fontFamily="sans-serif" textAnchor="middle">Park Street</text>
 
    {/* Downtown Crossing */}
    <circle cx="283" cy="136" r="9" fill="#DA291C" stroke="white" strokeWidth="2.5"/>
    <circle cx="283" cy="136" r="4" fill="white"/>
    <text x="296" y="129" fontSize="10" fontWeight="bold" fill="#1A2332" fontFamily="sans-serif">Downtown Crossing</text>
 
    {/* Green B markers */}
    <circle cx="196" cy="149" r="8" fill="#00843D" stroke="white" strokeWidth="2"/>
    <text x="192" y="153" fontSize="9" fontWeight="bold" fill="white" fontFamily="sans-serif">B</text>
    <circle cx="235" cy="164" r="8" fill="#00843D" stroke="white" strokeWidth="2"/>
    <text x="231" y="168" fontSize="9" fontWeight="bold" fill="white" fontFamily="sans-serif">B</text>
 
    {/* Purple pill */}
    <rect x="197" y="140" width="38" height="14" rx="3" fill="#6B5EA8"/>
    <text x="216" y="150" fontSize="7.5" fill="white" fontFamily="sans-serif" textAnchor="middle">Purplegate</text>
 
    {/* A station */}
    <circle cx="246" cy="152" r="8" fill="#666" stroke="white" strokeWidth="2"/>
    <text x="242" y="156" fontSize="9" fontWeight="bold" fill="white" fontFamily="sans-serif">A</text>
 
    {/* Transfer dot */}
    <circle cx="256" cy="146" r="3.5" fill="#333"/>
 
    {/* Line legend */}
    <rect x="10" y="272" width="205" height="22" rx="6" fill="white" opacity=".85"/>
    {[["#DA291C","Red"],["#00843D","Green"],["#ED8B00","Orange"],["#003DA5","Blue"]].map(([c,l],i)=>(
      <g key={l}>
        <circle cx={20+i*51} cy="283" r="5" fill={c}/>
        <text x={28+i*51} y="287" fontSize="8" fill="#333" fontFamily="sans-serif">{l}</text>
      </g>
    ))}
  </svg>
);
 
/* ════════════════════════════
   DASHBOARD
════════════════════════════ */
const Dashboard = () => {
  const [dest, setDest] = useState("");
 
  return (
    <div className="eb-main">
 
      {/* ══ LEFT ══ */}
      <div className="eb-left">
 
        {/* Hero */}
        <div className="eb-hero">
          <h1>Navigate &amp; Explore<br/>Boston with Ease</h1>
          <p>Find the best transit routes, discover nearby attractions, and see real-time subway updates all in one place.</p>
        </div>
 
        {/* Search */}
        <div className="eb-search">
          <div className="eb-srow">
            <span className="eb-sicon"><IcoSearch/></span>
            <input
              type="text"
              placeholder="Where are you going?"
              value={dest}
              onChange={e => setDest(e.target.value)}
            />
            <span className="eb-gpspill"><IcoGps/> GPS</span>
            <button className="eb-gobtn"><IcoArrow/></button>
          </div>
          <div className="eb-srow">
            <span className="eb-ticon"><IcoTransit/></span>
            <input type="text" defaultValue="355 Congress St." readOnly style={{color:"#6B7280",cursor:"default"}}/>
            <span className="eb-sicon"><IcoBack/></span>
          </div>
        </div>
 
        {/* Next Train */}
        <div className="eb-train">
          <div>
            <div className="eb-train-lbl">NEXT ARRIVAL</div>
            <div className="eb-train-row">
              <span className="eb-lbadge">
                <span className="eb-ldot" style={{background:"#DA291C"}}/>
                3 Red
              </span>
              <span className="eb-ttime">3 <span className="eb-tunit">mins</span></span>
            </div>
            <div className="eb-chips">
              <span className="eb-chip"><span className="eb-adot"/>36 Mass Ave Alerts</span>
              <span className="eb-chip">⏱ 3 mins</span>
            </div>
          </div>
          <div className="eb-eta">
            <span className="eb-eta-n">3</span>
            <span className="eb-eta-u">mins</span>
          </div>
        </div>
 
        {/* Featured Destinations */}
        <div className="eb-featured">
          <div className="eb-shdr">
            <h3>Featured Destinations</h3>
            <span className="eb-abadge">3 Service Alerts</span>
          </div>
 
          <div className="eb-dgrid">
            {/* Quincy Market */}
            <div className="eb-dcard">
              <div className="eb-dimg eb-d1">🏛️</div>
              <div className="eb-dbody">
                <div className="eb-dname">Quincy Market</div>
                <div className="eb-dmeta">
                  <span className="eb-tag eb-tr">O</span>
                  <span className="eb-tag eb-tb" style={{fontSize:9}}>10</span>
                  <span className="eb-tag eb-tk" style={{fontSize:9}}>88</span>
                  <span className="eb-dmin">9</span>
                </div>
                <div className="eb-dmeta">
                  <span className="eb-stars">★★★★</span>
                  <span className="eb-rnum">4.5</span>
                </div>
              </div>
            </div>
 
            {/* Museum of Fine Arts */}
            <div className="eb-dcard">
              <div className="eb-dimg eb-d2">🎨</div>
              <div className="eb-dbody">
                <div className="eb-dname">Museum of<br/>Fine Arts</div>
                <div className="eb-dmeta">
                  <span className="eb-tag eb-tg" style={{fontSize:9}}>Green D</span>
                  <span className="eb-dmin">18 min</span>
                </div>
                <div className="eb-dmeta">
                  <span className="eb-stars">★★★★</span>
                  <span className="eb-rnum">4.6</span>
                </div>
              </div>
            </div>
 
            {/* Boston Common */}
            <div className="eb-dcard">
              <div className="eb-dimg eb-d3">🌳</div>
              <div className="eb-dbody">
                <div className="eb-dname">Boston Common</div>
                <div className="eb-dmeta">
                  <span className="eb-tag eb-tr">Red</span>
                  <span className="eb-dmin">6 min</span>
                </div>
                <div className="eb-dmeta">
                  <span className="eb-stars">★★★★</span>
                  <span className="eb-rnum">4.5</span>
                </div>
              </div>
            </div>
 
            {/* Fenway Park */}
            <div className="eb-dcard">
              <div className="eb-dimg eb-d4">⚾</div>
              <div className="eb-dbody">
                <div className="eb-dname">Fenway Park</div>
                <div className="eb-dmeta">
                  <span className="eb-tag eb-tg" style={{fontSize:9}}>Green D</span>
                </div>
                <div className="eb-dmeta">
                  <span className="eb-stars">★★★★</span>
                  <span className="eb-rnum">4.5</span>
                </div>
              </div>
            </div>
          </div>
 
          <button className="eb-expbtn"><IcoPin/> Explore Attractions on Map</button>
        </div>
      </div>
 
      {/* ══ RIGHT ══ */}
      <div className="eb-right">
        <div className="eb-mapcard">
 
          {/* Map */}
          <div className="eb-mapwrap">
            <BostonMap/>
            <div className="eb-mapctrls">
              <button className="eb-mapbtn">+</button>
              <button className="eb-mapbtn">−</button>
            </div>
          </div>
 
          {/* Suggested Places */}
          <div className="eb-suggested">
            <div className="eb-shdr">
              <p className="eb-suglbl">
                Suggested Places near <strong>Downtown Crossing</strong>
              </p>
              <a href="#" className="eb-slink">See all ›</a>
            </div>
            <div className="eb-pgrid">
              <div className="eb-pcard">
                <div className="eb-pimg eb-p1">🍸</div>
                <div className="eb-pbody">
                  <div className="eb-pname">Raines Law Room</div>
                  <div className="eb-ptype">Cocktail Bar</div>
                  <div className="eb-pmeta"><span className="eb-stars">★★★★</span><span>7 min</span></div>
                </div>
              </div>
              <div className="eb-pcard">
                <div className="eb-pimg eb-p2">📚</div>
                <div className="eb-pbody">
                  <div className="eb-pname">Brattle Book Shop</div>
                  <div className="eb-ptype">Bookstore</div>
                  <div className="eb-pmeta"><span className="eb-stars">★★★</span><span className="eb-open">Open Now</span></div>
                </div>
              </div>
              <div className="eb-pcard">
                <div className="eb-pimg eb-p3">🌸</div>
                <div className="eb-pbody">
                  <div className="eb-pname">Boston Public Garden</div>
                  <div className="eb-ptype">Park</div>
                  <div className="eb-pmeta"><span className="eb-stars">★★★★</span><span>4.5</span></div>
                </div>
              </div>
            </div>
          </div>
 
        </div>
      </div>
    </div>
  );
};
 
export default Dashboard;
 