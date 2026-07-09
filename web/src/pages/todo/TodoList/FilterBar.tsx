import React, { useState } from 'react';
import { Button, Tag, Radio, Space, Badge } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { useTagStore } from '@/stores/tagStore';
import { getTagColorById } from '@/styles/themes/tagColors';

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
    <div className="filter-bar">
      {/* Header: toggle + clear */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Button
          size="small"
          icon={<FilterOutlined />}
          onClick={() => setShowPanel(v => !v)}
          type={showPanel ? 'primary' : 'default'}
        >
          筛选 {hasActiveFilters && <Badge status="processing" />}
        </Button>
        {hasActiveFilters && (
          <Button size="small" icon={<ClearOutlined />} onClick={handleClear}>
            清除筛选
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {showPanel && (
        <div style={{
          padding: 16,
          marginBottom: 16,
          background: '#fafafa',
          borderRadius: 8,
          border: '1px solid #f0f0f0',
        }}>
          {/* Status */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 6, fontWeight: 500 }}>状态</div>
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
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 6, fontWeight: 500 }}>优先级</div>
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
            <div style={{ fontSize: 13, color: '#666', marginBottom: 6, fontWeight: 500 }}>标签</div>
            <Space wrap size={[4, 4]}>
              {allTags.map(tag => {
                const isSelected = (filter.tagIds || []).includes(tag.id);
                const tagColor = getTagColorById(tag.id);
                return (
                  <Tag
                    key={tag.id}
                    color={isSelected ? tagColor.color : undefined}
                    style={{
                      cursor: 'pointer',
                      borderColor: isSelected ? tagColor.color : tagColor.borderColor,
                      background: isSelected ? tagColor.color : tagColor.bgColor,
                      color: isSelected ? '#fff' : tagColor.color,
                      fontSize: 12,
                    }}
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    {tag.name}
                  </Tag>
                );
              })}
              <Tag
                style={{
                  cursor: 'pointer',
                  borderStyle: 'dashed',
                  borderColor: filter.untagged ? '#00b26a' : '#d9d9d9',
                  background: filter.untagged ? 'rgba(0, 178, 106, 0.08)' : undefined,
                  color: filter.untagged ? '#00b26a' : '#666',
                  fontSize: 12,
                }}
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
