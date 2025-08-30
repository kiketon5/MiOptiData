import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-lg font-semibold text-blue-600">MiOptiData</span>
            <p className="text-sm text-gray-600 mt-1">Track your eye health easily</p>
          </div>
          
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="mb-4 md:mb-0">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Help Center</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Terms of Service</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Contact</h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:support@MiOptiData.com" className="text-sm text-gray-600 hover:text-blue-600">support@MiOptiData.com</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-6 pt-6 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} MiOptiData. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;