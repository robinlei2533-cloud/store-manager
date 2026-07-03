import React, { useState, useEffect, useRef, useCallback } from 'react';
import { message, Button, Card, Statistic, Row, Col, Typography, Input, Divider, List, Empty, Modal, Spin, Alert } from 'antd';
import { QrcodeOutlined, CameraOutlined, ScanOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
import { addFanPoints, scanQrCode } from '../../../services/api';

const { Title, Paragraph, Text } = Typography;

const QrScannerModal = ({ open, onClose, onScanResult, scanLimitReached }) => {
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
      const stream = await navigator.mediaDevices.getUserMedia({
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
      setCameraError('Camera access denied. Please grant camera permission or enter code manually.');
      setUseManual(true);
    }
  }, []);

  useEffect(() => {
    if (open) {
      // Check if BarcodeDetector is available
      if ('BarcodeDetector' in window) {
        startCamera();
      } else {
        setCameraError('QR scanner not supported in this browser. Please enter the code manually.');
        setUseManual(true);
      }
    } else {
      stopCamera();
      setUseManual(false);
      setManualCode('');
      setCameraError(null);
    }
    return () => stopCamera();
  }, [open, startCamera, stopCamera]);

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
      title={<span style={{ color: '#FFD700' }}><ScanOutlined /> Scan QR Code</span>}
      open={open}
      onCancel={() => { stopCamera(); onClose(); }}
      footer={null}
      width={400}
      destroyOnClose
      styles={{ content: { background: '#14141e', border: '1px solid rgba(255,215,0,0.15)' } }}
    >
      {scanLimitReached ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Text style={{ color: '#ff4d4f', fontSize: 16 }}>Daily scan limit reached (3/3)</Text>
          <Paragraph style={{ color: '#888', marginTop: 12 }}>Come back tomorrow to scan more products!</Paragraph>
          <Button onClick={onClose}>Close</Button>
        </div>
      ) : (
        <div>
          {!useManual ? (
            <div>
              {cameraError && (
                <Alert message={cameraError} type="warning" showIcon style={{ marginBottom: 12, borderRadius: 8 }} />
              )}
              <div style={{
                position: 'relative', width: '100%', height: 320, borderRadius: 12, overflow: 'hidden',
                background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <video
                  ref={videoRef}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  muted playsInline
                />
                {!cameraReady && !cameraError && (
                  <Spin size="large" style={{ position: 'absolute' }} />
                )}
                {/* Scanner frame overlay */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: 200, height: 200, border: '2px solid rgba(255,215,0,0.6)', borderRadius: 12,
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
                }}>
                  <div style={{
                    position: 'absolute', top: -1, left: -1, width: 24, height: 24,
                    borderTop: '3px solid #FFD700', borderLeft: '3px solid #FFD700',
                    borderTopLeftRadius: 12,
                  }} />
                  <div style={{
                    position: 'absolute', top: -1, right: -1, width: 24, height: 24,
                    borderTop: '3px solid #FFD700', borderRight: '3px solid #FFD700',
                    borderTopRightRadius: 12,
                  }} />
                  <div style={{
                    position: 'absolute', bottom: -1, left: -1, width: 24, height: 24,
                    borderBottom: '3px solid #FFD700', borderLeft: '3px solid #FFD700',
                    borderBottomLeftRadius: 12,
                  }} />
                  <div style={{
                    position: 'absolute', bottom: -1, right: -1, width: 24, height: 24,
                    borderBottom: '3px solid #FFD700', borderRight: '3px solid #FFD700',
                    borderBottomRightRadius: 12,
                  }} />
                </div>
                {detecting && (
                  <div style={{ position: 'absolute', bottom: 16 }}>
                    <Spin style={{ color: '#FFD700' }} />
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Button type="link" onClick={() => { stopCamera(); setUseManual(true); }} style={{ color: '#FFD700' }}>
                  Enter code manually
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Paragraph style={{ color: '#888', textAlign: 'center', marginBottom: 16 }}>
                Enter the QR code from your UWELL product packaging
              </Paragraph>
              <Input
                size="large"
                placeholder="e.g. UWELL-G4-XXXXXXXX"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                style={{ borderRadius: 12, marginBottom: 12, textAlign: 'center', fontFamily: 'monospace' }}
                onPressEnter={handleManualSubmit}
              />
              <Button type="primary" block size="large" onClick={handleManualSubmit}
                disabled={!manualCode.trim()}
                style={{ borderRadius: 12, height: 48, background: 'linear-gradient(135deg, #FFD700, #FFA500)', border: 'none' }}>
                Submit Code
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

const ScanTab = ({ fan, onPointsChange }) => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Load scan records from localDb directly
  const [scanRecords, setScanRecords] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const records = localDb.all('scan_records') || [];
    setScanRecords(records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  }, [refreshKey]);

  const todayStr = new Date().toISOString().split('T')[0];
  const myScans = scanRecords.filter((s) => s.fan_id === fan?.id);
  const todayScans = myScans.filter((s) => {
    const date = s.created_at ? String(s.created_at) : '';
    return date.startsWith(todayStr);
  }).length;
  const scanLimit = 3;
  const scansRemaining = scanLimit - todayScans;

  // Get products for lookup
  const products = localDb.all('products') || [];

  const handleScanResult = async (code) => {
    setScannerOpen(false);
    if (!code || scansRemaining <= 0) return;
    setScanning(true);
    try {
      // Try the standard API first (works for both local and Supabase)
      let points = 5;
      let productId = null;
      let storeId = null;
      let matchedQr = null;

      try {
        const apiResult = await scanQrCode(code, fan.id);
        if (apiResult) {
          points = apiResult.points_earned || apiResult.points || 5;
          productId = apiResult.product_id || null;
          storeId = apiResult.store_id || null;
          matchedQr = { id: apiResult.qr_code_id || code, code: code };
        }
      } catch (_apiErr) {
        // Fallback: direct localDb lookup
        const allQrCodes = localDb.all('qr_codes') || [];
        matchedQr = allQrCodes.find(q => q.code === code || q.id === code);

        if (matchedQr) {
          points = matchedQr.points || 5;
          productId = matchedQr.product_id;
          storeId = matchedQr.store_id || null;
          localDb.update('qr_codes', matchedQr.id, { scan_count: (matchedQr.scan_count || 0) + 1 });
        } else {
          const products = localDb.all('products') || [];
          const matchedProduct = products.find(p =>
            code.toLowerCase().includes(p.sku?.toLowerCase() || '') ||
            p.sku?.toLowerCase().includes(code.toLowerCase())
          );
          if (matchedProduct) {
            points = 5;
            productId = matchedProduct.id;
          }
          const newQr = localDb.insert('qr_codes', { code, points: 5, is_active: true, scan_count: 1, product_id: productId, store_id: null });
          if (newQr?.id) matchedQr = newQr;
        }

        // Record locally if API failed
        localDb.insert('scan_records', {
          qr_code_id: matchedQr?.id || code,
          fan_id: fan.id,
          product_id: productId,
          store_id: storeId,
          points_earned: points,
        });
      }

      await addFanPoints(fan.id, points, 'earn', 'QR Scan', 'Scanned: ' + (matchedQr?.code || code));
      message.success('Scan successful! +' + points + ' points');
      setRefreshKey(k => k + 1);
      if (onPointsChange) onPointsChange();
    } catch (err) {
      message.error(err?.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <Card className='liquid-glass' style={{ textAlign: 'center', borderRadius: 16, marginBottom: 16 }}>
        <QrcodeOutlined style={{ fontSize: 64, color: '#722ed1', marginBottom: 16 }} />
        <Title level={4}>Scan to Earn Points!</Title>
        <Paragraph type="secondary" style={{ fontSize: 13 }}>
          Buy any UWELL product, find the QR code inside the package, and scan it here to earn points!
        </Paragraph>
        <Divider style={{ margin: '12px 0' }} />
        <Row gutter={16}>
          <Col span={12}>
            <Statistic title="Today's Scans" value={`${todayScans}/${scanLimit}`} valueStyle={{ color: scansRemaining > 0 ? '#52c41a' : '#ff4d4f' }} />
          </Col>
          <Col span={12}>
            <Statistic title="Total Scans" value={myScans.length} />
          </Col>
        </Row>
      </Card>

      <Button
        type="primary"
        size="large"
        block
        loading={scanning}
        disabled={scansRemaining <= 0}
        onClick={() => setScannerOpen(true)}
        icon={<CameraOutlined />}
        style={{ height: 56, fontSize: 18, fontWeight: 700, borderRadius: 16, marginBottom: 16, background: 'linear-gradient(135deg, #722ed1 0%, #FFD700 100%)', border: 'none' }}
      >
        {scanning ? 'Processing...' : scansRemaining > 0 ? 'Open Scanner' : 'Limit Reached (3/day)'}
      </Button>

      <Card title="Recent Scans" size="small" className='liquid-glass' style={{ borderRadius: 12 }}>
        {myScans.length === 0 ? (
          <Empty description="No scans yet. Buy a UWELL product and scan the QR code!" />
        ) : (
          <List
            size="small"
            dataSource={myScans.slice(0, 10)}
            renderItem={(s) => {
              const product = s.product_id ? localDb.findById('products', s.product_id) : null;
              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={<QrcodeOutlined style={{ fontSize: 20, color: '#722ed1' }} />}
                    title={product?.name || s.products?.name || 'Scanned Product'}
                    description={<>
                      <Text style={{ color: '#52c41a', fontWeight: 600 }}>+{s.points_earned} pts</Text>
                      <Text style={{ color: '#888', marginLeft: 8, fontSize: 11 }}>
                        {new Date(s.created_at).toLocaleString('en-US')}
                      </Text>
                    </>}
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>

      <QrScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanResult={handleScanResult}
        scanLimitReached={scansRemaining <= 0}
      />
    </div>
  );
};

export default ScanTab;
