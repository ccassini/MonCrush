import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PrivyProvider } from './providers/PrivyProvider.tsx';
import "./App.css";

// Lazy load the main component
const MonanimalCrushPage = React.lazy(() => import("./components/mon-crush/MonanimalCrushPage.tsx"));

const App: React.FC = () => {
  return (
    <PrivyProvider>
      <Router>
        <div id="container">
          <Suspense fallback={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontFamily: 'Arial, sans-serif'
            }}>
              Loading...
            </div>
          }>
            <Routes>
              <Route path="/" element={<MonanimalCrushPage />} />
              <Route path="/monanimalcrush" element={<MonanimalCrushPage />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </PrivyProvider>
  );
};

export default App;
