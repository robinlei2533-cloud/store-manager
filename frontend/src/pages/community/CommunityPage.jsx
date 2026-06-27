import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Button, Tag, Avatar, List, Space, message, Spin, Empty, Statistic, Divider, Typography, Select } from 'antd';
import { LikeOutlined, CommentOutlined, FireOutlined, UserOutlined, SendOutlined } from '@ant-design/icons';
import localDb from '../../services/db/localDb';
import useAuthStore from '../../stores/authStore';

const { TextArea } = Input;
const { Text } = Typography;

const CATEGORY_CONFIG = {
  Discussion: { color: 'blue', icon: '💬', label: 'Discussion' },
  Question: { color: 'orange', icon: '❓', label: 'Question' },
  Share: { color: 'green', icon: '📢', label: 'Share' },
  Event: { color: 'purple', icon: '🎉', label: 'Event' },
};

const SEED_POSTS = [
  { id: 'cp-001', author_name: 'Robin C.', content: 'Just visited 5 stores today! UWELL G4 PRO is selling great 🚀', category: 'Discussion', likes: 12, created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'cp-002', author_name: 'Ahmed K.', content: 'How do you handle stores with low foot traffic?', category: 'Question', likes: 8, created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 'cp-003', author_name: 'Salem M.', content: 'New campaign idea: Buy 2 G4 PRO get 1 free pod!', category: 'Share', likes: 24, created_at: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: 'cp-004', author_name: 'Fatima A.', content: 'Store upgrade: rabie alkayf just went from B to A! 🎉', category: 'Event', likes: 18, created_at: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: 'cp-005', author_name: 'Khalid R.', content: 'Best month ever - 80 stores covered, 40 active fans!', category: 'Discussion', likes: 31, created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
];

const SEED_COMMENTS = [
  { id: 'cc-001', post_id: 'cp-001', author_name: 'Ahmed K.', content: 'Great work! Keep it up 💪', created_at: new Date(Date.now() - 3600000 * 1).toISOString() },
  { id: 'cc-002', post_id: 'cp-002', author_name: 'Salem M.', content: 'Try offering free samples to attract walk-in customers', created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: 'cc-003', post_id: 'cp-003', author_name: 'Robin C.', content: 'Love this idea! Let me propose it to the team', created_at: new Date(Date.now() - 3600000 * 6).toISOString() },
  { id: 'cc-004', post_id: 'cp-004', author_name: 'Khalid R.', content: 'Congratulations! What was the key improvement?', created_at: new Date(Date.now() - 3600000 * 10).toISOString() },
];

function ensureSeed() {
  if (localDb.all('community_posts').length === 0) {
    localDb.insertBatch('community_posts', SEED_POSTS);
  }
  if (localDb.all('community_comments').length === 0) {
    localDb.insertBatch('community_comments', SEED_COMMENTS);
  }
}

const CommunityPage = () => {
  const profile = useAuthStore((s) => s.profile);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [category, setCategory] = useState('Discussion');
  const [sortBy, setSortBy] = useState('latest');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    ensureSeed();
    loadData();
  }, []);

  const loadData = () => {
    const p = localDb.all('community_posts');
    const c = localDb.all('community_comments');
    setPosts(p);
    setComments(c);
  };

  const handlePost = () => {
    if (!newPost.trim()) {
      message.warning('Please write something first');
      return;
    }
    const authorName = profile?.name || 'Current User';
    localDb.insert('community_posts', {
      author_name: authorName,
      content: newPost.trim(),
      category,
      likes: 0,
    });
    setNewPost('');
    message.success('Post published!');
    loadData();
  };

  const handleLike = (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const isLiked = likedPosts[postId];
    const newLikes = isLiked ? post.likes - 1 : post.likes + 1;
    localDb.update('community_posts', postId, { likes: newLikes });
    setLikedPosts({ ...likedPosts, [postId]: !isLiked });
    loadData();
  };

  const toggleComments = (postId) => {
    setExpandedComments({ ...expandedComments, [postId]: !expandedComments[postId] });
  };

  const handleComment = (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    const authorName = profile?.name || 'Current User';
    localDb.insert('community_comments', {
      post_id: postId,
      author_name: authorName,
      content: text.trim(),
    });
    setCommentInputs({ ...commentInputs, [postId]: '' });
    loadData();
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'liked') return b.likes - a.likes;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const postComments = (postId) => comments.filter((c) => c.post_id === postId);

  // Right column stats
  const totalPosts = posts.length;
  const totalComments = comments.length;
  const uniqueAuthors = [...new Set(posts.map((p) => p.author_name))].length;
  const hotTopics = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 5);

  // Active users
  const userPostCounts = {};
  posts.forEach((p) => {
    userPostCounts[p.author_name] = (userPostCounts[p.author_name] || 0) + 1;
  });
  const activeUsers = Object.entries(userPostCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const formatTime = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getAvatarColor = (name) => {
    const colors = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'];
    const hash = name?.charCodeAt(0) || 0;
    return colors[hash % colors.length];
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}>🏢 Community</h2>
        <Space>
          <Text type="secondary">Sort by:</Text>
          <Button
            type={sortBy === 'latest' ? 'primary' : 'default'}
            size="small"
            onClick={() => setSortBy('latest')}
          >
            Latest
          </Button>
          <Button
            type={sortBy === 'liked' ? 'primary' : 'default'}
            size="small"
            onClick={() => setSortBy('liked')}
          >
            Most Liked
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        {/* Left Column - Posts */}
        <Col xs={24} lg={16}>
          {/* Create Post */}
          <Card style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Select
                  value={category}
                  onChange={setCategory}
                  style={{ width: 150 }}
                  options={Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => ({
                    label: `${cfg.icon} ${cfg.label}`,
                    value: key,
                  }))}
                />
              </Space>
              <TextArea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share something with the community..."
                rows={3}
                maxLength={500}
                showCount
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" icon={<SendOutlined />} onClick={handlePost}>
                  Post
                </Button>
              </div>
            </Space>
          </Card>

          {/* Post List */}
          {sortedPosts.length === 0 ? (
            <Card><Empty description="No posts yet. Be the first to share!" /></Card>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              {sortedPosts.map((post) => {
                const cfg = CATEGORY_CONFIG[post.category] || CATEGORY_CONFIG.Discussion;
                const pComments = postComments(post.id);
                const isExpanded = expandedComments[post.id];
                const isLiked = likedPosts[post.id];

                return (
                  <Card key={post.id} size="small">
                    {/* Post Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <Avatar style={{ backgroundColor: getAvatarColor(post.author_name), flexShrink: 0 }}>
                        {post.author_name?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{post.author_name}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>{formatTime(post.created_at)}</Text>
                      </div>
                      <Tag color={cfg.color}>{cfg.icon} {cfg.label}</Tag>
                    </div>

                    {/* Post Content */}
                    <p style={{ marginBottom: 12, fontSize: 14, lineHeight: 1.6 }}>{post.content}</p>

                    {/* Actions */}
                    <Space size="large">
                      <Button
                        type="text"
                        size="small"
                        icon={<LikeOutlined style={{ color: isLiked ? '#1677ff' : undefined }} />}
                        onClick={() => handleLike(post.id)}
                      >
                        {post.likes} Likes
                      </Button>
                      <Button
                        type="text"
                        size="small"
                        icon={<CommentOutlined />}
                        onClick={() => toggleComments(post.id)}
                      >
                        {pComments.length} Comments
                      </Button>
                    </Space>

                    {/* Comments Section */}
                    {isExpanded && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                        {pComments.length > 0 ? (
                          <Space direction="vertical" style={{ width: '100%' }} size={8}>
                            {pComments.map((c) => (
                              <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <Avatar size="small" style={{ backgroundColor: getAvatarColor(c.author_name), flexShrink: 0 }}>
                                  {c.author_name?.[0]?.toUpperCase() || 'U'}
                                </Avatar>
                                <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '8px 12px', flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.author_name}</div>
                                  <div style={{ fontSize: 13 }}>{c.content}</div>
                                  <Text type="secondary" style={{ fontSize: 11 }}>{formatTime(c.created_at)}</Text>
                                </div>
                              </div>
                            ))}
                          </Space>
                        ) : (
                          <Text type="secondary" style={{ fontSize: 12 }}>No comments yet</Text>
                        )}

                        {/* Add Comment */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <Input
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            placeholder="Write a comment..."
                            size="small"
                            onPressEnter={() => handleComment(post.id)}
                          />
                          <Button type="primary" size="small" onClick={() => handleComment(post.id)}>
                            Reply
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </Space>
          )}
        </Col>

        {/* Right Column - Sidebar */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            {/* Community Stats */}
            <Card size="small" title="📊 Community Stats">
              <Row gutter={8}>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Statistic title="Posts" value={totalPosts} valueStyle={{ fontSize: 20 }} />
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Statistic title="Comments" value={totalComments} valueStyle={{ fontSize: 20 }} />
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Statistic title="Members" value={uniqueAuthors} valueStyle={{ fontSize: 20 }} />
                </Col>
              </Row>
            </Card>

            {/* Hot Topics */}
            <Card size="small" title="🔥 Hot Topics">
              {hotTopics.length > 0 ? (
                <List
                  size="small"
                  dataSource={hotTopics}
                  renderItem={(post, index) => (
                    <List.Item style={{ padding: '8px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: index < 3 ? '#ff4d4f' : '#999', minWidth: 20 }}>
                          #{index + 1}
                        </span>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {post.content}
                          </div>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            <LikeOutlined /> {post.likes} · {post.author_name}
                          </Text>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No posts" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>

            {/* Active Users */}
            <Card size="small" title="👥 Active Users">
              {activeUsers.length > 0 ? (
                <List
                  size="small"
                  dataSource={activeUsers}
                  renderItem={([name, count], index) => (
                    <List.Item style={{ padding: '8px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                        <Avatar size="small" style={{ backgroundColor: getAvatarColor(name) }}>
                          {name?.[0]?.toUpperCase()}
                        </Avatar>
                        <span style={{ flex: 1, fontSize: 13 }}>{name}</span>
                        <Tag color={index < 3 ? 'gold' : 'default'}>{count} posts</Tag>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No active users" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default CommunityPage;
