import React, { useState, useEffect } from 'react';
import { message, Button } from 'antd';
import { TeamOutlined, CopyOutlined, UserOutlined, StarOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
import { getFanPointsLog } from '../../../services/api';
import { buildReferralCode } from '../../../utils/trialOps';
import useLanguageStore from '../../../stores/languageStore';
const INVITE_REWARD_POINTS = 50;

const InviteTab = ({ fan }) => {
  const { t } = useLanguageStore();
  const [inviteCount, setInviteCount] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    if (!fan) return;
    let disposed = false;
    async function loadReferralStats() {
      const localRecords = localDb.find('mall_redemptions', (r) => r.fan_id === fan.id && r.source === 'invite');
      let referralLogs;
      try {
        referralLogs = await getFanPointsLog(fan.id);
      } catch {
        referralLogs = localDb.find('fan_points_log', (r) => r.fan_id === fan.id);
      }
      if (disposed) return;
      const inviterLogs = (referralLogs || []).filter((log) => (
        log.source === 'Referral'
        && Number(log.points) > 0
        && String(log.description || '').startsWith('Friend registered')
      ));
      setInviteCount(Math.max(localRecords.length, inviterLogs.length));
      setPointsEarned(inviterLogs.reduce((sum, log) => sum + Number(log.points || 0), 0) || localRecords.length * INVITE_REWARD_POINTS);
    }
    loadReferralStats();
    return () => { disposed = true; };
  }, [fan]);

  const referralCode = fan ? buildReferralCode(fan.id) : 'UWELL-FAN';
  const referralLink = `${window.location.origin}/fan-app.html#/fan-entry?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      message.success(t('fan_real_invite_copied'));
    }).catch(() => {
      message.info(`${t('fan_real_invite_share_code')} ${referralCode}`);
    });
  };

  return (
    <div className="fan-invite-shell">
      <section className="fan-invite-hero">
        <TeamOutlined />
        <div>
          <span className="fan-mini-label">{t('fan_real_invite_label')}</span>
          <h2>{t('fan_real_invite_title')}</h2>
          <strong>{t('fan_real_invite_earn')}</strong>
          <p>{t('fan_real_invite_desc')}</p>
        </div>
      </section>

      <section className="fan-invite-code-card">
        <span>{t('fan_real_referral_code')}</span>
        <strong>{referralCode}</strong>
        <Button type="primary" block size="large" icon={<CopyOutlined />} onClick={handleCopy}>
          {t('fan_real_copy_referral')}
        </Button>
      </section>

      <section className="fan-invite-stat-grid">
        <div>
          <UserOutlined />
          <span>{t('fan_real_friends_invited')}</span>
          <strong>{inviteCount}</strong>
        </div>
        <div>
          <StarOutlined />
          <span>{t('fan_real_points_earned')}</span>
          <strong>{pointsEarned}</strong>
        </div>
      </section>

      <section className="fan-invite-rule-note">
        <strong>{t('fan_real_how_it_works')}</strong>
        <p>{t('fan_real_invite_rule_desc')}</p>
      </section>
    </div>
  );
};

export default InviteTab;

