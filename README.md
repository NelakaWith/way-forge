# 🧭 Way Forge - Route Optimizer

A **Next.js 14** web application that visualizes and optimizes routes between multiple nodes using **Leaflet** and **pathfinding algorithms**.

## 🚀 Features

- 🗺️ **Interactive Maps** - Leaflet-powered visualization with real-time updates
- 🎯 **Smart Algorithms** - Dijkstra & A\* pathfinding for optimal routes
- 📊 **Analytics Dashboard** - Track performance and optimize your routes
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 🔒 **Authentication** - Secure user management with NextAuth.js

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Mapping**: Leaflet + React-Leaflet
- **Algorithms**: Custom Dijkstra / A\* implementation
- **Database**: Prisma + PostgreSQL
- **Auth**: NextAuth.js
- **Charts**: Recharts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/NelakaWith/way-forge.git
cd way-forge
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📝 Development

### Committing Changes

This project uses **Commitizen** for standardized conventional commits:

```bash
# Stage your changes
git add .

# Use Commitizen for commits
npm run commit
```

See [COMMITIZEN.md](./COMMITIZEN.md) for detailed commit guidelines.

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run commit` - Interactive commit with Commitizen

## 📁 Project Structure

```
way-forge/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # Reusable React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── MapView.tsx  # Interactive map component
│   │   ├── NodeMarker.tsx # Map marker component
│   │   └── RouteLine.tsx # Route line component
│   └── lib/             # Utilities and algorithms
├── public/              # Static assets
├── PLAN.md             # Detailed project plan
├── TODO.md             # Development checklist
└── COMMITIZEN.md       # Commit guidelines
```

## 🗺️ Map Components

- **MapView** - Main interactive map container
- **NodeMarker** - Customizable map markers with popups
- **RouteLine** - Polyline visualization for routes

## 📋 Development Status

See [TODO.md](./TODO.md) for current development progress and upcoming features.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Stage your changes (`git add .`)
4. Commit using Commitizen (`npm run commit`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📚 Documentation

- [Project Plan](./PLAN.md) - Detailed development roadmap
- [TODO List](./TODO.md) - Current progress and tasks
- [Commit Guidelines](./COMMITIZEN.md) - How to write good commits

## 📄 License

This project is licensed under the MIT License.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
