import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Button, Card, Col, DatePicker, Form, Input, Progress, Row, Select, Space, Spin, Statistic, Tag, message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import useAuthStore from '../../stores/authStore';
import { getStores, getProfiles, createEvaluation, updateEvaluation, getEvaluationById } from '../../services/api';
import PageTransition from '../../components/common/PageTransition';

const STORE_RATING_DIMENSIONS = [
  {
    key: 'monthly_sales',
    title: 'Monthly sales',
    max: 20,
    hint: 'Temporary trial rule: C 1-2 units, B 2-3 units, A 3-4 units, S 4-6+ units. This dimension contributes 20% of the score.',
    fields: [
      {
        name: 'monthly_sales_units',
        label: 'Last month UWELL sales volume',
        options: [
          { label: '0 units', value: 0 },
          { label: '1-2 units', value: 8 },
          { label: '2-3 units', value: 12 },
          { label: '3-4 units', value: 16 },
          { label: '4-6+ units', value: 20 },
        ],
      },
    ],
  },
  {
    key: 'location_traffic',
    title: 'Location / traffic',
    max: 15,
    fields: [
      {
        name: 'location_traffic',
        label: 'Store location and daily customer flow',
        options: [
          { label: 'Remote or low-traffic location', value: 3 },
          { label: 'Stable community street traffic', value: 7 },
          { label: 'Good commercial street traffic', value: 11 },
          { label: 'High-traffic core location', value: 15 },
        ],
      },
    ],
  },
  {
    key: 'storefront',
    title: 'Store front / signboard image',
    max: 10,
    fields: [
      {
        name: 'storefront_quality',
        label: 'Storefront visibility and brand-friendly image',
        options: [
          { label: 'No visible signboard or poor storefront', value: 0 },
          { label: 'Visible but weak image', value: 4 },
          { label: 'Clean storefront and clear signboard', value: 7 },
          { label: 'Strong storefront suitable for fan map exposure', value: 10 },
        ],
      },
    ],
  },
  {
    key: 'display_quality',
    title: 'UWELL display quality',
    max: 15,
    fields: [
      {
        name: 'uwell_display_quality',
        label: 'Current UWELL display position and quality',
        options: [
          { label: 'No UWELL display or mixed on floor', value: 0 },
          { label: 'Corner display', value: 5 },
          { label: 'Counter or shelf display', value: 10 },
          { label: 'Golden position or dedicated display area', value: 15 },
        ],
      },
    ],
  },
  {
    key: 'product_coverage',
    title: 'Product coverage',
    max: 15,
    fields: [
      {
        name: 'product_coverage',
        label: 'UWELL SKU coverage and strategic product fit',
        options: [
          { label: 'No confirmed UWELL SKU coverage', value: 0 },
          { label: 'Basic products only', value: 5 },
          { label: 'Main G series products covered', value: 10 },
          { label: 'Strong G series and new-product coverage', value: 15 },
        ],
      },
    ],
  },
  {
    key: 'staff_cooperation',
    title: 'Staff cooperation',
    max: 10,
    fields: [
      {
        name: 'staff_cooperation',
        label: 'Owner or staff cooperation',
        options: [
          { label: 'Low interest or difficult communication', value: 0 },
          { label: 'Willing to understand UWELL activities', value: 4 },
          { label: 'Willing to support display and verification', value: 7 },
          { label: 'Highly cooperative and suitable for deeper operations', value: 10 },
        ],
      },
    ],
  },
  {
    key: 'campaign_readiness',
    title: 'Campaign readiness',
    max: 10,
    fields: [
      {
        name: 'campaign_readiness',
        label: 'Ability to host store events and fan verification',
        options: [
          { label: 'Not ready for activities', value: 0 },
          { label: 'Can support simple offline activity', value: 4 },
          { label: 'Can verify fans and manage basic materials', value: 7 },
          { label: 'Ready for official campaigns and store-created events', value: 10 },
        ],
      },
    ],
  },
  {
    key: 'photo_data',
    title: 'Photo / data completeness',
    max: 5,
    fields: [
      {
        name: 'photo_data_completeness',
        label: 'Required photos and visit data completeness',
        options: [
          { label: 'Missing key photos or profile data', value: 0 },
          { label: 'Basic profile complete, evidence incomplete', value: 2 },
          { label: 'Storefront, display, SKU, and next action complete', value: 5 },
        ],
      },
    ],
  },
];

