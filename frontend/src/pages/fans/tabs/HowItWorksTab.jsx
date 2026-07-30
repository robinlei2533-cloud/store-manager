import React from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import useLanguageStore from '../../../stores/languageStore';

const HowItWorksTab = () => {
  const { t } = useLanguageStore();
  const earningChannels = [
    {
      q: t('fan_real_help_scan_question'),
      a: t('fan_real_help_scan_answer'),
    },
    {
      q: t('fan_real_help_checkin_question'),
      a: t('fan_real_help_checkin_answer'),
    },
    {
      q: t('fan_real_help_activities_question'),
      a: t('fan_real_help_activities_answer'),
    },
    {
      q: t('fan_real_help_community_question'),
      a: t('fan_real_help_community_answer'),
    },
  ];

  const supportChannels = [
    {
      q: t('fan_real_help_invite_question'),
      a: t('fan_real_help_invite_answer'),
    },
    {
      q: t('fan_real_help_levels_question'),
      a: t('fan_real_help_levels_answer'),
    },
    {
      q: t('fan_real_help_existing_fan_question'),
      a: t('fan_real_help_existing_fan_answer'),
    },
  ];

  return (
    <div className="fan-guide-shell">
      <section className="fan-guide-hero">
        <QuestionCircleOutlined />
        <div>
          <span className="fan-mini-label">{t('fan_real_help_label')}</span>
          <h2>{t('fan_real_help_title')}</h2>
          <p>{t('fan_real_help_desc')}</p>
        </div>
      </section>

      <section className="fan-guide-help-card">
        <strong>{t('fan_real_need_more_help')}</strong>
        <p>{t('fan_real_help_more_desc')}</p>
      </section>

      <section className="fan-guide-channel-grid">
        {earningChannels.map((faq) => (
          <article key={faq.q}>
            <strong>{faq.q}</strong>
            <p>{faq.a}</p>
          </article>
        ))}
      </section>

      <section className="fan-guide-support-row">
        {supportChannels.map((faq) => (
          <article key={faq.q}>
            <strong>{faq.q}</strong>
            <p>{faq.a}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default HowItWorksTab;

