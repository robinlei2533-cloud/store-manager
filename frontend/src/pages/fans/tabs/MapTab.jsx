import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, Tag, Button, Spin, Empty, Typography, Space } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
import 'leaflet/dist/leaflet.css';

const { Text } = Typography;

const LVL = {
  S: { label: 'Platinum', icon: '👑', mark: '#B9F2FF' },
  A: { label: 'Gold', icon: '🥇', mark: '#FFD700' },
  B: { label: 'Silver', icon: '🥈', mark: '#C0C0C0' },
  C: { label: 'Bronze', icon: '⚪', mark: '#CD7F32' },
};
const LVL_KEYS = ['S', 'A', 'B', 'C'];

function makePopup(store) {
  const lv = store.level || 'C';
  const cfg = LVL[lv] || LVL.C;
  return '<div style=\"font-family:system-ui,sans-serif;min-width:200px;\">' +
    '<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:6px;\">' +
    '<span style=\"font-size:22px;\">' + cfg.icon + '</span>' +
    '<strong style=\"font-size:14px;color:#1a1a2e;\">' + escapeHtml(store.name) + '</strong></div>' +
    '<div style=\"margin-bottom:6px;\">' +
    '<span style=\"background:' + cfg.mark + ';color:#000;padding:1px 10px;border-radius:8px;font-size:11px;font-weight:bold;\">' +
    cfg.label + ' Store</span></div>' +
    '<div style=\"font-size:12px;color:#666;margin:4px 0;\">\uD83D\uDCDE ' + (store.phone || 'N/A') + '</div>' +
    '<div style=\"margin-top:8px;\">' +
    '<a href=\"https://www.google.com/maps/dir/?api=1&destination=' + store.lat + ',' + store.lng + '\" ' +
    'target=\"_blank\" rel=\"noopener\" ' +
    'style=\"display:inline-block;background:#1677ff;color:white;padding:6px 16px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;\">' +
    '\uD83D\uDDFA\uFE0F Navigate</a>' +
    '<a href=\"' + (store.address || '#') + '\" target=\"_blank\" rel=\"noopener\" ' +
    'style=\"display:inline-block;margin-left:6px;background:#f0f0f0;color:#333;padding:6px 12px;border-radius:6px;text-decoration:none;font-size:12px;\">' +
    '\uD83D\uDCCD Map</a></div></div>';
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;');
}

const MapTab = ({ fan }) => {
  const mapDiv = useRef(null);
  const mapInst = useRef(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState(null);

  // Load stores
  useEffect(() => {
    (async () => {
      if (localDb.needsInit()) {
        const seed = (await import('../../../services/db/seedData')).default;
        localDb.init(seed);
      }
      const list = localDb.all('stores').filter(s => s.lat && s.lng);
      setStores(list);
      setLoading(false);
    })();
  }, []);

  // Draw map
  const drawMap = useCallback(async () => {
    if (!mapDiv.current || stores.length === 0) return;
    if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; }

    const L = await import('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const map = L.map(mapDiv.current, {
      center: [24.7236, 46.6853],
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const filtered = filter ? stores.filter(s => s.level === filter) : stores;
    const markers = [];

    filtered.forEach(store => {
      const lv = store.level || 'C';
      const cfg = LVL[lv] || LVL.C;

      const icon = L.divIcon({
        className: '',
        html: '<div style="' +
          'width:38px;height:38px;background:' + cfg.mark + ';' +
          'border:3px solid ' + (lv === 'A' ? '#FFD700' : lv === 'B' ? '#FFA500' : '#C0C0C0') + ';' +
          'border-radius:50%;display:flex;align-items:center;justify-content:center;' +
          'font-size:15px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.4);' +
          'cursor:pointer;color:#000;' +
        '">' + lv + '</div>',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -22],
      });

      const marker = L.marker([store.lat, store.lng], { icon }).addTo(map);
      marker.bindPopup(makePopup(store), { maxWidth: 280 });
      marker.on('click', () => setSelected(store));
      markers.push(marker);
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.15));
    }

    mapInst.current = map;
  }, [stores, filter]);

  useEffect(() => {
    if (!loading) drawMap();
    return () => { if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; } };
  }, [loading, drawMap]);

  if (loading) {
    return <div style={{display:'flex',justifyContent:'center',padding:60}}><Spin size="large" /></div>;
  }

  if (stores.length === 0) {
    return <Card style={{textAlign:'center',margin:20}}><Empty description="No nearby stores found" /></Card>;
  }

  const counts = {};
  stores.forEach(s => { counts[s.level] = (counts[s.level] || 0) + 1; });

  return (
    <div>
      <div style={{display:'flex',gap:6,padding:'8px 0',flexWrap:'wrap',justifyContent:'center'}}>
        <Button size="small" type={!filter ? 'primary' : 'default'}
          onClick={() => setFilter(null)} style={{borderRadius:20,fontSize:12}}>
          \uD83C\uDFEA All ({stores.length})
        </Button>
        {LVL_KEYS.map(k => (
          <Button key={k} size="small" type={filter === k ? 'primary' : 'default'}
            onClick={() => setFilter(k)}
            style={{
              borderRadius:20, fontSize:12,
              background: filter === k ? LVL[k].mark : undefined,
              borderColor: LVL[k].mark,
              color: filter === k ? '#000' : LVL[k].mark,
              fontWeight: 600,
            }}>
            {k} {LVL[k].label} ({counts[k] || 0})
          </Button>
        ))}
      </div>

      <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:4,fontSize:11,color:'#999'}}>
        {LVL_KEYS.map(k => (
          <span key={k}><span style={{color:LVL[k].mark}}>●</span> {LVL[k].label}</span>
        ))}
      </div>

      <div style={{borderRadius:12,overflow:'hidden',border:'1px solid #2a2a35'}}>
        <div ref={mapDiv} style={{width:'100%',height:400}} />
      </div>

      {selected && (
        <Card size="small" style={{marginTop:10,background:'#1a1a25',borderColor:'#2a2a35'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
            <div>
              <Space>
                <span style={{fontSize:20}}>{LVL[selected.level]?.icon || '\uD83C\uDFEA'}</span>
                <Text strong style={{color:'#e5e5e5',fontSize:14}}>{selected.name}</Text>
                <Tag color={LVL[selected.level]?.mark} style={{color:'#000',fontWeight:600}}>
                  {LVL[selected.level]?.label}
                </Tag>
              </Space>
              <div style={{fontSize:12,color:'#888',marginTop:4}}>
                \uD83D\uDCDE {selected.phone || 'N/A'}
              </div>
            </div>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
               target="_blank" rel="noopener noreferrer">
              <Button type="primary" icon={<EnvironmentOutlined />} size="small">Navigate</Button>
            </a>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MapTab;
