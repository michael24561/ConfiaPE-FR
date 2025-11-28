import React, { useState, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- Componente 3D: Hélice Animada ---
const HelixShape = () => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const tubeRef = useRef<THREE.TubeGeometry>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.z = t * 0.2;

        // Animar la forma de la hélice (opcional, pero da un efecto dinámico)
        const tube = tubeRef.current;
        if (tube) {
            const path = new THREE.CatmullRomCurve3(
                Array.from({ length: 10 }, (_, i) => {
                    const angle = (i / 10) * Math.PI * 4;
                    const x = Math.cos(angle + t) * (2 + Math.sin(t * 0.5));
                    const y = Math.sin(angle + t) * (2 + Math.sin(t * 0.5));
                    const z = (i - 5) * 1.5;
                    return new THREE.Vector3(x, y, z);
                })
            );
            tube.copy(new THREE.TubeGeometry(path, 64, 0.1, 8, false));
        }
    });

    return (
        <mesh ref={meshRef}>
            <tubeGeometry ref={tubeRef} args={[]} />
            <meshStandardMaterial
                color="#0ea5e9"
                emissive="#0ea5e9"
                emissiveIntensity={0.7}
                roughness={0.4}
                metalness={1}
                wireframe
            />
        </mesh>
    );
};

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [errors, setErrors] = useState({ name: '', email: '', phone: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        setErrors((prev) => ({ ...prev, [id]: '' }));
        setSubmitStatus(null);
    };

    const validateForm = () => {
        let newErrors = { name: '', email: '', phone: '', message: '' };
        let isValid = true;
        if (!formData.name.trim()) { newErrors.name = 'El nombre es requerido.'; isValid = false; }
        if (!formData.email.trim()) { newErrors.email = 'El correo es requerido.'; isValid = false; }
        else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = 'El correo no es válido.'; isValid = false; }
        if (formData.phone.trim() && !/^[0-9+\s-()]{7,}$/.test(formData.phone)) { newErrors.phone = 'El teléfono no es válido.'; isValid = false; }
        if (!formData.message.trim()) { newErrors.message = 'El mensaje es requerido.'; isValid = false; }
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        setSubmitStatus(null);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', phone: '', message: '' });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubmitStatus(null), 5000);
        }
    };

    return (
        <section id="contact" className="py-24 bg-black text-white relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #007BFF, transparent 30%), radial-gradient(circle at 80% 70%, #fb923c, transparent 30%)' }} />

            <div className="container mx-auto px-6 relative z-10">
                <motion.h2
                    className="text-4xl md:text-5xl font-bold mb-12 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Construyamos Algo <span className="text-primary-blue">Increíble</span>
                </motion.h2>

                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
                        <div className="w-full h-80">
                            <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
                                <ambientLight intensity={0.5} />
                                <pointLight color="#0ea5e9" position={[0, 0, 5]} intensity={150} />
                                <Suspense fallback={null}>
                                    <HelixShape />
                                </Suspense>
                            </Canvas>
                        </div>
                        <h3 className="text-3xl font-bold text-white mt-4">Cada gran proyecto comienza con una conversación.</h3>
                        <p className="text-gray-300 mt-2">
                            Compártenos tu idea, y nuestro equipo de expertos te guiará en cada paso del camino para hacerla realidad.
                        </p>
                    </div>

                    <div className="flex flex-col justify-center">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {['name', 'email', 'phone', 'message'].map((field) => (
                                <div key={field} className="relative group">
                                    <input
                                        type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                                        id={field}
                                        placeholder=" "
                                        value={formData[field as keyof typeof formData]}
                                        onChange={handleChange}
                                        className={`peer w-full bg-transparent border-b-2 ${errors[field as keyof typeof errors] ? 'border-red-500' : 'border-gray-600'} focus:border-transparent pt-4 pb-2 outline-none transition-colors text-white`}
                                    />
                                    <label
                                        htmlFor={field}
                                        className="absolute left-0 -top-3.5 text-sm text-primary-blue transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-primary-blue group-hover:text-primary-blue"
                                    >
                                        {field === 'name' ? 'Nombre Completo' : field === 'email' ? 'Correo Electrónico' : field === 'phone' ? 'Teléfono (Opcional)' : 'Tu Mensaje'}
                                    </label>
                                    <div className="absolute -bottom-px left-0 h-0.5 bg-primary-blue w-0 peer-focus:w-full transition-all duration-300" />
                                    {errors[field as keyof typeof errors] && <p className="text-red-500 text-sm mt-1">{errors[field as keyof typeof errors]}</p>}
                                </div>
                            ))}
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center px-8 py-4 font-bold text-white rounded-full group bg-primary-blue shadow-lg shadow-primary-blue/30 disabled:opacity-50"
                                whileHover={{ scale: 1.05, y: -3, boxShadow: '0 0 20px rgba(0,123,255,0.5)' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isSubmitting ? <FaSpinner className="animate-spin" /> : <><FaPaperPlane className="mr-2" /> Enviar Mensaje</>}
                            </motion.button>
                            <AnimatePresence>
                                {submitStatus && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`text-center mt-4 ${submitStatus === 'success' ? 'text-green-400' : 'text-red-500'}`}
                                    >
                                        {submitStatus === 'success' ? '¡Mensaje enviado! Gracias por contactarnos.' : 'Error al enviar. Inténtalo de nuevo.'}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
