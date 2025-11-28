import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaArrowUp } from 'react-icons/fa';
import Image from 'next/image';

const Footer = () => {
    const [showScrollToTop, setShowScrollToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollToTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const socialLinks = [
        { icon: FaFacebook, href: '#' },
        { icon: FaTwitter, href: '#' },
        { icon: FaInstagram, href: '#' },
        { icon: FaLinkedin, href: '#' },
    ];

    const footerLinks = [
        { name: 'Política de Privacidad', href: '#' },
        { name: 'Términos de Servicio', href: '#' },
    ];

    return (
        <footer className="relative bg-black py-16 text-white overflow-hidden">
            <div className="absolute inset-0 z-0">
                <motion.div
                    className="absolute top-0 left-0 w-full h-full bg-cyan-500/10 blur-3xl"
                    animate={{ x: [-100, 100], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-0 right-0 w-full h-full bg-orange-500/10 blur-3xl"
                    animate={{ x: [100, -100], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 25, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
            </div>

            <div className="relative z-10 container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative h-16 w-48 mx-auto mb-8"
                >
                    <Image
                        src="/ConfiaPE.png"
                        alt="ConfiaPE Logo"
                        fill
                        className="object-contain"
                    />
                </motion.div>

                <motion.div
                    className="flex justify-center space-x-6 mb-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1, transition: { delay: 0.2 } }}
                    viewport={{ once: true }}
                >
                    {footerLinks.map((link) => (
                        <a key={link.name} href={link.href} className="text-gray-400 hover:text-primary-blue transition-colors">
                            {link.name}
                        </a>
                    ))}
                </motion.div>

                <motion.div
                    className="flex justify-center space-x-6 mb-10"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1, transition: { delay: 0.4 } }}
                    viewport={{ once: true }}
                >
                    {socialLinks.map((link, index) => (
                        <motion.a
                            key={index}
                            href={link.href}
                            whileHover={{ scale: 1.2, color: '#fb923c' }} // Orange hover
                            className="text-gray-400 text-3xl"
                        >
                            <link.icon />
                        </motion.a>
                    ))}
                </motion.div>

                <div className="border-t border-gray-800 pt-8">
                    <p className="text-gray-500">&copy; {new Date().getFullYear()} Confia.pe. Todos los derechos reservados.</p>
                </div>
            </div>

            <AnimatePresence>
                {showScrollToTop && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 bg-primary-blue text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50 shadow-primary-blue/40"
                        whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(0,123,255,0.7)' }}
                    >
                        <FaArrowUp className="text-xl" />
                    </motion.button>
                )}
            </AnimatePresence>
        </footer>
    );
};

export default Footer;
