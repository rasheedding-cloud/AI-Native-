import React from 'react';
import { Layout as AntLayout, Menu, Breadcrumb, theme } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  AimOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  LineChartOutlined,
  WarningOutlined,
  RobotOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 根据当前路径获取选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === '/') return ['dashboard'];
    if (path.includes('strategies')) return ['strategies'];
    if (path.includes('initiatives')) return ['initiatives'];
    if (path.includes('projects')) return ['projects'];
    if (path.includes('tasks')) return ['tasks'];
    if (path.includes('kpis')) return ['kpis'];
    if (path.includes('risks')) return ['risks'];
    if (path.includes('ai')) return ['ai'];
    if (path.includes('settings')) return ['settings'];
    return ['dashboard'];
  };

  // 获取面包屑
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [{ title: '首页', href: '/' }];

    if (path.includes('strategies')) {
      breadcrumbs.push({ title: '战略管理', href: '/strategies' });
    } else if (path.includes('initiatives')) {
      breadcrumbs.push({ title: '战役管理', href: '/initiatives' });
    } else if (path.includes('projects')) {
      breadcrumbs.push({ title: '项目管理', href: '/projects' });
    } else if (path.includes('tasks')) {
      breadcrumbs.push({ title: '任务管理', href: '/tasks' });
    } else if (path.includes('kpis')) {
      breadcrumbs.push({ title: 'KPI管理', href: '/kpis' });
    } else if (path.includes('risks')) {
      breadcrumbs.push({ title: '风险管理', href: '/risks' });
    } else if (path.includes('ai')) {
      breadcrumbs.push({ title: 'AI功能', href: '/ai' });
    } else if (path.includes('settings')) {
      breadcrumbs.push({ title: '设置', href: '/settings' });
    }

    return breadcrumbs;
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">仪表盘</Link>,
    },
    {
      key: 'strategies',
      icon: <AimOutlined />,
      label: <Link to="/strategies">战略管理</Link>,
    },
    {
      key: 'initiatives',
      icon: <ProjectOutlined />,
      label: <Link to="/initiatives">战役管理</Link>,
    },
    {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: <Link to="/projects">项目管理</Link>,
    },
    {
      key: 'tasks',
      icon: <CheckSquareOutlined />,
      label: <Link to="/tasks">任务管理</Link>,
    },
    {
      key: 'kpis',
      icon: <LineChartOutlined />,
      label: <Link to="/kpis">KPI管理</Link>,
    },
    {
      key: 'risks',
      icon: <WarningOutlined />,
      label: <Link to="/risks">风险管理</Link>,
    },
    {
      key: 'ai',
      icon: <RobotOutlined />,
      label: <Link to="/ai">AI功能</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">设置</Link>,
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        theme="light"
        width={240}
        collapsedWidth={80}
        breakpoint="lg"
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{
          height: 64,
          margin: '16px 16px 24px 16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '18px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
          transition: 'all 0.3s ease'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RobotOutlined />
            <span className="sidebar-logo-text">AI PM</span>
          </span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          style={{
            borderRight: 0,
            background: 'transparent',
            padding: '0 8px'
          }}
          className="custom-menu"
        />
      </Sider>
      <AntLayout>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Breadcrumb
              items={getBreadcrumbs().map(item => ({
                title: item.href ? <Link to={item.href} style={{ color: '#1890ff' }}>{item.title}</Link> : item.title,
              }))}
            />
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <RobotOutlined style={{ color: '#667eea' }} />
            <span>AI Native 项目管理工具</span>
          </div>
        </Header>
        <Content style={{
          margin: '24px',
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          overflow: 'hidden'
        }}>
          <style>{`
            @media (max-width: 768px) {
              .ant-layout-content {
                margin: '12px',
                padding: '16px',
              }
            }

            .ant-menu-item {
              border-radius: 8px !important;
              margin: 4px 0 !important;
              transition: all 0.3s ease !important;
            }

            .ant-menu-item:hover {
              background: rgba(102, 126, 234, 0.1) !important;
              transform: translateX(4px) !important;
            }

            .ant-menu-item-selected {
              background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%) !important;
              border-left: 4px solid #667eea !important;
            }

            .sidebar-logo-text {
              display: inline;
            }

            @media (max-width: 768px) {
              .sidebar-logo-text {
                display: none;
              }
            }
          `}</style>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;