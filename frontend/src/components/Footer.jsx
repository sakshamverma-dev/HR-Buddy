import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 mt-auto animate-fade-in delay-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    {/* Copyright */}
                    <div className="text-sm text-gray-600">
                        Copyright © {currentYear} HR Buddy. All rights reserved.
                    </div>

                    {/* Developer Credit with LinkedIn */}
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                        <span>Developed By:</span>
                        <span className="font-semibold text-blue-600">Saksham Verma</span>
                        <a
                            href="https://www.linkedin.com/in/saksham-verma-3589a9329/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-5 h-5 text-blue-600 hover:text-blue-800 transition-colors"
                            aria-label="LinkedIn Profile"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
