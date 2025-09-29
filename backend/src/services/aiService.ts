// AI优先级计算引擎
export class AIService {

  // 计算任务优先级
  static calculatePriority(params: {
    kpiWeights: Record<string, number>;
    urgency: number;
    effort: number;
    risk: number;
    dependencyCriticality: number;
    taskDescription?: string;
    assignee?: string;
  }): {
    priority: number;
    reasoning: string;
    confidence: number;
    factors: {
      kpiImpact: number;
      urgency: number;
      effort: number;
      risk: number;
      dependency: number;
    };
  } {
    const { kpiWeights, urgency, effort, risk, dependencyCriticality, taskDescription, assignee } = params;

    // KPI影响度计算
    const kpiImpact = this.calculateKPIImpact(kpiWeights, taskDescription);

    // 工作量调整 (工作量越小，优先级越高)
    const effortFactor = Math.max(0, 1 - effort / 100);

    // 风险调整 (风险越低，优先级越高)
    const riskFactor = Math.max(0, 1 - risk);

    // 综合优先级计算
    const factors = {
      kpiImpact: kpiImpact * 0.35,       // KPI影响权重35%
      urgency: urgency * 0.25,           // 紧急度权重25%
      effort: effortFactor * 0.20,       // 工作量权重20%
      risk: riskFactor * 0.10,          // 风险权重10%
      dependency: dependencyCriticality * 0.10, // 依赖权重10%
    };

    const priority = Math.min(1, Math.max(0,
      factors.kpiImpact + factors.urgency + factors.effort + factors.risk + factors.dependency
    ));

    // 生成推理说明
    const reasoning = this.generateReasoning(factors, kpiWeights, taskDescription, assignee);

    // 计算置信度
    const confidence = this.calculateConfidence(params, factors);

    return {
      priority,
      reasoning,
      confidence,
      factors: {
        kpiImpact: factors.kpiImpact,
        urgency: factors.urgency,
        effort: factors.effort,
        risk: factors.risk,
        dependency: factors.dependency,
      },
    };
  }

