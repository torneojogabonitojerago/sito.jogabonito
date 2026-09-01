import { Route, Routes } from 'react-router';
import { TournamentsRegistryProvider } from '@/data/tournaments-registry';
import Layout from '@/components/Layout';
import TournamentRoute from '@/components/TournamentRoute';
import Home from '@/pages/Home';
import TournamentHome from '@/pages/TournamentHome';
import Gironi from '@/pages/Gironi';
import Risultati from '@/pages/Risultati';
import Classifiche from '@/pages/Classifiche';
import AlboDoro from '@/pages/AlboDoro';
import Regolamento from '@/pages/Regolamento';
import Iscrizioni from '@/pages/Iscrizioni';
import Admin from '@/pages/Admin';
import AdminHub from '@/pages/AdminHub';

export default function App() {
  return (
    <TournamentsRegistryProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="admin" element={<AdminHub />} />
          <Route path=":slug" element={<TournamentRoute />}>
            <Route index element={<TournamentHome />} />
            <Route path="gironi" element={<Gironi />} />
            <Route path="risultati" element={<Risultati />} />
            <Route path="classifiche" element={<Classifiche />} />
            <Route path="albo-d-oro" element={<AlboDoro />} />
            <Route path="regolamento" element={<Regolamento />} />
            <Route path="iscrizioni" element={<Iscrizioni />} />
            <Route path="admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </TournamentsRegistryProvider>
  );
}
