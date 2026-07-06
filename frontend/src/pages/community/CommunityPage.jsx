import { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Card, Col, Empty, Input, List, Row, Select, Space, Statistic, Tag, Typography, message } from 'antd';
import { CommentOutlined, FireOutlined, LikeOutlined, MessageOutlined, QuestionCircleOutlined, SendOutlined, ShareAltOutlined, TeamOutlined } from '@ant-design/icons';
import localDb from '../../services/db/localDb';
import useAuthStore from '../../stores/authStore';
import useLanguageStore from '../../stores/languageStore';

const { TextArea } = Input;
const { Text } = Typography;

const CATEGORY_CONFIG = {
  Discussion: { color: 'blue', Icon: MessageOutlined, label: 'Discussion' },
  Question: { color: 'orange', Icon: QuestionCircleOutlined, label: 'Question' },
  Share: { color: 'green', Icon: ShareAltOutlined, label: 'Share' },
  Event: { color: 'purple', Icon: FireOutlined, label: 'Event' },
};

const SEED_POSTS = [
  { id: 'cp-001', author_name: 'Robin C.', content: 'Just visited 5 stores today. UWELL G4 PRO is selling strongly.', category: 'Discussion', likes: 12, created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'cp-002', author_name: 'Ahmed K.', content: 'How do you handle stores with low foot traffic?', category: 'Question', likes: 8, created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 'cp-003', author_name: 'Salem M.', content: 'Campaign idea: buy 2 G4 PRO devices and get 1 pod pack free.', category: 'Share', likes: 24, created_at: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: 'cp-004', author_name: 'Fatima A.', content: 'Store upgrade: rabie alkayf moved from B level to A level.', category: 'Event', likes: 18, created_at: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: 'cp-005', author_name: 'Khalid R.', content: 'Best month so far: 80 stores covered and 40 active fans added.', category: 'Discussion', likes: 31, created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
];

const SEED_COMMENTS = [
  { id: 'cc-001', post_id: 'cp-001', author_name: 'Ahmed K.', content: 'Great work. Keep going.', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'cc-002', post_id: 'cp-002', author_name: 'Salem M.', content: 'Try free samples and staff training for slow stores.', created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: 'cc-003', post_id: 'cp-003', author_name: 'Robin C.', content: 'Good idea. This can be tested with A-level stores first.', created_at: new Date(Date.now() - 3600000 * 6).toISOString() },
];

function ensureSeed() {
  if (localDb.all('community_posts').length === 0) {
    localDb.insertBatch('community_posts', SEED_POSTS);
  }
  if (localDb.all('community_comments').length === 0) {
    localDb.insertBatch('community_comments', SEED_COMMENTS);
  }
}

function formatTime(value) {
  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getAvatarColor(name = '') {
  const colors = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
}

const CommunityPage = () => {
  const { t } = useLanguageStore();
  const profile = useAuthStore((state) => state.profile);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [category, setCategory] = useState('Discussion');
  const [sortBy, setSortBy] = useState('latest');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [likedPosts, setLikedPosts] = useState({});

  const loadData = () => {
    setPosts(localDb.all('community_posts') || []);
    setComments(localDb.all('community_comments') || []);
  };

  useEffect(() => {
    ensureSeed();
    loadData();
  }, []);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (sortBy === 'liked') return (b.likes || 0) - (a.likes || 0);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [posts, sortBy]);

  const hotTopics = useMemo(() => [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5), [posts]);
  const activeUsers = useMemo(() => {
    const counts = {};
    posts.forEach((post) => {
      counts[post.author_name] = (counts[post.author_name] || 0) + 1;
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5);
  }, [posts]);

  const postComments = (postId) => comments.filter((comment) => comment.post_id === postId);

  const handlePost = () => {
    if (!newPost.trim()) {
      message.warning('Please write something first');
      return;
    }
    localDb.insert('community_posts', {
      id: `cp-${Date.now()}`,
      author_name: profile?.name || 'Current User',
      content: newPost.trim(),
      category,
      likes: 0,
      created_at: new Date().toISOString(),
    });
    setNewPost('');
    message.success('Post published');
    loadData();
  };

  const handleLike = (postId) => {
    const post = posts.find((item) => item.id === postId);
    if (!post) return;
    const isLiked = Boolean(likedPosts[postId]);
    localDb.update('community_posts', postId, { likes: Math.max(0, (post.likes || 0) + (isLiked ? -1 : 1)) });
    setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));
    loadData();
  };

  const handleComment = (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    localDb.insert('community_comments', {
      id: `cc-${Date.now()}`,
      post_id: postId,
      author_name: profile?.name || 'Current User',
      content: text.trim(),
      created_at: new Date().toISOString(),
    });
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    loadData();
  };

  return (
    <div className="bg-radial-top" style={{ minHeight: '100vh', padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}>{t('community_title', 'Community')}</h2>
        <Space>
          <Text type="secondary">Sort by</Text>
          <Button type={sortBy === 'latest' ? 'primary' : 'default'} size="small" onClick={() => setSortBy('latest')}>Latest</Button>
          <Button type={sortBy === 'liked' ? 'primary' : 'default'} size="small" onClick={() => setSortBy('liked')}>Most Liked</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card className="liquid-glass" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                value={category}
                onChange={setCategory}
                style={{ width: 180 }}
                options={Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({ label: cfg.label, value: key }))}
              />
              <TextArea value={newPost} onChange={(event) => setNewPost(event.target.value)} placeholder="Share an update with the team..." rows={3} maxLength={500} showCount />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" icon={<SendOutlined />} onClick={handlePost}>Post</Button>
              </div>
            </Space>
          </Card>

          {sortedPosts.length === 0 ? (
            <Card><Empty description="No posts yet" /></Card>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              {sortedPosts.map((post) => {
                const cfg = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG.Discussion;
                const Icon = cfg.Icon;
                const commentsForPost = postComments(post.id);
                const isExpanded = expandedComments[post.id];
                const isLiked = likedPosts[post.id];

                return (
                  <Card key={post.id} size="small">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <Avatar style={{ backgroundColor: getAvatarColor(post.author_name), flexShrink: 0 }}>{post.author_name?.[0]?.toUpperCase() || 'U'}</Avatar>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{post.author_name}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{formatTime(post.created_at)}</Text>
                      </div>
                      <Tag color={cfg.color}><Icon /> {cfg.label}</Tag>
                    </div>

                    <p style={{ marginBottom: 12, fontSize: 14, lineHeight: 1.6 }}>{post.content}</p>

                    <Space size="large">
                      <Button type="text" size="small" icon={<LikeOutlined style={{ color: isLiked ? '#1677ff' : undefined }} />} onClick={() => handleLike(post.id)}>
                        {post.likes || 0} Likes
                      </Button>
                      <Button type="text" size="small" icon={<CommentOutlined />} onClick={() => setExpandedComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}>
                        {commentsForPost.length} Comments
                      </Button>
                    </Space>

                    {isExpanded && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                        <Space direction="vertical" style={{ width: '100%' }} size={8}>
                          {commentsForPost.length ? commentsForPost.map((comment) => (
                            <div key={comment.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              <Avatar size="small" style={{ backgroundColor: getAvatarColor(comment.author_name), flexShrink: 0 }}>{comment.author_name?.[0]?.toUpperCase() || 'U'}</Avatar>
                              <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '8px 12px', flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{comment.author_name}</div>
                                <div style={{ fontSize: 13 }}>{comment.content}</div>
                                <Text type="secondary" style={{ fontSize: 11 }}>{formatTime(comment.created_at)}</Text>
                              </div>
                            </div>
                          )) : <Text type="secondary" style={{ fontSize: 12 }}>No comments yet</Text>}
                        </Space>

                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <Input value={commentInputs[post.id] || ''} onChange={(event) => setCommentInputs((prev) => ({ ...prev, [post.id]: event.target.value }))} placeholder="Write a comment..." size="small" onPressEnter={() => handleComment(post.id)} />
                          <Button type="primary" size="small" onClick={() => handleComment(post.id)}>Reply</Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </Space>
          )}
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            <Card className="liquid-glass" size="small" title="Community Stats">
              <Row gutter={8}>
                <Col span={8} style={{ textAlign: 'center' }}><Statistic title="Posts" value={posts.length} styles={{ content: { fontSize: 20 } }} /></Col>
                <Col span={8} style={{ textAlign: 'center' }}><Statistic title="Comments" value={comments.length} styles={{ content: { fontSize: 20 } }} /></Col>
                <Col span={8} style={{ textAlign: 'center' }}><Statistic title="Members" value={new Set(posts.map((post) => post.author_name)).size} styles={{ content: { fontSize: 20 } }} /></Col>
              </Row>
            </Card>

            <Card className="liquid-glass" size="small" title="Hot Topics">
              <List
                size="small"
                dataSource={hotTopics}
                locale={{ emptyText: <Empty description="No posts" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                renderItem={(post, index) => (
                  <List.Item>
                    <Space>
                      <Text strong>#{index + 1}</Text>
                      <Text ellipsis style={{ maxWidth: 180 }}>{post.content}</Text>
                      <Text type="secondary"><LikeOutlined /> {post.likes || 0}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>

            <Card className="liquid-glass" size="small" title="Active Users">
              <List
                size="small"
                dataSource={activeUsers}
                locale={{ emptyText: <Empty description="No active users" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                renderItem={([name, count]) => (
                  <List.Item>
                    <Space>
                      <Avatar size="small" icon={<TeamOutlined />} style={{ backgroundColor: getAvatarColor(name) }} />
                      <Text>{name}</Text>
                      <Tag>{count} posts</Tag>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default CommunityPage;
