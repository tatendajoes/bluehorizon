import React from 'react';
import Header from './Header';
import AlertBanner from './AlertBanner';
import Footer from './Footer';
import BackToTop from '../ui/BackToTop';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <Header />
      <AlertBanner />
      <main className="container mx-auto px-4 py-4 flex-grow">
        {children}
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Layout;
