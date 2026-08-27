import { HashRouter, Route, Routes } from 'react-router-dom';
import './css/App.css'
import Home from './pages/Home';
import { MainLayout } from './components/MainLayout';
import { Leaderboard } from './pages/Leaderboard';
import { Admin } from './pages/Admin';
import { GroupsPage } from './pages/GroupsPage';
import { MatchesPages } from './pages/MatchesPage';

export const isAdmin: boolean = true;


export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />}/>
          <Route path="/home" element={<Home />}/>
          <Route path="/leaderboard" element={<Leaderboard />}/>
          <Route path="/groups" element={<GroupsPage />}/>
          <Route path="/matches" element={<MatchesPages />}/>
          {isAdmin && (<Route path="/admin" element={<Admin />}/>)}
          <Route path="*" element={<Home />}/>
        </Route>
      </Routes>
    </HashRouter>
  );
}
