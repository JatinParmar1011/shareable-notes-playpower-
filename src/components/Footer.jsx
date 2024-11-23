import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#3B1E54] text-white py-4 mt-auto">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} <strong>Shareable Notes</strong>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;


