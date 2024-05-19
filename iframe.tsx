import React from 'react';
import {createRoot} from 'react-dom/client';
import ReplySuggestions from './ReplySuggestions'
const root = createRoot(document.getElementById('iframe') as HTMLElement);
root.render(<ReplySuggestions/>);