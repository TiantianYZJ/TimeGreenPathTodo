import { useEffect, useState } from 'react';
import { Card, Typography, Timeline, Spin, Empty } from 'antd';
import { configApi } from '../../services';
import type { ChangelogItem } from '../../services/modules/configApi';

const { Title, Text } = Typography;

export default function Changelog() {
  const [changelog, setChangelog] = useState<ChangelogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await configApi.getChangelog();
        if (res.success) setChangelog(res.changelogList || []);
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
      <Title level={4} style={{ marginBottom: 16 }}>更新日志</Title>
      <Spin spinning={loading}>
        {changelog.length > 0 ? (
          <Card style={{ borderRadius: 12 }}>
            <Timeline
              items={changelog.map((item) => ({
                children: (
                  <div>
                    <Title level={5}>V{item.version} <Text type="secondary" style={{ fontSize: 14 }}>{item.date}</Text></Title>
                    <ul style={{ paddingLeft: 20 }}>
                      {item.content.map((line, i) => (
                        <li key={i}><Text>{line}</Text></li>
                      ))}
                    </ul>
                  </div>
                ),
              }))}
            />
          </Card>
        ) : (
          <Card style={{ borderRadius: 12 }}><Empty description="暂无更新日志" /></Card>
        )}
      </Spin>
    </div>
  );
}
