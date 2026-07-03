import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Form, Input, InputNumber, Select, Button, Card, message, Spin } from 'antd';
import { createStore, updateStore, getStoreById } from '../../services/api';
import { STORE_LEVELS } from '../../utils/constants';
import { cityOptionsForCountry, countryOptions } from '../../utils/trialOps';
import PageTransition from "../../components/common/PageTransition";

const StoreCreatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const selectedCountry = Form.useWatch('country', form);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getStoreById(id).then((data) => {
        form.setFieldsValue(data);
      }).catch(() => {
        message.error('Store not found');
        navigate('/app/stores/list');
      }).finally(() => setLoading(false));
    }
  }, [id, form, navigate]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (id) {
        await updateStore(id, values);
        message.success('Store updated');
      } else {
        await createStore(values);
        message.success('Store created');
      }
      navigate('/app/stores/list');
    } catch (err) {
      message.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  return (
    <PageTransition>
    <div className="bg-radial-top" style={{minHeight:"100vh",padding:24}}>
    <Card className="liquid-glass" title={id ? 'Edit Store' : 'Add Store'}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 600 }}>
        <Form.Item name="name" label="Store Name" rules={[{ required: true, message: 'Please enter store name' }]}>
          <Input placeholder="e.g. Good Store (Downtown)" />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input placeholder="e.g. 123 Main Street" />
        </Form.Item>
        <Form.Item name="country" label="Country" rules={[{ required: true, message: 'Please select country' }]}>
          <Select
            placeholder="Select country"
            options={countryOptions}
            onChange={() => form.setFieldValue('city', undefined)}
          />
        </Form.Item>
        <Form.Item name="city" label="City" rules={[{ required: true, message: 'Please select city' }]}>
          <Select placeholder="Select city" options={cityOptionsForCountry(selectedCountry)} disabled={!selectedCountry} />
        </Form.Item>
        <Form.Item name="status" label="Store Status" initialValue="active">
          <Select
            options={[
              { value: 'active', label: 'Active' },
              { value: 'pending_review', label: 'Pending review' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </Form.Item>
        <Form.Item name="lat" label="Latitude"><InputNumber style={{ width: '100%' }} placeholder="39.9087" /></Form.Item>
        <Form.Item name="lng" label="Longitude"><InputNumber style={{ width: '100%' }} placeholder="116.3974" /></Form.Item>
        <Form.Item name="level" label="Level"><Select placeholder="Select level" options={STORE_LEVELS} allowClear /></Form.Item>
        <Form.Item name="chain_name" label="Chain Name"><Input placeholder="e.g. 7-Eleven" /></Form.Item>
        <Form.Item name="chain_store_count" label="Chain Store Count"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="contact" label="Contact Person"><Input placeholder="e.g. John" /></Form.Item>
        <Form.Item name="phone" label="Phone"><Input placeholder="e.g. 13800000000" /></Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>{id ? 'Update' : 'Create'}</Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/app/stores/list')}>Cancel</Button>
        </Form.Item>
      </Form>
    </Card>
    </div>
    </PageTransition>);
};

export default StoreCreatePage;

