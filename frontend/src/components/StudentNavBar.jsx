import { React, useState, useEffect, Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const StudentNavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    // Remplacez par le vrai username de l'utilisateur (depuis le contexte, props ou localStorage)
    const { user, signOut } = useAuth();
    const username = user ? user.username : 'Guest';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }
        , []);

    const navigation = [
        { name: 'Projets', to: '/projects' },
        { name: 'Vœux', to: '/voeux' },
        { name: 'Groupes', to: '/projects_team/admin' },
        { name: 'Demande de changement', to: '/request-change' },
    ];


    const handleLogout = () => {
        signOut()
        // localStorage.removeItem('authToken');
        // navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Navbar fixe */}
            <nav className={`fixed top-0 left-0 right-0 z-50 ${scrolled ? 'bg-gray-800/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg' : 'bg-gray-800 dark:bg-gray-900'} border-b border-gray-700 transition-all duration-300`}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">

                        {/* Logo et navigation desktop */}
                        <div className="flex items-center">
                            {/* Menu mobile button */}
                            <div className="flex md:hidden">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                >
                                    <span className="sr-only">Open main menu</span>
                                    {mobileMenuOpen ? (
                                        <XMarkIcon className="h-6 w-6" />
                                    ) : (
                                        <Bars3Icon className="h-6 w-6" />
                                    )}
                                </button>
                            </div>

                            {/* Navigation desktop */}
                            <div className="hidden md:block">
                                <div className="flex items-center space-x-4">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.to}
                                            className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(item.to)
                                                ? 'bg-gray-900 text-white dark:bg-gray-700'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                } transition-colors duration-200`}
                                        >
                                            {item.name}
                                            {isActive(item.to) && (
                                                <span className="block h-0.5 w-full bg-indigo-500 mt-1"></span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* User menu */}
                        <div className="ml-4 flex items-center md:ml-6">
                            <Menu as="div" className="relative">
                                <div>
                                    <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                        <span className="sr-only">Open user menu</span>
                                        <span className="mr-3 hidden md:inline text-sm font-medium text-gray-300">
                                            {username}
                                        </span>
                                        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                                            {username.charAt(0).toUpperCase()}
                                        </div>
                                    </Menu.Button>
                                </div>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to="/settings"
                                                    className={`flex items-center px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                        } text-gray-700 dark:text-gray-300`}
                                                >
                                                    <Cog6ToothIcon className="h-5 w-5 mr-2" />
                                                    Mon profil
                                                </Link>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={handleLogout}
                                                    className={`flex items-center w-full px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                        } text-gray-700 dark:text-gray-300`}
                                                >
                                                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                                                    Déconnexion
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <Transition
                    show={mobileMenuOpen}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                    className="md:hidden"
                >
                    <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3 bg-gray-800 dark:bg-gray-900">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.to}
                                className={`block rounded-md px-3 py-2 text-base font-medium ${isActive(item.to)
                                    ? 'bg-gray-900 text-white dark:bg-gray-700'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    <div className="border-t border-gray-700 pb-3 pt-4 bg-gray-800 dark:bg-gray-900">
                        <div className="flex items-center px-5">
                            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-white">{username}</div>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1 px-2">
                            <Link
                                to="/settings"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Mon profil
                            </Link>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </Transition>
            </nav>

            {/* Espace réservé pour éviter que le contenu ne soit caché sous la navbar */}
            <div className="h-16"></div>
        </>
    );
};

export default StudentNavBar;