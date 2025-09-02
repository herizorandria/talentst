import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Lazy load the main app for better initial load performance
const App = lazy(() => import('./App.tsx'))

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={
  <div className="min-h-screen bg-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <App />
    </Suspense>
  </StrictMode>
);
