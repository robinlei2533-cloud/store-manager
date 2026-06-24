import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Spin, Row, Col, Statistic, Progress, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { getEvaluationById } from '../../services/api';

const EvalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: evalData, isLoading } = useQuery({ queryKey: ['evaluation', id], queryFn: () => getEvaluationById(id), enabled: !!id });

  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;
  if (!evalData) return <Empty />;

  const radarData = [
    { dimension: 'Sales/Orders', score: evalData.score_sales },
    { dimension: 'Display', score: evalData.score_display },
    { dimension: 'Location', score: evalData.score_location },
    { dimension: 'Cooperation', score: evalData.score_cooperation },
    { dimension: 'Expansion', score: evalData.score_expansion },
    { dimension: 'Appearance', score: evalData.score_appearance },
  ];

  const dims = [
    { label: 'Sales / Order Frequency', score: evalData.score_sales },
    { label: 'Display Quality', score: evalData.score_display },
    { label: 'Location & Traffic', score: evalData.score_location },
    { label: 'Owner Cooperation', score: evalData.score_cooperation },
    { label: 'Chain / Expansion', score: evalData.score_expansion },
    { label: 'Store Appearance', score: evalData.score_appearance },
  ];

  return (
    <div>
      <Button type="link" onClick={() => navigate('/app/evaluation')} style={{ marginBottom: 16, paddingLeft: 0 }}>&larr; Back to Evaluations</Button>
      <Card title={`Evaluation: ${evalData.stores?.name || ''}`}>
        <Descriptions column={3} bordered style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Store">{evalData.stores?.name}</Descriptions.Item>
          <Descriptions.Item label="Date">{evalData.eval_date ? new Date(evalData.eval_date).toLocaleDateString('en-US') : '-'}</Descriptions.Item>
          <Descriptions.Item label="Level"><Tag color={evalData.recommended_level === 'A' ? 'green' : evalData.recommended_level === 'B' ? 'blue' : 'orange'}>{evalData.recommended_level}</Tag></Descriptions.Item>
          <Descriptions.Item label="Total Score"><span style={{ fontSize: 20, fontWeight: 700 }}>{evalData.total_score}</span> / 60</Descriptions.Item>
          <Descriptions.Item label="Average">{(evalData.total_score / 6).toFixed(1)} / 10</Descriptions.Item>
          <Descriptions.Item label="Evaluator">{evalData.evaluator?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Notes" span={3}>{evalData.notes || '-'}</Descriptions.Item>
        </Descriptions>

        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Card title="Radar Chart" size="small">
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 10]} />
                  <Radar dataKey="score" stroke="#1677ff" fill="#1677ff" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Dimension Scores" size="small">
              {dims.map((d, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{d.label}</span><span style={{ fontWeight: 600 }}>{d.score} / 10</span>
                  </div>
                  <Progress percent={d.score * 10} size="small" color={d.score >= 8 ? '#52c41a' : d.score >= 6 ? '#1890ff' : '#faad14'} />
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EvalDetailPage;
