import { useEffect, useState } from 'react';
import { Button, Progress, Tag, message } from 'antd';
import { CheckCircleOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';
import useLanguageStore from '../../../stores/languageStore';
import localDb from '../../../services/db/localDb';
import { addFanPoints } from '../../../services/api';
import { FAN_LEVELS } from '../../../utils/constants';
import { OPERATIONAL_RULE_RECORD_ID, mergeOperationalRules } from '../../../utils/uwellLaunchRules';

const CheckInTab = ({ fan, onPointsChange }) => {
  const { t } = useLanguageStore();
  const operationalRules = mergeOperationalRules(localDb.findById('fan_points_rules', OPERATIONAL_RULE_RECORD_ID)?.settings);
  const [checkinStreak, setCheckinStreak] = useState(0);
  const [todayChecked, setTodayChecked] = useState(false);
  const [weekData, setWeekData] = useState([]);

  useEffect(() => {
    if (!fan) return;
    const checkins = localDb.find('fan_checkins', (c) => c.fan_id === fan.id);
    const today = new Date().toISOString().split('T')[0];
    setTodayChecked(checkins.some((c) => c.date === today));

    let streak = 0;
    for (let i = 0; i < 365; i += 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (checkins.some((c) => c.date === dateStr)) {
        streak += 1;
      } else if (i > 0) {
        break;
      }
    }
    setCheckinStreak(streak);

    const week = [];
    const weekdays = ['weekday_sun', 'weekday_mon', 'weekday_tue', 'weekday_wed', 'weekday_thu', 'weekday_fri', 'weekday_sat'];
    for (let i = 6; i >= 0; i -= 1) {
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
    await addFanPoints(fan.id, operationalRules.checkInPoints, 'earn', 'Daily Check-in', 'Daily check-in bonus');
    localDb.insert('fan_checkins', { fan_id: fan.id, date: today, points: operationalRules.checkInPoints });
    setTodayChecked(true);
    setCheckinStreak((s) => s + 1);
    setWeekData((prev) => prev.map((d) => (d.isToday ? { ...d, checked: true } : d)));
    message.success(t('fan_checkin_success').replace('+10', `+${operationalRules.checkInPoints}`).replace('+5', `+${operationalRules.checkInPoints}`));
    onPointsChange();
  };

  const levelInfo = FAN_LEVELS.find((l) => l.value === fan?.level) || FAN_LEVELS[0];
  const nextLevel = FAN_LEVELS.find((l) => l.min_points > (fan?.points || 0));
  const levelProgress = nextLevel
    ? Math.round(((fan?.points || 0) / nextLevel.min_points) * 100)
    : 100;

  return (
    <div className="fan-checkin-page">
      <section className="fan-checkin-hero">
        <div>
          <span className="fan-mini-label">{t('fan_real_checkin_title')}</span>
          <h2>{t('fan_real_checkin_build_streak')}</h2>
          <p>{t('fan_real_checkin_desc')}</p>
        </div>
        <div className="fan-checkin-streak-badge">
          <FireOutlined />
          <strong>{checkinStreak}</strong>
          <span>{t('days')}</span>
        </div>
      </section>

      <section className="fan-checkin-action-card fan-checkin-priority-action">
        <div>
          <strong>{todayChecked ? t('fan_real_checkin_you_checked') : t('fan_real_checkin_collect_today')}</strong>
          <span>{todayChecked ? t('fan_real_checkin_come_back') : `${t('fan_real_checkin_daily_reward')}: +${operationalRules.checkInPoints} ${t('fan_real_points_unit')}.`}</span>
        </div>
        <Button
          type="primary"
          size="large"
          disabled={todayChecked}
          onClick={handleCheckIn}
        >
          {todayChecked ? t('fan_already_checked') : `${t('fan_check_in')} (+${operationalRules.checkInPoints})`}
        </Button>
      </section>

      <section className="fan-checkin-stat-grid">
        <div>
          <StarOutlined />
          <span>{t('fan_my_points')}</span>
          <strong>{(fan?.points || 0).toLocaleString()}</strong>
        </div>
        <div>
          <span>{t('fan_level')}</span>
          <Tag color={levelInfo.color}>{levelInfo.label}</Tag>
        </div>
        <div>
          <span>{t('fan_real_checkin_today')}</span>
          <strong>{todayChecked ? t('fan_real_checkin_done') : `+${operationalRules.checkInPoints} ${t('fan_real_pts_unit')}`}</strong>
        </div>
      </section>

      <section className="fan-checkin-week-card">
        <div className="fan-section-heading">
          <span>{t('fan_real_checkin_this_week')}</span>
          <strong>{todayChecked ? t('fan_real_checkin_checked_today') : t('fan_real_checkin_ready_now')}</strong>
        </div>
        <div className="fan-checkin-week-strip">
          {weekData.map((day, idx) => (
            <div key={idx} className={`fan-checkin-day${day.checked ? ' is-checked' : ''}${day.isToday ? ' is-today' : ''}`}>
              <span>{t(day.weekday)}</span>
              <strong>{day.date}</strong>
              {day.checked ? <CheckCircleOutlined /> : <i />}
            </div>
          ))}
        </div>
      </section>

      {nextLevel && (
        <section className="fan-checkin-progress-card">
          <div>
            <strong>{levelInfo.label}</strong>
            <span>{nextLevel.min_points - (fan?.points || 0)} {t('fan_points_unit')} {t('fan_next_level')} {nextLevel.label}</span>
          </div>
          <Progress percent={levelProgress} showInfo={false} strokeColor={{ from: '#ccff00', to: '#7ee000' }} railColor="rgba(17,22,10,0.12)" />
        </section>
      )}
    </div>
  );
};

export default CheckInTab;