const LEVEL_THRESHOLDS = [
  { label: '90-100', level: 'S', color: 'gold' },
  { label: '75-89', level: 'A', color: 'green' },
  { label: '60-74', level: 'B', color: 'blue' },
  { label: '<60', level: 'C', color: 'orange' },
];

const defaultRatings = STORE_RATING_DIMENSIONS.reduce((acc, section) => {
  section.fields.forEach((field) => {
    acc[field.name] = field.options[0].value;
  });
  return acc;
}, {});

function getLevel(score) {
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  return 'C';
}

function levelColor(level) {
  return LEVEL_THRESHOLDS.find((item) => item.level === level)?.color || 'default';
}

function optionLabel(sectionKey, fieldName, value) {
  const section = STORE_RATING_DIMENSIONS.find((item) => item.key === sectionKey);
  const field = section?.fields.find((item) => item.name === fieldName);
  return field?.options.find((item) => item.value === value)?.label || String(value ?? '');
}

const EvalCreatePage = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const id = params.id || searchParams.get('id');
  const presetStoreId = searchParams.get('store_id');
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const [form] = Form.useForm();
  const [ratings, setRatings] = useState(defaultRatings);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: stores = [] } = useQuery({ queryKey: ['stores-all'], queryFn: () => getStores({}) });
  const { data: profiles = [] } = useQuery({ queryKey: ['profiles'], queryFn: getProfiles });

  useEffect(() => {
    if (id) {
      setLoading(true);
      getEvaluationById(id).then((data) => {
        form.setFieldsValue({
          ...data,
          eval_date: data.eval_date ? dayjs(data.eval_date) : dayjs(),
          city: data.city || '',
        });
        setRatings({ ...defaultRatings, ...(data.rating_answers || {}) });
      }).finally(() => setLoading(false));
    } else {
      form.setFieldsValue({
        eval_date: dayjs(),
        evaluator_id: profile?.id,
        store_id: presetStoreId || undefined,
        review_status: 'pending_manager_review',
      });
    }
  }, [id, form, profile?.id, presetStoreId]);

  const sectionScores = useMemo(() => STORE_RATING_DIMENSIONS.map((section) => ({
    key: section.key,
    title: section.title,
    max: section.max,
    score: section.fields.reduce((sum, field) => sum + Number(ratings[field.name] || 0), 0),
  })), [ratings]);

  const total = sectionScores.reduce((sum, section) => sum + section.score, 0);
  const recLevel = getLevel(total);
  const selectedStore = stores.find((store) => store.id === form.getFieldValue('store_id'));

  const handleRatingChange = (name, value) => {
    setRatings((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const ratingSummary = STORE_RATING_DIMENSIONS.map((section) => ({
        key: section.key,
        title: section.title,
        score: section.fields.reduce((sum, field) => sum + Number(ratings[field.name] || 0), 0),
        max: section.max,
        fields: section.fields.map((field) => ({
          name: field.name,
          label: field.label,
          value: ratings[field.name],
          text: optionLabel(section.key, field.name, ratings[field.name]),
        })),
      }));
      const data = {
        ...values,
        eval_date: values.eval_date?.format('YYYY-MM-DD'),
        evaluator_id: values.evaluator_id || profile?.id,
        score_model: 'uwell_store_sabc_100_v1',
        rating_answers: ratings,
        rating_summary: ratingSummary,
        total_score: total,
        recommended_level: recLevel,
        review_status: values.review_status || 'pending_manager_review',
        review_note: 'Manager/Admin final review required before changing fan-facing store level.',
        score_sales: sectionScores.find((item) => item.key === 'monthly_sales')?.score || 0,
        score_location: sectionScores.find((item) => item.key === 'location_traffic')?.score || 0,
        score_appearance: sectionScores.find((item) => item.key === 'storefront')?.score || 0,
        score_display: sectionScores.find((item) => item.key === 'display_quality')?.score || 0,
        score_cooperation: sectionScores.find((item) => item.key === 'staff_cooperation')?.score || 0,
        score_expansion: (sectionScores.find((item) => item.key === 'product_coverage')?.score || 0)
          + (sectionScores.find((item) => item.key === 'campaign_readiness')?.score || 0)
          + (sectionScores.find((item) => item.key === 'photo_data')?.score || 0),
      };
      if (id) await updateEvaluation(id, data);
      else await createEvaluation(data);
      message.success(id ? 'Evaluation updated' : 'Evaluation saved for manager/admin review');
      navigate('/app/evaluation');
    } catch (err) {
      message.error(err.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  return (
    <PageTransition>
      <div className="evaluation-page">
        <Button type="link" onClick={() => navigate('/app/evaluation')} className="eval-back-button">返回评级列表</Button>
        <div className="eval-hero-card liquid-glass">
          <div>
            <div className="eval-kicker">地推门店评级</div>
            <h1>UWELL S/A/B/C 门店评级表</h1>
            <p>地推提交标准 100 分评分，系统给出建议等级；经理或管理员最终审核后，等级才会影响粉丝地图曝光。</p>
          </div>
          <div className="eval-score-ring">
            <strong>{total}</strong>
            <span>/ 100</span>
          </div>
        </div>

        <Form form={form} layout="vertical">
          <Card className="crud-card eval-form-card" title="门店与拜访基础信息">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="store_id" label="Store" rules={[{ required: true, message: 'Please select a store' }]}>
                  <Select
                    placeholder="Select existing store"
                    showSearch
                    optionFilterProp="label"
                    options={stores.map((store) => ({ label: store.name, value: store.id }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="city" label="City">
                  <Input placeholder="Riyadh / Jeddah / Dammam" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="evaluator_id" label="Field rep">
                  <Select options={profiles.map((item) => ({ label: item.name, value: item.id }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="eval_date" label="拜访日期" rules={[{ required: true, message: '请选择拜访日期' }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card className="crud-card eval-result-card">
            <Row gutter={[20, 20]} align="middle">
              <Col xs={24} md={6}>
                <Statistic title="总分" value={total} suffix="/ 100" />
              </Col>
              <Col xs={24} md={6}>
                <div className="eval-level-box">
                  <span>建议等级</span>
                  <Tag color={levelColor(recLevel)}>{recLevel}</Tag>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <Progress percent={total} showInfo={false} strokeColor="#b7f33a" />
                <div className="eval-thresholds">
                  {LEVEL_THRESHOLDS.map((item) => `${item.label} ${item.level}`).join(' · ')}
                </div>
              </Col>
            </Row>
          </Card>

          <div className="eval-section-list">
            {STORE_RATING_DIMENSIONS.map((section) => {
              const score = sectionScores.find((item) => item.key === section.key)?.score || 0;
              return (
                <Card
                  key={section.key}
                  className="crud-card eval-section-card"
                  title={<Space><span>{section.title}</span><Tag>{score} / {section.max}</Tag></Space>}
                >
                  <Row gutter={[18, 12]} align="middle">
                    {section.fields.map((field) => (
                      <React.Fragment key={field.name}>
                        <Col xs={24} lg={10}>
                          <div className="eval-field-label">{field.label}</div>
                        </Col>
                        <Col xs={24} lg={11}>
                          <Select
                            value={ratings[field.name]}
                            onChange={(value) => handleRatingChange(field.name, value)}
                            options={field.options}
                            style={{ width: '100%' }}
                          />
                        </Col>
                        <Col xs={24} lg={3}>
                          <div className="eval-field-score">{ratings[field.name]}</div>
                        </Col>
                      </React.Fragment>
                    ))}
                  </Row>
                  {section.hint && <div className="eval-section-hint">{section.hint}</div>}
                </Card>
              );
            })}
          </div>

          <Card className="crud-card eval-form-card" title="Field Notes and Review Status">
            <Form.Item name="review_status" label="Review status">
              <Select
                options={[
                  { label: 'Pending manager review', value: 'pending_manager_review' },
                  { label: 'Needs more evidence', value: 'needs_more_evidence' },
                  { label: 'Ready for admin confirmation', value: 'ready_for_admin_confirmation' },
                ]}
              />
            </Form.Item>
            <Form.Item name="notes" label="Notes">
              <Input.TextArea rows={4} placeholder="Record owner feedback, competitor pressure, missing evidence, material needs, and recommended next action." />
            </Form.Item>
            <div className="eval-actions">
              <Button type="primary" size="large" loading={submitting} onClick={handleSubmit}>
                Save rating result
              </Button>
              <Button size="large" onClick={() => navigate('/app/evaluation')}>Cancel</Button>
              {selectedStore && <span className="eval-selected-store">Selected store: {selectedStore.name}</span>}
            </div>
          </Card>
        </Form>
      </div>
    </PageTransition>
  );
};

export default EvalCreatePage;
