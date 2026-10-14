import { RouterProvider, createHashRouter, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import TopicPage from './pages/Topic';
import ExamPage from './pages/Exam';
import { CodingListPage, CodingProblemPage } from './pages/Coding';
import RoadmapPage from './pages/Roadmap';
import SettingsPage from './pages/Settings';
import { PracticePage, WeakAreasPage } from './pages/WeakAreas';
import { resumeLocation } from './lib/uiPrefs';

// On a fresh start at the dashboard URL, reopen the page the user was last reading.
// Deep links (any other hash) are respected as-is.
const resume = resumeLocation();
if (resume && ['', '#', '#/'].includes(window.location.hash)) {
  window.history.replaceState(null, '', `#${resume}`);
}

const router = createHashRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: 'topic/:id', element: <TopicPage /> },
      { path: 'topic/:id/exam', element: <ExamPage /> },
      { path: 'coding', element: <CodingListPage /> },
      { path: 'coding/:pid', element: <CodingProblemPage /> },
      { path: 'roadmap', element: <RoadmapPage /> },
      { path: 'weak-areas', element: <WeakAreasPage /> },
      { path: 'practice', element: <PracticePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Home /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

function RouteError() {
  const err = useRouteError();
  const message = isRouteErrorResponse(err) ? `${err.status} ${err.statusText}` : err instanceof Error ? err.message : String(err);
  // a failed lazy chunk usually means the app was rebuilt or the dev server restarted: a reload fixes it
  const staleChunk = /dynamically imported module|Failed to fetch|Importing a module script failed/i.test(message);
  return (
    <div className="page narrow" style={{ padding: 40 }}>
      <h1>Something went wrong on this page</h1>
      <p className="muted">Your progress is safe. It&apos;s stored in this browser.</p>
      {staleChunk && <p>Part of the app failed to download (it was probably rebuilt or restarted). Reloading usually fixes it.</p>}
      <pre className="console-out">{message}</pre>
      <div className="row gap-s">
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload
        </button>
        <a className="btn" href="#/">
          Back to dashboard
        </a>
      </div>
    </div>
  );
}
