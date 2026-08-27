import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/Brawlhalla-Tournament" element={<Home />}/>
          <Route path="/Brawlhalla-Tournament/home" element={<Home />}/>
          <Route path="/Brawlhalla-Tournament/leaderboard" element={<Leaderboard />}/>
          <Route path="/Brawlhalla-Tournament/groups" element={<GroupsPage />}/>
          <Route path="/Brawlhalla-Tournament/matches" element={<MatchesPages />}/>
          {isAdmin && (<Route path="/Brawlhalla-Tournament/admin" element={<Admin />}/>)}
          <Route path="*" element={<Home />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
