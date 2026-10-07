import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <TooltipProvider delay={150}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" theme="dark" closeButton />
    </TooltipProvider>
  );
}
