import { Route, Routes } from 'react-router';
import { TournamentProvider } from '@/data/store';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Gironi from '@/pages/Gironi';
import Risultati from '@/pages/Risultati';
import Classifiche from '@/pages/Classifiche';
import AlboDoro from '@/pages/AlboDoro';
import Regolamento from '@/pages/Regolamento';
import Admin from '@/pages/Admin';

export default function App() {
  return (
    <TournamentProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="gironi" element={<Gironi />} />
          <Route path="risultati" element={<Risultati />} />
          <Route path="classifiche" element={<Classifiche />} />
          <Route path="albo-d-oro" element={<AlboDoro />} />
          <Route path="regolamento" element={<Regolamento />} />
          <Route path="admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </TournamentProvider>
  );
}
