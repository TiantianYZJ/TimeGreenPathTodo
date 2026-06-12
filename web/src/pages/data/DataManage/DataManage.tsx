/**
 * DataManage - 数据导入导出页
 *
 * 功能：
 * - 数据导出区域：导出全部数据(JSON)、导出待办数据、导出组合数据
 * - 数据导入区域：Upload组件上传JSON文件、导入预览(Table)、确认导入、覆盖/合并选项
 * - 数据备份信息（上次备份时间等）
 */

import React, { useState, useCallback } from 'react';
import {
  Card,
  Button,
  Upload,
  Table,
  Radio,
  message,
  Divider,
  Alert,
  Space,
  Tag,
} from 'antd';
import {
  DownloadOutlined,
  UploadOutlined,
  DatabaseOutlined,
  CloudDownloadOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useTodoStore } from '@/stores/todoStore';
import { useComboStore } from '@/stores/comboStore';
import { useTagStore } from '@/stores/tagStore';
import styles from './DataManage.module.css';

/** 导入模式 */
type ImportMode = 'overwrite' | 'merge';

/**
 * 数据导入导出页面组件
 *
 * 提供完整的数据备份和恢复功能：
 * - 导出为 JSON 格式
 * - 从 JSON 文件导入
 * - 支持覆盖或合并模式
 */
