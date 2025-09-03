import React from 'react';
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t py-6 text-center text-sm text-gray-600">
        <div className="space-x-4 mb-2">
          <Link to="/legal" className="hover:underline">
            Legal
          </Link>
          <Link to="/privacy" className="hover:underline">
            Política de privacidad
          </Link>
        </div>
        <p>© 2025 MiOptiData</p>
      </footer>
  );
};

export default Footer;