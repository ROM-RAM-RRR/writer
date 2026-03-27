import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <nav className="sidebar">
        <h1 className="logo">Writer AI</h1>
        <ul className="nav-links">
          <li>
            <NavLink to="/editor" className={({ isActive }) => isActive ? 'active' : ''}>
              写作
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>
              项目
            </NavLink>
          </li>
          <li>
            <NavLink to="/outlines" className={({ isActive }) => isActive ? 'active' : ''}>
              大纲
            </NavLink>
          </li>
          <li>
            <NavLink to="/themes" className={({ isActive }) => isActive ? 'active' : ''}>
              主题
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
              设置
            </NavLink>
          </li>
        </ul>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}