import React, { useState, useEffect, useRef, useCallback } from 'react';
import { message, Button, Typography, Input, Empty, Modal, Spin, Alert, Tag } from 'antd';
import { QrcodeOutlined, CameraOutlined, ScanOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
import { addFanPoints } from '../../../services/api';
import { OPERATIONAL_RULE_RECORD_ID, classifyScanResult, mergeOperationalRules } from '../../../utils/uwellLaunchRules';
import useLanguageStore from '../../../stores/languageStore';

const { Title, Paragraph, Text } = Typography;

const QrScannerModal = ({ open, onClose, onScanResult, scanLimitReached, initialManual = false, t }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [useManual, setUseManual] = useState(false);
  const animRef = useRef(null);
  const detectedRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    setCameraError(null);
    detectedRef.current = false;
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setDetecting(false);
    detectedRef.current = false;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(t('fan_real_scan_camera_unavailable'));
      }
      const stream = await navigator.mediaDevices?.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(t('fan_real_scan_camera_denied'));
      setUseManual(true);
    }
  }, [t]);

  useEffect(() => {
    if (open) {
      setManualCode('');
      setCameraError(null);
      setUseManual(Boolean(initialManual));
      if (initialManual || scanLimitReached) return;
      if ('BarcodeDetector' in window) {
        startCamera();
      } else {
        setCameraError(t('fan_real_scan_not_supported'));
        setUseManual(true);
      }
    } else {
      stopCamera();
      setUseManual(false);
      setManualCode('');
      setCameraError(null);
    }
    return () => stopCamera();
  }, [open, initialManual, scanLimitReached, startCamera, stopCamera, t]);

  // Detection loop
  useEffect(() => {
    if (!cameraReady || !videoRef.current || detectedRef.current) return;

    const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
    let running = true;

    const detect = async () => {
      if (!running || detectedRef.current) return;
      try {
        const barcodes = await barcodeDetector.detect(videoRef.current);
        for (const barcode of barcodes) {
          if (barcode.rawValue && !detectedRef.current) {
            detectedRef.current = true;
            onScanResult(barcode.rawValue);
            return;
          }
        }
      } catch (_e) {
        // detection frame error, retry
      }
      if (running) { animRef.current = requestAnimationFrame(detect); }
    };

    detect();
    return () => { running = false; if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [cameraReady, onScanResult]);

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScanResult(manualCode.trim());
    }
  };

  return (
    <Modal
      className="fan-scan-modal"
      rootClassName="fan-scan-modal-root"
      title={<span className="fan-scan-modal-title"><ScanOutlined /> {t('fan_real_scan_modal_title')}</span>}
      open={open}
      onCancel={() => { stopCamera(); onClose(); }}
      footer={null}
      width={400}
      destroyOnHidden
    >
      {scanLimitReached && !useManual ? (
        <div className="fan-scan-limit">
          <Text>{t('fan_real_daily_limit')}</Text>
          <Paragraph>{t('fan_real_scan_limit_note')}</Paragraph>
          <Button onClick={() => setUseManual(true)}>{t('fan_real_enter_code')}</Button>
        </div>
      ) : (
        <div>
          {!useManual ? (
            <div>
              <Alert
                title={t('fan_real_use_camera')}
                description={t('fan_real_scan_camera_desc')}
                type="info"
                showIcon
                className="fan-scan-camera-alert"
              />
              {cameraError && (
                <Alert title={cameraError} type="warning" showIcon className="fan-scan-camera-alert" />
              )}
              <div className="fan-scan-camera-viewport">
                <video
                  ref={videoRef}
                  className="fan-scan-camera-video"
                  muted playsInline
                />
                {!cameraReady && !cameraError && (
                  <Spin size="large" className="fan-scan-camera-spinner" />
                )}
                <div className="fan-scan-frame" aria-hidden="true">
                  <div className="fan-scan-corner is-top-left" />
                  <div className="fan-scan-corner is-top-right" />
                  <div className="fan-scan-corner is-bottom-left" />
                  <div className="fan-scan-corner is-bottom-right" />
                </div>
                {detecting && (
                  <div className="fan-scan-detecting">
                    <Spin />
                  </div>
                )}
              </div>
              <div className="fan-scan-manual-link-row">
                <Button type="link" onClick={() => { stopCamera(); setUseManual(true); }} className="fan-scan-manual-link">
                  {t('fan_real_enter_code')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="fan-scan-manual-panel">
              <Paragraph className="fan-scan-manual-copy">
                {t('fan_real_scan_manual_copy')}
              </Paragraph>
              <Input
                size="large"
                placeholder="e.g. UWELL-G4-XXXXXXXX"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                className="fan-scan-manual-input"
                onPressEnter={handleManualSubmit}
              />
              <Button type="primary" block size="large" onClick={handleManualSubmit}
                disabled={!manualCode.trim()}
                className="fan-scan-submit">
                {t('fan_real_scan_submit_code')}
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

const ScanTab = ({ fan, onPointsChange }) => {
  const { t } = useLanguageStore();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState('camera');
  const [scanning, setScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);

  // Load scan records from localDb directly
  const [scanRecords, setScanRecords] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const records = localDb.all('scan_records') || [];
    setScanRecords(records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  }, [refreshKey]);

  const todayStr = new Date().toISOString().split('T')[0];
  const operationalRules = mergeOperationalRules(localDb.findById('fan_points_rules', OPERATIONAL_RULE_RECORD_ID)?.settings);
  const myScans = scanRecords.filter((s) => s.fan_id === fan?.id);
  const todayCountedProductScans = myScans.filter((s) => {
    const date = s.created_at ? String(s.created_at) : '';
    return date.startsWith(todayStr)
      && s.code_type === 'product_unique'
      && Number(s.points_earned || 0) > 0;
  }).length;
  const scanLimit = operationalRules.dailyScanLimit;
  const scansRemaining = Math.max(0, scanLimit - todayCountedProductScans);
  const scanProgress = scanLimit > 0 ? Math.min(100, Math.round((todayCountedProductScans / scanLimit) * 100)) : 100;
  const openScanner = (mode = 'camera') => {
    setScannerMode(mode);
    setScannerOpen(true);
  };
  const formatScanStatus = (status) => String(status || 'recognized_no_points').replaceAll('_', ' ');
  const scanCodeClasses = [
    {
      title: t('fan_real_scan_product_unique'),
      type: 'product_unique',
      desc: `${t('fan_real_scan_desc')} +${operationalRules.scanPoints} ${t('fan_real_points_unit')}, max ${operationalRules.dailyScanLimit}/day.`,
      tone: 'primary',
    },
    {
      title: t('fan_real_scan_store_event'),
      type: 'store_event',
      desc: t('fan_real_scan_store_event_desc'),
      tone: 'store',
    },
    {
      title: t('fan_real_scan_activity_code'),
      type: 'official_activity',
      desc: t('fan_real_scan_activity_desc'),
      tone: 'activity',
    },
    {
      title: t('fan_real_scan_entry_code'),
      type: 'fan_center_entry',
      desc: t('fan_real_scan_entry_desc'),
      tone: 'entry',
    },
    {
      title: t('fan_real_scan_non_uwell'),
      type: 'not_uwell',
      desc: t('fan_real_scan_non_uwell_desc'),
      tone: 'blocked',
    },
  ];

  const resolveUwellCode = (rawCode) => {
    const code = String(rawCode || '').trim();
    const normalized = code.toUpperCase();
    const allQrCodes = localDb.all('qr_codes') || [];
    const matchedQr = allQrCodes.find(q => String(q.code || '').toUpperCase() === normalized || String(q.id || '').toUpperCase() === normalized);
    if (matchedQr?.is_active === false) {
      return { code, codeType: 'inactive_product', matchedQr };
    }
    if (matchedQr) {
      return { code, codeType: matchedQr.code_type || 'product_unique', matchedQr };
    }
    if (/^UWELL-(G4|G5|CALIBURN|KOKO|POD|PRODUCT)-[A-Z0-9-]{4,}$/.test(normalized)) {
      return { code, codeType: 'product_unique', matchedQr: null };
    }
    if (/^(UWELL-)?STORE-EVENT-[A-Z0-9-]{3,}$/.test(normalized)) {
      return { code, codeType: 'store_event', matchedQr: null };
    }
    if (/^(UWELL-)?(OFFICIAL-)?ACTIVITY-[A-Z0-9-]{3,}$/.test(normalized)) {
      return { code, codeType: 'official_activity', matchedQr: null };
    }
    if (/^(UWELL-)?FAN-CENTER(-ENTRY)?/.test(normalized)) {
      return { code, codeType: 'fan_center_entry', matchedQr: null };
    }
    if (/UWELL|ELUXTECH/.test(normalized) && /HTTPS?:\/\/|WWW\.|\.COM|INSTAGRAM|TIKTOK|WHATSAPP|COMMUNITY/.test(normalized)) {
      return { code, codeType: 'social_community', matchedQr: null };
    }
    return { code, codeType: 'not_uwell', matchedQr: null };
  };

  const handleScanResult = async (code) => {
    setScannerOpen(false);
    if (!code) return;
    setScanning(true);
    try {
      const resolved = resolveUwellCode(code);
      const scanKey = resolved.matchedQr?.id || resolved.code;
      const existingScans = localDb.all('scan_records') || [];
      const previousClaim = existingScans.find((record) => {
        const sameCode = record.qr_code_id === scanKey || String(record.scanned_code || '').toUpperCase() === resolved.code.toUpperCase();
        if (!sameCode) return false;
        if (resolved.codeType !== 'product_unique') return true;
        return Number(record.points_earned || 0) > 0 || record.validation_mode === 'trial_admin_code_library';
      });
      let scanDecision = classifyScanResult({
        codeType: resolved.codeType,
        alreadyClaimed: Boolean(previousClaim),
        claimedByCurrentFan: previousClaim?.fan_id === fan?.id,
        scansToday: todayCountedProductScans,
        hasServerValidation: Boolean(resolved.matchedQr),
        ruleSettings: operationalRules,
      });

      if (resolved.codeType === 'inactive_product') {
        scanDecision.status = 'suspicious';
        scanDecision.message = t('fan_real_scan_inactive_code');
      }

      const record = {
        qr_code_id: scanKey,
        fan_id: fan.id,
        product_id: resolved.matchedQr?.product_id || null,
        store_id: resolved.matchedQr?.store_id || null,
        scanned_code: resolved.code,
        code_type: resolved.codeType,
        scan_status: scanDecision.status,
        points_earned: scanDecision.points,
        validator_source: scanDecision.validatorSource || (resolved.matchedQr ? 'admin_generated_trial_batch' : 'local_preview_recognition'),
        decision_reason: scanDecision.decisionReason || scanDecision.message,
        validation_mode: resolved.matchedQr ? 'trial_admin_code_library' : 'trial_preview_only',
        code_signature: resolved.matchedQr?.code_signature || null,
        batch_no: resolved.matchedQr?.batch_no || resolved.matchedQr?.batch_id || null,
      };

      if (scanDecision.status === 'not_uwell') {
        localDb.insert('scan_records', record);
        setLastScanResult(scanDecision);
        message.error(scanDecision.message || t('fan_real_scan_not_eligible_title'));
        setRefreshKey(k => k + 1);
        return;
      }

      if (['suspicious', 'already_claimed', 'daily_limit', 'unverified_preview_only'].includes(scanDecision.status)) {
        localDb.insert('scan_records', record);
        setLastScanResult(scanDecision);
        message.warning(scanDecision.message);
        setRefreshKey(k => k + 1);
        return;
      }

      if (scanDecision.status === 'points_awarded') {
        let matchedQr = resolved.matchedQr;
        if (!matchedQr) throw new Error('Official UWELL code validation is required before product scan points can be awarded.');
        localDb.update('qr_codes', matchedQr.id, {
          scan_count: (matchedQr.scan_count || 0) + 1,
          status: 'claimed',
          claimed_by: fan.id,
          claimed_at: new Date().toISOString(),
          validator_source: 'admin_generated_trial_batch',
          decision_reason: scanDecision.decisionReason,
        });
        localDb.insert('scan_records', { ...record, qr_code_id: matchedQr.id });
        await addFanPoints(fan.id, scanDecision.points, 'earn', 'QR Scan', 'Scanned unique UWELL code: ' + resolved.code);
        setLastScanResult(scanDecision);
        message.success(scanDecision.message);
        setRefreshKey(k => k + 1);
        if (onPointsChange) onPointsChange();
        return;
      }

      localDb.insert('scan_records', record);
      setLastScanResult(scanDecision);
      message.info(scanDecision.message);
      setRefreshKey(k => k + 1);
    } catch (err) {
      message.error(err?.message || t('fan_real_scan_failed'));
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fan-scan-page fan-scan-primary-task-page fan-scan-centered-action-lock fan-scan-layout-discipline">
      <section className="fan-scan-focus-hero">
        <div className="fan-scan-visual-stage" style={{ '--scan-progress': `${scanProgress}%` }}>
          <div className="fan-scan-qr-mark">
            <QrcodeOutlined />
            <span />
          </div>
        </div>
        <div className="fan-scan-cockpit-copy fan-scan-copy-stage fan-scan-main-action-panel">
          <span className="fan-mini-label">{t('fan_real_scan_title')}</span>
          <Title level={4}>{t('fan_real_scan_title')}</Title>
          <div className="fan-scan-action-grid">
            <Button
              type="primary"
              size="large"
              loading={scanning}
              onClick={() => openScanner('camera')}
              icon={<CameraOutlined />}
              className="fan-scan-primary-button"
            >
              {scanning ? t('fan_real_processing') : scansRemaining > 0 ? t('fan_real_use_camera') : t('fan_real_scan_anyway')}
            </Button>
            <Button
              size="large"
              onClick={() => openScanner('manual')}
              icon={<QrcodeOutlined />}
              className="fan-scan-manual-button"
            >
              {t('fan_real_enter_code')}
            </Button>
            <span className="fan-scan-limit-note">
              {todayCountedProductScans}/{scanLimit} {t('fan_real_scan_limit_used')}
            </span>
          </div>
        </div>
      </section>

      <section className="fan-scan-status-strip">
        <div>
          <span>{t('fan_real_scan_remaining')}</span>
          <strong>{scansRemaining}</strong>
        </div>
        <div>
          <span>{t('fan_real_product_points_rule')}</span>
          <strong>+{operationalRules.scanPoints} {t('fan_real_scan_valid_points')}</strong>
        </div>
        <div>
          <span>{t('fan_real_daily_limit')}</span>
          <strong>{scanLimit} {t('fan_real_scan_product_scans')}</strong>
        </div>
        <div>
          <span>{t('fan_real_total_scan_records')}</span>
          <strong>{myScans.length}</strong>
        </div>
      </section>

      {lastScanResult && (
        <section className={`fan-scan-result-panel is-${lastScanResult.status}`}>
          <span>{lastScanResult.points > 0 ? `+${lastScanResult.points}` : t('fan_real_scan_status_zero')} {t('fan_real_pts_unit')}</span>
          <strong>{formatScanStatus(lastScanResult.status)}</strong>
          <p>{lastScanResult.message}</p>
        </section>
      )}

      <details className="fan-scan-rules-drawer is-secondary-detail">
        <summary>{t('fan_real_scan_rules_summary', 'Scan rules and supported codes')}</summary>
        <p className="fan-scan-guide-link">{t('fan_real_scan_desc')}</p>
        <section className="fan-scan-code-matrix is-folded" aria-label="Supported UWELL scan code classes">
          {scanCodeClasses.map((item) => (
            <article key={item.type} className={`fan-scan-code-card is-${item.tone}`}>
              <Tag color={item.type === 'product_unique' ? 'green' : item.type === 'not_uwell' ? 'red' : 'blue'}>{item.type}</Tag>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
            </article>
          ))}
        </section>
        <p className="fan-scan-warning-note">{t('fan_real_scan_not_eligible_title')}</p>
      </details>

      <section className="fan-scan-recent-panel is-secondary-history">
        <div className="fan-scan-section-heading">
          <span>{t('fan_real_recent_scans')}</span>
          <strong>{myScans.length} {t('fan_real_records_unit')}</strong>
        </div>
        {myScans.length === 0 ? (
          <div className="fan-scan-empty">
            <Empty description={t('fan_real_scan_empty')} />
          </div>
        ) : (
          <div className="fan-scan-recent-list">
            {myScans.slice(0, 10).map((s) => {
              const product = s.product_id ? localDb.findById('products', s.product_id) : null;
              const points = Number(s.points_earned || 0);
              const status = formatScanStatus(s.scan_status || (points > 0 ? 'points_awarded' : 'recognized_no_points'));
              const scanTime = s.created_at || s.scanned_at;
              return (
                <article key={s.id || `${s.scanned_code}-${scanTime}`} className={`fan-scan-recent-item is-${s.scan_status || 'recognized_no_points'}`}>
                  <div className="fan-scan-recent-icon"><QrcodeOutlined /></div>
                  <div className="fan-scan-recent-main">
                    <strong>{product?.name || s.products?.name || s.scanned_code || t('fan_real_uwell_code')}</strong>
                    <span>{status} · {scanTime ? new Date(scanTime).toLocaleString('en-US') : '-'}</span>
                  </div>
                  <Tag color={points > 0 ? 'green' : 'default'}>
                    {points > 0 ? `+${points} ${t('fan_real_pts_unit')}` : t('fan_real_no_product_points')}
                  </Tag>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <QrScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanResult={handleScanResult}
        scanLimitReached={scansRemaining <= 0}
        initialManual={scannerMode === 'manual'}
        t={t}
      />
    </div>
  );
};

export default ScanTab;
