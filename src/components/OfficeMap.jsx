import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import { OFFICE_COORDS, NEPAL_CENTER, NEPAL_BOUNDS } from '../data/officeCoords'

const markerHtml = `
  <div class="office-pin">
    <span class="office-pin__pulse"></span>
    <span class="office-pin__dot"></span>
  </div>
`

const officeIcon = L.divIcon({
  className: 'office-marker',
  html: markerHtml,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

export default function OfficeMap({ offices, onSelect }) {
  const markers = offices
    .map(o => ({ office: o, coords: OFFICE_COORDS[o.shard] }))
    .filter(m => m.coords)

  const missing = offices.length - markers.length

  return (
    <div className="relative">
      <MapContainer
        center={NEPAL_CENTER}
        zoom={7}
        scrollWheelZoom={false}
        minZoom={6}
        maxZoom={12}
        maxBounds={NEPAL_BOUNDS}
        maxBoundsViscosity={1}
        style={{ height: '480px', width: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        {markers.map(({ office, coords }) => (
          <Marker
            key={office.shard}
            position={[coords.lat, coords.lng]}
            icon={officeIcon}
            eventHandlers={{ click: () => onSelect(office) }}
          >
            <Tooltip direction="top" offset={[0, -12]} opacity={1} className="office-tooltip">
              <div className="font-semibold text-slate-900 text-sm">{office.displayName}</div>
              <div className="text-xs text-slate-500">{coords.region}</div>
              <div className="text-xs text-slate-700 mt-0.5 tabular-nums">
                {office.count.toLocaleString()} records
              </div>
              <div className="text-[10px] text-red-600 mt-1 font-medium">Click to search →</div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      {missing > 0 && (
        <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-600 shadow-sm pointer-events-none">
          {missing} office{missing === 1 ? '' : 's'} without mapped coordinates — use the list tab to find them.
        </div>
      )}
    </div>
  )
}
