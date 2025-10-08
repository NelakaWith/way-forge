# 🧭 Route Optimizer / Map Intelligence App

A **Next.js 14** web application that visualizes and optimizes routes between multiple nodes using **Leaflet** and **pathfinding algorithms (Dijkstra / A\*)**.

This app has two main parts:
- **Public Website** — landing page, feature highlights, and demo
- **Dashboard** — authenticated area for managing nodes, routes, and analytics

---

## 🚀 Overview

### 🎯 Goal
Showcase your skills in:
- Modern Next.js full-stack development (App Router)
- Interactive map visualizations with Leaflet
- Algorithmic logic (shortest path, cost optimization)
- API design, CRUD, and database structure
- UI/UX design for both marketing and internal dashboards

---

## 🧱 Tech Stack

| Area | Technology |
|------|-------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Mapping | Leaflet + React-Leaflet |
| Algorithms | Custom Dijkstra / A* implementation |
| Database | Prisma + PostgreSQL (or Supabase for convenience) |
| Auth | NextAuth.js (GitHub, Google, or Email) |
| Charts | Recharts or ApexCharts |
| Deployment | Vercel (frontend), Railway (database) |

---

## 🗂️ Project Structure

```
route-optimizer/
│
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── demo/page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── routes/page.tsx
│   │   ├── nodes/page.tsx
│   │   ├── analytics/page.tsx
│   │
│   ├── api/
│   │   ├── routes/route.ts
│   │   ├── nodes/route.ts
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── MapView.tsx
│   ├── NodeMarker.tsx
│   ├── RouteLine.tsx
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│
├── lib/
│   ├── dijkstra.ts
│   ├── prisma.ts
│   ├── utils.ts
│
├── prisma/
│   └── schema.prisma
│
├── public/
│   ├── icons/
│   └── map-assets/
│
├── styles/
│   └── globals.css
│
├── package.json
└── README.md
```

---

## 🌍 Public Website

### Pages
1. `/` — Landing Page
2. `/demo` — Public Route Optimizer Demo

---

## 📊 Dashboard (Authenticated)

### Sections
1. **Dashboard Home**
2. **Nodes**
3. **Routes**
4. **Analytics**

---

## 🧮 Algorithm: Dijkstra’s Shortest Path

```ts
export function findShortestPath(graph: Record<string, any>, start: string, end: string) {
  const distances = {};
  const visited = new Set();
  const previous = {};

  Object.keys(graph).forEach(node => {
    distances[node] = Infinity;
  });
  distances[start] = 0;

  while (visited.size < Object.keys(graph).length) {
    const [closestNode] = Object.entries(distances)
      .filter(([node]) => !visited.has(node))
      .sort(([, a], [, b]) => a - b)[0] || [];

    if (!closestNode) break;
    visited.add(closestNode);

    for (const neighbor in graph[closestNode]) {
      const newDist = distances[closestNode] + graph[closestNode][neighbor];
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        previous[neighbor] = closestNode;
      }
    }
  }

  const path = [];
  let current = end;
  while (current) {
    path.unshift(current);
    current = previous[current];
  }

  return { path, distance: distances[end] };
}
```

---

## 🧾 Database Schema (Prisma)

```prisma
model User {
  id        String  @id @default(cuid())
  email     String  @unique
  name      String?
  routes    Route[]
  nodes     Node[]
}

model Node {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  name      String
  latitude  Float
  longitude Float
  createdAt DateTime @default(now())
}

model Route {
  id          String  @id @default(cuid())
  userId      String
  user        User    @relation(fields: [userId], references: [id])
  startNodeId String
  endNodeId   String
  distance    Float
  path        Json
  createdAt   DateTime @default(now())
}
```

---

## 🔐 Authentication Flow
NextAuth.js with GitHub/Google provider.

---

## 🧭 Map Integration

Example setup:
```tsx
<MapContainer center={[6.9271, 79.8612]} zoom={13}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {nodes.map(node => (
    <Marker position={[node.latitude, node.longitude]} />
  ))}
</MapContainer>
```

---

## ✅ Milestones

| Phase | Tasks |
|--------|-------|
| **1. Setup** | Next.js, Tailwind, shadcn/ui, Leaflet setup |
| **2. Landing Page** | Hero + demo section |
| **3. Auth & Dashboard** | NextAuth + layout |
| **4. Nodes CRUD** | Map + form + DB |
| **5. Route Optimization** | Dijkstra integration |
| **6. Analytics** | Charts + insights |
| **7. Polish & Deploy** | UI cleanup, deploy to Vercel |

---

## 🏁 Expected Outcome

A professional, visually engaging full-stack **Next.js app** that demonstrates:
- Strong **frontend UI/UX**
- Solid **backend logic & APIs**
- **Algorithmic thinking** and visualization
- Real-world deployable structure
