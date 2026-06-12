/**
 * Eating - 今天吃什么随机选择器
 *
 * 功能：
 * - 大大的"今天吃什么？"标题
 * - 选择按钮（带动画效果）
 * - 食物选项列表（中式早餐/午餐/晚餐/夜宵分类）
 * - 结果展示（食物名+图片占位+推荐语）
 * - "换一个"按钮
 * - 历史记录（避免重复推荐）
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  Button,
  Tag,
  Empty,
} from 'antd';
import {
  CoffeeOutlined,
  ThunderboltOutlined,
  SmileOutlined,
  ReloadOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import styles from './Eating.module.css';

/** 食物分类 */
type FoodCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface FoodItem {
  name: string;
  category: FoodCategory;
  description?: string;
}

/** 分类配置 */
const CATEGORY_CONFIG: Record<FoodCategory, { label: string; icon: React.ReactNode; color: string }> = {
  breakfast: { label: '早餐', icon: <CoffeeOutlined />, color: '#faad14' },
  lunch: { label: '午餐', icon: <ThunderboltOutlined />, color: '#00b26a' },
  dinner: { label: '晚餐', icon: <SmileOutlined />, color: '#1890ff' },
  snack: { label: '夜宵', icon: <HistoryOutlined />, color: '#eb2f96' },
};

/** 食物数据库 */
const FOOD_DATABASE: FoodItem[] = [
  // 早餐
  { name: '豆浆油条', category: 'breakfast', description: '经典搭配，营养美味' },
  { name: '小笼包', category: 'breakfast', description: '皮薄馅大，汤汁鲜美' },
  { name: '煎饼果子', category: 'breakfast', description: '天津风味，酥脆可口' },
  { name: '粥配咸菜', category: 'breakfast', description: '清淡养胃，简单实在' },
  { name: '鸡蛋灌饼', category: 'breakfast', description: '外酥里嫩，香气四溢' },
  { name: '馄饨', category: 'breakfast', description: '皮薄汤鲜，温暖身心' },
  { name: '豆腐脑', category: 'breakfast', description: '嫩滑爽口，佐料丰富' },
  { name: '面包牛奶', category: 'breakfast', description: '西式快捷，方便省时' },

  // 午餐
  { name: '红烧肉盖饭', category: 'lunch', description: '肥而不腻，入口即化' },
  { name: '宫保鸡丁', category: 'lunch', description: '酸甜微辣，下饭神器' },
  { name: '麻婆豆腐', category: 'lunch', description: '麻辣鲜香，川菜经典' },
  { name: '番茄炒蛋', category: 'lunch', description: '家常味道，百吃不厌' },
  { name: '鱼香肉丝', category: 'lunch', description: '酸甜可口，色泽红亮' },
  { name: '青椒肉丝', category: 'lunch', description: '清爽不腻，快手好菜' },
  { name: '回锅肉', category: 'lunch', description: '川菜之魂，香辣过瘾' },
  { name: '水煮肉片', category: 'lunch', description: '麻辣鲜嫩，红油飘香' },
  { name: '黄焖鸡米饭', category: 'lunch', description: '酱香浓郁，软烂入味' },
  { name: '卤肉饭', category: 'lunch', description: '台式风味，卤汁醇厚' },

  // 晚餐
  { name: '火锅', category: 'dinner', description: '围炉而坐，热气腾腾' },
  { name: '烧烤', category: 'dinner', description: '烟火气息，滋滋作响' },
  { name: '饺子', category: 'dinner', description: '团圆美满，南北皆宜' },
  { name: '面条', category: 'dinner', description: '劲道爽滑，汤头浓郁' },
  { name: '炒饭', category: 'dinner', description: '粒粒分明，镬气十足' },
  { name: '酸菜鱼', category: 'dinner', description: '酸爽开胃，鱼肉嫩滑' },
  { name: '烤鸭', category: 'dinner', description: '北京名菜，皮脆肉嫩' },
  { name: '小龙虾', category: 'dinner', description: '麻辣鲜香，夜市之王' },
  { name: '煲仔饭', category: 'dinner', description: '广式风味，锅巴焦香' },
  { name: '披萨', category: 'dinner', description: '西式美味，芝士拉丝' },

  // 夜宵
  { name: '麻辣烫', category: 'snack', description: '万物皆可烫，随心所欲' },
  { name: '炸鸡', category: 'snack', description: '外酥里嫩，快乐源泉' },
  { name: '关东煮', category: 'snack', description: '日式风味，暖胃暖心' },
  { name: '炒河粉', category: 'snack', description: '镬气十足，深夜食堂' },
  { name: '螺蛳粉', category: 'snack', description: '闻着臭吃着香，上瘾' },
  { name: '串串香', category: 'snack', description: '一串一串，停不下来' },
  { name: '臭豆腐', category: 'snack', description: '黑色诱惑，外焦内嫩' },
  { name: '凉皮', category: 'snack', description: '酸辣爽口，夏日必备' },
];

/** 推荐语库 */
const RECOMMENDATIONS = [
  '今天吃这个准没错！',
  '不错的选择，试试看吧~',
  '就决定是你了！',
  '看起来很好吃的样子',
  '相信我，不会后悔的',
  '今日最佳推荐',
  '来点不一样的？',
  '满足你的味蕾',
];

