/**
 * NotFound - 404 页面不存在
 *
 * 当用户访问不存在的路由时显示此页面。
 * 提供返回首页的导航按钮。
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import styles from './NotFound.module.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <Result
        status="404"
        title="404"
        subTitle="您访问的页面已被移除或暂时不可用"
        extra={
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
          >
            返回首页
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
