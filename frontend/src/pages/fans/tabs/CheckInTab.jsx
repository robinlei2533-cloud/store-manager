import useLanguageStore from '../../../stores/languageStore';
﻿import React, { useState, useEffect } from 'react';
import { message, Button, Card, Statistic, Tag, Progress, Space, Typography, Row, Col, Divider, List, Input, Empty, Avatar } from 'antd';
import { StarOutlined, CrownOutlined, FireOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import localDb from '../../../services/db/localDb';
import { addFanPoints } from '../../../services/api';
import { FAN_LEVELS } from '../../../utils/constants';
const { Text } = Typography;
const CheckInTab = ({ fan, onPointsChange }) => {
  const queryClient = useQueryClient();
  const [checkinStreak, setCheckinStreak] = useState(0);
  const [todayChecked, setTodayChecked] = useState(false);
  const [weekData, setWeekData] = useState([]);

  useEffect(() => {
    if (!fan) return;
    const checkins = localDb.find('fan_checkins', (c) => c.fan_id === fan.id);
    const today = new Date().toISOString().split('T')[0];
    setTodayChecked(checkins.some((c) => c.date === today));

    // Calculate streak
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (checkins.some((c) => c.date === dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    setCheckinStreak(streak);

    // Build week data
    const week = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const checked = checkins.some((c) => c.date === dateStr);
      week.push({
        weekday: weekdays[d.getDay()],
        date: d.getDate(),
        checked,
        isToday: dateStr === today,
      });
    }
    setWeekData(week);
  }, [fan]);

  const handleCheckIn = async () => {
    if (!fan || todayChecked) return;
    const today = new Date().toISOString().split('T')[0];
    localDb.insert('fan_checkins', { fan_id: fan.id, date: today, points: 5 });
    await addFanPoints(fan.id, 5, 'earn', 'Daily Check-in', 'Daily check-in bonus');
    setTodayChecked(true);
    setCheckinStreak((s) => s + 1);
    setWeekData((prev) => prev.map((d) => (d.isToday ? { ...d, checked: true } : d)));
    message.success('Check-in successful! +5 points 🔥');
    onPointsChange();
  };

  const levelInfo = FAN_LEVELS.find((l) => l.value === fan?.level) || FAN_LEVELS[0];
  const nextLevel = FAN_LEVELS.find((l) => l.min_points > (fan?.points || 0));
  const levelProgress = nextLevel
    ? Math.round(((fan?.points || 0) / nextLevel.min_points) * 100)
    : 100;

  return (
    <div style={{ padding: '8px 0' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Card size="small" style={{ textAlign: 'center', borderRadius: 16, background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)' }}>
            <Statistic title="My Points" value={fan?.points || 0} prefix={<StarOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#FFD700', fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small" style={{ textAlign: 'center', borderRadius: 16 }}>
            <div style={{ fontSize: 12, color: '#999' }}>Level</div>
            <Tag color={levelInfo.color} style={{ fontSize: 14, padding: '4px 12px', marginTop: 4 }}>{levelInfo.label}</Tag>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ textAlign: 'center', borderRadius: 16, background: '#f0f5ff' }}>
            <Statistic title="Streak" value={checkinStreak} suffix="days" prefix={<FireOutlined style={{ color: '#ff4d4f' }} />} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      {/* Week calendar */}
      <Card title="📅 This Week" size="small" style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row gutter={4}>
          {weekData.map((day, idx) => (
            <Col span={24 / 7} key={idx} style={{ textAlign: 'center' }}>
              <div style={{
                padding: '12px 2px',
                borderRadius: 12,
                background: day.checked ? 'linear-gradient(135deg, #52c41a20 0%, #389e0d20 100%)' : day.isToday ? '#FFD70010' : '#fafafa',
                border: day.isToday ? '2px solid #FFD700' : '1px solid #f0f0f0',
              }}>
                <div style={{ fontSize: 11, color: '#999' }}>{day.weekday}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: day.checked ? '#52c41a' : '#333', margin: '4px 0' }}>{day.date}</div>
                {day.checked ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} /> : <div style={{ height: 16 }} />}
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Check-in button */}
      <Button
        type="primary"
        size="large"
        block
        disabled={todayChecked}
        onClick={handleCheckIn}
        style={{
          height: 56, fontSize: 18, fontWeight: 700, borderRadius: 16,
          background: todayChecked ? '#d9d9d9' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
        }}
      >
        {todayChecked ? '✓ Checked In Today' : '🔥 Check In Now (+5 pts)'}
      </Button>

      {/* Level progress */}
      {nextLevel && (
        <Card size="small" style={{ marginTop: 16, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text>{levelInfo.label}</Text>
            <Text type="secondary">{nextLevel.min_points - (fan?.points || 0)} pts to {nextLevel.label}</Text>
          </div>
          <Progress percent={levelProgress} strokeColor={{ from: '#667eea', to: '#764ba2' }} />
        </Card>
      )}
    </div>
  );
};

export default CheckInTab;

