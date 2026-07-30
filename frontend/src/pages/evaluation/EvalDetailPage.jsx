import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, Descriptions, Tag, Button, Spin, Row, Col, Progress, Empty, message, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { getEvaluationById } from '../../services/api';
import PageTransition from '../../components/common/PageTransition';

const EvalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: evalData, isLoading } = useQuery({
    queryKey: ['evaluation', id],
    queryFn: () => getEvaluationById(id),
    enabled: !!id,
  });

  if (isLoading) return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;
  if (!evalData) return <Empty description="No rating record" />;

  const isBdRating = evalData.score_model === 'bd_store_rating_v1' || Number(evalData.total_score || 0) > 60;
  const maxScore = isBdRating ? 110 : 60;
  const radarMax = isBdRating ? 25 : 10;
  const radarData = evalData.rating_summary?.length
    ? evalData.rating_summary.map((item) => ({ dimension: item.title.replace(/^\d+\.\s*/, ''), score: item.score, max: item.max }))
    : [
      { dimension: 'Sales/Orders', score: evalData.score_sales, max: 10 },
      { dimension: 'Display', score: evalData.score_display, max: 10 },
      { dimension: 'Location', score: evalData.score_location, max: 10 },
      { dimension: 'Cooperation', score: evalData.score_cooperation, max: 10 },
      { dimension: 'Expansion', score: evalData.score_expansion, max: 10 },
      { dimension: 'Appearance', score: evalData.score_appearance, max: 10 },
    ];

  const dims = evalData.rating_summary?.length
    ? evalData.rating_summary.map((item) => ({ label: item.title, score: item.score, max: item.max }))
    : [
      { label: 'Sales / Order Frequency', score: evalData.score_sales, max: 10 },
      { label: 'Display Quality', score: evalData.score_display, max: 10 },
      { label: 'Location & Traffic', score: evalData.score_location, max: 10 },
      { label: 'Owner Cooperation', score: evalData.score_cooperation, max: 10 },
      { label: 'Chain / Expansion', score: evalData.score_expansion, max: 10 },
      { label: 'Store Appearance', score: evalData.score_appearance, max: 10 },
    ];

  const levelColor = { S: 'gold', A: 'green', B: 'blue', C: 'orange', D: 'red' }[evalData.recommended_level] || 'default';

  const buildCopyText = () => [
    'UWELL Store Rating Result',
    `Store: ${evalData.stores?.name || '-'}`,
    `Date: ${evalData.eval_date ? new Date(evalData.eval_date).toLocaleDateString('en-US') : '-'}`,
    `Rating: ${evalData.recommended_level || '-'}`,
    `Total score: ${evalData.total_score || 0} / ${maxScore}`,
    '',
    'Breakdown:',
    ...dims.map((item) => `- ${item.label}: ${item.score} / ${item.max}`),
    '',
    `Notes: ${evalData.notes || '-'}`,
  ].join('\n');

  const handleCopy = async () => {
    const text = buildCopyText();
    try {
      await navigator.clipboard.writeText(text);
      message.success('Rating result copied.');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      message.success('Rating result copied.');
    }
  };

  return (
    <PageTransition>
      <div className="bg-radial-top" style={{ minHeight: '100vh', padding: 24 }}>
        <Button type="link" onClick={() => navigate('/app/evaluation')} style={{ marginBottom: 16, paddingLeft: 0 }}>
          &larr; Back to Evaluations
        </Button>
        <Card
          className="crud-card"
          title={`Store Rating: ${evalData.stores?.name || ''}`}
          extra={(
            <Space wrap>
              <Button onClick={() => navigate(`/app/evaluation/create?id=${evalData.id}`)}>Edit rating</Button>
              <Button type="primary" onClick={handleCopy}>Copy rating result</Button>
            </Space>
          )}
        >
          <Descriptions column={3} bordered style={{ marginBottom: 24 }}>
            <Descriptions.Item label="Store">{evalData.stores?.name}</Descriptions.Item>
            <Descriptions.Item label="Date">{evalData.eval_date ? new Date(evalData.eval_date).toLocaleDateString('en-US') : '-'}</Descriptions.Item>
            <Descriptions.Item label="Level"><Tag color={levelColor}>{evalData.recommended_level}</Tag></Descriptions.Item>
            <Descriptions.Item label="Total Score"><span style={{ fontSize: 20, fontWeight: 700 }}>{evalData.total_score}</span> / {maxScore}</Descriptions.Item>
            <Descriptions.Item label="Rate">{Math.round((Number(evalData.total_score || 0) / maxScore) * 100)}%</Descriptions.Item>
            <Descriptions.Item label="Evaluator">{evalData.evaluator?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="Notes" span={3}>{evalData.notes || '-'}</Descriptions.Item>
          </Descriptions>

          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Card className="liquid-glass" title="Radar Chart" size="small">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, radarMax]} />
                    <Radar dataKey="score" stroke="#1677ff" fill="#1677ff" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card className="liquid-glass" title="Dimension Scores" size="small">
                {dims.map((dimension) => (
                  <div key={dimension.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>{dimension.label}</span>
                      <span style={{ fontWeight: 600 }}>{dimension.score} / {dimension.max}</span>
                    </div>
                    <Progress
                      percent={Math.round((Number(dimension.score || 0) / (dimension.max || 10)) * 100)}
                      size="small"
                      strokeColor="#d6a84f"
                    />
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </PageTransition>
  );
};

export default EvalDetailPage;
