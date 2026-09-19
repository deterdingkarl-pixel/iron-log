import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import LogWorkout from '@/pages/LogWorkout';
import Plans from '@/pages/Plans';
import Exercises from '@/pages/Exercises';
import Progress from '@/pages/Progress';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/training-eintragen" element={<LogWorkout />} />
        <Route path="/plaene" element={<Plans />} />
        <Route path="/uebungen" element={<Exercises />} />
        <Route path="/fortschritt" element={<Progress />} />
        <Route path="/einstellungen" element={<Settings />} />
      </Route>
    </Routes>
  );
}