/**
 * 今天吃什么随机选择器组件
 *
 * 帮助选择困难症解决吃饭问题：
 * - 支持按餐次筛选
 * - 随机推荐避免重复
 * - 精美的结果展示动画
 */
const Eating: React.FC = () => {
  // 本地状态
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FoodCategory | null>(null);
  const [history, setHistory] = useState<FoodItem[]>([]);

  /** 根据分类过滤食物列表 */
  const filteredFoods = useMemo(() => {
    if (!activeCategory) return FOOD_DATABASE;
    return FOOD_DATABASE.filter((f) => f.category === activeCategory);
  }, [activeCategory]);

  /**
   * 随机选择食物
   */
  const handlePick = useCallback(() => {
    if (filteredFoods.length === 0) return;

    // 过滤掉最近3次的历史记录，增加多样性
    const recentNames = new Set(history.slice(0, 3).map((f) => f.name));
    const candidates = filteredFoods.filter((f) => !recentNames.has(f.name));
    const pool = candidates.length > 2 ? candidates : filteredFoods;

    // 动画效果
    setIsSpinning(true);

    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * pool.length);
      const selected = pool[randomIndex];
      if (selected) setSelectedFood(selected);
      count++;

      if (count >= 15) {
        clearInterval(interval);
        // 最终确定
        const finalIndex = Math.floor(Math.random() * pool.length);
        const finalPick = pool[finalIndex];
        setSelectedFood(finalPick!);
        setHistory((prev) => [finalPick!, ...prev].slice(0, 20));
        setIsSpinning(false);
      }
    }, 80);
  }, [filteredFoods, history]);

  /**
   * 换一个（快速切换）
   */
  const handleChange = useCallback(() => {
    if (filteredFoods.length === 0) return;

    const recentNames = new Set(history.slice(0, 5).map((f) => f.name));
    const candidates = filteredFoods.filter((f) => !recentNames.has(f.name));
    const pool = candidates.length > 1 ? candidates : filteredFoods;

    const index = Math.floor(Math.random() * pool.length);
    const pick = pool[index]!;
    setSelectedFood(pick);
    setHistory((prev) => [pick, ...prev].slice(0, 20));
  }, [filteredFoods, history]);

  /**
   * 获取推荐语
   */
  const getRecommendation = useCallback((): string => {
    return RECOMMENDATIONS[Math.floor(Math.random() * RECOMMENDATIONS.length)]!;
  }, []);

  // ========== 渲染 ==========

  return (
    <div className={styles.pageContainer}>
      {/* 标题 */}
      <div className={styles.header}>
        <h1 className={`${styles.title} ${isSpinning ? styles.spinning : ''}`}>
          今天吃什么？
        </h1>
        <p className={styles.subtitle}>选择困难症的救星</p>
      </div>

      {/* 分类选择 */}
      <div className={styles.categoryTabs}>
        <Button
          type={!activeCategory ? 'primary' : 'default'}
          onClick={() => setActiveCategory(null)}
          className={styles.categoryBtn}
        >
          全部
        </Button>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
          <Button
            key={key}
            type={activeCategory === key ? 'primary' : 'default'}
            icon={config.icon}
            onClick={() =>
              setActiveCategory(activeCategory === key ? null : (key as FoodCategory))
            }
            style={
              activeCategory === key
                ? { backgroundColor: config.color }
                : undefined
            }
            className={styles.categoryBtn}
          >
            {config.label}
          </Button>
        ))}
      </div>

      {/* 选择按钮 */}
      <div className={styles.pickSection}>
        <Button
          type="primary"
          size="large"
          icon={<ThunderboltOutlined />}
          onClick={handlePick}
          loading={isSpinning}
          disabled={filteredFoods.length === 0}
          className={styles.pickBtn}
          style={{ backgroundColor: '#00b26a' }}
        >
          {isSpinning ? '选择中...' : '帮我选！'}
        </Button>
      </div>

      {/* 结果展示 */}
      {selectedFood && (
        <Card className={styles.resultCard}>
          <div className={styles.resultContent}>
            {/* 食物名称 */}
            <h2 className={styles.foodName}>{selectedFood.name}</h2>

            {/* 分类标签 */}
            <Tag
              color={CATEGORY_CONFIG[selectedFood.category]?.color ?? '#999'}
              icon={CATEGORY_CONFIG[selectedFood.category]?.icon}
              className={styles.foodTag}
            >
              {CATEGORY_CONFIG[selectedFood.category]?.label}
            </Tag>

            {/* 推荐语 */}
            <p className={styles.recommendation}>{getRecommendation()}</p>

            {/* 描述 */}
            {selectedFood.description && (
              <p className={styles.foodDesc}>{selectedFood.description}</p>
            )}

            {/* 图片占位 */}
            <div className={styles.imagePlaceholder}>
              <span>{selectedFood.name}</span>
            </div>

            {/* 换一个按钮 */}
            <Button
              icon={<ReloadOutlined />}
              onClick={handleChange}
              className={styles.changeBtn}
            >
              换一个
            </Button>
          </div>
        </Card>
      )}

      {/* 空状态提示 */}
      {!selectedFood && (
        <Card className={styles.emptyCard}>
          <Empty
            image={<CoffeeOutlined style={{ fontSize: 64, color: '#ddd' }} />}
            description={
              <span className={styles.emptyText}>
                点击上方按钮开始选择
              </span>
            }
          />
        </Card>
      )}
    </div>
  );
};

export default Eating;
