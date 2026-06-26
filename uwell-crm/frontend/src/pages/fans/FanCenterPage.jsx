import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tabs, Button, Row, Col, Statistic, Tag, Spin, Empty, Space, message, Progress, List, Input, Typography, Divider, Avatar, Dropdown } from 'antd';
import {
  CheckCircleOutlined, QrcodeOutlined, GiftOutlined, TeamOutlined, MessageOutlined,
  QuestionCircleOutlined, CopyOutlined, LikeOutlined, StarOutlined, CrownOutlined,
  ThunderboltOutlined, LogoutOutlined, FireOutlined, UserOutlined,
  SettingOutlined, ShopOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../stores/authStore';
import localDb from '../../services/db/localDb';
import seedData from '../../services/db/seedData';
import { getFans, addFanPoints, getQrCodes, scanQrCode, getScanRecords } from '../../services/api';
import { FAN_LEVELS, MALL_ITEMS } from '../../utils/constants';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ============ Check-in Tab ============
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
            <Statistic title="My Points" value={fan?.points || 0} prefix={<StarOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#1677ff', fontWeight: 700 }} />
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
                background: day.checked ? 'linear-gradient(135deg, #52c41a20 0%, #389e0d20 100%)' : day.isToday ? '#1677ff10' : '#fafafa',
                border: day.isToday ? '2px solid #1677ff' : '1px solid #f0f0f0',
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

// ============ Scan & Earn Tab ============
const ScanTab = ({ fan, onPointsChange }) => {
  const { data: qrCodes = [], isLoading } = useQuery({ queryKey: ['fan-qr-codes'], queryFn: () => getQrCodes({}) });
  const { data: scanRecords = [] } = useQuery({ queryKey: ['fan-scans'], queryFn: () => getScanRecords({}) });
  const [scanning, setScanning] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const myScans = scanRecords.filter((s) => s.fan_id === fan?.id);
  const todayScans = myScans.filter((s) => s.created_at?.startsWith(todayStr)).length;
  const scanLimit = 3;
  const scansRemaining = scanLimit - todayScans;

  const activeQr = qrCodes.find((q) => q.is_active);

  const handleScan = async () => {
    if (!activeQr || scansRemaining <= 0) return;
    setScanning(true);
    try {
      await scanQrCode(activeQr.id);
      message.success(`Scan successful! +${activeQr.points} points 🎉`);
      onPointsChange();
    } catch (err) {
      message.error(err.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <Card style={{ textAlign: 'center', borderRadius: 16, marginBottom: 16, background: 'linear-gradient(135deg, #722ed110 0%, #1677ff10 100%)' }}>
        <QrcodeOutlined style={{ fontSize: 64, color: '#722ed1', marginBottom: 16 }} />
        <Title level={4}>Scan to Earn Points!</Title>
        <Paragraph type="secondary" style={{ fontSize: 13 }}>
          Buy any UWELL product, find the QR code inside the package, and scan it here to earn points!
        </Paragraph>
        <Divider style={{ margin: '12px 0' }} />
        <Row gutter={16}>
          <Col span={12}>
            <Statistic title="Today's Scans" value={`${todayScans}/${scanLimit}`} valueStyle={{ color: scansRemaining > 0 ? '#52c41a' : '#ff4d4f' }} />
          </Col>
          <Col span={12}>
            <Statistic title="Total Scans" value={myScans.length} />
          </Col>
        </Row>
      </Card>

      <Button
        type="primary"
        size="large"
        block
        loading={scanning}
        disabled={!activeQr || scansRemaining <= 0}
        onClick={handleScan}
        style={{ height: 56, fontSize: 18, fontWeight: 700, borderRadius: 16, marginBottom: 16, background: 'linear-gradient(135deg, #722ed1 0%, #1677ff 100%)', border: 'none' }}
      >
        {scansRemaining > 0 ? '📱 Scan Now' : 'Limit Reached (3/day)'}
      </Button>

      <Card title="Recent Scans" size="small" style={{ borderRadius: 12 }}>
        {myScans.length === 0 ? (
          <Empty description="No scans yet. Buy a UWELL product and scan the QR code!" />
        ) : (
          <List
            size="small"
            dataSource={myScans.slice(0, 5)}
            renderItem={(s) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<QrcodeOutlined style={{ fontSize: 20, color: '#722ed1' }} />}
                  title={`${s.products?.name || 'Product'} · +${s.points_earned} pts`}
                  description={new Date(s.created_at).toLocaleString('en-US')}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

// ============ Rewards Mall Tab ============
const MallTab = ({ fan, onPointsChange }) => {
  const [category, setCategory] = useState('All');
  const [redeeming, setRedeeming] = useState(null);

  const categories = ['All', 'Device', 'Pod', 'Merch', 'Coupon', 'VIP'];
  const filteredItems = category === 'All' ? MALL_ITEMS : MALL_ITEMS.filter((i) => i.category === category);

  const handleRedeem = async (item) => {
    if (!fan) return;
    if (fan.points < item.points_cost) {
      message.error('Not enough points!');
      return;
    }
    setRedeeming(item.id);
    try {
      localDb.insert('mall_redemptions', {
        fan_id: fan.id,
        item_id: item.id,
        item_name: item.name,
        points_cost: item.points_cost,
      });
      await addFanPoints(fan.id, -item.points_cost, 'redeem', 'Mall Redemption', `Redeemed: ${item.name}`);
      message.success(`Redeemed ${item.name}! -${item.points_cost} points 🎁`);
      onPointsChange();
    } catch (err) {
      message.error('Redemption failed');
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <Card size="small" style={{ textAlign: 'center', borderRadius: 16, marginBottom: 16, background: 'linear-gradient(135deg, #52c41a10 0%, #389e0d10 100%)' }}>
        <Statistic title="Available Points" value={fan?.points || 0} prefix={<StarOutlined style={{ color: '#faad14' }} />} valueStyle={{ fontSize: 28, fontWeight: 700, color: '#1677ff' }} />
      </Card>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {categories.map((cat) => (
          <Button
            key={cat}
            size="small"
            type={category === cat ? 'primary' : 'default'}
            onClick={() => setCategory(cat)}
            style={{ borderRadius: 20, flexShrink: 0 }}
          >
            {cat}
          </Button>
        ))}
      </div>

      <Row gutter={[12, 12]}>
        {filteredItems.map((item) => (
          <Col xs={12} sm={8} md={6} key={item.id}>
            <Card
              size="small"
              hoverable
              style={{ borderRadius: 16, textAlign: 'center', overflow: 'hidden' }}
              cover={
                <div style={{
                  height: 100, background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                }}>
                  🎁
                </div>
              }
            >
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, minHeight: 36 }}>{item.name}</div>
              <Tag color="orange" style={{ marginBottom: 8 }}>{item.points_cost} pts</Tag>
              <br />
              <Button
                size="small"
                type="primary"
                loading={redeeming === item.id}
                disabled={(fan?.points || 0) < item.points_cost}
                onClick={() => handleRedeem(item)}
                style={{ borderRadius: 12, width: '100%' }}
              >
                Redeem
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

// ============ Invite Friends Tab ============
const InviteTab = ({ fan }) => {
  const [inviteCount, setInviteCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!fan) return;
    const records = localDb.find('mall_redemptions', (r) => r.fan_id === fan.id && r.source === 'invite');
    setInviteCount(records.length);
  }, [fan]);

  const referralCode = fan ? `UWELL-${fan.id?.slice(-8).toUpperCase()}` : 'UWELL-FAN';
  const referralLink = `${window.location.origin}/#/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      message.success('Link copied! Share with your friends 📤');
    }).catch(() => {
      message.info(`Share this code: ${referralCode}`);
    });
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <Card style={{ textAlign: 'center', borderRadius: 16, marginBottom: 16, background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' }}>
        <TeamOutlined style={{ fontSize: 56, color: '#667eea', marginBottom: 16 }} />
        <Title level={4}>Invite Friends, Earn 30 Points!</Title>
        <Paragraph type="secondary" style={{ fontSize: 13 }}>
          Share your unique referral link. When your friends register, you get <strong style={{ color: '#52c41a' }}>30 points</strong> per friend!
        </Paragraph>
      </Card>

      <Card title="Your Referral Code" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
        <div style={{
          textAlign: 'center', padding: 16, background: '#f5f5f5', borderRadius: 12, marginBottom: 12,
          fontFamily: 'monospace', fontSize: 20, fontWeight: 700, letterSpacing: 2, color: '#667eea',
        }}>
          {referralCode}
        </div>
        <Button type="primary" block size="large" icon={<CopyOutlined />} onClick={handleCopy} style={{ borderRadius: 12, height: 48 }}>
          Copy Referral Link
        </Button>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card size="small" style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic title="Friends Invited" value={inviteCount} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" style={{ textAlign: 'center', borderRadius: 12 }}>
            <Statistic title="Points Earned" value={inviteCount * 30} prefix={<StarOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Card size="small" style={{ marginTop: 16, borderRadius: 12, background: '#fffbe6' }}>
        <Text style={{ fontSize: 12, color: '#666' }}>
          💡 <strong>How it works:</strong> Your friend clicks the link, registers as a UWELL fan, and you both earn points. The more friends you invite, the more rewards you unlock!
        </Text>
      </Card>
    </div>
  );
};

// ============ Community Tab (Simplified) ============
const CommunityTab = ({ fan }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    // Seed some posts if empty
    if (localDb.count('community_posts') === 0) {
      const seedPosts = [
        { id: 'fp-001', author_name: 'Ahmed K.', content: 'Just got my G4 PRO! The flavor is incredible 🔥', category: 'Discussion', likes: 12, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 'fp-002', author_name: 'Saud M.', content: 'Redeemed a UWELL cap from the mall with my points! Love this club ⚡', category: 'Share', likes: 8, created_at: new Date(Date.now() - 172800000).toISOString() },
        { id: 'fp-003', author_name: 'Faisal R.', content: 'Which is better: G4 or G5? Thinking about upgrading', category: 'Question', likes: 5, created_at: new Date(Date.now() - 259200000).toISOString() },
      ];
      seedPosts.forEach((p) => localDb.insert('community_posts', p));
    }
    const allPosts = localDb.all('community_posts').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setPosts(allPosts);
  }, []);

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post = localDb.insert('community_posts', {
      author_name: fan?.profiles?.name || 'UWELL Fan',
      content: newPost.trim(),
      category: 'Discussion',
      likes: 0,
    });
    setPosts([post, ...posts]);
    setNewPost('');
    message.success('Posted! 🎉');
  };

  const handleLike = (postId) => {
    if (likedPosts.has(postId)) return;
    const post = localDb.findById('community_posts', postId);
    if (post) {
      localDb.update('community_posts', postId, { likes: (post.likes || 0) + 1 });
    }
    setLikedPosts(new Set([...likedPosts, postId]));
    setPosts(posts.map((p) => (p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p)));
  };

  const catColors = { Discussion: 'blue', Question: 'orange', Share: 'green', Event: 'purple' };

  return (
    <div style={{ padding: '8px 0' }}>
      <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
        <TextArea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share something with the community..."
          rows={3}
          style={{ borderRadius: 12, marginBottom: 8 }}
        />
        <Button type="primary" block onClick={handlePost} disabled={!newPost.trim()} style={{ borderRadius: 12 }}>
          Post
        </Button>
      </Card>

      <List
        dataSource={posts}
        renderItem={(post) => (
          <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <Avatar style={{ background: '#667eea', flexShrink: 0 }}>
                {post.author_name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 13 }}>{post.author_name}</Text>
                  <Tag color={catColors[post.category] || 'default'} style={{ fontSize: 10 }}>{post.category}</Tag>
                </div>
                <Paragraph style={{ marginBottom: 8, fontSize: 14 }}>{post.content}</Paragraph>
                <Space>
                  <Button
                    size="small"
                    type="text"
                    icon={<LikeOutlined style={{ color: likedPosts.has(post.id) ? '#1677ff' : '#999' }} />}
                    onClick={() => handleLike(post.id)}
                  >
                    {post.likes || 0}
                  </Button>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {new Date(post.created_at).toLocaleDateString('en-US')}
                  </Text>
                </Space>
              </div>
            </div>
          </Card>
        )}
      />
    </div>
  );
};

// ============ How It Works Tab ============
const HowItWorksTab = () => {
  const faqs = [
    {
      q: '🎯 How do I earn points?',
      a: 'There are many ways: Daily check-in (+5 pts), scanning QR codes on UWELL products (+5 pts each, up to 3/day), inviting friends (+30 pts per friend), and participating in lucky draws. The more active you are, the more points you earn!',
    },
    {
      q: '🏆 How do I level up?',
      a: 'You level up automatically as you earn more points. There are 5 levels: L1 Bronze (0+), L2 Silver (100+), L3 Gold (500+), L4 Platinum (2000+), L5 Diamond (5000+). Higher levels unlock exclusive rewards and benefits.',
    },
    {
      q: '🎁 What can I get with points?',
      a: 'Visit the Rewards Mall to redeem points for UWELL devices (G4, G5, KOKO), pod packs, merchandise (T-shirts, caps, lighters), store coupons, and VIP badges. New items are added regularly!',
    },
    {
      q: '📱 How does scanning work?',
      a: 'When you buy any UWELL product (G4, G4 PRO, G5, KOKO, or pods), look for the QR code inside the packaging. Open this app, go to "Scan & Earn", and scan the code. You\'ll earn 5 points per scan, up to 3 scans per day.',
    },
    {
      q: '👤 Old User Verification (Bonus 50 Points!)',
      a: 'If you purchased UWELL products before joining the Fan Club, you can verify your previous purchase to receive a bonus 50 points! Bring your receipt or proof of purchase to any UWELL store, or contact our WhatsApp support to verify. This is a one-time bonus for loyal UWELL users.',
    },
    {
      q: '👥 How does the invite system work?',
      a: 'Go to "Invite Friends", copy your unique referral link, and share it via WhatsApp, social media, or any messaging app. When someone clicks your link and registers, you automatically receive 30 points. There\'s no limit to how many friends you can invite!',
    },
    {
      q: '💬 What is the Community?',
      a: 'The Community tab is where UWELL fans share experiences, ask questions, and discuss products. You can post about your favorite flavors, ask for recommendations, share photos, and connect with other vape enthusiasts in the Middle East.',
    },
  ];

  return (
    <div style={{ padding: '8px 0' }}>
      <Card style={{ textAlign: 'center', borderRadius: 16, marginBottom: 16, background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' }}>
        <QuestionCircleOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 12 }} />
        <Title level={4}>How UWELL Fan Club Works</Title>
        <Text type="secondary">Everything you need to know about earning rewards</Text>
      </Card>

      {faqs.map((faq, idx) => (
        <Card key={idx} size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
          <Title level={5} style={{ marginBottom: 8 }}>{faq.q}</Title>
          <Paragraph style={{ color: '#666', fontSize: 13, marginBottom: 0 }}>{faq.a}</Paragraph>
        </Card>
      ))}

      <Card size="small" style={{ borderRadius: 12, background: '#f0f5ff', textAlign: 'center' }}>
        <Text style={{ fontSize: 13, color: '#666' }}>
          Need more help? Contact UWELL support on WhatsApp:
          <br />
          <Text strong style={{ fontSize: 16, color: '#52c41a' }}>+966 50 000 0000</Text>
        </Text>
      </Card>
    </div>
  );
};

// ============ Main Fan Center Page ============
const FanCenterPage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('checkin');
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: fans = [], isLoading } = useQuery({
    queryKey: ['fans', refreshKey],
    queryFn: () => getFans({}),
  });

  // Find current fan — match by user ID or fall back to first fan
  let currentFan = fans.find((f) => f.user_id === user?.id) || fans[0] || null;

  // Ensure DB is initialized
  if (localDb.needsInit()) { localDb.init(seedData); }

  // Auto-find fan from localStorage user session
  if (!currentFan) {
    const savedFanId = localStorage.getItem("store_manager_current_user");
    if (savedFanId) {
      const savedFan = localDb.findById("fans", savedFanId);
      if (savedFan) { currentFan = savedFan; }
    }
  }

  // Final fallback: use first seed fan
  if (!currentFan) {
    const allFans = localDb.all("fans");
    if (allFans.length > 0) {
      currentFan = allFans[0];
      localStorage.setItem("store_manager_current_user", currentFan.id);
    }
  }


  const handlePointsChange = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleLogout = async () => {
    localStorage.removeItem('store_manager_current_user');
    localStorage.removeItem('fan_logged_in');
    localStorage.removeItem('store_owner_mode');
    await signOut();
    window.location.href = '/fan-entry.html';
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Spin size="large" /></div>;
  }

  if (!currentFan) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Card style={{ textAlign: 'center', maxWidth: 400, borderRadius: 16 }}>
          <Empty description="No fan profile found. Please contact support." />
          <Button type="primary" onClick={handleLogout} style={{ marginTop: 16 }}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  const levelInfo = FAN_LEVELS.find((l) => l.value === currentFan.level) || FAN_LEVELS[0];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingBottom: 24 }}>
      {/* Top Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0a23 0%, #1a1a4e 50%, #2d1b69 100%)',
        padding: '16px 20px', color: '#fff', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 600, margin: '0 auto' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 2, background: 'linear-gradient(90deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              UWELL
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>FAN CLUB</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#faad14' }}>{currentFan.points} pts</div>
              <Tag color={levelInfo.color} style={{ fontSize: 10, margin: 0 }}>{levelInfo.label}</Tag>
            </div>
            <Dropdown menu={{
              items: [
                { key: 'owner', icon: <ShopOutlined />, label: 'Store Owner Portal' },
                { key: 'admin', icon: <SettingOutlined />, label: 'Admin Login' },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'owner') window.location.href = '/#/store-owner';
                else if (key === 'admin') window.location.href = '/#/admin';
                else if (key === 'logout') handleLogout();
              },
            }} placement="bottomRight">
              <Button type="text" size="small" icon={<SettingOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />} />
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px 12px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          size="small"
          items={[
            {
              key: 'checkin',
              label: <span>📅 Check-in</span>,
              children: <CheckInTab fan={currentFan} onPointsChange={handlePointsChange} />,
            },
            {
              key: 'scan',
              label: <span>📱 Scan</span>,
              children: <ScanTab fan={currentFan} onPointsChange={handlePointsChange} />,
            },
            {
              key: 'mall',
              label: <span>🎁 Rewards</span>,
              children: <MallTab fan={currentFan} onPointsChange={handlePointsChange} />,
            },
            {
              key: 'invite',
              label: <span>👥 Invite</span>,
              children: <InviteTab fan={currentFan} />,
            },
            {
              key: 'community',
              label: <span>💬 Community</span>,
              children: <CommunityTab fan={currentFan} />,
            },
            {
              key: 'help',
              label: <span>❓ Help</span>,
              children: <HowItWorksTab />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default FanCenterPage;
