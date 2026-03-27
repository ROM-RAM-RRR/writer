import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Editor from './pages/Editor';
import Themes from './pages/Themes';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import Outlines from './pages/Outlines';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/editor" replace />} />
          <Route path="editor" element={<Editor />} />
          <Route path="themes" element={<Themes />} />
          <Route path="projects" element={<Projects />} />
          <Route path="outlines" element={<Outlines />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;