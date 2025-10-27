import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { Gamepad2, Menu, X, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Browse Games', path: '/games' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Live Game Room', path: '/game/room/test-room' },
  ];

  const authLinks = token
    ? [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Inventory', path: '/inventory' },
        { name: 'Profile', path: '/profile' },
      ]
    : [
        { name: 'Login', path: '/login' },
        { name: 'Sign Up', path: '/register', gradient: true },
      ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 bg-white border-b border-gray-200 transition-all duration-300 ${
        scrolled ? 'shadow-md py-2' : 'py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Gamepad2 className="w-7 h-7 text-purple-600 group-hover:text-purple-500 transition-colors" />
            <span className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
              GameEngine
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`${
                  location.pathname === link.path
                    ? 'text-purple-600 font-semibold'
                    : 'text-gray-700'
                } hover:text-purple-600 transition-colors font-medium`}
              >
                {link.name}
              </Link>
            ))}

            {authLinks.map((link) =>
              link.gradient ? (
                <Link
                  key={link.name}
                  to={link.path}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
                >
                  {link.name}
                </Link>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
                >
                  {link.name}
                </Link>
              )
            )}

            {token && (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-purple-600 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white border-t border-gray-200 overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-screen py-4' : 'max-h-0'
        }`}
      >
        <div className="px-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="block text-gray-700 hover:text-purple-600 transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {authLinks.map((link) =>
            link.gradient ? (
              <Link
                key={link.name}
                to={link.path}
                className="block px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold text-center hover:bg-purple-700 transition-all"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ) : (
              <Link
                key={link.name}
                to={link.path}
                className="block text-gray-700 hover:text-purple-600 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            )
          )}

          {token && (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="block w-full text-left text-red-500 hover:text-red-400 transition-colors font-medium"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
