# Argus Intelligence - Blockchain Security Platform

## Overview

Argus Intelligence is a comprehensive blockchain security and intelligence platform built with a modern full-stack architecture. The application provides real-time monitoring, threat detection, and analysis capabilities for blockchain transactions and wallet activities across multiple networks.

The platform features a React-based frontend with a natural language chat interface, comprehensive dashboard visualizations, and a Node.js/Express backend with PostgreSQL database integration using Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state management
- **Charts**: Recharts for data visualization
- **Build Tool**: Vite for development and bundling

### Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: connect-pg-simple for PostgreSQL session store
- **Development**: Hot module replacement with Vite integration

### Database Design
The application uses PostgreSQL with the following core tables:
- `users`: User authentication and profiles
- `api_keys`: API key management for external integrations
- `alert_subscriptions`: User-configurable threat detection subscriptions
- `transaction_alerts`: Real-time transaction threat notifications
- `blockchain_metrics`: Historical blockchain analytics data

## Key Components

### Dashboard System
- **KPI Cards**: Real-time metrics display (transactions, risk alerts, wallets screened)
- **Interactive Charts**: Transaction volume trends, anomaly detection, network graphs
- **Alert Management**: Configurable threat subscriptions and notifications

### Chat Interface
- **Natural Language Processing**: Conversational interface for blockchain queries
- **Suggested Queries**: Pre-built analysis templates for common use cases
- **Real-time Responses**: Integrated with backend intelligence systems

### API Management
- **Key Generation**: Secure API key creation and management
- **Usage Tracking**: Last used timestamps and activity monitoring
- **Access Control**: User-scoped API key permissions

### Threat Detection
- **OFAC Sanctions**: Automated screening against sanctions lists
- **Ransomware Detection**: Pattern recognition for known ransomware addresses
- **Large Volume Alerts**: Threshold-based transaction monitoring
- **Custom Rules**: User-configurable alert conditions

## Data Flow

1. **Real-time Monitoring**: Blockchain networks are continuously monitored for transaction patterns
2. **Risk Analysis**: Transactions are scored using multiple threat intelligence sources
3. **Alert Generation**: High-risk activities trigger user notifications based on subscriptions
4. **Data Aggregation**: Metrics are collected and stored for historical analysis
5. **Visualization**: Processed data is presented through interactive dashboards and charts

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **recharts**: Chart rendering and data visualization

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling framework
- **ESBuild**: Production bundling for server code

### Authentication & Security
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store
- **zod**: Runtime type validation and schema definition

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite middleware integration with Express
- **Type Checking**: Real-time TypeScript compilation
- **Database Migrations**: Drizzle Kit for schema management

### Production Build
- **Frontend**: Static asset generation to `dist/public`
- **Backend**: ESM bundle compilation to `dist/index.js`
- **Environment**: Node.js production runtime with PostgreSQL

### Database Management
- **Schema**: Drizzle schema definitions in `shared/schema.ts`
- **Migrations**: Automated migration generation and deployment
- **Connection**: Environment-based DATABASE_URL configuration

## Changelog

Changelog:
- July 01, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.