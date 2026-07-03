import React, { useMemo, useState } from 'react';
import { Button, Card, Empty, Input, List, Select, Space, Tag, message } from 'antd';
import { CustomerServiceOutlined } from '@ant-design/icons';
import PageTransition from '../../components/common/PageTransition';
import localDb from '../../services/db/localDb';
import useAuthStore from '../../stores/authStore';
import { canViewCompanyScope, filterByAssignedStores } from '../../utils/uwellRoleAccess';

const statusMap = {
  open: { color: 'gold', text: '待回复' },
  replied: { color: 'green', text: '已回复' },
  closed: { color: 'default', text: '已关闭' },
};

const ComplaintReplyPage = () => {
  const profile = useAuthStore((state) => state.profile);
  const [status, setStatus] = useState('open');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const stores = localDb.all('stores') || [];
  const fans = localDb.all('fans') || [];

  const complaints = useMemo(() => {
    const allComplaints = (localDb.all('fan_complaints') || [])
      .map((item) => ({
        ...item,
        store: stores.find((store) => store.id === item.store_id),
        fan: fans.find((fan) => fan.id === item.fan_id),
      }))
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const scoped = canViewCompanyScope(profile)
      ? allComplaints
      : filterByAssignedStores(profile, allComplaints, stores);
    return status ? scoped.filter((item) => item.status === status) : scoped;
  }, [fans, profile, refreshKey, status, stores]);

  const handleReply = (complaint) => {
    const reply = replyDrafts[complaint.id]?.trim();
    if (!reply) {
      message.warning('请先填写回复内容');
      return;
    }
    localDb.update('fan_complaints', complaint.id, {
      status: 'replied',
      reply,
      replied_by: profile?.id,
      replied_at: new Date().toISOString(),
    });
    setReplyDrafts((drafts) => ({ ...drafts, [complaint.id]: '' }));
    setRefreshKey((value) => value + 1);
    message.success('客诉已回复');
  };

  return (
    <PageTransition>
      <Card
        className="crud-card"
        title={<Space><CustomerServiceOutlined /> 粉丝客诉回复</Space>}
        extra={(
          <Select
            value={status}
            style={{ width: 140 }}
            options={[
              { label: '待回复', value: 'open' },
              { label: '已回复', value: 'replied' },
              { label: '全部', value: '' },
            ]}
            onChange={setStatus}
          />
        )}
      >
        <List
          dataSource={complaints}
          locale={{ emptyText: <Empty description="暂无客诉记录" /> }}
          renderItem={(item) => (
            <List.Item>
              <Card size="small" style={{ width: '100%' }}>
                <Space wrap size={8}>
                  <strong>{item.fan?.name || item.fan_name || '粉丝'}</strong>
                  <Tag>{item.store?.name || item.store_name || '未关联门店'}</Tag>
                  <Tag color={statusMap[item.status]?.color}>{statusMap[item.status]?.text || item.status}</Tag>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{new Date(item.created_at).toLocaleString()}</span>
                </Space>
                <p style={{ margin: '10px 0 12px', color: 'var(--uw-text-primary)' }}>{item.content}</p>
                {item.status === 'replied' ? (
                  <div style={{ padding: 10, borderRadius: 8, background: 'rgba(255,215,0,0.06)' }}>
                    <strong>回复：</strong>{item.reply || '-'}
                  </div>
                ) : (
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      value={replyDrafts[item.id] || ''}
                      placeholder="输入给粉丝的回复"
                      onChange={(event) => setReplyDrafts((drafts) => ({ ...drafts, [item.id]: event.target.value }))}
                    />
                    <Button type="primary" onClick={() => handleReply(item)}>回复</Button>
                  </Space.Compact>
                )}
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </PageTransition>
  );
};

export default ComplaintReplyPage;
