import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Strategies from './pages/Strategies';
import Initiatives from './pages/Initiatives';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Kpis from './pages/Kpis';
import RiskManagement from './pages/RiskManagement';
import { useStore } from './store';
import { strategyApi, initiativeApi, projectApi, taskApi, kpiApi } from './services/api';

import AIFeatures from './pages/AIFeatures';
import Settings from './pages/Settings';
import ProjectDetail from './pages/ProjectDetail';

const App: React.FC = () => {
  const {
    strategies,
    initiatives,
    projects,
    tasks,
    kpis,
    setStrategies,
    setInitiatives,
    setProjects,
    setTasks,
    setKpis,
    setLoading,
    setError
  } = useStore();

  useEffect(() => {
    // 初始化数据加载
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // 强制重新加载，不检查现有数据
        console.log('🔄 开始加载初始数据...');

        // 并行加载所有数据，设置超时
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('请求超时')), 5000)
        );

        const dataPromise = Promise.all([
          strategyApi.getAll().catch(() => ({ data: [] })),
          initiativeApi.getAll().catch(() => ({ data: [] })),
          projectApi.getAll().catch(() => ({ data: [] })),
          taskApi.getAll().catch(() => ({ data: [] })),
          kpiApi.getAll().catch(() => ({ data: [] })),
        ]);

        const [strategiesRes, initiativesRes, projectsRes, tasksRes, kpisRes] =
          await Promise.race([dataPromise, timeoutPromise]) as any;

        console.log('📊 策略数据:', strategiesRes.data?.data?.length || strategiesRes.data?.length || 0);
        console.log('📊 任务数据:', tasksRes.data?.data?.length || tasksRes.data?.length || 0);

        // 详细调试数据结构
        console.log('🔍 任务响应结构:', {
          hasData: !!tasksRes.data,
          hasNestedData: !!tasksRes.data?.data,
          dataLength: tasksRes.data?.data?.length,
          rawDataLength: tasksRes.data?.length,
          sampleData: tasksRes.data?.data?.[0] || tasksRes.data?.[0]
        });

        const tasksData = tasksRes.data?.data || tasksRes.data || [];
        console.log('📝 最终设置的任务数据:', tasksData.length, tasksData);

        setStrategies(strategiesRes.data?.data || strategiesRes.data || []);
        setInitiatives(initiativesRes.data?.data || initiativesRes.data || []);
        setProjects(projectsRes.data?.data || projectsRes.data || []);
        setTasks(tasksData);
        setKpis(kpisRes.data?.data || kpisRes.data || []);
      } catch (error) {
        console.error('初始化数据失败:', error);
        // 不设置错误状态，避免影响用户体验
        // setError('初始化数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []); // 移除依赖项，避免重复执行

  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/strategies" element={<Strategies />} />
            <Route path="/initiatives" element={<Initiatives />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/kpis" element={<Kpis />} />
            <Route path="/risks" element={<RiskManagement />} />
            <Route path="/ai" element={<AIFeatures />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default App;
