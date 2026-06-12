/**
 * Motivation - 每日激励语录页
 *
 * 功能：
 * - 精美卡片展示一句励志语录
 * - 作者/来源
 * - 切换下一条按钮（带翻转动画）
 * - 分享按钮（复制文字）
 * - 语录数据（内置30条以上中文励志语录数组）
 * - 每日自动推荐一条（基于日期取模）
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Card,
  Button,
  message,
} from 'antd';
import {
  BulbOutlined,
  SwapOutlined,
  ShareAltOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import styles from './Motivation.module.css';

/** 语录数据结构 */
interface Quote {
  /** 语录内容 */
  text: string;
  /** 作者/来源 */
  author: string;
}

/** 内置励志语录库（30+条） */
const QUOTES: Quote[] = [
  { text: '成功不是终点，失败也不是终结，唯有继续前行的勇气才是最重要的。', author: '温斯顿·丘吉尔' },
  { text: '不要因为走得太远，而忘记为什么出发。', author: '纪伯伦' },
  { text: '生活不是等待暴风雨过去，而是学会在雨中跳舞。', author: '薇薇安·格林' },
  { text: '你今天的努力，是幸运的伏笔；当下的付出，是明日的花开。', author: '佚名' },
  { text: '种一棵树最好的时间是十年前，其次是现在。', author: '经济学名言' },
  { text: '世界上只有一种真正的英雄主义，那就是认清生活的真相后依然热爱它。', author: '罗曼·罗兰' },
  { text: '你的时间有限，不要浪费在重复别人的生活上。', author: '史蒂夫·乔布斯' },
  { text: '每一个不曾起舞的日子，都是对生命的辜负。', author: '尼采' },
  { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
  { text: '天行健，君子以自强不息。', author: '《周易》' },
  { text: '宝剑锋从磨砺出，梅花香自苦寒来。', author: '古语' },
  { text: '千里之行，始于足下。', author: '老子' },
  { text: '不积跬步，无以至千里；不积小流，无以成江海。', author: '荀子' },
  { text: '山重水复疑无路，柳暗花明又一村。', author: '陆游' },
  { text: '长风破浪会有时，直挂云帆济沧海。', author: '李白' },
  { text: '会当凌绝顶，一览众山小。', author: '杜甫' },
  { text: '世上无难事，只怕有心人。', author: '谚语' },
  { text: '有志者事竟成，破釜沉舟百二秦关终属楚；苦心人天不负，卧薪尝胆三千越甲可吞吴。', author: '蒲松龄' },
  { text: '人生如逆旅，我亦是行人。', author: '苏轼' },
  { text: '莫等闲，白了少年头，空悲切。', author: '岳飞' },
  { text: '少壮不努力，老大徒伤悲。', author: '汉乐府' },
  { text: '业精于勤荒于嬉，行成于思毁于随。', author: '韩愈' },
  { text: '学而不思则罔，思而不学则殆。', author: '孔子' },
  { text: '知之者不如好之者，好之者不如乐之者。', author: '孔子' },
  { text: '己所不欲，勿施于人。', author: '孔子' },
  { text: '三人行，必有我师焉。择其善者而从之，其不善者而改之。', author: '孔子' },
  { text: '学而时习之，不亦说乎？有朋自远方来，不亦乐乎？', author: '孔子' },
  { text: '海纳百川，有容乃大；壁立千仞，无欲则刚。', author: '林则徐' },
  { text: '落红不是无情物，化作春泥更护花。', author: '龚自珍' },
  { text: '沉舟侧畔千帆过，病树前头万木春。', author: '刘禹锡' },
  { text: '问渠那得清如许？为有源头活水来。', author: '朱熹' },
  { text: '纸上得来终觉浅，绝知此事要躬行。', author: '陆游' },
];

/**
 * 每日激励语录组件
 *
 * 提供每日励志语录：
 * - 基于日期自动推荐
 * - 支持手动切换
 * - 可分享复制
 * - 精美的卡片展示和动画效果
 */
const Motivation: React.FC = () => {
  // 本地状态
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // ========== 计算逻辑 ==========

  /** 基于当前日期计算每日推荐索引 */
  const dailyIndex = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return dayOfYear % QUOTES.length;
  }, []);

  /** 当前展示的语录 */
  const currentQuote = useMemo(() => {
    return QUOTES[currentIndex] ?? QUOTES[0];
  }, [currentIndex]);

  /** 是否为今日推荐 */
  const isDailyPick = currentIndex === dailyIndex;

  // ========== 事件处理 ==========

  /**
   * 切换到下一条语录（带翻转动画）
   */
  const handleNext = useCallback(() => {
    setIsFlipping(true);

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % QUOTES.length);
      setTimeout(() => {
        setIsFlipping(false);
      }, 50);
    }, 300);
  }, []);

  /**
   * 复制语录到剪贴板
   */
  const handleShare = useCallback(async () => {
    const shareText = `「${currentQuote!.text}」—— ${currentQuote!.author}`;
    try {
      await navigator.clipboard.writeText(shareText);
      message.success('已复制到剪贴板');
    } catch {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      message.success('已复制到剪贴板');
    }
  }, [currentQuote]);

  /**
   * 跳转到今日推荐
   */
  const handleGoToDaily = useCallback(() => {
    if (currentIndex === dailyIndex) return;

    setIsFlipping(true);
    setTimeout(() => {
      setCurrentIndex(dailyIndex);
      setTimeout(() => {
        setIsFlipping(false);
      }, 50);
    }, 300);
  }, [currentIndex, dailyIndex]);

  // ========== 渲染 ==========

  return (
    <div className={styles.pageContainer}>
      {/* 页面标题 */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <BulbOutlined /> 每日激励
        </h1>
        <p className={styles.subtitle}>每天一句，温暖前行</p>
      </div>

      {/* 语录卡片 */}
      <Card className={`${styles.quoteCard} ${isFlipping ? styles.flipping : ''}`}>
        <div className={styles.quoteContent}>
          {/* 引号装饰 */}
          <div className={styles.quoteMark}>"</div>

          {/* 语录正文 */}
          <p className={styles.quoteText}>{currentQuote!.text}</p>

          {/* 作者 */}
          <div className={styles.authorSection}>
            <span className={styles.dash}>—</span>
            <span className={styles.authorName}>{currentQuote!.author}</span>
          </div>
        </div>
      </Card>

      {/* 操作按钮区域 */}
      <div className={styles.actions}>
        {/* 今日推荐标识 */}
        {!isDailyPick && (
          <Button
            icon={<CalendarOutlined />}
            onClick={handleGoToDaily}
            className={styles.dailyBtn}
          >
            查看今日推荐
          </Button>
        )}

        {isDailyPick && (
          <span className={styles.dailyBadge}>
            <CalendarOutlined /> 今日推荐
          </span>
        )}

        <div className={styles.actionBtns}>
          <Button
            icon={<SwapOutlined />}
            onClick={handleNext}
            size="large"
            className={styles.nextBtn}
          >
            换一条
          </Button>
          <Button
            icon={<ShareAltOutlined />}
            onClick={handleShare}
            size="large"
            className={styles.shareBtn}
          >
            分享
          </Button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className={styles.stats}>
        <span>共收录 {QUOTES.length} 条励志语录</span>
        <span>当前第 {currentIndex + 1}/{QUOTES.length} 条</span>
      </div>
    </div>
  );
};

export default Motivation;
