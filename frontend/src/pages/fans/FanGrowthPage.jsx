import React, { useState, useEffect } from 'react';
import {
  Card, Tabs, Button, Row, Col, Statistic, Tag, Spin, Empty, Space, message,
  Modal, Progress, List, Image, Select, Typography, Badge,
} from 'antd';
import {
  CheckCircleOutlined, GiftOutlined, ShoppingOutlined, EnvironmentOutlined,
  TrophyOutlined, StarOutlined, ThunderboltOutlined, CrownOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Cell } from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import localDb from '../../services/db/localDb';
import {
  getFans, getFanPointsLog, addFanPoints, getScanRecords,
} from '../../services/api';
import { FAN_LEVELS, LOTTERY_PRIZES, MALL_ITEMS } from '../../utils/constants';
import PageTransition from "../../components/common/PageTransition";

const { Title, Text, Paragraph } = Typography;

// ============ Helper: get level info ============
function getLevelInfo(level) {
  return FAN_LEVELS.find((l) => l.value === level) || FAN_LEVELS[0];
}

function getNextLevel(currentLevel) {
  const idx = FAN_LEVELS.findIndex((l) => l.value === currentLevel);
  if (idx < 0 || idx >= FAN_LEVELS.length - 1) return null;
  return FAN_LEVELS[idx + 1];
}


