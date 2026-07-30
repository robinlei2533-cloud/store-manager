import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, Button, Spin, Empty, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
import { getFanSafeStores } from '../../../services/api/stores';
import { getFanFacingStorePresentation, getStoreExposureScore, sortStoresForFanExposure } from '../../../utils/uwellLaunchRules';
import useLanguageStore from '../../../stores/languageStore';
import 'leaflet/dist/leaflet.css';

const { Text } = Typography;

const LVL = {
  S: { labelKey: 'fan_real_store_brand_store', className: 'is-s' },
  A: { labelKey: 'fan_real_store_recommended', className: 'is-a' },
  B: { labelKey: 'fan_real_store_listed', className: 'is-b' },
  C: { labelKey: 'fan_real_store_listed', className: 'is-c' },
};
const LVL_KEYS = ['S', 'A', 'B', 'C'];
const STOREFRONT_CATEGORY = { key: 'store_front_photo', labelKey: 'fan_real_storefront_photo', noteKey: 'fan_real_storefront_note' };
const STORE_HERO_VISUAL = '/uwell-assets/fan-refresh-v2/store-hero.jpg';
const STORE_DETAIL_VISUAL = '/uwell-assets/fan-refresh-v2/store-detail.jpg';
const STORE_FALLBACK_VISUALS = {
  S: '/uwell-assets/fan-refresh-v2/store-s.jpg',
  A: '/uwell-assets/fan-refresh-v2/store-a.jpg',
  B: '/uwell-assets/fan-refresh-v2/store-b.jpg',
  C: '/uwell-assets/fan-refresh-v2/store-c.jpg',
};
const STORE_VISUAL_SEQUENCE = [
  '/uwell-assets/fan-refresh-v2/store-s.jpg',
  '/uwell-assets/fan-refresh-v2/store-a.jpg',
  '/uwell-assets/fan-refresh-v2/store-b.jpg',
  '/uwell-assets/fan-refresh-v2/store-gallery.jpg',
];

function localizeStorePresentation(presentation, t) {
  const copyKeys = {
    'UWELL Brand Store': 'fan_real_store_brand_store',
    'Official UWELL brand experience and premium reward pickup readiness.': 'fan_real_store_brand_experience',
    'Premium pickup ready': 'fan_real_store_premium_pickup_ready',
    'Recommended UWELL partner': 'fan_real_store_recommended_partner',
    'Reviewed UWELL partner with reward pickup readiness.': 'fan_real_store_reviewed_pickup',
    'Pickup eligible': 'fan_real_pickup_eligible',
    'UWELL partner store': 'fan_real_store_partner_store',
    'Visible UWELL partner for store visits and product support.': 'fan_real_store_visible_partner',
    'Partner store': 'fan_real_store_partner_pickup',
  };
  return {
    ...presentation,
    fanLabel: t(copyKeys[presentation.fanLabel], presentation.fanLabel),
    trustCopy: t(copyKeys[presentation.trustCopy], presentation.trustCopy),
    pickupLabel: t(copyKeys[presentation.pickupLabel], presentation.pickupLabel),
  };
}

function getStoreVisual(store, index, selectedDisplays = []) {
  const approvedFront = selectedDisplays.find((item) => item.category === STOREFRONT_CATEGORY.key);
  if (approvedFront?.image_url) return approvedFront.image_url;
  const level = store?.level || 'C';
  return STORE_FALLBACK_VISUALS[level] || STORE_VISUAL_SEQUENCE[Math.min(index, STORE_VISUAL_SEQUENCE.length - 1)];
}

