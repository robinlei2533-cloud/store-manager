import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Form, Input, Select, DatePicker, InputNumber, Button, Card, message, Spin, Checkbox, Row, Col, Divider } from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getStores, getCampaignById, createCampaign, updateCampaign } from '../../services/api';
import { CAMPAIGN_TYPES } from '../../utils/constants';
import PageTransition from "../../components/common/PageTransition";

const { TextArea } = Input;

const CampaignCreatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: stores = [] } = useQuery({ queryKey: ['stores-all'], queryFn: () => getStores({}) });

  useEffect(() => {
    if (id) {
      setLoading(true);
      getCampaignById(id).then(c => {
        form.setFieldsValue({ ...c, start_date: c.start_date ? dayjs(c.start_date) : null, end_date: c.end_date ? dayjs(c.end_date) : null, target_stores: c.target_stores || [] });
      }).finally(() => setLoading(false));
    } else {
      form.setFieldsValue({ status: 'planned', budget: 5000 });
    }
  }, [id, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const data = { ...values, start_date: values.start_date?.format('YYYY-MM-DD'), end_date: values.end_date?.format('YYYY-MM-DD') };
      if (id) await updateCampaign(id, data);
      else await createCampaign(data);
      message.success(id ? '活动已更新' : '活动已创建');
      navigate('/app/campaigns');
    } catch (err) { message.error(err.message || '保存失败'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  return (
    <PageTransition>
    <div className="bg-radial-top" style={{minHeight:"100vh",padding:24}}>
      <Button type="link" onClick={() => navigate('/app/campaigns')} style={{ marginBottom: 16, paddingLeft: 0 }}>&larr; 返回活动列表</Button>
      <Card className="liquid-glass" title={id ? '编辑活动' : '新建活动'}>
        <Form form={form} layout="vertical" style={{ maxWidth: 700 }}>
          <Form.Item name="name" label="活动名称" rules={[{ required: true, message: '必填' }]}><Input placeholder="例如：夏季推广活动" /></Form.Item>
          <Form.Item name="type" label="活动类型"><Select options={CAMPAIGN_TYPES.map(t => ({ label: t, value: t }))} /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="start_date" label="开始日期" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="end_date" label="结束日期" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="status" label="状态"><Select options={[{ label: '已计划', value: 'planned' }, { label: '进行中', value: 'ongoing' }, { label: '已完成', value: 'completed' }, { label: '已取消', value: 'cancelled' }]} /></Form.Item>
          <Form.Item name="budget" label="预算 ($)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="description" label="活动说明"><TextArea rows={3} /></Form.Item>
          <Divider>目标门店</Divider>
          <Form.Item name="target_stores" label="选择门店">
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                {stores.map(s => (
                  <Col span={8} key={s.id} style={{ marginBottom: 8 }}>
                    <Checkbox value={s.id}>{s.name} ({s.level || '-'})</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" size="large" loading={submitting} onClick={handleSubmit}>{id ? '更新活动' : '创建活动'}</Button>
            <Button size="large" style={{ marginLeft: 8 }} onClick={() => navigate('/app/campaigns')}>取消</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
    </PageTransition>);
};

export default CampaignCreatePage;

