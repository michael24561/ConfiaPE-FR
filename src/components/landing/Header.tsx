import { useState, useEffect } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        const handleHashChange = () => {
            setActiveLink(window.location.hash);
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Set initial active link

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    const navLinks = [
        { name: 'Cómo Funciona', href: '#how-it-works' },
        { name: 'Beneficios', href: '#benefits' },
        { name: 'Contacto', href: '#contact' },
    ];

    const linkVariants = {
        hidden: { y: -20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
        hover: { y: -3, transition: { type: 'spring', stiffness: 300 } },
    } as const;

    const mobileMenuVariants = {
        closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
        open: {
            opacity: 1,
            height: "auto",
            transition: {
                duration: 0.3,
                when: "beforeChildren",
                staggerChildren: 0.1,
            },
        },
    } as const;

    const mobileLinkVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { duration: 0.2 } },
    } as const;

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 15, duration: 0.5 }}
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-950/80 backdrop-blur-lg py-2 border-b border-gray-700' : 'bg-gray-950/70 backdrop-blur-md py-4 border-b border-gray-800'
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    whileHover={{ scale: 1.05, rotate: 2, boxShadow: "0 0 15px rgba(0, 123, 255, 0.6)" }}
                    className="relative h-16 w-48 cursor-pointer"
                >
                    <Image
                        src="/ConfiaPE.png"
                        alt="ConfiaPE Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </motion.div>

                <nav className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link, index) => (
                        <motion.a
                            key={link.name}
                            href={link.href}
                            variants={linkVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className={`text-lg font-medium transition-colors relative group ${activeLink === link.href ? 'text-primary-blue' : 'text-white hover:text-primary-blue'
                                }`}
                        >
                            {link.name}
                            <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-primary-blue transition-transform duration-300 ${activeLink === link.href ? 'scale-x-100 shadow-primary-blue-glow' : 'scale-x-0 group-hover:scale-x-100 group-hover:shadow-primary-blue-glow'
                                }`}></span>
                        </motion.a>
                    ))}

                    {/* Login Button */}
                    <motion.div
                        variants={linkVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.6 }}
                    >
                        <Link
                            href="/Login"
                            className="px-5 py-2 rounded-full bg-primary-blue text-white font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-primary-blue/30"
                        >
                            Iniciar Sesión
                        </Link>
                    </motion.div>
                </nav>

                <div className="md:hidden">
                    <Disclosure>
                        {({ open }) => (
                            <>
                                <DisclosureButton
                                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-blue"
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <HiX className="block h-7 w-7" aria-hidden="true" />
                                    ) : (
                                        <HiMenu className="block h-7 w-7" aria-hidden="true" />
                                    )}
                                </DisclosureButton>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            variants={mobileMenuVariants}
                                            initial="closed"
                                            animate="open"
                                            exit="closed"
                                            className="absolute top-full left-0 w-full bg-gray-950/90 backdrop-blur-md pb-3 md:hidden overflow-hidden"
                                        >
                                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
                                                {navLinks.map((link, index) => (
                                                    <DisclosureButton
                                                        key={link.name}
                                                        as={motion.a}
                                                        href={link.href}
                                                        variants={mobileLinkVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        transition={{ delay: 0.1 + index * 0.05 }}
                                                        className={`block px-3 py-2 rounded-md text-base font-medium ${activeLink === link.href ? 'text-primary-blue bg-gray-800' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                                            }`}
                                                        onClick={() => {
                                                            setIsOpen(false);
                                                            setActiveLink(link.href);
                                                        }}
                                                    >
                                                        {link.name}
                                                    </DisclosureButton>
                                                ))}
                                                <DisclosureButton
                                                    as={Link}
                                                    href="/Login"
                                                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-blue hover:bg-blue-600 mt-4 text-center mx-2"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    Iniciar Sesión
                                                </DisclosureButton>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </Disclosure>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