function makePopup(store, t) {
  const lv = store.level || 'C';
  const cfg = LVL[lv] || LVL.C;
  const exposure_controls = store.exposure_controls || {};
  const presentation = localizeStorePresentation(getFanFacingStorePresentation(store), t);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
  const mapUrl = store.address?.startsWith('http')
    ? store.address
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address || store.name || '')}`;

  return `
    <div class="fan-map-popup">
      <div class="fan-map-popup-head">
        <span class="fan-map-popup-level ${cfg.className}">${lv}</span>
        <strong>${escapeHtml(store.name)}</strong>
      </div>
      <div class="fan-map-popup-label-row">
        <span class="fan-map-popup-label ${cfg.className}">${presentation.fanLabel}</span>
      </div>
      <div class="fan-map-popup-trust">${presentation.trustCopy}</div>
      <div class="fan-map-popup-muted">${t('fan_real_phone')}: ${escapeHtml(store.phone || t('fan_real_not_available'))}</div>
      ${exposure_controls.fan_map_highlighted ? `<div class="fan-map-popup-active">${t('fan_real_map_highlighted_ops')}</div>` : ''}
      ${exposure_controls.reward_pickup_recommended ? `<div class="fan-map-popup-pickup">${presentation.pickupLabel}</div>` : ''}
      <div class="fan-map-popup-actions">
        <a class="fan-map-popup-primary" href="${directionsUrl}" target="_blank" rel="noopener">${t('fan_real_navigate')}</a>
        <a class="fan-map-popup-secondary" href="${mapUrl}" target="_blank" rel="noopener">${t('fan_real_map_label')}</a>
      </div>
    </div>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const MapTab = ({ fan: _fan }) => {
  const { t } = useLanguageStore();
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
      const list = sortStoresForFanExposure(await getFanSafeStores());
      setStores(list);
      setLoading(false);
    })();
  }, []);

  // Draw map
  const drawMap = useCallback(async () => {
    if (!mapDiv.current || stores.length === 0) return;
    if (mapInst.current) {
      try {
        mapInst.current.off();
        mapInst.current.remove();
      } catch {
        // Leaflet can throw during rapid route teardown while tiles are still loading.
      }
      mapInst.current = null;
    }

    const L = await import('leaflet');
    if (!mapDiv.current?.isConnected) return;
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
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
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
      const exposure_controls = store.exposure_controls || {};
      const exposureScore = getStoreExposureScore(store);

      const icon = L.divIcon({
        className: `fan-map-marker-wrap ${cfg.className}${exposure_controls.fan_map_highlighted ? ' is-highlighted' : ''}`,
        html: '<div class="fan-map-marker" title="' + t('fan_real_exposure_score') + ' ' + exposureScore + '">' + lv + '</div>',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -22],
      });

      const marker = L.marker([store.lat, store.lng], { icon }).addTo(map);
      marker.bindPopup(makePopup(store, t), { maxWidth: 280 });
      marker.on('click', () => setSelected(store));
      markers.push(marker);
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.15));
    }

    mapInst.current = map;
  }, [stores, filter, t]);

  useEffect(() => {
    if (!loading) drawMap();
    return () => {
      if (!mapInst.current) return;
      try {
        mapInst.current.off();
        mapInst.current.remove();
      } catch {
        // Ignore teardown races from Leaflet internals.
      }
      mapInst.current = null;
    };
  }, [loading, drawMap]);

  if (loading) {
    return <div className="fan-map-loading"><Spin size="large" /></div>;
  }

  if (stores.length === 0) {
    return <div className="fan-map-page"><Card className="fan-map-empty-card"><Empty description={t('fan_real_map_empty')} /></Card></div>;
  }

  const counts = {};
  stores.forEach(s => { counts[s.level] = (counts[s.level] || 0) + 1; });
  const selectedDisplays = selected
    ? (localDb.find('store_display_uploads', (item) => item.store_id === selected.id && item.status === 'approved') || [])
    : [];
  const selectedExposure = selected?.exposure_controls || {};
  const selectedPresentation = selected ? localizeStorePresentation(getFanFacingStorePresentation(selected), t) : null;
  const selectedMedia = selected ? getStoreVisual(selected, 0, selectedDisplays) : null;
  const selectedGallery = selectedDisplays.slice(0, 2);
  const selectedGalleryFallback = [
    STORE_DETAIL_VISUAL,
    STORE_VISUAL_SEQUENCE[3],
  ];
  const selectedGalleryItems = [
    ...selectedGallery,
    ...selectedGalleryFallback
      .slice(0, Math.max(0, 2 - selectedGallery.length))
      .map((imageUrl, index) => ({
        id: `fallback-store-gallery-${index}`,
        image_url: imageUrl,
      })),
  ].slice(0, 2);

  return (
    <div className="fan-map-page">
      <section className="fan-map-hero">
        <div className="fan-map-hero-copy">
          <span className="fan-mini-label">{t('fan_real_store_map_label')}</span>
          <h2>{t('fan_real_store_map_title')}</h2>
        </div>
        <div className="fan-map-hero-visual">
          <img src={STORE_HERO_VISUAL} alt="UWELL store discovery visual" loading="lazy" />
          <div className="fan-map-hero-score">
            <strong>{stores.length}</strong>
            <span>{t('fan_real_visible_stores')}</span>
          </div>
        </div>
      </section>

      <div className="fan-map-filter-row">
        <Button className={`fan-map-filter-btn ${!filter ? 'is-active' : ''}`} aria-pressed={!filter}
          onClick={() => setFilter(null)}>
          {t('fan_real_all')} ({stores.length})
        </Button>
        {LVL_KEYS.map(k => (
          <Button key={k} className={`fan-map-filter-btn ${filter === k ? 'is-active' : ''}`} aria-pressed={filter === k}
            onClick={() => setFilter(k)}>
            {k} {t(LVL[k].labelKey)} ({counts[k] || 0})
          </Button>
        ))}
      </div>

      <div className="fan-map-legend">
        <span>{t('fan_real_map_unavailable_hidden')}</span>
        {LVL_KEYS.map(k => (
          <span key={k}><span className="fan-map-legend-dot" /> {t(LVL[k].labelKey)}</span>
        ))}
      </div>

      <div className="fan-map-canvas liquid-glass">
        <div ref={mapDiv} className="fan-map-canvas-inner" />
      </div>

      {selected && (
        <Card size="small" className="fan-map-detail-card liquid-glass">
          <div className="fan-map-detail-head">
            <div>
              <div className="fan-map-store-title">
                <span className="fan-map-level-chip">{selected.level || 'C'}</span>
                <Text strong>{selected.name}</Text>
                <span className="fan-map-trust-chip">{selectedPresentation.fanLabel}</span>
              </div>
              <div className="fan-map-store-phone">
                {t('fan_real_phone')}: {selected.phone || t('fan_real_not_available')}
              </div>
              <div className="fan-map-photo-note">{selectedPresentation.trustCopy}</div>
              <div className="fan-map-trust-row">
                {selectedExposure.fan_map_highlighted && <span className="fan-map-trust-chip">{t('fan_real_map_highlighted')}</span>}
                {selectedExposure.reward_pickup_recommended && <span className="fan-map-trust-chip">{selectedPresentation.pickupLabel}</span>}
              </div>
            </div>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
               target="_blank" rel="noopener noreferrer">
              <Button className="fan-map-navigate-button" type="primary" icon={<EnvironmentOutlined />}>{t('fan_real_navigate')}</Button>
            </a>
          </div>
          <div className="fan-map-photo-sections">
            <div className="fan-map-store-media">
              <img src={selectedMedia} alt={selected?.name || t('fan_real_storefront_photo')} loading="lazy" />
            </div>
            <div className="fan-map-trust-strip">
              <span>{selectedPresentation.fanLabel}</span>
              <span>{selectedPresentation.trustCopy}</span>
              <span>{selectedExposure.fan_map_highlighted ? t('fan_real_map_highlighted') : t('fan_real_storefront_pending')}</span>
            </div>
            <div className="fan-map-photo-grid">
              {selectedGalleryItems.map((item) => (
                <div key={item.id} className="fan-map-gallery-tile">
                  <img src={item.image_url} alt={t('fan_real_storefront_photo')} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MapTab;
