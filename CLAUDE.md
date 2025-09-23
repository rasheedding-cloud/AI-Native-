# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a greenfield project for building an **AI Native Project Management Tool v2.0** for 51Talk's Adult Business division. The project aims to create a comprehensive project management system with AI-powered prioritization, scheduling, and KPI tracking capabilities.

## Technology Stack (To Be Determined)

The project has not been initialized yet. Based on the requirements, you'll need to set up:
- Frontend: React/Vue.js with TypeScript
- Backend: Node.js/Python with FastAPI/Express
- Database: SQLite/PostgreSQL (local storage requirement)
- AI Integration: Local LLM or API-based AI services

## Core Architecture

### Data Model Hierarchy
```
Strategy → Initiative → Project → Task → Subtask
```

### Key Entities and Fields
- **Task**: id, title, description, assignee, priority, estimate, due, status, dependencies[], kpi_links[], risk_flags[], created_at, updated_at
- **KPIs**: 体验课转化率, 教材/套餐完成度, ROI, 续费率, 转介绍率
- **Risk Flags**: Compliance scanning for sensitive content

### AI-Driven Components
1. **Priority Engine**: `Priority = f(Impact_on_KPI, Urgency, Effort, Risk, Dependency_Criticality)`
2. **Scheduling Engine**: Considers dependencies, calendars, prayer/weekend rules
3. **Report Generator**: Fixed structure (现状 → 问题 → 建议 → 风险)
4. **Compliance Radar**: Sensitive content detection and suggestions

## Development Commands

Since this is a new project, you'll need to initialize the development environment:

```bash
# Initialize npm project (if using Node.js)
npm init -y

# Install common dependencies
npm install express typescript @types/node @types/express
npm install react react-dom @types/react @types/react-dom
npm install sqlite3 @types/sqlite3

# Set up TypeScript
npx tsc --init

# Install development dependencies
npm install -D nodemon ts-node jest @types/jest
```

## Critical Development Rules

### Data Integrity
- All JSON fields must be complete, never omit required fields
- All AI outputs must include explanatory reasoning
- Never silently overwrite data - always prompt for conflicts
- Keep Adult Business completely separate from Youth Business systems

### AI Integration Requirements
- All AI suggestions must include reasoning (no black-box decisions)
- Implement fallback mechanisms for AI failures
- AI participation should be tracked (AI vs human task completion ratio)
- Compliance scanning must run on all user inputs

### Performance Requirements
- Support 1000+ tasks and 100+ projects with sub-second response times
- All data storage must be local (no third-party cloud uploads)
- Implement proper indexing for database queries

### Compliance & Security
- Scan for sensitive content: 猪, 酒, 十字架, 圣诞节, 男女同框, 以色列
- Generate risk levels (低/中/高) with alternative suggestions
- All data must remain within local storage

## User Interface Requirements

### Key Views
1. **Dashboard**: Five KPIs with gap analysis and trends
2. **Project View**: Kanban + Gantt + risk markers
3. **Task View**: List + Calendar (AI-auto populated)
4. **Report View**: Auto-generated weekly/monthly reports with export
5. **Compliance View**: Highlighted sensitive items + suggestions

### Design Patterns
- Use component-based architecture
- Implement responsive design (Web + PWA)
- Support both Chinese and English languages

## Testing Strategy

- Unit tests for all business logic
- Integration tests for AI engines
- Performance tests for large datasets
- Compliance scanning accuracy tests

## Deployment Notes

- This is an internal tool - no commercial features needed
- PWA support required for mobile access
- Local deployment only (no cloud hosting)

## Special Considerations

- This is specifically for Adult Business "抗标" (target resistance) goals
- All development must follow the three-phase rollout plan
- Never modify requirements without user confirmation
- Maintain clear separation from Youth Business systems and data