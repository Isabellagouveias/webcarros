import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './App';
import './index.css';
import AuthProvider from './contexts/authContext';
import { register } from 'swiper/element/bundle';
import 'swiper/swiper-bundle.css'
import { Toaster } from 'react-hot-toast';

register();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Toaster position='top-right' reverseOrder={false} />
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
