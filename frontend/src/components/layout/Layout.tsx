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
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-300 flex flex-col overflow-x-hidden dark:[--bg-gradient:radial-gradient(circle_at_top_right,_hsl(210_40%_10%),_hsl(210_30%_15%))] [background:var(--bg-gradient)]">
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
