import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-darkcard py-4 mt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto text-center text-gray-500 dark:text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} CampusBuzz. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;