import React from 'react';
import { createRoot } from 'react-dom/client';
import HelpModel from './HelpModel';
const root = createRoot(document.getElementById('help') as HTMLElement);
root.render(
  <HelpModel
    onClose={function (): void {
      throw new Error('Function not implemented.');
    }}
  />
);
