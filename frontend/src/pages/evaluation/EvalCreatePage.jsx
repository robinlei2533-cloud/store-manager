import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, DatePicker, Slider, Button, Card, message, Spin, Row, Col, Statistic, Tag, Divider } from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import useAuthStore from '../../stores/authStore';
import { getStores, getProfiles, createEvaluation, updateEvaluation, getEvaluationById } from '../../services/api';

const dimensions = [
  { key: 'score_sales', label: 'Sales / Order Frequency', desc: 'Recent sales volume and order frequency' },
  { key: 'score_display', label: 'Display Quality', desc: 'Product display standards and shelf richness' },
  { key: 'score_location', label: 'Location & Traffic', desc: 'Store location and foot traffic' },
  { key: 'score_cooperation', label: 'Owner Cooperation', desc: 'Owner cooperation and activity participation' },
  { key: 'score_expansion', label: 'Chain / Expansion Potential', desc: 'Chain brand status and expansion plans' },
  { key: 'score_appearance', label: 'Store Appearance', desc: 'Storefront image and interior cleanliness' },
];

const EvalCreatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);
  const [form] = Form.useForm();
  const [scores, setScores] = useState({ score_sales: 5, score_display: 5, score_location: 5, score_cooperation: 5, score_expansion: 5, score_appearance: 5 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: stores = [] } = useQuery({ queryKey: ['stores-all'], queryFn: () => getStores({}) });
  const { data: profiles = [] } = useQuery({ queryKey: ['profiles'], queryFn: getProfiles });

  useEffect(() => {
    if (id) {
      setLoading(true);
      getEvaluationById(id).then(data => {
        form.setFieldsValue({ ...data, eval_date: data.eval_date ? dayjs(data.eval_date) : dayjs() });
        setScores({ score_sales: data.score_sales, score_display: data.score_display, score_location: data.score_location, score_cooperation: data.score_cooperation, score_expansion: data.score_expansion, score_appearance: data.score_appearance });
      }).finally(() => setLoading(false));
    } else {
      form.setFieldsValue({ eval_date: dayjs(), evaluator_id: profile?.id });
    }
  }, [id]);

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const avg = total / 6;
  const recLevel = avg >= 8 ? 'A' : avg >= 6 ? 'B' : 'C';

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const data = { ...values, ...scores, eval_date: values.eval_date?.format('YYYY-MM-DD'), evaluator_id: values.evaluator_id || profile?.id };
      if (id) await updateEvaluation(id, data);
      else await createEvaluation(data);
      message.success(id ? 'Evaluation updated' : 'Evaluation created');
      navigate('/app/evaluation');
    } catch (err) { message.error(err.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  return (
    <div>
      <Button type="link" onClick={() => navigate('/app/evaluation')} style={{ marginBottom: 16, paddingLeft: 0 }}>&larr; Back</Button>
      <Card title={id ? 'Edit Evaluation' : 'New Evaluation'}>
        <Form form={form} layout="vertical">
          <Form.Item name="store_id" label="Store" rules={[{ required: true, message: 'Please select a store' }]}>
            <Select placeholder="Select store" showSearch optionFilterProp="label" options={stores.map(s => ({ label: s.name, value: s.id }))} />
          </Form.Item>
          <Form.Item name="eval_date" label="Evaluation Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="evaluator_id" label="Evaluator"><Select options={profiles.map(p => ({ label: p.name, value: p.id }))} /></Form.Item>
        </Form>

        <Divider>Dimension Scores (1-10)</Divider>
        {dimensions.map(d => (
          <div key={d.key} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div><strong>{d.label}</strong><br /><span style={{ fontSize: 12, color: '#999' }}>{d.desc}</span></div>
              <Statistic value={scores[d.key]} suffix="/10" valueStyle={{ fontSize: 18 }} />
            </div>
            <Slider min={1} max={10} value={scores[d.key]} onChange={(v) => setScores({ ...scores, [d.key]: v })} />
          </div>
        ))}

        <Card size="small" style={{ background: '#f0f5ff', marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={8}><Statistic title="Total Score" value={total} suffix="/60" /></Col>
            <Col span={8}><Statistic title="Average" value={avg.toFixed(1)} suffix="/10" /></Col>
            <Col span={8}><div style={{ textAlign: 'center' }}><div style={{ fontSize: 12, color: '#999' }}>Recommended Level</div><Tag color={recLevel === 'A' ? 'green' : recLevel === 'B' ? 'blue' : 'orange'} style={{ fontSize: 20, padding: '4px 16px', marginTop: 4 }}>{recLevel}</Tag></div></Col>
          </Row>
        </Card>

        <Form.Item name="notes" label="Notes"><Input.TextArea rows={3} placeholder="Evaluation notes..." /></Form.Item>
        <Button type="primary" size="large" loading={submitting} onClick={handleSubmit}>{id ? 'Update' : 'Create'} Evaluation</Button>
        <Button size="large" style={{ marginLeft: 8 }} onClick={() => navigate('/app/evaluation')}>Cancel</Button>
      </Card>
    </div>
  );
};

export default EvalCreatePage;
