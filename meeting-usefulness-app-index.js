// index.js - Main entry point for the Meeting Usefulness App

import React from 'react';
import ReactDOM from 'react-dom';
import MeetingUsefulnessApp from './MeetingUsefulnessApp';
import './styles.css';

// Root component rendering
ReactDOM.render(
  <React.StrictMode>
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-6xl sm:mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700">Meeting Usefulness AI</h1>
          <p className="text-gray-600 mt-2">Optimize your meeting time with AI-powered recommendations</p>
        </div>
        <MeetingUsefulnessApp />
      </div>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);