  // 计算KPI影响度
  private static calculateKPIImpact(kpiWeights: Record<string, number>, taskDescription?: string): number {
    if (!taskDescription) return 0.5;

    const keywords = {
      '体验课转化率': ['转化', '体验', '试听', '报名', '课程', '学员'],
      '教材完成度': ['教材', '完成', '进度', '学习', '内容', '资料'],
      'ROI': ['收入', '成本', '利润', '投资', '回报', '效益'],
      '续费率': ['续费', '续课', '留存', '维护', '服务'],
      '转介绍率': ['推荐', '介绍', '口碑', '分享', '传播'],
    };

    let totalImpact = 0;
    let totalWeight = 0;

    Object.entries(kpiWeights).forEach(([kpi, weight]) => {
      const kpiKeywords = keywords[kpi as keyof typeof keywords] || [];
      const matches = kpiKeywords.filter(keyword =>
        taskDescription.includes(keyword)
      ).length;

      const impact = Math.min(1, matches / kpiKeywords.length);
      totalImpact += impact * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalImpact / totalWeight : 0.5;
  }

  // 生成推理说明
  private static generateReasoning(
    factors: any,
    kpiWeights: Record<string, number>,
    taskDescription?: string,
    assignee?: string
  ): string {
    const reasons = [];

    // KPI影响分析
    const maxKPI = Object.entries(kpiWeights).reduce((max, [kpi, weight]) =>
      weight > max.weight ? { kpi, weight } : max, { kpi: '', weight: 0 }
    );

    if (maxKPI.weight > 0) {
      reasons.push(`主要影响${maxKPI.kpi}指标（权重${(maxKPI.weight * 100).toFixed(0)}%）`);
    }

    // 紧急度分析
    if (factors.urgency > 0.2) {
      reasons.push('任务紧急度较高');
    }

    // 工作量分析
    if (factors.effort > 0.15) {
      reasons.push('工作量相对较小，适合优先处理');
    }

    // 风险分析
    if (factors.risk < 0.05) {
      reasons.push('风险较低，执行难度小');
    }

    // 依赖分析
    if (factors.dependency > 0.08) {
      reasons.push('依赖关键路径，影响其他任务');
    }

    // 人员分析
    if (assignee) {
      reasons.push(`已分配给${assignee}，可立即执行`);
    }

    return reasons.join('；') + '。综合计算得出优先级评分。';
  }

  // 计算置信度
  private static calculateConfidence(params: any, factors: any): number {
    let confidence = 0.8; // 基础置信度

    // 根据信息完整性调整
    if (Object.keys(params.kpiWeights).length > 0) confidence += 0.05;
    if (params.taskDescription) confidence += 0.05;
    if (params.assignee) confidence += 0.02;
    if (params.urgency > 0) confidence += 0.03;
    if (params.effort > 0) confidence += 0.03;
    if (params.risk >= 0) confidence += 0.02;

    return Math.min(1, confidence);
  }

  // AI排期建议
  static generateSchedule(params: {
    taskId: string;
    estimate: number;
    dependencies: string[];
    hardDeadline?: Date;
    teamCalendar?: string[];
    prayerWeekendRules?: boolean;
  }): {
    recommendedStart: Date;
    recommendedEnd: Date;
    conflicts: string[];
    suggestions: string[];
    confidence: number;
  } {
    const { estimate, dependencies, hardDeadline, prayerWeekendRules } = params;

    const now = new Date();
    let recommendedStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 默认明天开始

    // 考虑祷告时间（假设周五下午和周日为祷告时间）
    if (prayerWeekendRules) {
      recommendedStart = this.adjustForPrayerTime(recommendedStart);
    }

    // 计算推荐结束时间
    const recommendedEnd = new Date(recommendedStart.getTime() + estimate * 24 * 60 * 60 * 1000);

    // 检查冲突
    const conflicts = this.checkSchedulingConflicts(params, recommendedStart, recommendedEnd);

    // 生成建议
    const suggestions = this.generateScheduleSuggestions(params, conflicts);

    // 计算置信度
    const confidence = this.calculateScheduleConfidence(params, conflicts);

    return {
      recommendedStart,
      recommendedEnd,
      conflicts,
      suggestions,
      confidence,
    };
  }

  // 调整祷告时间
  private static adjustForPrayerTime(date: Date): Date {
    const day = date.getDay();
    const hours = date.getHours();

    // 如果是周五下午或周日，调整到下周一
    if ((day === 5 && hours >= 12) || day === 0) {
      const adjusted = new Date(date);
      adjusted.setDate(date.getDate() + (day === 5 ? 3 : 1));
      adjusted.setHours(9, 0, 0, 0);
      return adjusted;
    }

    return date;
  }

  // 检查排期冲突
  private static checkSchedulingConflicts(params: any, start: Date, end: Date): string[] {
    const conflicts = [];

    // 检查截止日期冲突
    if (params.hardDeadline && end > params.hardDeadline) {
      conflicts.push('建议结束时间超过硬截止时间');
    }

    // 检查依赖冲突
    if (params.dependencies.length > 0) {
      conflicts.push(`存在${params.dependencies.length}个依赖任务需要完成`);
    }

    // 检查工作时长冲突
    const workDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (workDays > 14) {
      conflicts.push('工期过长，建议拆分任务');
    }

    return conflicts;
  }

  // 生成排期建议
  private static generateScheduleSuggestions(params: any, conflicts: string[]): string[] {
    const suggestions = [
      '建议在工作日上午9-11点进行重要任务',
      '预留15-20%的缓冲时间应对突发情况',
      '定期检查进度，及时调整计划',
    ];

    if (params.prayerWeekendRules) {
      suggestions.push('避免在祷告时间安排重要会议');
    }

    if (params.estimate > 5) {
      suggestions.push('建议设置里程碑节点，分阶段验收');
    }

    if (conflicts.length > 0) {
      suggestions.push('建议优先解决排期冲突，确保项目顺利进行');
    }

    return suggestions;
  }

  // 计算排期置信度
  private static calculateScheduleConfidence(params: any, conflicts: string[]): number {
    let confidence = 0.7;

    // 根据参数完整性调整
    if (params.estimate > 0) confidence += 0.1;
    if (params.hardDeadline) confidence += 0.05;
    if (params.dependencies.length === 0) confidence += 0.1;

    // 根据冲突数量调整
    confidence -= conflicts.length * 0.05;

    return Math.max(0.1, Math.min(1, confidence));
  }

  // 合规检查
  static checkCompliance(text: string): {
    sensitiveWords: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    suggestions: string[];
    isCompliant: boolean;
  } {
    const sensitiveWords = ['猪', '酒', '十字架', '圣诞节', '男女同框', '以色列'];
    const foundWords = sensitiveWords.filter(word => text.includes(word));

    const riskLevel = foundWords.length === 0 ? 'LOW' :
                     foundWords.length <= 2 ? 'MEDIUM' : 'HIGH';

    const suggestions = foundWords.map(word => {
      switch(word) {
        case '猪': return '建议使用"猪肉"或其他替代词汇';
        case '酒': return '建议使用"酒精饮料"或避免提及';
        case '十字架': return '建议避免宗教符号';
        case '圣诞节': return '建议使用"节日"替代';
        case '男女同框': return '建议注意性别隔离要求';
        case '以色列': return '建议使用"中东地区"替代';
        default: return '建议重新考虑此词汇';
      }
    });

    return {
      sensitiveWords: foundWords,
      riskLevel,
      suggestions,
      isCompliant: foundWords.length === 0,
    };
  }

  // 生成报告
  static generateReport(params: {
    type: 'weekly' | 'monthly';
    startDate: string;
    endDate: string;
    data?: any;
  }): {
    type: string;
    period: string;
    generatedAt: string;
    content: {
      status: string;
      issues: string[];
      suggestions: string[];
      risks: string[];
    };
  } {
    const { type, startDate, endDate, data } = params;

    const report = {
      type,
      period: `${startDate} - ${endDate}`,
      generatedAt: new Date().toISOString(),
      content: {
        status: this.generateReportStatus(data),
        issues: this.generateReportIssues(data),
        suggestions: this.generateReportSuggestions(data),
        risks: this.generateReportRisks(data),
      },
    };

    return report;
  }

  // 生成报告状态
  private static generateReportStatus(data?: any): string {
    if (!data) return '所有项目按计划进行';

    const completion = data.completionRate || 0;
    if (completion >= 0.8) return '项目进展良好，大部分任务按计划完成';
    if (completion >= 0.6) return '项目进展正常，需要关注关键路径任务';
    return '项目进展较慢，需要加强资源投入和管理';
  }

  // 生成报告问题
  private static generateReportIssues(data?: any): string[] {
    const issues = [];

    if (!data) {
      issues.push('任务A进度延迟2天');
      issues.push('资源分配需要优化');
      return issues;
    }

    if (data.delayedTasks) {
      issues.push(`${data.delayedTasks.length}个任务出现延迟`);
    }

    if (data.resourceConflicts) {
      issues.push('存在资源分配冲突');
    }

    return issues;
  }

  // 生成报告建议
  private static generateReportSuggestions(data?: any): string[] {
    const suggestions = [
      '增加人力资源投入',
      '调整任务优先级',
      '加强团队沟通协调',
    ];

    if (data && data.bottlenecks) {
      suggestions.push('重点关注瓶颈任务，优先解决');
    }

    return suggestions;
  }

  // 生成报告风险
  private static generateReportRisks(data?: any): string[] {
    return [
      '技术风险: 新框架学习曲线',
      '时间风险: 截止日期紧张',
      '资源风险: 关键人员依赖',
    ];
  }
}