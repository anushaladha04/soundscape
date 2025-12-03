import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ onOpenModal }) {
  const location = useLocation();

  return (
    <nav className="bg-dark-gray border-b border-medium-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <Link to="/" className="text-2xl font-semibold text-white hover:text-primary transition-colors">
            Soundscape
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/community"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/community'
                  ? 'text-primary bg-primary/10'
                  : 'text-light-gray hover:text-white hover:bg-medium-gray'
              }`}
            >
              Your Community
            </Link>

            {/* Submit Post Button */}
            <button
              onClick={onOpenModal}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Submit a Post
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

