import React, { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../exbosHome.css";

/* ── MBTA line colours ── */
const LINE_COLOR = { Red: "#DA291C", Green: "#00843D", Orange: "#ED8B00", Blue: "#003DA5" };

/* ── Key MBTA stops to display on the map ── */
const MAP_STOPS = [
  { id:"place-pktrm",  name:"Park Street",         lat:42.3563, lng:-71.0624, lines:["Red","Green"] },
  { id:"place-dwnxg",  name:"Downtown Crossing",    lat:42.3555, lng:-71.0601, lines:["Red","Orange"] },
  { id:"place-state",  name:"State",                lat:42.3589, lng:-71.0577, lines:["Orange","Blue"] },
  { id:"place-gover",  name:"Government Center",    lat:42.3594, lng:-71.0591, lines:["Green","Blue"] },
  { id:"place-north",  name:"North Station",        lat:42.3661, lng:-71.0617, lines:["Orange","Green"] },
  { id:"place-haecl",  name:"Haymarket",            lat:42.3628, lng:-71.0579, lines:["Orange","Green"] },
  { id:"place-coecl",  name:"Copley",               lat:42.3498, lng:-71.0771, lines:["Green"] },
  { id:"place-kencl",  name:"Kenmore",              lat:42.3485, lng:-71.0960, lines:["Green"] },
  { id:"place-harsq",  name:"Harvard",              lat:42.3736, lng:-71.1190, lines:["Red"] },
  { id:"place-knncl",  name:"Kendall/MIT",          lat:42.3625, lng:-71.0862, lines:["Red"] },
  { id:"place-chmnl",  name:"Charles/MGH",          lat:42.3614, lng:-71.0707, lines:["Red"] },
  { id:"place-sstat",  name:"South Station",        lat:42.3519, lng:-71.0553, lines:["Red"] },
  { id:"place-bbsta",  name:"Back Bay",             lat:42.3469, lng:-71.0751, lines:["Orange"] },
  { id:"place-rugg",   name:"Ruggles",              lat:42.3363, lng:-71.0897, lines:["Orange"] },
  { id:"place-mfa",    name:"Museum of Fine Arts",  lat:42.3365, lng:-71.0985, lines:["Green"] },
  { id:"place-aqucl",  name:"Aquarium",             lat:42.3590, lng:-71.0521, lines:["Blue"] },
  { id:"place-aport",  name:"Airport",              lat:42.3737, lng:-71.0302, lines:["Blue"] },
  { id:"place-hymnl",  name:"Hynes Conv. Center",   lat:42.3488, lng:-71.0877, lines:["Green"] },
  { id:"place-nuniv",  name:"Northeastern",         lat:42.3400, lng:-71.0893, lines:["Green"] },
  { id:"place-tumnl",  name:"Tufts Medical",        lat:42.3485, lng:-71.0633, lines:["Orange"] },
];

/* ── Subway line paths (ordered lat/lng for polylines) ── */
const LINE_PATHS = {
  Red: [
    [42.3967,-71.1220],[42.3888,-71.1192],[42.3736,-71.1190],[42.3652,-71.1036],
    [42.3625,-71.0862],[42.3614,-71.0707],[42.3563,-71.0624],[42.3555,-71.0601],
    [42.3519,-71.0553],[42.3427,-71.0568],[42.3306,-71.0571],[42.3202,-71.0522],
  ],
  Green: [
    [42.3698,-71.0765],[42.3665,-71.0688],[42.3661,-71.0617],[42.3628,-71.0579],
    [42.3594,-71.0591],[42.3563,-71.0624],[42.3519,-71.0624],[42.3512,-71.0706],
    [42.3498,-71.0771],[42.3488,-71.0877],[42.3485,-71.0960],[42.3450,-71.1049],
    [42.3416,-71.1099],[42.3325,-71.1180],
  ],
  Orange: [
    [42.4365,-71.0709],[42.4264,-71.0685],[42.4021,-71.0773],[42.3920,-71.0771],
    [42.3836,-71.0763],[42.3729,-71.0694],[42.3661,-71.0617],[42.3628,-71.0579],
    [42.3589,-71.0577],[42.3555,-71.0601],[42.3519,-71.0622],[42.3485,-71.0633],
    [42.3469,-71.0751],[42.3413,-71.0831],[42.3363,-71.0897],[42.3313,-71.0952],
    [42.3233,-71.1005],[42.3178,-71.1044],[42.3104,-71.1074],[42.3004,-71.1136],
  ],
  Blue: [
    [42.4136,-70.9918],[42.4077,-70.9924],[42.3971,-70.9923],[42.3906,-70.9975],
    [42.3859,-71.0047],[42.3791,-71.0226],[42.3737,-71.0302],[42.3693,-71.0397],
    [42.3590,-71.0521],[42.3589,-71.0577],[42.3594,-71.0591],[42.3613,-71.0620],
  ],
};

/* ── Leaflet map component ── */
const MBTAMap = () => (
  <MapContainer
    center={[42.3601, -71.0589]}
    zoom={13}
    style={{ width: "100%", height: "100%" }}
    zoomControl={false}
    scrollWheelZoom={false}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    />
    {/* Draw subway lines */}
    {Object.entries(LINE_PATHS).map(([line, coords]) => (
      <Polyline key={line} positions={coords} color={LINE_COLOR[line]} weight={4} opacity={0.85} />
    ))}
    {/* Draw stops */}
    {MAP_STOPS.map(stop => (
      <CircleMarker
        key={stop.id}
        center={[stop.lat, stop.lng]}
        radius={stop.lines.length > 1 ? 7 : 5}
        fillColor="white"
        color={LINE_COLOR[stop.lines[0]]}
        weight={2.5}
        fillOpacity={1}
      >
        <Popup>
          <strong>{stop.name}</strong><br/>
          {stop.lines.map(l => (
            <span key={l} style={{
              display:"inline-block", background:LINE_COLOR[l], color:"white",
              borderRadius:4, padding:"1px 7px", fontSize:11, marginRight:4
            }}>{l}</span>
          ))}
        </Popup>
      </CircleMarker>
    ))}
  </MapContainer>
);
 
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
            <MBTAMap/>
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
 