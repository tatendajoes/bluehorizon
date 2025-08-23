# Blue Horizon Dashboard

A professional React TypeScript dashboard for monitoring water quality parameters including pH, Turbidity, and TDS levels.

## Features

- 📊 Real-time water quality data visualization
- 🚨 Smart alert system for critical parameters
- 📱 Responsive design with modern UI
- 🤖 AI assistant integration
- 📤 Data export functionality
- 🔄 Auto-refresh capabilities

## File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # Branding + status
│   │   ├── Layout.tsx              # Main wrapper
│   │   └── AlertBanner.tsx         # Critical alerts
│   ├── dashboard/
│   │   ├── Dashboard.tsx           # Main dashboard page
│   │   ├── WaterTrends.tsx         # Chart component placeholder
│   │   ├── WaterStatus.tsx         # Status panel placeholder
│   │   └── QuickActions.tsx        # Export/refresh buttons
│   ├── chat/
│   │   └── YourChatComponent.tsx   # AI assistant placeholder
│   └── ui/
│       └── Button.tsx              # Reusable button component
├── hooks/
│   └── useWaterData.ts             # Shared data logic
├── utils/
│   ├── waterUtils.ts               # Helper functions
│   └── constants.ts                # Water quality thresholds
└── types/
    └── waterTypes.ts               # TypeScript interfaces
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Component Integration

### Replace Placeholder Components

The following components are placeholders that you should replace with your existing implementations:

- `WaterTrends.tsx` - Your chart component
- `WaterStatus.tsx` - Your status panel  
- `YourChatComponent.tsx` - Your AI assistant

### Data Integration

The `useWaterData` hook provides:
- Mock data generation
- Issue detection
- Auto-refresh functionality
- Export capabilities

## Water Quality Parameters

- **pH**: Safe range 6.5-8.5, Critical < 6.0
- **Turbidity**: Safe < 5.0 NTU, Critical > 10.0 NTU
- **TDS**: Safe < 500 ppm, Critical > 1000 ppm

## Technologies Used

- React 18
- TypeScript
- Tailwind CSS (utility classes)
- Custom hooks for data management

## Customization

- Modify thresholds in `constants.ts`
- Update alert logic in `AlertBanner.tsx`
- Customize UI components in `ui/` folder
- Extend data types in `waterTypes.ts`
