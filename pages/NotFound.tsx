import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
export const NotFound: React.FC = () => (
    <>
        <Helmet>
            <title>404 — Page Not Found | Infofix Computers</title>
            <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
            <div className="text-8xl font-black text-gray-100 mb-4">404</div>
            <h1 className="text-3xl font-black text-gray-900 mb-3">Page Not Found</h1>
            <p className="text-gray-500 font-medium max-w-sm mb-8">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex gap-3">
                <Link
                    to="/"
                    className="bg-indigo-600 text-white px-7 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all"
                >
                    Go Home
                </Link>
                <Link
                    to="/shop"
                    className="border border-gray-200 text-gray-700 px-7 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                    Browse Shop
                </Link>
            </div>
        </div>
    </>
)