import useLanguageStore from '../../../stores/languageStore';
import React from 'react';
import { Card, Steps, Tag, Typography, Space, Row, Col } from 'antd';
import { CheckCircleOutlined, GiftOutlined, QrcodeOutlined, CrownOutlined } from '@ant-design/icons';
const { Text } = Typography;
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

export default HowItWorksTab;

