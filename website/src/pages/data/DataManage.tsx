import { Card, Typography, Button, Space, Upload, message } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload';
import { useTodoStore } from '../../stores';

const { Title, Text } = Typography;

export default function DataManage() {
  const { todos, fetchTodos } = useTodoStore();

  const handleExport = () => {
    const data = JSON.stringify(todos, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timegreen-todos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  };

  const handleImport = (file: UploadFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);
        if (!Array.isArray(imported)) {
          message.error('文件格式错误：应为待办数组');
          return;
        }

        const existing = JSON.parse(localStorage.getItem('todos') || '[]');
        const existingIds = new Set(existing.map((t: { id: string }) => t.id));
        let addedCount = 0;

        for (const todo of imported) {
          if (todo.id && !existingIds.has(todo.id)) {
            existing.push(todo);
            addedCount++;
          }
        }

        localStorage.setItem('todos', JSON.stringify(existing));
        fetchTodos();
        message.success(`导入完成，新增 ${addedCount} 条待办`);
      } catch {
        message.error('文件解析失败，请确认是有效的 JSON 文件');
      }
    };
    reader.readAsText(file as unknown as Blob);
    return false; // prevent default upload
  };

  return (
    <div className="animate-fade-in">
      <Title level={4} style={{ marginBottom: 16 }}>数据管理</Title>
      <Card style={{ borderRadius: 12, maxWidth: 500 }}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <div>
            <Title level={5}>导出数据</Title>
            <Text type="secondary">将所有待办数据导出为 JSON 文件</Text>
            <div style={{ marginTop: 12 }}>
              <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
                导出 ({todos.length} 条待办)
              </Button>
            </div>
          </div>
          <div>
            <Title level={5}>导入数据</Title>
            <Text type="secondary">从 JSON 文件导入待办数据（自动跳过重复项）</Text>
            <div style={{ marginTop: 12 }}>
              <Upload
                accept=".json"
                showUploadList={false}
                beforeUpload={handleImport}
              >
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
}
