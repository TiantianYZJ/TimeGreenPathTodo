import React, { useState } from 'react';
import { Button, Tag, Radio, Space, Badge } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { useTagStore } from '@/stores/tagStore';
import { getTagColorById } from '@/styles/themes/tagColors';
import filterStyles from './FilterBar.module.css';

interface FilterBarProps {
  /** Current filter state from the store */
  filter: {
    status: 'all' | 'completed' | 'uncompleted';
    tagIds: number[];
    priority?: string | null;
    untagged?: boolean;
  };
  /** Callback when any filter value changes — merge partial */
  onChange: (partial: Partial<FilterBarProps['filter']>) => void;
}

const priorityOptions = [
  { label: '全部', value: '' },
  { label: 'P1 紧急', value: 'p1' },
  { label: 'P2 重要', value: 'p2' },
  { label: 'P3 一般', value: 'p3' },
  { label: 'P4 低优', value: 'p4' },
];

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '未完成', value: 'uncompleted' },
  { label: '已完成', value: 'completed' },
];

const FilterBar: React.FC<FilterBarProps> = ({ filter, onChange }) => {
  const { systemTags, userTags } = useTagStore();
  const allTags = [...systemTags, ...userTags];
  const [showPanel, setShowPanel] = useState(false);

  const hasActiveFilters =
    filter.status !== 'all' ||
    (filter.tagIds && filter.tagIds.length > 0) ||
    !!filter.priority ||
    filter.untagged;

  const handleClear = () => {
    onChange({ status: 'all', tagIds: [], priority: null, untagged: false });
  };

  const handleTagToggle = (tagId: number) => {
    const current = filter.tagIds || [];
    const next = current.includes(tagId)
      ? current.filter(id => id !== tagId)
      : [...current, tagId];
    onChange({ tagIds: next });
  };

  return (
    <div className={filterStyles.filterBar}>
      {/* Header: toggle + clear */}
      <div className={filterStyles.filterHeader}>
        <Button
          size="small"
          icon={<FilterOutlined />}
          onClick={() => setShowPanel(v => !v)}
          type={showPanel ? 'primary' : 'default'}
          className={filterStyles.filterToggleBtn}
        >
          筛选 {hasActiveFilters && <Badge status="processing" className={filterStyles.activeBadge} />}
        </Button>
        {hasActiveFilters && (
          <Button size="small" icon={<ClearOutlined />} onClick={handleClear}>
            清除筛选
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {showPanel && (
        <div className={filterStyles.filterPanel}>
          {/* Status */}
          <div className={filterStyles.filterSection}>
            <div className={filterStyles.filterSectionLabel}>状态</div>
            <Radio.Group
              value={filter.status}
              onChange={e => onChange({ status: e.target.value })}
              size="small"
              optionType="button"
              buttonStyle="solid"
            >
              {statusOptions.map(opt => (
                <Radio.Button key={opt.value} value={opt.value}>{opt.label}</Radio.Button>
              ))}
            </Radio.Group>
          </div>

          {/* Priority */}
          <div className={filterStyles.filterSection}>
            <div className={filterStyles.filterSectionLabel}>优先级</div>
            <Radio.Group
              value={filter.priority || ''}
              onChange={e => onChange({ priority: e.target.value || null })}
              size="small"
              optionType="button"
              buttonStyle="solid"
            >
              {priorityOptions.map(opt => (
                <Radio.Button key={opt.value} value={opt.value}>{opt.label}</Radio.Button>
              ))}
            </Radio.Group>
          </div>

          {/* Tags */}
          <div>
            <div className={filterStyles.filterSectionLabel}>标签</div>
            <Space wrap size={[4, 4]}>
              {allTags.map(tag => {
                const isSelected = (filter.tagIds || []).includes(tag.id);
                const tagColor = getTagColorById(tag.id);
                return (
                  <Tag
                    key={tag.id}
                    color={isSelected ? tagColor.color : undefined}
                    className={filterStyles.tagItem}
                    style={{
                      borderColor: isSelected ? tagColor.color : tagColor.borderColor,
                      background: isSelected ? tagColor.color : tagColor.bgColor,
                      color: isSelected ? '#fff' : tagColor.color,
                    }}
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    {tag.name}
                  </Tag>
                );
              })}
              <Tag
                className={`${filterStyles.untaggedTag} ${filter.untagged ? filterStyles.untaggedTagActive : filterStyles.untaggedTagInactive}`}
                onClick={() => onChange({ untagged: !filter.untagged })}
              >
                无标签
              </Tag>
            </Space>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
