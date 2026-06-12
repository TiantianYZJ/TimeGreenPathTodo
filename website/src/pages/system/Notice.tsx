import { useEffect, useState } from 'react';
import { Card, Typography, List, Empty, Spin } from 'antd';
import { configApi } from '../../services';
import type { Notice as NoticeType } from '../../services/modules/configApi';

const { Title, Paragraph } = Typography;

export default function Notice() {
  const [notices, setNotices] = useState<NoticeType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await configApi.getNotices();
        if (res.success) setNotices(res.notices || []);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="animate-fade-in">
      <Title level={4} style={{ marginBottom: 16 }}>公告</Title>
      <Spin spinning={loading}>
        {notices.length > 0 ? (
          notices.map((notice, index) => (
            <Card key={index} style={{ borderRadius: 12, marginBottom: 12 }}>
              <Title level={5}>{notice.title}</Title>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{notice.content}</Paragraph>
            </Card>
          ))
        ) : (
          <Card style={{ borderRadius: 12 }}><Empty description="暂无公告" /></Card>
        )}
      </Spin>
    </div>
  );
}