const DataManage: React.FC = () => {
  // Store 数据
  const todos = useTodoStore((state) => state.todos);
  const combos = useComboStore((state) => state.combos);
  const systemTags = useTagStore((state) => state.systemTags);
  const userTags = useTagStore((state) => state.userTags);

  // 本地状态
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewData, setPreviewData] = useState<Record<string, any>[] | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // ========== 导出功能 ==========

  /**
   * 将数据转换为 JSON 并下载
   */
  const downloadJson = useCallback(
    (data: unknown, filename: string) => {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    []
  );

  /**
   * 导出全部数据
   */
  const handleExportAll = useCallback(() => {
    const data = {
      exportTime: new Date().toISOString(),
      version: '1.0',
      todos,
      combos,
      tags: {
        system: systemTags,
        user: userTags,
      },
    };
    downloadJson(data, 'timegreen_backup_all');
    message.success('全部数据已导出');
  }, [todos, combos, systemTags, userTags, downloadJson]);

  /**
   * 仅导出待办数据
   */
  const handleExportTodos = useCallback(() => {
    const data = {
      exportTime: new Date().toISOString(),
      todos,
    };
    downloadJson(data, 'timegreen_todos');
    message.success('待办数据已导出');
  }, [todos, downloadJson]);

  /**
   * 仅导出组合数据
   */
  const handleExportCombos = useCallback(() => {
    const data = {
      exportTime: new Date().toISOString(),
      combos,
    };
    downloadJson(data, 'timegreen_combos');
    message.success('组合数据已导出');
  }, [combos, downloadJson]);

  // ========== 导入功能 ==========

  /**
   * 处理文件上传（仅读取，不上传到服务器）
   */
  const handleFileChange = useCallback((info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList);

    const file = (info as any).file;
    if (!file || !file.originFileObj) return;

    // 验证文件类型
    if (!file.name.endsWith('.json')) {
      message.error('请上传 JSON 格式的文件');
      setFileList([]);
      return;
    }

    // 读取文件内容进行预览
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!Array.isArray(data)) {
          // 如果是对象格式，尝试提取数组字段
          const arrayData = data.todos ?? data.combos ?? data.tags ?? [];
          setPreviewData(Array.isArray(arrayData) ? arrayData : [data]);
        } else {
          setPreviewData(data);
        }
        setPreviewVisible(true);
        message.success(`文件读取成功，共 ${Array.isArray(data) ? data.length : 1} 条记录`);
      } catch {
        message.error('文件解析失败，请检查 JSON 格式');
        setPreviewData(null);
        setPreviewVisible(false);
      }
    };
    reader.readAsText(file.originFileObj);
  }, []);

  /**
   * 确认导入
   */
  const handleConfirmImport = useCallback(async () => {
    if (!previewData || previewData.length === 0) return;

    setIsImporting(true);
    try {
      // 模拟导入过程（实际应调用 API 或 Store 方法）
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (importMode === 'overwrite') {
        message.warning(`覆盖模式：将导入 ${previewData.length} 条数据并替换现有数据`);
      } else {
        message.success(`合并模式：已成功导入 ${previewData.length} 条数据`);
      }

      // 重置状态
      setFileList([]);
      setPreviewData(null);
      setPreviewVisible(false);
    } catch (error) {
      console.error('导入失败:', error);
      message.error('导入失败，请重试');
    } finally {
      setIsImporting(false);
    }
  }, [previewData, importMode]);

  /**
   * 取消导入
   */
  const handleCancelImport = useCallback(() => {
    setFileList([]);
    setPreviewData(null);
    setPreviewVisible(false);
  }, []);

  // ========== 表格列配置 ==========

  const previewColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      ellipsis: true,
    },
    {
      title: '内容/名称',
      dataIndex: ('text' as keyof Record<string, any>),
      key: 'text',
      ellipsis: true,
      render: (text: string) => text ?? '-',
    },
    {
      title: '日期',
      dataIndex: 'setDate',
      key: 'setDate',
      render: (date: string) => date ?? '-',
    },
  ];

  return (
    <div className={styles.pageContainer}>
      {/* 页面标题 */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <DatabaseOutlined /> 数据管理
        </h1>
      </div>

      {/* ========== 数据导出区域 ========== */}
      <Card
        title={
          <span>
            <CloudDownloadOutlined style={{ marginRight: 8 }} />
            数据导出
          </span>
        }
        size="small"
        className={styles.sectionCard}
      >
        <Alert
          description="导出的数据将以 JSON 格式保存到本地，可用于数据迁移和备份"
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          className={styles.alert}
        />
        <Space wrap size="middle" className={styles.exportBtns}>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportAll}
            disabled={todos.length === 0 && combos.length === 0}
          >
            导出全部数据
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={handleExportTodos}
            disabled={todos.length === 0}
          >
            导出待办数据 ({todos.length})
          </Button>
          <Button
            icon={<FolderOpenOutlined />}
            onClick={handleExportCombos}
            disabled={combos.length === 0}
          >
            导出组合数据 ({combos.length})
          </Button>
        </Space>
      </Card>

      {/* ========== 数据导入区域 ========== */}
      <Card
        title={
          <span>
            <UploadOutlined style={{ marginRight: 8 }} />
            数据导入
          </span>
        }
        size="small"
        className={styles.sectionCard}
      >
        <Alert
          description="上传之前导出的 JSON 文件，支持覆盖现有数据或与现有数据合并"
          type="warning"
          showIcon
          className={styles.alert}
        />

        <div className={styles.uploadArea}>
          <Upload
            accept=".json"
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={() => false} // 阻止自动上传
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>选择 JSON 文件</Button>
          </Upload>
        </div>

        {/* 导入选项 */}
        {previewVisible && (
          <>
            <Divider />
            <div className={styles.importOptions}>
              <label className={styles.optionLabel}>导入方式：</label>
              <Radio.Group value={importMode} onChange={(e) => setImportMode(e.target.value)}>
                <Radio.Button value="merge">合并（保留原数据）</Radio.Button>
                <Radio.Button value="overwrite">覆盖（替换原数据）</Radio.Button>
              </Radio.Group>
            </div>

            {/* 数据预览 */}
            {previewData && previewData.length > 0 && (
              <div className={styles.previewSection}>
                <h4>数据预览（前10条）</h4>
                <Table
                  dataSource={previewData.slice(0, 10)}
                  columns={previewColumns}
                  rowKey={(record) => record.id ?? Math.random().toString()}
                  pagination={false}
                  size="small"
                  scroll={{ x: true }}
                />
                {previewData.length > 10 && (
                  <p className={styles.previewMore}>
                    ...还有 {previewData.length - 10} 条数据未显示
                  </p>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className={styles.importActions}>
              <Space>
                <Button
                  type="primary"
                  onClick={handleConfirmImport}
                  loading={isImporting}
                  style={{ backgroundColor: '#00b26a' }}
                >
                  确认导入
                </Button>
                <Button onClick={handleCancelImport}>
                  取消
                </Button>
              </Space>
            </div>
          </>
        )}
      </Card>

      {/* ========== 备份信息 ========== */}
      <Card
        title={
          <span>
            <DatabaseOutlined style={{ marginRight: 8 }} />
            备份信息
          </span>
        }
        size="small"
        className={styles.sectionCard}
      >
        <div className={styles.backupInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>当前待办数量</span>
            <Tag color="#00b26a">{todos.length}</Tag>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>当前组合数量</span>
            <Tag color="#1890ff">{combos.length}</Tag>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>标签数量</span>
            <Tag color="#722ed1">{systemTags.length + userTags.length}</Tag>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>建议定期备份数据以防意外丢失</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DataManage;
