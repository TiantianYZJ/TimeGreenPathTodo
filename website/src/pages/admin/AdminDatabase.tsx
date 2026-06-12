import { useEffect, useState } from 'react';
import { Card, Typography, Select, Table, Spin } from 'antd';
import { useAdminStore } from '../../stores';

const { Title } = Typography;

export default function AdminDatabase() {
  const { tables, fetchTables, getTableData } = useAdminStore();
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<{ columns: string[]; rows: Record<string, unknown>[]; total: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleTableChange = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoading(true);
    try {
      const data = await getTableData(tableName) as { success: boolean; columns: string[]; rows: Record<string, unknown>[]; total: number };
      if (data.success) {
        setTableData(data);
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const columns = tableData?.columns.map((col) => ({
    title: col,
    dataIndex: col,
    key: col,
    ellipsis: true,
    width: 150,
  })) || [];

  return (
    <div className="animate-fade-in">
      <Title level={4} style={{ marginBottom: 16 }}>数据库浏览</Title>
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Select
          placeholder="选择数据表"
          style={{ width: 300 }}
          value={selectedTable || undefined}
          onChange={handleTableChange}
          options={tables.map((t) => ({ value: t, label: t }))}
        />
      </Card>
      <Spin spinning={loading}>
        {tableData && (
          <Card style={{ borderRadius: 12 }}>
            <Table
              dataSource={tableData.rows}
              columns={columns}
              rowKey={(r) => String(r.id || JSON.stringify(r))}
              size="small"
              scroll={{ x: 'max-content' }}
              pagination={{ pageSize: 50 }}
            />
          </Card>
        )}
      </Spin>
    </div>
  );
}