// ============ Tab 1: Check-in & Points ============
const CheckInTab = ({ fan }) => {
  const queryClient = useQueryClient();
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);
  const [weekData, setWeekData] = useState([]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Get this week's dates (Mon-Sun)
  const getWeekDates = () => {
    const now = new Date();
    const day = now.getDay() || 7; // Sunday = 7
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  useEffect(() => {
    if (!fan) return;
    const weekDates = getWeekDates();
    const allCheckins = localDb.find('fan_checkins', (c) => c.fan_id === fan.id);
    const weekCheckins = weekDates.map((date) => ({
      date,
      checkedIn: allCheckins.some((c) => c.date === date),
      isToday: date === todayStr,
    }));
    setWeekData(weekCheckins);
    setTodayCheckedIn(allCheckins.some((c) => c.date === todayStr));
  }, [fan, todayStr]);

  const { data: pointsLog = [], isLoading: logLoading } = useQuery({
    queryKey: ['fan-logs', fan?.id],
    queryFn: () => getFanPointsLog(fan?.id),
    enabled: !!fan,
  });

  const { data: scanRecords = [] } = useQuery({
    queryKey: ['scan-records'],
    queryFn: () => getScanRecords({}),
  });

  const todayScans = scanRecords.filter((s) => s.created_at?.startsWith(todayStr)).length;
  const scanLimit = 3;
  const scansRemaining = Math.max(0, scanLimit - todayScans);

  const handleCheckIn = async () => {
    if (todayCheckedIn || !fan) return;
    localDb.insert('fan_checkins', {
      fan_id: fan.id,
      date: todayStr,
      points: 5,
    });
    await addFanPoints(fan.id, 5, 'earn', 'Daily Check-in', `Daily check-in ${todayStr}`);
    setTodayCheckedIn(true);
    setWeekData((prev) => prev.map((d) => (d.date === todayStr ? { ...d, checkedIn: true } : d)));
    queryClient.invalidateQueries({ queryKey: ['fan-logs'] });
    queryClient.invalidateQueries({ queryKey: ['fans'] });
    message.success('签到成功！+5 积分');
  };

  if (!fan) return <Empty description="暂无粉丝数据" />;

  const levelInfo = getLevelInfo(fan.level);
  const nextLevel = getNextLevel(fan.level);
  const progressPct = nextLevel
    ? Math.min(100, Math.round(((fan.points - levelInfo.min_points) / (nextLevel.min_points - levelInfo.min_points)) * 100))
    : 100;

  const weekDayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  return (
    <PageTransition>
    <div>
      <Row gutter={16} className="fg-mb24">
        <Col xs={12} sm={12} lg={6}>
          <Card className="liquid-glass" size="small">
            <Statistic title="当前积分" value={fan.points} prefix={<StarOutlined />} styles={{ content: { color: 'var(--uwell-gold)' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="liquid-glass" size="small">
            <Statistic title="等级" value={levelInfo.label} prefix={<CrownOutlined style={{ color: levelInfo.color }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small">
            <Statistic title="今日扫码" value={`${todayScans}/${scanLimit}`} prefix={<ThunderboltOutlined />} styles={{ content: { color: scansRemaining > 0 ? '#52c41a' : '#ff4d4f' } }} />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small">
            <Statistic title="总贡献" value={fan.total_contribution} />
          </Card>
        </Col>
      </Row>

      {/* Level Progress */}
      <Card title="等级进度" size="small" className="fg-mb24">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Tag color={levelInfo.color} style={{ fontSize: 14, padding: '4px 12px' }}>{levelInfo.label}</Tag>
          {nextLevel ? (
            <Text type="secondary">{fan.points} / {nextLevel.min_points} 积分，距离 {nextLevel.label}</Text>
          ) : (
            <Text type="success">已达到最高等级</Text>
          )}
        </div>
        <Progress percent={progressPct} strokeColor={levelInfo.color} />
      </Card>

      {/* Check-in Calendar */}
      <Card title="每日签到（+5 积分/天）" size="small" className="fg-mb24">
        <Row gutter={8}>
          {weekData.map((day, idx) => (
            <Col span={24 / 7} key={idx} style={{ textAlign: 'center' }}>
              <div
                style={{
                  padding: '12px 4px',
                  borderRadius: 8,
                  border: day.isToday ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.1)',
                  background: day.checkedIn ? 'rgba(22,163,74,0.12)' : day.date < todayStr ? 'rgba(255,255,255,0.03)' : 'transparent',
                  cursor: day.isToday && !day.checkedIn ? 'pointer' : 'default',
                  opacity: day.date > todayStr ? 0.5 : 1,
                }}
                onClick={() => day.isToday && !day.checkedIn && handleCheckIn()}
              >
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{weekDayLabels[idx]}</div>
                <div style={{ fontSize: 18, fontWeight: 600, margin: '4px 0' }}>
                  {new Date(day.date).getDate()}
                </div>
                {day.checkedIn ? (
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                ) : day.date > todayStr ? (
                  <LockOutlined style={{ color: 'rgba(255,255,255,0.2)' }} />
                ) : (
                  <div className="fg-day-spacer" />
                )}
              </div>
            </Col>
          ))}
        </Row>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            disabled={todayCheckedIn}
            onClick={handleCheckIn}
            style={{ minWidth: 200 }}
          >
            {todayCheckedIn ? '今日已签到' : '立即签到'}
          </Button>
        </div>
      </Card>

      {/* Points History */}
      <Card title="最近积分记录" size="small">
        {logLoading ? (
          <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
        ) : pointsLog.length > 0 ? (
          <List
            size="small"
            dataSource={pointsLog.slice(0, 10)}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color={item.type === 'earn' ? 'green' : 'red'}>
                        {item.type === 'earn' ? `+${item.points}` : `-${item.points}`}
                      </Tag>
                      {item.source}
                    </Space>
                  }
                  description={`${item.description} - ${new Date(item.created_at).toLocaleString('zh-CN')}`}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无积分记录" />
        )}
      </Card>
    </div>
    </PageTransition>);
};

// ============ Tab 2: Lucky Draw ============
const LuckyDrawTab = ({ fan }) => {
  const queryClient = useQueryClient();
  const [drawing, setDrawing] = useState(false);
  const [result, setResult] = useState(null);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const DRAW_COST = 20;

  useEffect(() => {
    if (!fan) return;
    const records = localDb.find('lottery_records', (r) => r.fan_id === fan.id);
    setHistory(records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  }, [fan]);

  const totalDraws = history.length;
  const totalWon = history.reduce((sum, r) => sum + r.points_won, 0);

  const drawPrize = () => {
    const rand = Math.random();
    let cumulative = 0;
    let wonPrize = LOTTERY_PRIZES[LOTTERY_PRIZES.length - 1]; // default
    for (const prize of LOTTERY_PRIZES) {
      cumulative += prize.probability;
      if (rand < cumulative) {
        wonPrize = prize;
        break;
      }
    }
    return wonPrize;
  };

  const handleDraw = async () => {
    if (!fan) return;
    if (fan.points < DRAW_COST) {
      message.error(`积分不足！需要 ${DRAW_COST} 积分，当前 ${fan.points} 积分`);
      return;
    }

    setDrawing(true);
    setResult(null);

    // Simulate animation delay
    setTimeout(async () => {
      const prize = drawPrize();

      // Record in localDb
      localDb.insert('lottery_records', {
        fan_id: fan.id,
        prize_id: prize.id,
        prize_label: prize.label,
        points_won: prize.points,
        created_at: new Date().toISOString(),
      });

      // Deduct draw cost
      await addFanPoints(fan.id, -DRAW_COST, 'redeem', 'Lucky Draw', `Draw cost: -${DRAW_COST} pts`);

      // Award prize if won
      if (prize.points > 0) {
        await addFanPoints(fan.id, prize.points, 'earn', 'Lucky Draw', `Won: ${prize.label} (+${prize.points} pts)`);
      }

      // Update history
      const records = localDb.find('lottery_records', (r) => r.fan_id === fan.id);
      setHistory(records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

      setResult(prize);
      setResultModalOpen(true);
      setDrawing(false);
      queryClient.invalidateQueries({ queryKey: ['fans'] });
      queryClient.invalidateQueries({ queryKey: ['fan-logs'] });
    }, 2000);
  };

  if (!fan) return <Empty description="暂无粉丝数据" />;

  return (
    <div>
      <Row gutter={16} className="fg-mb24">
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic title="当前积分" value={fan.points} prefix={<StarOutlined />} styles={{ content: { color: '#1677ff' } }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic title="抽奖次数" value={totalDraws} prefix={<GiftOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic title="中奖积分" value={totalWon} prefix={<TrophyOutlined />} styles={{ content: { color: '#52c41a' } }} />
          </Card>
        </Col>
      </Row>

      {/* Draw Area */}
      <Card style={{ textAlign: 'center', marginBottom: 24, background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)' }}>
        <div style={{ padding: '40px 20px' }}>
          <div
            style={{
              width: 200,
              height: 200,
              margin: '0 auto 24px',
              borderRadius: '50%',
              background: drawing ? 'conic-gradient(from 0deg, #ff4d4f, #faad14, #52c41a, #1677ff, #722ed1, #ff4d4f)' : 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              animation: drawing ? 'spin 0.5s linear infinite' : 'none',
              transition: 'all 0.3s',
            }}
          >
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              {drawing ? (
                <Spin size="large" />
              ) : result ? (
                <>
                  <div className="fg-lotto-result-icon">{result.icon}</div>
                  <div className="fg-lotto-result-label">{result.label}</div>
                </>
              ) : (
                <>
                  <GiftOutlined style={{ fontSize: 48, color: '#722ed1' }} />
                  <div style={{ marginTop: 8, color: '#999' }}>点击抽奖</div>
                </>
              )}
            </div>
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          <Button
            type="primary"
            size="large"
            icon={<ThunderboltOutlined />}
            loading={drawing}
            onClick={handleDraw}
            disabled={fan.points < DRAW_COST}
            style={{ minWidth: 220, height: 48, fontSize: 16 }}
          >
            {drawing ? '抽奖中...' : `立即抽奖（${DRAW_COST} 积分）`}
          </Button>
          {fan.points < DRAW_COST && (
            <div style={{ marginTop: 8, color: '#ffccc7' }}>
              <LockOutlined /> 至少需要 {DRAW_COST} 积分才能抽奖
            </div>
          )}
        </div>
      </Card>

      {/* Prize List */}
      <Card title="奖品档位" size="small" className="fg-mb24">
        <Row gutter={[8, 8]}>
          {LOTTERY_PRIZES.map((prize) => (
            <Col xs={12} sm={8} key={prize.id}>
              <Card size="small" hoverable style={{ textAlign: 'center' }}>
                <div className="fg-prize-icon">{prize.icon}</div>
                <div className="fg-prize-label">{prize.label}</div>
                <div style={{ color: prize.points > 0 ? '#52c41a' : '#999' }}>
                  {prize.points > 0 ? `+${prize.points} 积分` : '未中奖'}
                </div>
                <Tag className="fg-mt8">{(prize.probability * 100).toFixed(0)}%</Tag>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Draw History */}
      <Card title="抽奖记录" size="small">
        {history.length > 0 ? (
          <List
            size="small"
            dataSource={history.slice(0, 10)}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<GiftOutlined style={{ fontSize: 20, color: '#722ed1' }} />}
                  title={
                    <Space>
                      {item.prize_label}
                      {item.points_won > 0 ? (
                        <Tag color="green">+{item.points_won} pts</Tag>
                      ) : (
                        <Tag>未中奖</Tag>
                      )}
                    </Space>
                  }
                  description={new Date(item.created_at).toLocaleString('zh-CN')}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无抽奖记录" />
        )}
      </Card>

      {/* Result Modal */}
      <Modal
        open={resultModalOpen}
        onCancel={() => setResultModalOpen(false)}
        footer={<Button type="primary" onClick={() => setResultModalOpen(false)}>确认</Button>}
        centered
        width="90%" className="fg-spec-table"
      >
        {result && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div className="fg-fs72 fg-mb16">{result.icon}</div>
            <Title level={3} style={{ marginBottom: 8 }}>{result.label}</Title>
            {result.points > 0 ? (
              <Paragraph type="success" style={{ fontSize: 20 }}>
                +{result.points} 积分！
              </Paragraph>
            ) : (
              <Paragraph type="secondary">下次好运！</Paragraph>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

// ============ Tab 3: Points Mall ============
const MallTab = ({ fan }) => {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState(undefined);
  const [redemptions, setRedemptions] = useState([]);

  useEffect(() => {
    if (!fan) return;
    const records = localDb.find('mall_redemptions', (r) => r.fan_id === fan.id);
    setRedemptions(records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  }, [fan]);

  const categories = ['Device', 'Pod', 'Merch', 'Coupon', 'VIP'];
  const filteredItems = category ? MALL_ITEMS.filter((i) => i.category === category) : MALL_ITEMS;

  const handleRedeem = async (item) => {
    if (!fan) return;
    if (fan.points < item.points_cost) {
      message.error(`积分不足！需要 ${item.points_cost}，当前 ${fan.points}`);
      return;
    }
    if (item.stock <= 0) {
      message.error('库存不足！');
      return;
    }

    localDb.insert('mall_redemptions', {
      fan_id: fan.id,
      item_id: item.id,
      item_name: item.name,
      points_cost: item.points_cost,
      created_at: new Date().toISOString(),
    });

    await addFanPoints(fan.id, -item.points_cost, 'redeem', 'Points Mall', `Redeemed: ${item.name} (-${item.points_cost} pts)`);

    const records = localDb.find('mall_redemptions', (r) => r.fan_id === fan.id);
    setRedemptions(records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    queryClient.invalidateQueries({ queryKey: ['fans'] });
    queryClient.invalidateQueries({ queryKey: ['fan-logs'] });
    message.success(`已兑换：${item.name}！-${item.points_cost} 积分`);
  };

  if (!fan) return <Empty description="暂无粉丝数据" />;

  return (
    <div>
      <Card size="small" className="fg-card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(18,18,26,0.95) 100%)' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Statistic title="当前积分" value={fan.points} prefix={<StarOutlined />} styles={{ content: { color: '#1677ff', fontSize: 28 } }} />
          </Col>
          <Col>
            <Select
              placeholder="全部分类"
              value={category}
              onChange={setCategory}
              allowClear
              style={{ width: 180 }}
              options={categories.map((c) => ({ label: c, value: c }))}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={[12, 12]} className="fg-mb24">
        {filteredItems.map((item) => {
          const canAfford = fan.points >= item.points_cost;
          return (
            <Col xs={12} sm={8} md={6} key={item.id}>
              <Card
                size="small"
                hoverable
                cover={
                  <div
                    style={{
                      height: 120,
                      background: canAfford
                        ? 'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,215,0,0.03) 100%)'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {item.image ? (
                      <Image src={item.image} width={80} height={80} style={{ objectFit: 'cover', borderRadius: 8 }} />
                    ) : (
                      <ShoppingOutlined style={{ fontSize: 48, color: canAfford ? '#FFD700' : 'rgba(255,255,255,0.2)' }} />
                    )}
                    <Tag
                      color={item.category === 'VIP' ? 'purple' : item.category === 'Device' ? 'blue' : 'default'}
                      style={{ position: 'absolute', top: 8, left: 8 }}
                    >
                      {item.category}
                    </Tag>
                  </div>
                }
                actions={[
                  <Button
                    type="primary"
                    size="small"
                    disabled={!canAfford || item.stock <= 0}
                    onClick={() => handleRedeem(item)}
                    icon={!canAfford ? <LockOutlined /> : <ShoppingOutlined />}
                  >
                    {item.stock <= 0 ? '缺货' : canAfford ? '兑换' : `${item.points_cost} 积分`}
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={<Text className="fg-fs13">{item.name}</Text>}
                  description={
                    <Space>
                      <Tag color="orange">{item.points_cost} 积分</Tag>
                      <Text type="secondary" className="fg-fs12">库存：{item.stock}</Text>
                    </Space>
                  }
                />
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Redemption History */}
      <Card title="兑换记录" size="small">
        {redemptions.length > 0 ? (
          <List
            size="small"
            dataSource={redemptions.slice(0, 10)}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<ShoppingOutlined style={{ fontSize: 20, color: '#722ed1' }} />}
                  title={item.item_name}
                  description={
                    <Space>
                      <Tag color="red">-{item.points_cost} 积分</Tag>
                      {new Date(item.created_at).toLocaleString('zh-CN')}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无兑换记录" />
        )}
      </Card>
    </div>
  );
};

// ============ Tab 4: Fan Map ============
const FanMapTab = ({ fans }) => {
  const levelData = FAN_LEVELS.map((level) => ({
    name: level.label,
    count: fans.filter((f) => f.level === level.value).length,
    color: level.color,
  })).filter((d) => d.count > 0);

  const topFans = [...fans].sort((a, b) => b.points - a.points).slice(0, 10);

  // Group by store
  const storeGroups = {};
  fans.forEach((f) => {
    const storeName = f.stores?.name || '未分配';
    if (!storeGroups[storeName]) storeGroups[storeName] = [];
    storeGroups[storeName].push(f);
  });

  return (
    <div>
      <Row gutter={16} className="fg-mb24">
        <Col xs={12} sm={12} lg={6}>
          <Card size="small"><Statistic title="粉丝总数" value={fans.length} prefix={<EnvironmentOutlined />} /></Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small"><Statistic title="VIP (L5)" value={fans.filter((f) => f.level === 'diamond').length} prefix={<CrownOutlined />} styles={{ content: { color: '#B9F2FF' } }} /></Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small"><Statistic title="活跃门店" value={Object.keys(storeGroups).length} /></Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small"><Statistic title="总积分" value={fans.reduce((s, f) => s + f.points, 0)} prefix={<StarOutlined />} /></Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Level Distribution Chart */}
        <Col xs={24} lg={12}>
          <Card title="粉丝等级分布" size="small" className="fg-mb16">
            {levelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={levelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                  <RTooltip />
                  <Bar dataKey="count" name="粉丝" radius={[0, 4, 4, 0]}>
                    {levelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="暂无数据" className="fg-empty-p40" />
            )}
          </Card>
        </Col>

        {/* Top Fans Leaderboard */}
        <Col xs={24} lg={12}>
          <Card title={<><TrophyOutlined /> 粉丝排行榜</>} size="small" className="fg-mb16">
            <List
              size="small"
              dataSource={topFans}
              renderItem={(fan, idx) => {
                const levelInfo = getLevelInfo(fan.level);
                const medal = idx === 0 ? '第1' : idx === 1 ? '第2' : idx === 2 ? '第3' : `${idx + 1}`;
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<span className="fg-leaderboard-avatar">{medal}</span>}
                      title={
                        <Space>
                          <span>{fan.profiles?.name || `Fan #${fan.id?.slice(0, 6)}`}</span>
                          <Tag color={levelInfo.color} className="fg-fs10">{levelInfo.label}</Tag>
                        </Space>
                      }
                      description={
                        <Space>
                          <StarOutlined style={{ color: '#faad14' }} />
                          <strong>{fan.points}</strong> 积分
                          <Text type="secondary" style={{ fontSize: 12 }}>- {fan.stores?.name || '-'}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
              locale={{ emptyText: <Empty description="暂无粉丝" /> }}
            />
          </Card>
        </Col>
      </Row>

      {/* Fans by Store */}
      <Card className="liquid-glass" title="按门店查看粉丝" size="small">
        {Object.keys(storeGroups).length > 0 ? (
          <List
            size="small"
            dataSource={Object.entries(storeGroups).sort(([, a], [, b]) => b.length - a.length)}
            renderItem={([storeName, storeFans]) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      <EnvironmentOutlined />
                      <strong>{storeName}</strong>
                      <Badge count={storeFans.length} style={{ backgroundColor: '#1677ff' }} />
                    </Space>
                  }
                  description={
                    <Space wrap>
                      {storeFans.slice(0, 8).map((f) => {
                        const li = getLevelInfo(f.level);
                        return (
                          <Tag key={f.id} color={li.color} className="fg-fan-tag">
                            {f.profiles?.name || `粉丝 #${f.id?.slice(0, 4)}`} - {f.points}积分
                          </Tag>
                        );
                      })}
                      {storeFans.length > 8 && <Tag>还有 {storeFans.length - 8} 人</Tag>}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无粉丝分布数据" />
        )}
      </Card>
    </div>
  );
};

// ============ Main Page ============
const FanGrowthPage = () => {
  const [activeTab, setActiveTab] = useState('checkin');
  const [selectedFanId, setSelectedFanId] = useState(null);

  const { data: fans = [], isLoading } = useQuery({
    queryKey: ['fans'],
    queryFn: () => getFans({}),
  });

  // Use selected fan, or default to highest-points fan, but let user switch
  const currentFan = fans.find(f => f.id === selectedFanId) || fans[0] || null;

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>;
  }

  if (!fans.length) {
    return (
      <Card className="liquid-glass">
        <Empty description="暂无粉丝数据，请先在粉丝列表中添加粉丝。" />
      </Card>
    );
  }

  return (
    <div className="bg-radial-top" style={{minHeight:"100vh",padding:24}}>
      <Title level={4} className="fg-mb16">
        <ThunderboltOutlined /> 粉丝增长中心
      </Title>

      {/* Fan selector */}
      <Card size="small" className="fg-mb16 liquid-glass">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Text strong>选择粉丝：</Text>
            <Select
              value={currentFan?.id}
              onChange={setSelectedFanId}
              style={{ width: '60%', marginLeft: 8 }}
              showSearch
              optionFilterProp="label"
              options={fans.map(f => ({
                label: `${f.profiles?.name || '粉丝 #' + (f.id?.slice(-6) || '')} - ${f.points}积分 - ${f.level}`,
                value: f.id,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={16}>
            {currentFan && (
              <Space>
                <Tag color={FAN_LEVELS.find(l => l.value === currentFan.level)?.color}>
                  {FAN_LEVELS.find(l => l.value === currentFan.level)?.label || currentFan.level}
                </Tag>
                <Text strong>{currentFan.points} 积分</Text>
                <Text type="secondary">总贡献：{currentFan.total_contribution}</Text>
              </Space>
            )}
          </Col>
        </Row>
      </Card>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'checkin',
            label: <span><CheckCircleOutlined /> 签到与积分</span>,
            children: <CheckInTab fan={currentFan} />,
          },
          {
            key: 'lottery',
            label: <span><GiftOutlined /> 幸运抽奖</span>,
            children: <LuckyDrawTab fan={currentFan} />,
          },
          {
            key: 'mall',
            label: <span><ShoppingOutlined /> 积分商城</span>,
            children: <MallTab fan={currentFan} />,
          },
          {
            key: 'map',
            label: <span><EnvironmentOutlined /> 粉丝地图</span>,
            children: <FanMapTab fans={fans} />,
          },
        ]}
      />
    </div>
  );
};

export default FanGrowthPage;
