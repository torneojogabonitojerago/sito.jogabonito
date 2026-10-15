import { Navigate, Route, Routes, useParams } from 'react-router';
import { TournamentsRegistryProvider } from '@/data/tournaments-registry';
import { SiteConfigProvider } from '@/data/site-config';
import Layout from '@/components/Layout';
import TournamentRoute from '@/components/TournamentRoute';
import Home from '@/pages/Home';
import Archivio from '@/pages/Archivio';
import Gironi from '@/pages/Gironi';
import Risultati from '@/pages/Risultati';
import Classifiche from '@/pages/Classifiche';
import AlboDoro from '@/pages/AlboDoro';
import Regolamento from '@/pages/Regolamento';
import Iscrizioni from '@/pages/Iscrizioni';
import AdminPanel from '@/pages/admin/AdminPanel';

/* il vecchio indirizzo /torneo/admin porta al pannello unico, già sul torneo giusto */
function LegacyAdminRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/admin?t=${slug ?? ''}`} replace />;
}

export default function App() {
  return (
    <TournamentsRegistryProvider>
      <SiteConfigProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="admin" element={<AdminPanel />} />
            <Route path="archivio" element={<Archivio />} />
            <Route path="archivio/:slug" element={<Archivio />} />
            <Route path=":slug" element={<TournamentRoute />}>
              {/* la home è unica per tutti i tornei */}
              <Route index element={<Navigate to="/" replace />} />
              <Route path="gironi" element={<Gironi />} />
              <Route path="risultati" element={<Risultati />} />
              <Route path="classifiche" element={<Classifiche />} />
              <Route path="albo-d-oro" element={<AlboDoro />} />
              <Route path="regolamento" element={<Regolamento />} />
              <Route path="iscrizioni" element={<Iscrizioni />} />
              <Route path="admin" element={<LegacyAdminRedirect />} />
            </Route>
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </SiteConfigProvider>
    </TournamentsRegistryProvider>
  );
}
