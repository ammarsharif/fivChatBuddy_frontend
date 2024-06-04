import React from 'react';
import { createRoot } from 'react-dom/client';
import FeedbackModel from './FeedbackModel';
const root = createRoot(document.getElementById('feedback') as HTMLElement);
root.render(
  <FeedbackModel
    onClose={function (): void {
      throw new Error('Function not implemented.');
    }}
  />
);
