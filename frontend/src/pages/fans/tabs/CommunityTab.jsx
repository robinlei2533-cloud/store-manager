import React, { useMemo, useState, useEffect } from 'react';
import { message, Card, Button, Input, Typography, Avatar, Space } from 'antd';
import { CommentOutlined, LikeOutlined, PlusCircleOutlined } from '@ant-design/icons';
import localDb from '../../../services/db/localDb';
import { addFanPoints } from '../../../services/api';
import useLanguageStore from '../../../stores/languageStore';
import { OPERATIONAL_RULE_RECORD_ID, mergeOperationalRules } from '../../../utils/uwellLaunchRules';
const { TextArea } = Input;
const { Text, Paragraph } = Typography;

const getTodayKey = () => new Date().toISOString().split('T')[0];

const fanFriendlyPostKeys = {
  'cp-real-001': 'fan_real_community_post_001',
  'cp-real-002': 'fan_real_community_post_002',
  'cp-real-003': 'fan_real_community_post_003',
  'cp-real-004': 'fan_real_community_post_004',
  'cp-real-005': 'fan_real_community_post_005',
  'cp-real-006': 'fan_real_community_post_006',
  'cp-real-007': 'fan_real_community_post_007',
  'cp-real-008': 'fan_real_community_post_008',
  'cp-real-009': 'fan_real_community_post_009',
  'cp-real-010': 'fan_real_community_post_010',
  'cp-real-011': 'fan_real_community_post_011',
  'cp-real-012': 'fan_real_community_post_012',
  'fp-001': 'fan_real_community_post_seed_001',
  'fp-002': 'fan_real_community_post_seed_002',
  'fp-003': 'fan_real_community_post_seed_003',
};

const getDisplayPost = (post, index, t) => ({
  ...post,
  content: fanFriendlyPostKeys[post.id] ? t(fanFriendlyPostKeys[post.id]) : post.content,
  category: post.category === 'Event' ? t('fan_real_community_official') : t(`fan_real_community_${String(post.category || 'discussion').toLowerCase()}`, post.category),
  audienceLabel: post.author_id === undefined || post.category === 'Event' ? t('fan_real_community_official') : t('fan_real_community_fan'),
  author_name: post.author_name || (index % 2 ? 'UWELL Fan' : 'UWELL Official'),
});

const fanFriendlyCommentKeys = {
  'cc-real-001': 'fan_real_community_comment_001',
  'cc-real-002': 'fan_real_community_comment_002',
  'cc-real-003': 'fan_real_community_comment_003',
  'cc-real-004': 'fan_real_community_comment_004',
  'cc-real-005': 'fan_real_community_comment_005',
  'cc-real-006': 'fan_real_community_comment_006',
  'cc-real-007': 'fan_real_community_comment_007',
  'cc-real-008': 'fan_real_community_comment_008',
  'cc-real-009': 'fan_real_community_comment_009',
  'cc-real-010': 'fan_real_community_comment_010',
  'cc-real-011': 'fan_real_community_comment_011',
  'cc-real-012': 'fan_real_community_comment_012',
  'cc-real-013': 'fan_real_community_comment_013',
  'cc-real-014': 'fan_real_community_comment_014',
  'cc-real-015': 'fan_real_community_comment_015',
  'cc-real-016': 'fan_real_community_comment_016',
  'cc-real-017': 'fan_real_community_comment_017',
  'cc-real-018': 'fan_real_community_comment_018',
  'cc-real-019': 'fan_real_community_comment_019',
  'cc-real-020': 'fan_real_community_comment_020',
};

const getDisplayComment = (comment, t) => ({
  ...comment,
  content: fanFriendlyCommentKeys[comment.id] ? t(fanFriendlyCommentKeys[comment.id]) : comment.content,
});

