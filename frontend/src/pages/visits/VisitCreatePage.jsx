import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, Card, Col, DatePicker, Divider, Form, Image, Input, InputNumber, Row, Select, Space, Spin, Tag, Upload, message } from 'antd';
import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import useAuthStore from '../../stores/authStore';
import localDb from '../../services/db/localDb';
import { getStores, getProducts, createVisit, updateVisit, getVisitById, getVisitSales, getVisitPhotos, upsertVisitSales, uploadVisitPhoto, deleteVisitPhoto, submitSStoreVisitDetail } from '../../services/api';
import PageTransition from '../../components/common/PageTransition';
import { scoreStoreRating } from '../../utils/uwellLaunchRules';

const { TextArea } = Input;

const VISIT_TYPE_OPTIONS = [
  { label: '新店拜访', value: 'new_store' },
  { label: '复访', value: 'repeat_visit' },
];

const VISIT_EVIDENCE_TYPES = [
  { label: 'Storefront', value: 'storefront' },
  { label: 'Shelf', value: 'shelf' },
  { label: 'Counter display', value: 'counter_display' },
  { label: 'UWELL display', value: 'uwell_display' },
  { label: 'Competitor display', value: 'competitor_display' },
  { label: 'Activity evidence', value: 'activity_evidence' },
];

const STORE_TYPE_OPTIONS = [
  { label: 'Vape store', value: 'vape_store' },
  { label: 'Mobile accessories', value: 'mobile_accessories' },
  { label: 'Convenience / mixed retail', value: 'mixed_retail' },
  { label: 'Distributor / chain store', value: 'chain_store' },
];

const DISPLAY_LOCATION_OPTIONS = [
  { label: 'No UWELL display yet', value: 'none' },
  { label: 'Counter', value: 'counter' },
  { label: 'Shelf', value: 'shelf' },
  { label: 'Golden position', value: 'golden_position' },
  { label: 'Dedicated UWELL area', value: 'dedicated_area' },
];

const FIELD_RATING_FIELDS = [
  { name: 'monthlySalesUnits', label: 'Monthly UWELL sales units', max: 6, helper: '20% of rating: 1-2=C baseline, 2-3=B, 3-4=A, 4-6=S potential.' },
  { name: 'locationTraffic', label: 'Location / traffic', max: 15 },
  { name: 'storefront', label: 'Storefront / signboard image', max: 10 },
  { name: 'displayQuality', label: 'UWELL display quality', max: 15 },
  { name: 'productCoverage', label: 'Product coverage', max: 15 },
  { name: 'staffCooperation', label: 'Staff cooperation', max: 10 },
  { name: 'campaignReadiness', label: 'Campaign readiness', max: 10 },
  { name: 'dataCompleteness', label: 'Photo / data completeness', max: 5 },
];

const SALES_SCORE_BANDS = [
  { label: 'C potential: 1-2 units / month', score: '5 pts', note: 'Starter store; needs basic visibility and repeat follow-up.' },
  { label: 'B potential: 2-3 units / month', score: '10 pts', note: 'Partner store; can grow with display and SKU coverage.' },
  { label: 'A potential: 3-4 units / month', score: '15 pts', note: 'Recommended store; candidate for fan map exposure.' },
  { label: 'S potential: 4-6 units / month', score: '20 pts', note: 'Featured store; candidate for Fan Home and premium pickup exposure.' },
];

const RATING_REVIEW_LADDER = [
  'Rep suggestion is not final',
  'Manager can adjust',
  'Admin confirms final level',
  'S/A final stores can receive Fan Home and map exposure',
];

const VisitCreatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profile = useAuthStore((s) => s.profile);
  const [form] = Form.useForm();
  const visitType = Form.useWatch('visit_type', form);
  const selectedStoreId = Form.useWatch('store_id', form);
  const [salesRows, setSalesRows] = useState([{ product_id: null, sales_qty: 0, sales_amount: 0, stock_qty: 0 }]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStoreCampaigns, setSelectedStoreCampaigns] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fieldRating = Form.useWatch('field_rating', form) || {};
  const ratingResult = scoreStoreRating(fieldRating);

  const { data: stores = [] } = useQuery({ queryKey: ['stores-all'], queryFn: () => getStores({}) });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const selectedStoreForVisit = stores.find((store) => store.id === selectedStoreId);
  const isSelectedActiveSStore = Boolean(selectedStoreForVisit?.is_s_store || selectedStoreForVisit?.level === 'S')
    && (selectedStoreForVisit?.s_store_status || 'active') === 'active';

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([getVisitById(id), getVisitSales(id), getVisitPhotos(id)]).then(([visit, sales, visitPhotos]) => {
        form.setFieldsValue({
          ...visit,
          visit_type: visit.visit_type || 'repeat_visit',
          visit_date: visit.visit_date ? dayjs(visit.visit_date) : dayjs(),
          new_store_profile: visit.new_store_profile || {},
          display_data: visit.display_data || {},
          repeat_visit_summary: visit.repeat_visit_summary || {},
        });
        if (sales.length > 0) {
          setSalesRows(sales.map((row) => ({
            product_id: row.product_id,
            sales_qty: row.sales_qty,
            sales_amount: row.sales_amount,
            stock_qty: row.stock_qty,
          })));
        }
        setPhotos(visitPhotos);
      }).finally(() => setLoading(false));
    } else {
      form.setFieldsValue({
        visit_type: 'new_store',
        visit_date: dayjs(),
        status: 'draft',
        suggested_level_status: 'pending_rating',
      });
    }
  }, [id, form]);

  const handleAddRow = () => setSalesRows([...salesRows, { product_id: null, sales_qty: 0, sales_amount: 0, stock_qty: 0 }]);
  const handleRemoveRow = (idx) => setSalesRows(salesRows.filter((_, i) => i !== idx));
  const handleRowChange = (idx, field, value) => {
    const newRows = [...salesRows];
    newRows[idx][field] = value;
    setSalesRows(newRows);
  };

  const handleStoreChange = (storeId) => {
    const claims = localDb.find('campaign_claims', (claim) => claim.store_id === storeId && claim.status !== 'cancelled') || [];
    const campaigns = localDb.all('campaigns') || [];
    const outbounds = localDb.all('material_outbound') || [];
    const enriched = claims.map((claim) => {
      const campaign = campaigns.find((item) => item.id === claim.campaign_id);
      const deliveries = outbounds.filter((item) => item.claim_id === claim.id);
      const deliveryStatus = deliveries.length === 0 ? 'Not Assigned' : deliveries.some((item) => item.status === 'delivered') ? 'Delivered' : 'Pending';
      return { ...claim, campaignName: campaign?.name || 'Unknown campaign', deliveryStatus };
    });
    setSelectedStoreCampaigns(enriched);
  };

  const handlePhotoUpload = async (file, photoType) => {
    const tempUrl = URL.createObjectURL(file);
    setPhotos([...photos, { photo_type: photoType, photo_url: tempUrl, file, temp: true }]);
    return false;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { s_store_visit_detail, ...visitValues } = values;
      setSubmitting(true);
      const visitData = {
        ...visitValues,
        visit_date: values.visit_date?.format('YYYY-MM-DD'),
        rep_id: profile?.id || 'u-rep1',
        visit_type: values.visit_type,
        new_store_profile: values.new_store_profile || {},
        display_data: values.display_data || {},
        field_rating: values.field_rating || {},
        field_rating_summary: {
          model: 'uwell_store_sabc_100_v1',
          total: ratingResult.total,
          salesScore: ratingResult.salesScore,
          suggestedLevel: ratingResult.suggestedLevel,
          dimensions: FIELD_RATING_FIELDS.map((field) => ({
            key: field.name,
            label: field.label,
            value: Number(values.field_rating?.[field.name] || 0),
            max: field.max,
          })),
        },
        suggested_level: ratingResult.suggestedLevel,
        suggested_store_level: ratingResult.suggestedLevel,
        repeat_visit_summary: values.repeat_visit_summary || {},
        next_action: values.next_action || '',
        suggested_level_status: values.suggested_level_status || 'pending_rating',
      };

      let visitId = id;
      if (id) {
        await updateVisit(id, visitData);
      } else {
        const newVisit = await createVisit(visitData);
        visitId = newVisit.id;
      }

      const validSales = salesRows.filter((row) => row.product_id);
      if (validSales.length > 0) {
        await upsertVisitSales(validSales.map((row) => ({ ...row, visit_id: visitId })));
      }

      if (values.visit_type === 'repeat_visit' && isSelectedActiveSStore && s_store_visit_detail) {
        await submitSStoreVisitDetail({
          visit_id: visitId,
          store_id: values.store_id,
          field_rep_id: profile?.id || 'u-rep1',
          inventory_status: s_store_visit_detail.inventory_status || '',
          display_status: s_store_visit_detail.display_status || '',
          sell_through_observation: s_store_visit_detail.sell_through_observation || '',
          competitor_situation: s_store_visit_detail.competitor_situation || '',
          hot_brands: s_store_visit_detail.hot_brands || '',
          hot_flavors: s_store_visit_detail.hot_flavors || '',
          consumer_feedback: s_store_visit_detail.consumer_feedback || '',
          market_notes: s_store_visit_detail.market_notes || '',
          support_needed: s_store_visit_detail.support_needed || '',
          replenishment_needed: Boolean(s_store_visit_detail.replenishment_needed),
          visit_photos: photos.map((photo) => photo.photo_type).filter(Boolean),
        }, {
          ...profile,
          id: profile?.id || 'u-rep1',
          role: profile?.role || 'rep',
        });
        message.success('拜访已创建，并已提交S店拜访详情。');
      }

      const newPhotos = photos.filter((photo) => photo.temp && photo.file);
      for (const photo of newPhotos) {
        await uploadVisitPhoto(visitId, photo.file, photo.photo_type);
      }

      queryClient.invalidateQueries({ queryKey: ['visits'] });
      message.success(id ? '拜访已更新' : '拜访已创建');
      navigate(`/app/visits/${visitId}`);
    } catch (err) {
      message.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  return (
    <PageTransition>
      <div className="bg-radial-top admin-visit-create-page" style={{ minHeight: '100vh', padding: 24 }}>
        <Button type="link" onClick={() => navigate('/app/visits/list')} style={{ marginBottom: 16, paddingLeft: 0 }}>返回拜访列表</Button>
        <Card className="liquid-glass admin-visit-create-card" title={id ? '编辑地推拜访' : '新建地推拜访'}>
          <Form form={form} layout="vertical">
            <Card size="small" title="拜访流程" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item name="visit_type" label="拜访类型" rules={[{ required: true, message: '请选择拜访类型' }]}>
                    <Select options={VISIT_TYPE_OPTIONS} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="visit_date" label="拜访日期" rules={[{ required: true, message: '请选择拜访日期' }]}>
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="status" label="Status">
                    <Select options={[
                      { label: 'Draft', value: 'draft' },
                      { label: 'Completed', value: 'completed' },
                      { label: 'Cancelled', value: 'cancelled' },
                    ]} />
                  </Form.Item>
                </Col>
              </Row>
              <div style={{ color: 'var(--uw-text-secondary)' }}>
                {visitType === 'new_store'
                  ? '创建门店档案、收集证据，然后使用标准评级表为门店评分。'
                  : '更新门店陈列照片、复盘活动执行，并记录问题和下一步动作。'}
              </div>
            </Card>

            {visitType === 'new_store' && (
              <>
                <Card size="small" title="门店档案" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item name={['new_store_profile', 'store_name']} label="Store name" rules={[{ required: true, message: 'Store name is required' }]}>
                        <Input placeholder="Store name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                      <Form.Item name={['new_store_profile', 'country']} label="Country">
                        <Input placeholder="Saudi Arabia" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                      <Form.Item name={['new_store_profile', 'city']} label="City">
                        <Input placeholder="Riyadh / Jeddah / Dammam" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name={['new_store_profile', 'address']} label="Address">
                        <Input placeholder="Street, district, landmark" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name={['new_store_profile', 'map_link']} label="Map link">
                        <Input placeholder="Google Maps or local map URL" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name={['new_store_profile', 'contact_person']} label="Contact person">
                        <Input placeholder="Owner or manager name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name={['new_store_profile', 'phone']} label="Phone">
                        <Input placeholder="+966..." />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name={['new_store_profile', 'store_type']} label="Store type">
                        <Select options={STORE_TYPE_OPTIONS} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                <Card size="small" title="Field Rating Preview" style={{ marginBottom: 16 }}>
                  <div className="field-rating-rule-strip">
                    <div>
                      <strong>Monthly sales is 20% of the S/A/B/C score</strong>
                      <span>Sales potential is visible, but evidence quality and manager/admin review still control the final level.</span>
                    </div>
                    <Tag color="gold">Manager review required</Tag>
                  </div>
                  <div className="field-rating-sales-band-grid">
                    {SALES_SCORE_BANDS.map((band) => (
                      <div key={band.label}>
                        <strong>{band.label}</strong>
                        <b>{band.score}</b>
                        <span>{band.note}</span>
                      </div>
                    ))}
                  </div>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} lg={18}>
                      <Row gutter={12}>
                        {FIELD_RATING_FIELDS.map((field) => (
                          <Col xs={24} md={12} key={field.name}>
                            <Form.Item
                              name={['field_rating', field.name]}
                              label={`${field.label}${field.name === 'monthlySalesUnits' ? '' : ` / ${field.max}`}`}
                              extra={field.helper}
                            >
                              <InputNumber min={0} max={field.max} style={{ width: '100%' }} />
                            </Form.Item>
                          </Col>
                        ))}
                      </Row>
                    </Col>
                    <Col xs={24} lg={6}>
                      <Card className="liquid-glass" size="small" title="System suggestion">
                        <div style={{ fontSize: 32, fontWeight: 800, color: '#ccff00' }}>{ratingResult.suggestedLevel}</div>
                        <div style={{ color: 'var(--uw-text-secondary)', marginBottom: 10 }}>
                          {ratingResult.total}/100 total / sales score {ratingResult.salesScore}/20
                        </div>
                        <Tag color="gold">Manager review required</Tag>
                        <p style={{ marginBottom: 0, marginTop: 10 }}>
                          Field reps submit evidence and suggested level only. Manager/Admin confirms or changes the final store level with a reason.
                        </p>
                        <div className="field-rating-review-ladder">
                          {RATING_REVIEW_LADDER.map((step, index) => (
                            <div key={step}>
                              <span>{index + 1}</span>
                              <strong>{step}</strong>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </>
            )}

            {visitType === 'repeat_visit' && (
              <Card size="small" title="复访记录" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="store_id" label="Store" rules={[{ required: true, message: 'Please select a store' }]}>
                      <Select
                        placeholder="Select store"
                        showSearch
                        optionFilterProp="label"
                        options={stores.map((store) => ({ label: store.name, value: store.id }))}
                        onChange={handleStoreChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={['repeat_visit_summary', 'purpose']} label="Visit purpose">
                      <Select options={[
                        { label: 'Display follow-up', value: 'display_follow_up' },
                        { label: 'Activity support', value: 'activity_support' },
                        { label: 'Material delivery', value: 'material_delivery' },
                        { label: 'Problem solving', value: 'problem_solving' },
                      ]} />
                    </Form.Item>
                  </Col>
                </Row>
                {selectedStoreCampaigns.length > 0 && (
                  <Card className="liquid-glass" size="small" title="Active Campaign Deliveries" style={{ marginBottom: 16 }}>
                    {selectedStoreCampaigns.map((claim, idx) => (
                      <div key={claim.id || idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{claim.campaignName}</div>
                          <div style={{ fontSize: 12, color: 'var(--uw-text-secondary)' }}>Claim: {claim.status} | Effect: {claim.effect || 'Pending report'}</div>
                        </div>
                        <Tag color={claim.deliveryStatus === 'Delivered' ? 'success' : claim.deliveryStatus === 'Pending' ? 'orange' : 'default'}>
                          {claim.deliveryStatus}
                        </Tag>
                      </div>
                    ))}
                  </Card>
                )}
              </Card>
            )}

            {visitType === 'repeat_visit' && isSelectedActiveSStore && (
              <Card size="small" title="S店拜访详情" style={{ marginBottom: 16 }}>
                <div style={{ color: 'var(--uw-text-secondary)', marginBottom: 12 }}>
                  拜访照片通过运营证据照片上传；本区记录 UWELL 品牌店后续跟进所需的终端情报。
                </div>
                <div className="s-store-visit-checklist">
                  <div>
                    <strong>门店现场检查</strong>
                    <span>离店前检查库存状态、UWELL 陈列和动销观察。</span>
                  </div>
                  <div>
                    <strong>市场情报</strong>
                    <span>记录竞品情况、热卖品牌、热卖口味、消费者反馈和市场备注。</span>
                  </div>
                  <div>
                    <strong>支持与补货跟进</strong>
                    <span>标记补货需求并上传证据照片；后台跟进仍保持独立处理。</span>
                  </div>
                  <div>
                    <strong>证据提醒</strong>
                    <span>照片保留在运营证据照片中，并在普通拜访保存后关联。</span>
                  </div>
                </div>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name={['s_store_visit_detail', 'inventory_status']} label="库存状态">
                      <Select options={[
                        { label: '健康', value: 'healthy' },
                        { label: '低库存', value: 'low_stock' },
                        { label: '已断货', value: 'out_of_stock' },
                        { label: '不清楚', value: 'unclear' },
                      ]} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={['s_store_visit_detail', 'display_status']} label="陈列状态">
                      <Select options={[
                        { label: '独立 UWELL 区域', value: 'dedicated_area' },
                        { label: '柜台陈列良好', value: 'good_counter_display' },
                        { label: '与竞品混放', value: 'mixed_with_competitors' },
                        { label: '需要重置', value: 'needs_reset' },
                      ]} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={['s_store_visit_detail', 'sell_through_observation']} label="动销观察">
                      <TextArea rows={2} placeholder="本周/本月哪些产品动销？是否有慢动销产品系列？" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={['s_store_visit_detail', 'competitor_situation']} label="竞品情况">
                      <TextArea rows={2} placeholder="竞品品牌、促销、货架压力和价格变化。" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={['s_store_visit_detail', 'hot_brands']} label="热卖品牌">
                      <Input placeholder="当前在本店或市场卖得好的品牌" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={['s_store_visit_detail', 'hot_flavors']} label="热卖口味">
                      <Input placeholder="消费者最常询问的口味" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={['s_store_visit_detail', 'consumer_feedback']} label="消费者反馈">
                      <TextArea rows={2} placeholder="消费者对 UWELL 产品、价格、口味、设备或服务的反馈。" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={['s_store_visit_detail', 'market_notes']} label="市场备注">
                      <TextArea rows={2} placeholder="店主、店员或消费者反馈的最新本地市场情况。" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={['s_store_visit_detail', 'support_needed']} label="需要支持">
                      <Input placeholder="培训、物料、陈列重置、活动支持等" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name={['s_store_visit_detail', 'replenishment_needed']} label="需要补货">
                      <Select options={[
                        { label: '否', value: false },
                        { label: '是', value: true },
                      ]} />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            )}

            <Card size="small" title="Display Data" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name={['display_data', 'sku_list']} label="SKU list">
                    <TextArea rows={2} placeholder="List visible UWELL SKUs, especially G series products." />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name={['display_data', 'display_location']} label="Display location">
                    <Select options={DISPLAY_LOCATION_OPTIONS} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name={['display_data', 'competitor_pressure']} label="Competitor pressure">
                    <Select options={[
                      { label: 'Low', value: 'low' },
                      { label: 'Medium', value: 'medium' },
                      { label: 'High', value: 'high' },
                    ]} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name={['display_data', 'material_needs']} label="Material needs">
                    <Input placeholder="Poster, display stand, lanyard, samples..." />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="suggested_level_status" label="Level status">
                    <Select options={[
                      { label: 'Pending rating', value: 'pending_rating' },
                      { label: 'Submitted for review', value: 'submitted_for_review' },
                      { label: 'Manager/Admin reviews final store level', value: 'manager_admin_review' },
                    ]} />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="next_action" label="Record problems and next action">
                    <TextArea rows={3} placeholder="Example: missing storefront photo, owner asks for material support, schedule second visit next week." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card size="small" title="Sales Data" style={{ marginBottom: 16 }}>
              {salesRows.map((row, idx) => (
                <Space key={idx} style={{ display: 'flex', marginBottom: 8 }} align="center" wrap>
                  <Select placeholder="Product" style={{ width: 220 }} value={row.product_id} onChange={(value) => handleRowChange(idx, 'product_id', value)} options={products.map((product) => ({ label: product.name, value: product.id }))} />
                  <InputNumber placeholder="Qty" min={0} value={row.sales_qty} onChange={(value) => handleRowChange(idx, 'sales_qty', value || 0)} />
                  <InputNumber placeholder="Amount" min={0} prefix="$" value={row.sales_amount} onChange={(value) => handleRowChange(idx, 'sales_amount', value || 0)} />
                  <InputNumber placeholder="Stock" min={0} value={row.stock_qty} onChange={(value) => handleRowChange(idx, 'stock_qty', value || 0)} />
                  {salesRows.length > 1 && <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleRemoveRow(idx)} />}
                </Space>
              ))}
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddRow}>Add Product</Button>
            </Card>

            <Card size="small" title="Operational Evidence Photos">
              <Space wrap style={{ marginBottom: 16 }}>
                {VISIT_EVIDENCE_TYPES.map((type) => (
                  <Upload key={type.value} accept="image/*" showUploadList={false} beforeUpload={(file) => handlePhotoUpload(file, type.value)}>
                    <Button icon={<UploadOutlined />}>Upload {type.label}</Button>
                  </Upload>
                ))}
              </Space>
              <Divider style={{ margin: '12px 0' }} />
              {photos.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {photos.map((photo, idx) => (
                    <div key={photo.id || idx} style={{ position: 'relative' }}>
                      <Image src={photo.photo_url} width={120} height={120} style={{ objectFit: 'cover', borderRadius: 8 }} />
                      <Tag style={{ position: 'absolute', left: 4, bottom: 4 }}>{photo.photo_type}</Tag>
                      <Button type="link" danger size="small" icon={<DeleteOutlined />} style={{ position: 'absolute', top: 0, right: 0 }} onClick={() => {
                        if (photo.id) deleteVisitPhoto(photo.id);
                        setPhotos(photos.filter((_, i) => i !== idx));
                      }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--uw-text-secondary)' }}>Upload storefront, shelf, counter, UWELL display, competitor, or activity evidence photos.</div>
              )}
            </Card>

            <Form.Item name="notes" label="Additional notes" style={{ marginTop: 16 }}>
              <TextArea rows={3} placeholder="Any extra observation from the field visit." />
            </Form.Item>
          </Form>

          <div style={{ marginTop: 24 }}>
            <Button type="primary" size="large" loading={submitting} onClick={handleSubmit}>{id ? 'Update Visit' : 'Create Visit'}</Button>
            <Button size="large" style={{ marginLeft: 8 }} onClick={() => navigate('/app/visits/list')}>Cancel</Button>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
};

export default VisitCreatePage;
