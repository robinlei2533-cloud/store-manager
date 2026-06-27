import useLanguageStore from '../../../stores/languageStore';
import React, { useState, useEffect } from 'react';
import { message, Card, Button, Input, List, Typography, Avatar, Empty, Space } from 'antd';
import { LikeOutlined, MessageOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
const { TextArea } = Input;
const { Text } = Typography;
const CommunityTab = ({ fan }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());

  const [initialized, setInitialized] = useState(false);
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
                    icon={<LikeOutlined style={{ color: likedPosts.has(post.id) ? '#FFD700' : '#999' }} />}
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

export default CommunityTab;