const COMMUNITY_HERO_VISUAL = '/uwell-assets/fan-refresh-v2/community-hero.jpg';
const COMMUNITY_MEDIA_ASSETS = [
  '/uwell-assets/fan-refresh-v2/community-feed-1.jpg',
  '/uwell-assets/fan-refresh-v2/community-feed-2.jpg',
  '/uwell-assets/fan-refresh-v2/community-feed-3.jpg',
  '/uwell-assets/fan-refresh-v2/community-feed-4.jpg',
];

const getCommunityMediaAsset = (post, index) => {
  const key = String(post?.id || '').toLowerCase();
  if (key.includes('fp-001') || key.includes('official')) return COMMUNITY_MEDIA_ASSETS[0];
  if (key.includes('fp-002') || key.includes('share')) return COMMUNITY_MEDIA_ASSETS[1];
  if (key.includes('fp-003') || key.includes('question')) return COMMUNITY_MEDIA_ASSETS[2];
  if (key.includes('fp-004') || key.includes('travel') || key.includes('visit')) return COMMUNITY_MEDIA_ASSETS[3];
  return COMMUNITY_MEDIA_ASSETS[Math.min(index, COMMUNITY_MEDIA_ASSETS.length - 1)];
};

const CommunityTab = ({ fan }) => {
  const { t } = useLanguageStore();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [pointActions, setPointActions] = useState([]);
  const operationalRules = mergeOperationalRules(localDb.findById('fan_points_rules', OPERATIONAL_RULE_RECORD_ID)?.settings);
  const communityPointRules = useMemo(() => ({
    like: { points: operationalRules.communityLikePoints, dailyLimit: operationalRules.communityLikeDailyLimit, label: t('fan_real_community_like') },
    comment: { points: operationalRules.communityCommentPoints, dailyLimit: operationalRules.communityCommentDailyLimit, label: t('fan_real_community_comment') },
    post: { points: operationalRules.communityPostPoints, dailyLimit: operationalRules.communityPostDailyLimit, label: t('fan_real_community_first_post') },
  }), [
    t,
    operationalRules.communityLikePoints,
    operationalRules.communityLikeDailyLimit,
    operationalRules.communityCommentPoints,
    operationalRules.communityCommentDailyLimit,
    operationalRules.communityPostPoints,
    operationalRules.communityPostDailyLimit,
  ]);

  useEffect(() => {
    // Seed some posts if empty
    if (localDb.count('community_posts') === 0) {
      const seedPosts = [
        { id: 'fp-001', author_id: 'seed-ahmed', author_name: 'Ahmed K.', content: t('fan_real_community_post_seed_001'), category: 'Discussion', likes: 12, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 'fp-002', author_id: 'seed-saud', author_name: 'Saud M.', content: t('fan_real_community_post_seed_002'), category: 'Share', likes: 8, created_at: new Date(Date.now() - 172800000).toISOString() },
        { id: 'fp-003', author_id: 'seed-faisal', author_name: 'Faisal R.', content: t('fan_real_community_post_seed_003'), category: 'Question', likes: 5, created_at: new Date(Date.now() - 259200000).toISOString() },
      ];
      seedPosts.forEach((p) => localDb.insert('community_posts', p));
    }
    const allPosts = localDb.all('community_posts').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const allComments = localDb.all('community_comments') || [];
    const actions = localDb.all('community_point_actions') || [];
    const myLikedPostIds = new Set(actions
      .filter((action) => action.fan_id === fan?.id && action.action_type === 'like')
      .map((action) => action.post_id));
    const groupedComments = allComments.reduce((acc, comment) => {
      acc[comment.post_id] = [...(acc[comment.post_id] || []), comment];
      return acc;
    }, {});
    setPosts(allPosts);
    setLikedPosts(myLikedPostIds);
    setCommentsByPost(groupedComments);
    setPointActions(actions);
  }, [fan?.id, t]);

  const countTodayActions = (actionType) => {
    const today = getTodayKey();
    return pointActions.filter((action) => (
      action.fan_id === fan?.id
      && action.action_type === actionType
      && String(action.created_at || '').startsWith(today)
    )).length;
  };

  const recordCommunityAction = async (actionType, postId, points) => {
    const action = localDb.insert('community_point_actions', {
      fan_id: fan?.id,
      action_type: actionType,
      post_id: postId,
      points,
    });
    setPointActions((current) => [action, ...current]);
    if (points > 0) {
      await addFanPoints(fan.id, points, 'earn', 'UWELL Community', `${communityPointRules[actionType].label}: +${points}`);
    }
    return action;
  };

  const handlePost = async () => {
    const content = newPost.trim();
    if (content.length < 5) {
      message.warning(t('fan_real_community_post_min'));
      return;
    }
    const post = localDb.insert('community_posts', {
      author_id: fan?.id,
      author_name: fan?.profiles?.name || 'UWELL Fan',
      content,
      category: 'Discussion',
      likes: 0,
    });
    setPosts([post, ...posts]);
    setNewPost('');
    if (countTodayActions('post') < communityPointRules.post.dailyLimit) {
      await recordCommunityAction('post', post.id, communityPointRules.post.points);
      message.success(`${t('fan_real_community_posted_points')} +${communityPointRules.post.points}`);
      return;
    }
    message.success(t('fan_real_community_posted_limit'));
  };

  const handleLike = async (postId) => {
    if (likedPosts.has(postId)) {
      message.info(t('fan_real_community_already_liked'));
      return;
    }
    const post = localDb.findById('community_posts', postId);
    if (post) {
      localDb.update('community_posts', postId, { likes: (post.likes || 0) + 1 });
    }
    setLikedPosts(new Set([...likedPosts, postId]));
    setPosts(posts.map((p) => (p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p)));
    if (post && post.author_id === fan?.id) {
      await recordCommunityAction('like', postId, 0);
      message.info(t('fan_real_community_self_like'));
      return;
    }
    if (countTodayActions('like') < communityPointRules.like.dailyLimit) {
      await recordCommunityAction('like', postId, communityPointRules.like.points);
      message.success(`${t('fan_real_community_like_counted')} +${communityPointRules.like.points}`);
      return;
    }
    await recordCommunityAction('like', postId, 0);
    message.info(t('fan_real_community_like_limit'));
  };

  const handleComment = async (postId) => {
    const content = (commentDrafts[postId] || '').trim();
    if (content.length < 5) {
      message.warning(t('fan_real_community_comment_min'));
      return;
    }
    const comment = localDb.insert('community_comments', {
      post_id: postId,
      fan_id: fan?.id,
      author_name: fan?.profiles?.name || 'UWELL Fan',
      content,
    });
    setCommentsByPost((current) => ({
      ...current,
      [postId]: [...(current[postId] || []), comment],
    }));
    setCommentDrafts((current) => ({ ...current, [postId]: '' }));
    if (countTodayActions('comment') < communityPointRules.comment.dailyLimit) {
      await recordCommunityAction('comment', postId, communityPointRules.comment.points);
      message.success(`${t('fan_real_community_comment_points')} +${communityPointRules.comment.points}`);
      return;
    }
    await recordCommunityAction('comment', postId, 0);
    message.info(t('fan_real_community_comment_limit'));
  };

  const todayStats = ['like', 'comment', 'post'].map((key) => ({
    key,
    ...communityPointRules[key],
    used: countTodayActions(key),
  }));
  const displayPosts = posts.map((post, index) => getDisplayPost(post, index, t));

  return (
    <div className="fan-community-feed-shell">
      <section className="fan-community-hero-poster">
        <div className="fan-community-hero-copy">
          <span className="fan-mini-label">{t('fan_real_community_label')}</span>
          <strong>{t('fan_real_community_title')}</strong>
          <p>{t('fan_real_community_desc')}</p>
          <div className="fan-community-product-showcase">
            <span>UWELL</span>
            <span>G5</span>
            <span>Store visits</span>
          </div>
        </div>
        <div className="fan-community-hero-visual is-compact">
          <img src={COMMUNITY_HERO_VISUAL} alt="UWELL community visual" loading="lazy" />
        </div>
      </section>

      <Card size="small" className="fan-community-composer">
        <div className="fan-community-composer-head">
          <Avatar className="fan-community-avatar">{fan?.profiles?.name?.[0]?.toUpperCase() || 'U'}</Avatar>
          <div>
            <strong>{t('fan_real_community_share_moment')}</strong>
            <span>{t('fan_real_community_share_desc')}</span>
          </div>
        </div>
        <TextArea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder={t('fan_real_community_placeholder')}
          rows={2}
          className="fan-community-composer-input"
        />
        <Button type="primary" onClick={handlePost} disabled={!newPost.trim()} icon={<PlusCircleOutlined />} className="fan-community-post-button">
          {t('fan_real_community_post')}
        </Button>
      </Card>

      <div className="fan-community-rule-hint">
        <span className="fan-community-xp-chip">{t('fan_real_community_like')} +1 · {Math.min(todayStats[0].used, todayStats[0].dailyLimit)}/{todayStats[0].dailyLimit}</span>
        <span className="fan-community-xp-chip">{t('fan_real_community_comment')} +2 · {Math.min(todayStats[1].used, todayStats[1].dailyLimit)}/{todayStats[1].dailyLimit}</span>
        <span className="fan-community-xp-chip">{t('fan_real_community_first_post')} +10 · {Math.min(todayStats[2].used, todayStats[2].dailyLimit)}/{todayStats[2].dailyLimit}</span>
        <small>{t('fan_real_community_rules_hint')}</small>
      </div>

      <div className="fan-community-feed-list">
        {displayPosts.map((post, index) => (
          <article key={post.id} className="fan-community-post-card">
            <div className="fan-community-post-head">
              <Avatar className={post.audienceLabel === t('fan_real_community_official') ? 'fan-community-avatar is-official' : 'fan-community-avatar'}>
                {post.author_name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <div>
                <strong>{post.author_name}</strong>
                <span>{new Date(post.created_at).toLocaleDateString('en-US')}</span>
              </div>
              <span className={post.audienceLabel === t('fan_real_community_official') ? 'fan-community-post-chip is-official' : 'fan-community-post-chip'}>
                {post.audienceLabel}
              </span>
              <span className="fan-community-post-chip is-category">{post.category}</span>
            </div>
            <Paragraph className="fan-community-post-copy">{post.content}</Paragraph>
            {index < 3 && (
              <div className="fan-community-media-placeholder fan-community-media-card is-compact">
                <img src={getCommunityMediaAsset(post, index)} alt={post.audienceLabel === t('fan_real_community_official') ? t('fan_real_community_official_image') : t('fan_real_community_fan_photo')} loading="lazy" />
                <span>{post.audienceLabel === t('fan_real_community_official') ? t('fan_real_community_official_image') : t('fan_real_community_fan_photo')}</span>
              </div>
            )}
            <Space className="fan-community-post-actions" wrap>
              <Button
                className="fan-community-action-btn"
                type="text"
                icon={<LikeOutlined style={{ color: likedPosts.has(post.id) ? '#9bd400' : '#4d4a3c' }} />}
                onClick={() => handleLike(post.id)}
              >
                {post.likes || 0}
              </Button>
              <span className="fan-community-comment-count"><CommentOutlined /> {commentsByPost[post.id]?.length || 0}</span>
            </Space>
            <div className="fan-community-comment-box">
              {(commentsByPost[post.id] || []).slice(-2).map((comment) => getDisplayComment(comment, t)).map((comment) => (
                <div key={comment.id} className="fan-community-comment">
                  <Text strong>{comment.author_name}</Text>
                  <Paragraph>{comment.content}</Paragraph>
                </div>
              ))}
              <Input.Search
                value={commentDrafts[post.id] || ''}
                placeholder={t('fan_real_community_add_comment')}
                enterButton={<Button className="fan-community-comment-submit">{t('fan_real_community_comment')}</Button>}
                onChange={(e) => setCommentDrafts((current) => ({ ...current, [post.id]: e.target.value }))}
                onSearch={() => handleComment(post.id)}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default CommunityTab;

