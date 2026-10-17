import { RouterProvider, createHashRouter, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import Layout from './components/Layout';
import Home from './pages/Home';
import TopicPage from './pages/Topic';
import ExamPage from './pages/Exam';
import { CodingListPage, CodingProblemPage } from './pages/Coding';
import RoadmapPage from './pages/Roadmap';
import { PwLabOverviewPage, PwLabStepPage } from './pages/PwLab';
import PlaygroundPage from './pages/Playground';
import CompaniesPage from './pages/Companies';
import SettingsPage from './pages/Settings';
import AchievementsPage from './pages/Achievements';
import ContentsPage from './pages/Contents';
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
      { path: 'contents', element: <ContentsPage /> },
      { path: 'topic/:id', element: <TopicPage /> },
      { path: 'topic/:id/exam', element: <ExamPage /> },
      { path: 'coding', element: <CodingListPage /> },
      { path: 'coding/:pid', element: <CodingProblemPage /> },
      { path: 'roadmap', element: <RoadmapPage /> },
      { path: 'pw-lab', element: <PwLabOverviewPage /> },
      { path: 'pw-lab/:step', element: <PwLabStepPage /> },
      { path: 'playground', element: <PlaygroundPage /> },
      { path: 'companies', element: <CompaniesPage /> },
      { path: 'weak-areas', element: <WeakAreasPage /> },
      { path: 'practice', element: <PracticePage /> },
      { path: 'achievements', element: <AchievementsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Home /> },
    ],
  },
]);

export default function App() {
  // reducedMotion="user": the OS "reduce motion" setting turns off transform/layout animations
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  );
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
