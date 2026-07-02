import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { Form, Input, Select, DatePicker, Button, Card, message, Spin, Row, Col, Statistic, Tag, Progress, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import useAuthStore from '../../stores/authStore';
import useLanguageStore from '../../stores/languageStore';
import { getStores, getProfiles, createEvaluation, updateEvaluation, getEvaluationById } from '../../services/api';
import PageTransition from '../../components/common/PageTransition';

const ratingSections = [
  {
    key: 'purchase',
    title: '1. 进货情况',
    max: 25,
    hint: '品类仅记录，不影响评分，用于产品策略分析',
    fields: [
      {
        name: 'monthly_purchase',
        label: '上月进货金额（SAR）',
        options: [
          { label: '不知道 / 未问到', value: 0 },
          { label: '< 1,000', value: 5 },
          { label: '1,000 - 2,999', value: 10 },
          { label: '3,000 - 5,999', value: 15 },
          { label: '6,000+', value: 20 },
        ],
      },
      {
        name: 'main_category',
        label: '主要品类',
        options: [
          { label: '未确认', value: 0 },
          { label: 'Disposable / 一次性', value: 1 },
          { label: 'Pod System / 换弹', value: 3 },
          { label: 'Open System / 开放式', value: 3 },
          { label: 'UWELL 重点品类', value: 5 },
        ],
      },
    ],
  },
  {
    key: 'decoration',
    title: '2. 门店装修与外观',
    max: 20,
    hint: '装修反映老板投入意愿，高装修后通常对品牌形象更敏感',
    fields: [
      {
        name: 'decoration_style',
        label: '整体装修风格',
        options: [
          { label: '未评估', value: 0 },
          { label: '老旧 / 杂乱', value: 3 },
          { label: '普通整洁', value: 6 },
          { label: '高装修 / 形象好', value: 10 },
        ],
      },
      {
        name: 'sign_visibility',
        label: '门头 / 招牌可见度',
        options: [
          { label: '无门头或不可见', value: 0 },
          { label: '可见但弱', value: 4 },
          { label: '清晰可见', value: 7 },
          { label: '醒目且适合品牌露出', value: 10 },
        ],
      },
    ],
  },
  {
    key: 'display',
    title: '3. 陈列质量',
    max: 15,
    fields: [
      {
        name: 'display_position',
        label: '当前陈列位置',
        options: [
          { label: '无陈列 / 混放地上', value: 0 },
          { label: '角落陈列', value: 5 },
          { label: '柜台 / 货架陈列', value: 10 },
          { label: '黄金位置 / 专区陈列', value: 15 },
        ],
      },
    ],
  },
  {
    key: 'traffic',
    title: '4. 位置与客流',
    max: 20,
    hint: '客流仅记录不计分，配合位置判断',
    fields: [
      {
        name: 'location_type',
        label: '门店位置类型',
        options: [
          { label: '偏远区域 / 工业区', value: 0 },
          { label: '社区街边', value: 6 },
          { label: '商业街 / 商圈', value: 10 },
          { label: '高流量核心位置', value: 12 },
        ],
      },
      {
        name: 'daily_traffic',
        label: '日均客流体感',
        options: [
          { label: '冷清，几乎无顾客', value: 0 },
          { label: '稳定但不高', value: 3 },
          { label: '客流较好', value: 6 },
          { label: '持续高客流', value: 8 },
        ],
      },
    ],
  },
  {
    key: 'cooperation',
    title: '5. 老板合作意愿',
    max: 15,
    hint: '仿品情况仅记录，影响合作风险判断',
    fields: [
      {
        name: 'owner_attitude',
        label: '对合作的态度',
        options: [
          { label: '拒绝沟通 / 无兴趣', value: 0 },
          { label: '愿意了解', value: 4 },
          { label: '愿意试销 / 配合陈列', value: 7 },
          { label: '积极合作 / 可深度运营', value: 10 },
        ],
      },
      {
        name: 'fake_products',
        label: '是否混卖仿品 / 无牌品',
        options: [
          { label: '有大量仿品', value: 0 },
          { label: '少量混卖', value: 2 },
          { label: '未发现明显仿品', value: 5 },
        ],
      },
    ],
  },
  {
    key: 'scale',
    title: '6. 规模与扩张潜力',
    max: 10,
    fields: [
      {
        name: 'chain_count',
        label: '连锁店铺数量',
        options: [
          { label: '1家（单店）', value: 2 },
          { label: '2-3家', value: 5 },
          { label: '4-9家', value: 8 },
          { label: '10家以上', value: 10 },
        ],
      },
    ],
  },
  {
    key: 'social',
    title: '7. 社交媒体与曝光',
    max: 5,
    fields: [
      {
        name: 'social_account',
        label: '门店是否有社媒账号',
        options: [
          { label: '无', value: 0 },
          { label: '有但不活跃', value: 2 },
          { label: '活跃账号，可联动活动', value: 5 },
        ],
      },
    ],
  },
];

const defaultRatings = ratingSections.reduce((acc, section) => {
  section.fields.forEach((field) => {
    acc[field.name] = field.options[0].value;
  });
  return acc;
}, {});

function getLevel(score) {
  if (score >= 75) return 'A';
  if (score >= 50) return 'B';
  if (score >= 30) return 'C';
  return 'D';
}

function levelColor(level) {
  return { A: 'green', B: 'blue', C: 'orange', D: 'red' }[level] || 'default';
}

function optionLabel(sectionKey, fieldName, value) {
  const section = ratingSections.find((item) => item.key === sectionKey);
  const field = section?.fields.find((item) => item.name === fieldName);
  return field?.options.find((item) => item.value === value)?.label || String(value ?? '');
}

const EvalCreatePage = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const id = params.id || searchParams.get('id');
  const presetStoreId = searchParams.get('store_id');
  const navigate = useNavigate();
  const { t } = useLanguageStore();
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
        if (data.rating_answers) {
          setRatings({ ...defaultRatings, ...data.rating_answers });
        } else {
          setRatings({
            ...defaultRatings,
            monthly_purchase: data.score_sales || 0,
            decoration_style: Math.min(data.score_appearance || 0, 10),
            display_position: data.score_display || 0,
            location_type: Math.min(data.score_location || 0, 12),
            owner_attitude: Math.min(data.score_cooperation || 0, 10),
            chain_count: Math.min(data.score_expansion || 0, 10),
          });
        }
      }).finally(() => setLoading(false));
    } else {
      form.setFieldsValue({ eval_date: dayjs(), evaluator_id: profile?.id, store_id: presetStoreId || undefined });
    }
  }, [id, form, profile?.id, presetStoreId]);

  const sectionScores = useMemo(() => ratingSections.map((section) => ({
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
      const ratingSummary = ratingSections.map((section) => ({
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
        score_model: 'bd_store_rating_v1',
        rating_answers: ratings,
        rating_summary: ratingSummary,
        total_score: total,
        recommended_level: recLevel,
        score_sales: sectionScores.find((item) => item.key === 'purchase')?.score || 0,
        score_display: sectionScores.find((item) => item.key === 'display')?.score || 0,
        score_location: sectionScores.find((item) => item.key === 'traffic')?.score || 0,
        score_cooperation: sectionScores.find((item) => item.key === 'cooperation')?.score || 0,
        score_expansion: (sectionScores.find((item) => item.key === 'scale')?.score || 0) + (sectionScores.find((item) => item.key === 'social')?.score || 0),
        score_appearance: sectionScores.find((item) => item.key === 'decoration')?.score || 0,
      };
      if (id) await updateEvaluation(id, data);
      else await createEvaluation(data);
      message.success(id ? '评分已更新' : '评分已保存，门店等级已同步');
      navigate('/app/evaluation');
    } catch (err) {
      message.error(err.message || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;

  return (
    <PageTransition>
      <div className="evaluation-page">
        <Button type="link" onClick={() => navigate('/app/evaluation')} className="eval-back-button">← {t('back')}</Button>
        <div className="eval-hero-card liquid-glass">
          <div>
            <div className="eval-kicker">BD Store Research</div>
            <h1>沙特门店调研评分工具</h1>
            <p>BD 现场填写后自动计算 A/B/C/D 级别，并同步到门店等级，方便后续活动、物料和拜访优先级管理。</p>
          </div>
          <div className="eval-score-ring">
            <strong>{total}</strong>
            <span>/ 110</span>
          </div>
        </div>

        <Form form={form} layout="vertical">
        <Card className="crud-card eval-form-card" title="基础信息">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="store_id" label="店铺名称 / Shop name" rules={[{ required: true, message: '请选择店铺' }]}>
                  <Select
                    placeholder="选择已有门店"
                    showSearch
                    optionFilterProp="label"
                    options={stores.map((store) => ({ label: store.name, value: store.id }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="city" label="城市">
                  <Input placeholder="例如 Riyadh / Jeddah" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="evaluator_id" label="BD 姓名">
                  <Select options={profiles.map((item) => ({ label: item.name, value: item.id }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="eval_date" label="拜访日期" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
        </Card>

        <Card className="crud-card eval-result-card">
          <Row gutter={[20, 20]} align="middle">
            <Col xs={24} md={6}>
              <Statistic title="综合评分" value={total} suffix="/ 110" />
            </Col>
            <Col xs={24} md={6}>
              <div className="eval-level-box">
                <span>自动评级</span>
                <Tag color={levelColor(recLevel)}>{recLevel} 级</Tag>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Progress percent={Math.round((total / 110) * 100)} showInfo={false} strokeColor="#d6a84f" />
              <div className="eval-thresholds">A级 ≥75分 ｜ B级 50-74分 ｜ C级 30-49分 ｜ D级 &lt;30分</div>
            </Col>
          </Row>
        </Card>

        <div className="eval-section-list">
          {ratingSections.map((section) => {
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
                {section.hint && <div className="eval-section-hint">* {section.hint}</div>}
              </Card>
            );
          })}
        </div>

        <Card className="crud-card eval-form-card" title="备注 / 现场观察">
          <Form.Item name="notes">
            <Input.TextArea rows={4} placeholder="记录老板名字、特殊情况、竞品动态、本次是否成交等..." />
          </Form.Item>
          <div className="eval-actions">
            <Button type="primary" size="large" loading={submitting} onClick={handleSubmit}>
              保存评分结果
            </Button>
            <Button size="large" onClick={() => navigate('/app/evaluation')}>重置 / 返回</Button>
            {selectedStore && <span className="eval-selected-store">当前门店：{selectedStore.name}</span>}
          </div>
        </Card>
        </Form>
      </div>
    </PageTransition>
  );
};

export default EvalCreatePage;
