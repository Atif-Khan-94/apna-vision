import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { StoreProvider, useStore, calculateDynamicPrice } from './context/StoreContext';
import { COMPANY_PHONE, COMPANY_EMAIL, PRODUCTS, BLOG_POSTS, WEB3FORMS_ACCESS_KEY } from './constants';
import { 
  Phone, Mail, Menu, X, ShoppingCart, User as UserIcon, LogOut, 
  MapPin, Truck, ShieldCheck, Search, Filter, ChevronRight, CheckCircle, 
  Upload, MessageSquare, Plus, Minus, Eye, Award, HelpCircle, Users, ArrowRight, Loader2, Calendar, Tag, AlertCircle, TrendingDown, Map, Percent, SlidersHorizontal
} from 'lucide-react';
import { Product, CartItem, User, BlogPost } from './types';

// --- Animation Helper ---

const RevealOnScroll = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}>
      {children}
    </div>
  );
};

const TypingEffect = ({ text, className }: { text: string, className?: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const animate = () => {
      const currentLength = displayText.length;
      
      if (!isDeleting && currentLength < text.length) {
        // Typing
        setDisplayText(text.substring(0, currentLength + 1));
        timeout = setTimeout(animate, 150);
      } else if (!isDeleting && currentLength === text.length) {
        // Finished typing, pause before deleting
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && currentLength > 0) {
        // Deleting
        setDisplayText(text.substring(0, currentLength - 1));
        timeout = setTimeout(animate, 50);
      } else if (isDeleting && currentLength === 0) {
        // Finished deleting, restart
        setIsDeleting(false);
        timeout = setTimeout(animate, 500);
      }
    };

    timeout = setTimeout(animate, 100);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, text]);

  return (
    <span className={`${className}`}>
      {displayText}
      <span className="animate-pulse text-secondary">|</span>
    </span>
  );
};

// --- Utilities ---

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// --- Components ---

const Header = () => {
  const { user, cart, logout } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Catalog" },
    { to: "/about", label: "About Us" },
    { to: "/blog", label: "Blog" },
    { to: "/contact", label: "Contact" },
  ];

  // FIX: Increased z-index to 100 to ensure navbar stays above ALL hero content
  return (
    <header className="sticky top-0 z-[100] w-full bg-white border-b shadow-sm transition-all duration-300">
      <div className="bg-primary text-white text-xs py-1.5 px-4 flex justify-between items-center">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><Phone size={12} /> {COMPANY_PHONE}</span>
          <span className="flex items-center gap-1"><Mail size={12} /> {COMPANY_EMAIL}</span>
        </div>
        <div className="hidden sm:block font-medium">India's Leading B2B Optical Marketplace</div>
      </div>
      
      <div className="container mx-auto px-4 h-24 flex items-center justify-between">
        <Link to="/" className="flex flex-col items-center justify-center leading-none group py-2">
          <img 
            src="/logo.png" 
            alt="Apna Vision Logo" 
            className="h-16 md:h-16 w-auto object-contain mb-1 transition-transform group-hover:scale-105" 
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="hidden text-2xl font-bold text-primary">Apna<span className="text-secondary">Vision</span></span>
          <span className="text-base md:text-lg font-bold text-primary tracking-tight">
            Apna<span className="text-secondary">Vision</span>
          </span>
        </Link>

        {/* Desktop Nav with Animated Underline */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          {navLinks.map(link => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative py-2 transition-colors ${isActive ? 'text-secondary' : 'hover:text-secondary group'}`}
              >
                {link.label}
                {/* Underline: Full width if active, scales from 0 to 100 on hover if inactive */}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-secondary transition-all duration-300 ease-out ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
            )
          })}
          {user?.role === 'admin' && <Link to="/admin" className="text-red-500 hover:text-red-600 font-bold">Admin</Link>}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm font-medium">Hi, {user.name.split(' ')[0]}</span>
              <Link to="/cart" className="relative text-gray-600 hover:text-secondary transition-colors">
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    {cart.length}
                  </span>
                )}
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} className="text-gray-500 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-lg text-sm font-medium">
              <UserIcon size={16} /> Login
            </Link>
          )}
          
          <button className="md:hidden text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div 
        className={`md:hidden absolute left-0 w-full bg-white shadow-lg border-t overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 flex flex-col gap-4">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-secondary">Home</Link>
          <Link to="/products" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-secondary">Products</Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-secondary">About Us</Link>
          <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-secondary">Blog</Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-secondary">Contact</Link>
          {user?.role === 'admin' && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block py-2 text-red-500">Admin Panel</Link>}
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-primary text-gray-300 py-12">
    <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
      <div className="flex flex-col items-start">
        <div className="flex flex-col items-center mb-4">
           <img src="/logo.png" alt="Apna Vision" className="h-20 w-auto mb-2 bg-white rounded-full p-2" />
           <h3 className="text-2xl font-bold text-white">Apna<span className="text-secondary">Vision</span></h3>
        </div>
        <p className="text-sm leading-relaxed">Connecting optical retailers with premium frames and goggles at wholesale prices. Quality, Trust, and Vision.</p>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/products" className="hover:text-white transition-colors">Wholesale Catalog</Link></li>
          <li><Link to="/about" className="hover:text-white transition-colors">Our Story</Link></li>
          <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Contact</h4>
        <ul className="space-y-2 text-sm">
          <li>Phone: {COMPANY_PHONE}</li>
          <li>Email: {COMPANY_EMAIL}</li>
          <li>Head Office: Delhi, India</li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-semibold mb-4">Newsletter</h4>
        <p className="text-xs mb-2">Subscribe for latest wholesale rates.</p>
        <div className="flex gap-2">
          <input type="email" placeholder="Your email" className="bg-gray-800 border-none rounded px-3 py-2 w-full text-sm text-white focus:ring-1 focus:ring-secondary focus:outline-none" />
          <button className="bg-secondary text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors">Go</button>
        </div>
      </div>
    </div>
    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs text-gray-500">
      &copy; {new Date().getFullYear()} Apna Vision. All rights reserved.
    </div>
  </footer>
);
  const ModalEnquiry = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { addEnquiry, user } = useStore();

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('hasSeenEnquiry');
    if (!hasSeen && !user) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: `ENQ-${Date.now()}`,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      message: formData.get('message') as string,
      date: new Date().toISOString()
    };
    
    formData.append("access_key", WEB3FORMS_ACCESS_KEY);
    formData.append("subject", "New Enquiry - Apna Vision");
    
    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    addEnquiry(data);
    setSubmitted(true);
    sessionStorage.setItem('hasSeenEnquiry', 'true');
    setTimeout(() => setIsOpen(false), 2500);
  };

  if (!isOpen) return null;

  return (
    // FIX: Changed z-index from z-[60] to z-[200] so it sits ABOVE the navbar (z-[100])
    <div className="fixed inset-0 z-[200] flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm pt-20 sm:pt-4 px-4 pb-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative border border-gray-200">
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <h3 className="text-xl font-bold">Thank You!</h3>
            <p className="text-gray-600">Our team will contact you shortly.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2">Get Wholesale Rates</h2>
            <p className="text-gray-500 mb-6 text-sm">Join 50+ retailers. Request our latest catalog.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="name" required placeholder="Your Name" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all" />
              <input name="email" type="email" required placeholder="Email Address" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all" />
              <input name="phone" required placeholder="Phone Number" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all" />
              <textarea name="message" placeholder="What are you looking for?" className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-secondary focus:border-transparent outline-none h-24 transition-all" />
              <button type="submit" className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200">Request Callback</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
// FIX: WhatsApp Button improved:
// 1. Used official WhatsApp SVG Path
// 2. Matched size to AI Button (p-4)
// 3. Ringing animation every 2 seconds
const WhatsAppButton = () => (
  <>
    <style>
      {`
        @keyframes whatsapp-ring {
          0% { transform: rotate(0) scale(1); }
          5% { transform: rotate(-10deg) scale(1.1); }
          10% { transform: rotate(10deg) scale(1.1); }
          15% { transform: rotate(-10deg) scale(1.1); }
          20% { transform: rotate(10deg) scale(1.1); }
          25% { transform: rotate(0) scale(1); }
          100% { transform: rotate(0) scale(1); }
        }
        .animate-whatsapp-ring {
          animation: whatsapp-ring 2s infinite ease-in-out;
        }
      `}
    </style>
    <a
      href="https://wa.me/918860022021"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#20bd5a] transition-all flex items-center justify-center animate-whatsapp-ring border-2 border-white"
      aria-label="Chat on WhatsApp"
    >
      {/* Official WhatsApp Logo SVG */}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    </a>
  </>
);

// --- Pages ---

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // -------------------------------------------------------------------------
  // HERO SECTION IMAGES CONFIGURATION (EDIT HERE)
  // To change the banner images, update the URLs in this array below.
  // Recommended size: 1920x1080 or similar landscape aspect ratio.
  // -------------------------------------------------------------------------
  const heroImages = [
    "./banner1.png",
    "./banner5.png",
    "./banner3.avif",
    "./banner4.avif",
    "./banner2.png",
    "./banner6.png",
  ];

  // -------------------------------------------------------------------------
  // TRENDING PRODUCTS CONFIGURATION (EDIT HERE)
  // Enter the exact IDs of the 3 products you want to show on the home page.
  // Look at constants.ts for available IDs.
  // -------------------------------------------------------------------------
  const trendingProductIds = ['p21', 'p32', 'p46']; 

  const trendingProducts = PRODUCTS.filter(p => trendingProductIds.includes(p.id));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000); // Increased interval to allow full view of transition
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Calculate previous index to keep it visible while current one fades in
  const prevHeroIndex = (currentHeroIndex - 1 + heroImages.length) % heroImages.length;

  return (
    <div className="overflow-hidden bg-white">
      <ModalEnquiry />
      
      <section className="relative h-[600px] lg:h-[700px] overflow-hidden flex items-center justify-center bg-black">
        {/* Background Carousel - Improved Logic: Never Empty */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, index) => {
            // Logic: 
            // If active: Z-20, Opacity 100 (Fading in/staying)
            // If previous: Z-10, Opacity 100 (Staying behind active to prevent blank background)
            // Others: Z-0, Opacity 0
            let className = "absolute inset-0 object-cover w-full h-full transition-opacity duration-1000 ease-in-out";
            
            if (index === currentHeroIndex) {
              className += " opacity-100 z-20";
            } else if (index === prevHeroIndex) {
              className += " opacity-100 z-10"; 
            } else {
              className += " opacity-0 z-0";
            }

            return (
              <img 
                key={index}
                src={img} 
                alt={`Slide ${index}`} 
                className={className}
              />
            );
          })}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-transparent z-30"></div>
        </div>

        {/* FIX: Reduced z-index to z-30 to maintain layer hierarchy below Navbar (z-50) */}
        <div className="container mx-auto px-4 relative z-30 text-white mt-12">
          <RevealOnScroll className="max-w-2xl">
            <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 animate-pulse">
               🚀 Exclusive Wholesale Discounts for Retailers
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
              Sourcing Premium Frames & Goggles from <TypingEffect text="Top Brands" className="text-secondary" />
            </h1>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed drop-shadow-md max-w-lg">
              Your one-stop B2B destination. We supply a wide range of optical products from various companies directly to retailers at unbeatable wholesale prices.
            </p>
            
            {user ? (
               <div className="flex flex-col items-start gap-4">
                  <h3 className="text-3xl font-bold text-white">Hi <span className="text-secondary">{user.name}</span>!</h3>
                  <button onClick={() => navigate('/products')} className="bg-secondary px-8 py-4 rounded-xl font-bold text-white hover:bg-blue-600 transition-all hover:-translate-y-1 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                    View Catalog <ArrowRight size={20}/>
                  </button>
               </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/products')} className="bg-secondary px-8 py-4 rounded-xl font-bold text-white hover:bg-blue-600 transition-all hover:-translate-y-1 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                  View Catalog <ArrowRight size={20}/>
                </button>
                <button onClick={() => navigate('/auth')} className="bg-white/10 backdrop-blur-sm border border-white/30 px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-2">
                  Retailer Login <UserIcon size={20}/>
                </button>
              </div>
            )}
            
            <div className="mt-12 flex items-center gap-8 text-sm font-medium text-gray-400">
               <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400"/> Affordable Pricing</div>
               <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400"/> Exclusive Bulk Discounts</div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <RevealOnScroll>
            <h2 className="text-3xl font-bold mb-12 text-center text-primary">Featured Collections</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div onClick={() => navigate('/products')} className="group relative h-72 md:h-96 rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all">
                <img src="image1.png" alt="Frames" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
                  <span className="bg-secondary text-white text-xs font-bold px-3 py-1 rounded w-fit mb-3">Best Sellers</span>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">Premium Acetate Frames</h3>
                  <p className="text-gray-200 text-sm md:text-base flex items-center gap-2 group-hover:gap-3 transition-all font-medium">Shop Collection <ArrowRight size={16}/></p>
                </div>
              </div>
              <div onClick={() => navigate('/products')} className="group relative h-72 md:h-96 rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all">
                <img src="image2.avif" alt="Goggles" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
                  <span className="bg-accent text-primary text-xs font-bold px-3 py-1 rounded w-fit mb-3">New Arrivals</span>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">Polarized Goggles</h3>
                  <p className="text-gray-200 text-sm md:text-base flex items-center gap-2 group-hover:gap-3 transition-all font-medium">View Designs <ArrowRight size={16}/></p>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <RevealOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-secondary">
                  <Award size={36} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Premium Quality</h3>
                <p className="text-gray-500 leading-relaxed">Every piece is quality checked. We supply only grade-A acetate and metal frames directly from the line.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600">
                  <Truck size={36} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Fast Shipping</h3>
                <p className="text-gray-500 leading-relaxed">Dispatched within 24 hours. Reliable delivery network across 25+ states in India.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                  <ShieldCheck size={36} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Secure Business</h3>
                <p className="text-gray-500 leading-relaxed">Verified retailer accounts only. Transparent pricing. Easy returns on manufacturing defects.</p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <RevealOnScroll>
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="text-secondary font-bold uppercase tracking-wider text-sm">Best Sellers</span>
                <h2 className="text-3xl font-bold mt-2 text-primary">Trending This Month</h2>
              </div>
              <button onClick={() => navigate('/products')} className="hidden sm:flex items-center gap-1 font-semibold text-gray-600 hover:text-secondary transition-colors">
                View All <ChevronRight size={18} />
              </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {trendingProducts.map((p) => (
                <div key={p.id} className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="h-72 bg-gray-100 overflow-hidden relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm">
                      Min Qty: {p.minQty}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">{p.category}</div>
                    <h3 className="font-bold text-lg mb-2 truncate text-gray-800">{p.name}</h3>
                    <div className="flex justify-between items-center mt-6">
                      <span className="text-2xl font-bold text-secondary">₹{p.price}<span className="text-xs text-gray-400 font-normal ml-1">/pc</span></span>
                      <button onClick={() => navigate('/products')} className="text-sm font-semibold border-b-2 border-primary pb-0.5 hover:text-secondary hover:border-secondary transition-colors">
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <RevealOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">Meet the <span className="text-secondary">Co-Founders</span></h2>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">The visionaries dedicated to revolutionizing India's optical wholesale market.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-10 items-start max-w-4xl mx-auto">
              {/* Atif Khan Profile */}
              <div className="bg-secondary/10 rounded-2xl p-8 border border-white/10 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full mb-4 border-4 border-secondary flex items-center justify-center text-3xl font-bold">AK</div>
                <h3 className="text-xl font-bold">Atif Khan</h3>
                <p className="text-secondary font-medium mb-4">Co-Founder</p>
                <p className="text-gray-300 text-sm italic">
                  "Technology can solve the core operational hurdles for local opticians. Apna Vision is that solution—a streamlined platform to empower retailers."
                </p>
              </div>
              {/* Ayan Khan Profile */}
              <div className="bg-secondary/10 rounded-2xl p-8 border border-white/10 text-center flex flex-col items-center">
                 <div className="w-24 h-24 bg-gray-700 rounded-full mb-4 border-4 border-secondary flex items-center justify-center text-3xl font-bold">AY</div>
                <h3 className="text-xl font-bold">Ayan Khan</h3>
                <p className="text-secondary font-medium mb-4">Co-Founder</p>
                <p className="text-gray-300 text-sm italic">
                  "Our goal is to build lasting relationships based on trust and transparency, ensuring every retailer has access to quality products at fair prices."
                </p>
              </div>
            </div>
             {!user && (
               <div className="text-center mt-12">
                <button onClick={() => navigate('/auth')} className="bg-white text-primary px-10 py-4 rounded-full font-bold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg">
                  Register Your Shop
                </button>
               </div>
            )}
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
};

const AboutPage = () => {
  return (
    <div className="bg-white min-h-screen animate-fade-in">
      <div className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <RevealOnScroll>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Apna Vision</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Empowering independent optical retailers with technology, supply chain excellence, and transparent pricing.</p>
          </RevealOnScroll>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-24">
        <RevealOnScroll>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-primary">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To organize the unorganized optical wholesale market in India. We strive to provide small and medium-sized optical retailers access to a vast catalog of high-quality products at fair prices, eliminating middlemen and ensuring faster turnaround times.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="border-l-4 border-secondary pl-4">
                  <h4 className="font-bold text-lg">Vision</h4>
                  <p className="text-sm text-gray-500">To be India's #1 B2B Optical Platform.</p>
                </div>
                <div className="border-l-4 border-accent pl-4">
                  <h4 className="font-bold text-lg">Values</h4>
                  <p className="text-sm text-gray-500">Integrity, Speed, Quality.</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000" alt="Warehouse" className="w-full h-full object-cover" />
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="text-3xl font-bold text-center mb-12">Why Retailers Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Users size={32} />, title: "Network", desc: "Trusted by 50+ Optical Shops" },
              { icon: <Award size={32} />, title: "Quality", desc: "QC Checked Products Only" },
              { icon: <HelpCircle size={32} />, title: "Support", desc: "Dedicated Account Managers" },
            ].map((item, i) => (
              <div key={i} className="text-center p-8 bg-gray-50 rounded-xl hover:bg-white hover:shadow-xl transition-all border">
                <div className="text-secondary flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </RevealOnScroll>

        <RevealOnScroll>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-12">Leadership at Apna Vision</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Atif Khan Card */}
              <div className="bg-gray-50 rounded-2xl p-8 border hover:shadow-xl transition-all">
                <div className="w-24 h-24 bg-gray-700 text-white rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-bold border-4 border-secondary">AK</div>
                <h3 className="text-2xl font-bold mb-1">Atif Khan</h3>
                <p className="text-secondary font-semibold">Co-Founder</p>
                <p className="text-gray-500 text-sm mt-4 italic">
                  "Technology can solve the core operational hurdles for local opticians. Apna Vision is that solution—a streamlined platform to empower retailers."
                </p>
              </div>
              {/* Ayan Khan Card */}
              <div className="bg-gray-50 rounded-2xl p-8 border hover:shadow-xl transition-all">
                <div className="w-24 h-24 bg-gray-700 text-white rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-bold border-4 border-secondary">AY</div>
                <h3 className="text-2xl font-bold mb-1">Ayan Khan</h3>
                <p className="text-secondary font-semibold">Co-Founder</p>
                <p className="text-gray-500 text-sm mt-4 italic">
                  "Our goal is to build lasting relationships based on trust and transparency, ensuring every retailer has access to quality products at fair prices."
                </p>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              { q: "What is the minimum order quantity?", a: "We have a strict minimum order policy of 12 pieces per order to maintain wholesale pricing." },
              { q: "Do you offer credit?", a: "Currently, we operate on Cash on Delivery (COD) and Advance Payment models only." },
              { q: "How long does delivery take?", a: "Standard delivery time is 1-2 business days depending on your location." },
              { q: "Can I return items?", a: "We do not offer refunds, but we provide replacements or offers for manufacturing defects reported within 48 hours of delivery." },
            ].map((faq, i) => (
              <div key={i} className="border rounded-lg p-6 hover:border-secondary transition-colors bg-white">
                <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><HelpCircle size={16} className="text-secondary"/> {faq.q}</h4>
                <p className="text-gray-600 ml-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
};

const ProductsPage = () => {
  const { products, user, addToCart } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});
  const [viewImage, setViewImage] = useState<string | null>(null);
  
  // --- Price Range States ---
  const [selectedRanges, setSelectedRanges] = useState<string[]>([]);
  const [appliedRanges, setAppliedRanges] = useState<string[]>([]);

  // -------------------------------------------------------------------------
  // PRICE RANGE CONFIGURATION (CUSTOMIZE HERE)
  // Define your ranges here. Use 'Infinity' for the last range's max value.
  // -------------------------------------------------------------------------
  const PRICE_RANGES = [
    { id: 'r1', label: 'Under ₹100', min: 0, max: 99 },
    { id: 'r2', label: '₹100 - ₹200', min: 100, max: 199 },
    { id: 'r3', label: '₹200 - ₹300', min: 200, max: 299 },
    { id: 'r4', label: '₹300 - ₹400', min: 300, max: 399 },
    { id: 'r5', label: 'Above ₹400', min: 400, max: Infinity },
  ];

  useEffect(() => {
    if (viewImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [viewImage]);

  // Handle Range Checkbox Change
  const handleRangeChange = (rangeId: string) => {
    setSelectedRanges(prev => 
      prev.includes(rangeId) 
        ? prev.filter(id => id !== rangeId) 
        : [...prev, rangeId]
    );
  };

  // Apply Filter Action
  const applyPriceFilter = () => {
    setAppliedRanges(selectedRanges);
  };

  // --- Enhanced Filtering Logic ---
  const filtered = products.filter(p => {
    // 1. Search Logic: Checks Name, Description, Category, and Features (Tags)
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.features.some(feature => feature.toLowerCase().includes(term));

    // 2. Category Logic
    const matchesCategory = category === 'All' || p.category === category;

    // 3. Price Range Logic (Based on appliedRanges)
    // If appliedRanges is empty, we show all prices (matchesPrice remains true).
    let matchesPrice = true;
    if (appliedRanges.length > 0) {
      matchesPrice = appliedRanges.some(rangeId => {
        const range = PRICE_RANGES.find(r => r.id === rangeId);
        if (!range) return false;
        return p.price >= range.min && p.price <= range.max;
      });
    }

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleQtyChange = (id: string, delta: number, min: number) => {
    setQuantities(prev => {
      const current = prev[id] || min;
      const next = current + delta;
      return { ...prev, [id]: next < min ? min : next };
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        
        <div className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-secondary p-6 mb-8 rounded-r-xl shadow-sm animate-fade-in flex flex-col md:flex-row items-center gap-4 justify-between">
           <div className="flex items-center gap-4">
              <div className="bg-secondary/10 p-3 rounded-full text-secondary">
                 <Percent size={28} />
              </div>
              <div>
                 <h3 className="text-lg font-bold text-gray-800">Buy More, Save More!</h3>
                 <p className="text-sm text-gray-600">Prices drop automatically as you increase quantity. <strong>Get up to 10% off</strong> on bulk orders.</p>
              </div>
           </div>
           <div className="text-xs bg-secondary text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Wholesale Deal
           </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-28">
              <h3 className="font-bold mb-6 flex items-center gap-2 text-lg"><Filter size={20} /> Filters</h3>
              
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search name, description, tags..." 
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2 mb-8">
                <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">Categories</h4>
                {['All', 'Frames', 'Goggles'].map(c => (
                  <button 
                    key={c} 
                    onClick={() => setCategory(c)}
                    className={`block w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${category === c ? 'bg-secondary text-white font-medium shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  Price Range <SlidersHorizontal size={14}/>
                </h4>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range) => (
                    <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded checked:bg-secondary checked:border-secondary transition-all"
                          checked={selectedRanges.includes(range.id)}
                          onChange={() => handleRangeChange(range.id)}
                        />
                        <CheckCircle size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{range.label}</span>
                    </label>
                  ))}
                </div>
                <button 
                  onClick={applyPriceFilter}
                  className="w-full mt-4 bg-gray-900 text-white py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-secondary transition-colors"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {category} <span className="text-gray-400 text-lg font-normal">({filtered.length} products)</span>
            </h2>
            
            {filtered.map(product => {
              const currentQty = quantities[product.id] || product.minQty;
              const { price: dynamicPrice, discountPercent } = calculateDynamicPrice(product.price, currentQty, product.minQty);

              return (
                <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-8">
                  <div onClick={() => setViewImage(product.image)} className="w-full sm:w-56 h-56 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative group cursor-pointer">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold px-3 py-1 border border-white rounded-full backdrop-blur-sm">View Image</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                        <span className="bg-blue-50 text-secondary text-xs px-2 py-1 rounded font-medium">{product.category}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.features.map(f => (
                          <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{f}</span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                    </div>
                    
                    <div className="border-t pt-4">
                      {user ? (
                        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                           <div>
                             <p className="text-xs text-gray-400 mb-1">Wholesale Price (excl. GST)</p>
                             <div className="flex items-baseline gap-2">
                               {discountPercent > 0 ? (
                                 <>
                                  <span className="text-2xl font-bold text-green-600">₹{dynamicPrice}</span>
                                  <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                                  <span className="text-xs font-bold text-white bg-green-500 px-2 py-0.5 rounded-full flex items-center gap-0.5"><TrendingDown size={10}/> {discountPercent}%</span>
                                 </>
                               ) : (
                                  <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                               )}
                               <span className="text-sm text-gray-500">/ unit</span>
                             </div>
                             {discountPercent < 10 && (
                               <p className="text-[10px] text-secondary mt-1">Buy more to save more (Max 10%)</p>
                             )}
                           </div>
                           
                           <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
                             <div className="flex items-center gap-2">
                               <button onClick={() => handleQtyChange(product.id, -1, product.minQty)} className="w-8 h-8 flex items-center justify-center bg-white border rounded hover:bg-gray-100 text-gray-600">
                                 <Minus size={14} />
                               </button>
                               <div className="text-center w-12">
                                 <span className="text-sm font-bold block">{currentQty}</span>
                                 <span className="text-[10px] text-gray-400">Qty</span>
                               </div>
                               <button onClick={() => handleQtyChange(product.id, 1, product.minQty)} className="w-8 h-8 flex items-center justify-center bg-white border rounded hover:bg-gray-100 text-gray-600">
                                 <Plus size={14} />
                               </button>
                             </div>
                             <button 
                               onClick={() => addToCart(product, currentQty)}
                               className="bg-secondary text-white px-6 py-2 rounded-md font-medium hover:bg-blue-600 transition-colors shadow-sm"
                             >
                               Add
                             </button>
                           </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                          <div className="text-sm text-gray-600">
                            <span className="font-bold">Min Order:</span> {product.minQty} Units
                          </div>
                          <Link to="/auth" className="text-secondary text-sm font-bold hover:underline flex items-center gap-1">
                            Login to View Price <ArrowRight size={14}/>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filtered.length === 0 && (
              <div className="text-center py-24 text-gray-400 bg-white rounded-xl border border-dashed">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p>No products found in this category or matching your search.</p>
                {(appliedRanges.length > 0 || searchTerm) && (
                  <button onClick={() => { setSearchTerm(''); setAppliedRanges([]); setSelectedRanges([]); }} className="mt-4 text-secondary font-bold hover:underline">
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {viewImage && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setViewImage(null)}
        >
          <div className="relative max-w-5xl max-h-[95vh] w-full flex justify-center items-center animate-fade-in" onClick={e => e.stopPropagation()}>
            <img src={viewImage} alt="Product full view" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-gray-800" />
            <button 
              onClick={() => setViewImage(null)}
              className="absolute top-4 right-4 md:top-4 md:right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors border border-white/20 backdrop-blur-md z-10"
              aria-label="Close image view"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CartPage = () => {
  const { cart, removeFromCart, user, placeOrder } = useStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.shopAddress || '');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  useEffect(() => { if(!user) navigate('/auth'); }, [user, navigate]);

  const subtotal = cart.reduce((sum, item) => {
    const { price } = calculateDynamicPrice(item.price, item.quantity, item.minQty);
    return sum + (price * item.quantity);
  }, 0);
  
  useEffect(() => {
    if (isCouponApplied) {
      setDiscount(Math.round(subtotal * 0.10));
    } else {
      setDiscount(0);
    }
  }, [subtotal, isCouponApplied]);

  const total = subtotal - discount;

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'APNA786') {
      setIsCouponApplied(true);
    } else {
      alert("Invalid Coupon Code");
      setIsCouponApplied(false);
      setDiscount(0);
    }
  };

  const handleRemoveCoupon = () => {
    setIsCouponApplied(false);
    setCouponCode('');
    setDiscount(0);
  };

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address || !address.toLowerCase().includes('delhi')) {
       setShowLocationModal(true);
       return;
    }
    setLoading(true);
    const method = 'COD';
    const orderDetails = cart.map(i => {
      const { price } = calculateDynamicPrice(i.price, i.quantity, i.minQty);
      return `${i.name} x ${i.quantity} @ ₹${price} (Total: ₹${price * i.quantity})`;
    }).join('\n');
    const emailBody = `New Order from ${user?.shopName}\nUser: ${user?.name} (${user?.phone})\nAddress: ${address}\nPayment Method: COD\n\nItems:\n${orderDetails}\n\nSubtotal: ₹${subtotal}\nDiscount (${isCouponApplied ? 'APNA786' : 'None'}): -₹${discount}\n--------------------------------\nGrand Total: ₹${total}`;
    const web3Data = new FormData();
    web3Data.append("access_key", WEB3FORMS_ACCESS_KEY);
    web3Data.append("subject", `New Order ₹${total} - ${user?.shopName}`);
    web3Data.append("message", emailBody);
    try {
      await fetch("https://api.web3forms.com/submit", { method: "POST", body: web3Data });
      await placeOrder(method, address, total); 
      setSuccess(true);
    } catch (err) {
      alert("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-lg border-t-4 border-green-500">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
        <p className="text-gray-600 mb-6">Thank you for your business. Our team will call you shortly to confirm shipping details.</p>
        <button onClick={() => { setSuccess(false); navigate('/'); }} className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800">Return to Home</button>
      </div>
    </div>
  );

  if (cart.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-12 rounded-2xl shadow-sm border text-center">
        <ShoppingCart size={64} className="text-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-8">Add wholesale items to start an order.</p>
        <button onClick={() => navigate('/products')} className="bg-secondary text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">Browse Catalog</button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in relative">
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm text-center relative">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                 <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">We Apologize</h3>
              <p className="text-gray-600 mb-6">Currently, we only serve <strong>Delhi</strong> locations. Expansion to other cities is coming soon!</p>
              <button onClick={() => setShowLocationModal(false)} className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">
                Okay, I understand
              </button>
           </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8">Finalize Order</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b font-medium text-gray-700">Order Summary</div>
            <div className="p-6 space-y-6">
              {cart.map(item => {
                const { price: dynamicPrice, discountPercent } = calculateDynamicPrice(item.price, item.quantity, item.minQty);
                return (
                  <div key={item.id} className="flex justify-between items-center pb-6 border-b last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">Quantity: <span className="font-semibold text-gray-800">{item.quantity}</span></p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium">Price: ₹{dynamicPrice}</span>
                        {discountPercent > 0 && <span className="text-xs text-green-600 font-bold bg-green-50 px-1.5 rounded">({discountPercent}% Bulk Discount)</span>}
                      </div>
                      {item.quantity < 12 && <span className="text-xs text-red-500">Below MOQ (12)</span>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{dynamicPrice * item.quantity}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:text-red-700 mt-2 font-medium">Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-4 border-t bg-white">
               <div className="flex gap-2">
                  <input type="text" placeholder="Coupon Code" className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm uppercase focus:outline-none focus:ring-2 focus:ring-secondary" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={isCouponApplied} />
                  {isCouponApplied ? (<button onClick={handleRemoveCoupon} type="button" className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-200">Remove</button>) : (<button onClick={handleApplyCoupon} type="button" className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-black">Apply</button>)}
               </div>
               {isCouponApplied && <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1"><CheckCircle size={12}/> Code APNA786 applied successfully!</p>}
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-500"><span>Subtotal</span><span>₹{subtotal}</span></div>
              {isCouponApplied && (<div className="flex justify-between items-center text-sm text-green-600 font-medium"><span>Discount (10%)</span><span>- ₹{discount}</span></div>)}
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2"><span className="text-lg font-medium">Total Amount</span><span className="text-2xl font-bold text-primary">₹{total}</span></div>
            </div>
          </div>
        </div>
        <div className="h-fit space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Truck size={20}/> Shipping Details</h3>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Delivery Address</label>
                <textarea name="address" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white h-24 focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow resize-none" placeholder="Enter full shop address (must be in Delhi)..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Payment Method</label>
                <div className="p-4 border border-secondary/30 bg-secondary/5 rounded-lg flex items-center gap-3"><div className="w-5 h-5 rounded-full border-4 border-secondary bg-white"></div><span className="font-semibold text-primary">Cash on Delivery (COD)</span></div>
                <p className="text-xs text-gray-500 mt-2 pl-1">* Pay cash when the shipment arrives at your shop.</p>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-secondary text-white py-4 rounded-lg font-bold hover:bg-blue-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <>Confirm Order <ArrowRight size={18}/></>}
              </button>
              <p className="text-xs text-gray-400 text-center">By ordering, you agree to Apna Vision's Wholesale Terms.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const dbString = localStorage.getItem('apna_users_db');
    const db: User[] = dbString ? JSON.parse(dbString) : [];
    if (isLogin) {
      const foundUser = db.find(u => u.email === email && u.password === password);
      if (email === COMPANY_EMAIL && password === "admin123") {
         const adminUser: User = { id: 'ADMIN', name: 'Apna Vision Admin', email, role: 'admin', shopName: 'HQ', shopAddress: 'Delhi', phone: COMPANY_PHONE, password };
         login(adminUser);
         navigate('/admin');
         return;
      }
      if (foundUser) {
        login(foundUser);
        navigate('/');
      } else {
        setError('Invalid email or password.');
      }
    } else {
      const confirmPassword = formData.get('confirmPassword') as string;
      if (password !== confirmPassword) { setError("Passwords do not match."); return; }
      if (db.find(u => u.email === email)) { setError('Email already registered.'); return; }
      const newUser: User = {
        id: `USR-${Date.now()}`, name: formData.get('name') as string, email: email,
        shopName: formData.get('shopName') as string, shopAddress: formData.get('address') as string,
        phone: formData.get('phone') as string, role: 'retailer', password: password
      };
      db.push(newUser);
      localStorage.setItem('apna_users_db', JSON.stringify(db));
      const web3Data = new FormData();
      web3Data.append("access_key", WEB3FORMS_ACCESS_KEY);
      web3Data.append("subject", "New Retailer Signup");
      web3Data.append("message", JSON.stringify(newUser, null, 2));
      await fetch("https://api.web3forms.com/submit", { method: "POST", body: web3Data });
      login(newUser);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 animate-fade-in border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary">{isLogin ? 'Retailer Login' : 'Register Shop'}</h2>
          <p className="text-sm text-gray-500 mt-2">Access wholesale prices and bulk ordering.</p>
        </div>
        {error && <div className="bg-red-50 text-red-500 text-sm p-3 rounded mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (<><input name="name" required placeholder="Owner Name" className="w-full border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-secondary focus:outline-none text-sm" /><input name="shopName" required placeholder="Shop Name" className="w-full border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-secondary focus:outline-none text-sm" /><input name="address" required placeholder="Shop Address" className="w-full border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-secondary focus:outline-none text-sm" /><input name="phone" required placeholder="Phone Number" className="w-full border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-secondary focus:outline-none text-sm" /></>)}
          <input name="email" type="email" required placeholder="Email Address" className="w-full border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-secondary focus:outline-none text-sm" />
          {isLogin ? (<input name="password" type="password" required placeholder="Password" className="w-full border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-secondary focus:outline-none text-sm" />) : (<div className="grid grid-cols-2 gap-4"><input name="password" type="password" required placeholder="Create Password" className="w-full border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-secondary focus:outline-none text-sm" /><input name="confirmPassword" type="password" required placeholder="Confirm Password" className="w-full border rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-secondary focus:outline-none text-sm" /></div>)}
          <button type="submit" className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-lg">{isLogin ? 'Secure Login' : 'Create Account'}</button>
        </form>
        <p className="text-center mt-8 text-sm text-gray-600">{isLogin ? "Don't have an account? " : "Already have an account? "}<button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-secondary font-bold hover:underline">{isLogin ? "Register Now" : "Login Here"}</button></p>
      </div>
    </div>
  );
};

const BlogPage = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (selectedPost) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedPost]);

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4">
        <RevealOnScroll>
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4 text-primary">Optical Industry Insights</h1>
            <p className="text-gray-500 max-w-2xl mx-auto">Latest trends, technology updates, and business tips for optical retailers.</p>
          </div>
        </RevealOnScroll>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post, idx) => (
            <RevealOnScroll key={post.id} className={`delay-${idx * 100}`}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
                <div className="h-48 overflow-hidden relative"><img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /><div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div></div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-3"><span className="text-xs bg-blue-50 text-secondary px-2 py-1 rounded font-bold uppercase">{post.date}</span></div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800 line-clamp-2 group-hover:text-secondary transition-colors">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="mt-auto pt-4 border-t"><button onClick={() => setSelectedPost(post)} className="text-secondary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">Read Article <ChevronRight size={14} /></button></div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-fade-in flex flex-col">
            <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-red-500 rounded-full p-2 transition-all shadow-lg border border-white/30"><X size={24} /></button>
            <div className="h-64 sm:h-80 w-full shrink-0 relative"><img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div><div className="absolute bottom-0 left-0 p-6 sm:p-8 text-white w-full"><span className="bg-secondary px-3 py-1 rounded text-xs font-bold uppercase mb-2 inline-block shadow-sm">{selectedPost.date}</span><h2 className="text-2xl sm:text-3xl font-bold leading-tight drop-shadow-md">{selectedPost.title}</h2></div></div>
            <div className="p-6 sm:p-10 space-y-6">
               <div className="prose max-w-none text-gray-700 leading-relaxed text-lg whitespace-pre-line">{selectedPost.content}</div>
               <div className="pt-8 mt-4 border-t border-gray-100 flex justify-center sm:justify-end"><button onClick={() => setSelectedPost(null)} className="w-full sm:w-auto px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">Close Article <X size={18} /></button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ContactPage = () => {
  return (
    <div className="bg-white min-h-screen py-12 animate-fade-in">
      <div className="container mx-auto px-4">
        <RevealOnScroll>
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
            <div className="bg-primary text-white p-10 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10"><Mail size={200} /></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
                <div className="space-y-8">
                  <div className="flex items-start gap-4"><div className="bg-white/10 p-3 rounded-lg"><Phone className="text-secondary" /></div><div><h4 className="font-bold text-lg">Call Us</h4><p className="text-gray-300">{COMPANY_PHONE}</p></div></div>
                  <div className="flex items-start gap-4"><div className="bg-white/10 p-3 rounded-lg"><Mail className="text-secondary" /></div><div><h4 className="font-bold text-lg">Email Us</h4><p className="text-gray-300">{COMPANY_EMAIL}</p></div></div>
                  <div className="flex items-start gap-4"><div className="bg-white/10 p-3 rounded-lg"><MapPin className="text-secondary" /></div><div><h4 className="font-bold text-lg">Head Office</h4><p className="text-gray-300">Central Market, Lajpat Nagar<br/>New Delhi, India</p></div></div>
                </div>
              </div>
              <div className="mt-12 relative z-10"><p className="text-xs text-gray-400">Operating Hours: Mon-Sat, 10 AM - 7 PM</p></div>
            </div>
            <div className="p-10 md:w-3/5 bg-gray-50">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Send us a message</h3>
              <form action="https://api.web3forms.com/submit" method="POST" className="space-y-6">
                <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />
                <div className="grid grid-cols-2 gap-6"><div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Name</label><input name="name" required className="w-full border-b-2 border-gray-200 bg-transparent py-2 focus:border-secondary focus:outline-none transition-colors" /></div><div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Phone</label><input name="phone" required className="w-full border-b-2 border-gray-200 bg-transparent py-2 focus:border-secondary focus:outline-none transition-colors" /></div></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Email</label><input name="email" type="email" required className="w-full border-b-2 border-gray-200 bg-transparent py-2 focus:border-secondary focus:outline-none transition-colors" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Message</label><textarea name="message" required className="w-full border-b-2 border-gray-200 bg-transparent py-2 h-32 focus:border-secondary focus:outline-none transition-colors resize-none" /></div>
                <button type="submit" className="bg-secondary text-white px-10 py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-lg">Send Message</button>
              </form>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const { user, orders, enquiries } = useStore();
  
  if (!user || user.role !== 'admin') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow text-center">
        <h2 className="text-red-500 font-bold text-xl mb-2">Access Denied</h2>
        <p className="text-gray-600">You do not have permission to view this page.</p>
        <Link to="/" className="text-secondary mt-4 block hover:underline">Go Home</Link>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-primary">Admin Dashboard</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800"><ShoppingCart size={20} /> Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 uppercase text-xs"><tr><th className="px-4 py-3">ID / Date</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr></thead>
              <tbody className="divide-y">
                {orders.map(order => (<tr key={order.id} className="hover:bg-gray-50"><td className="px-4 py-3"><div className="font-bold text-gray-800">{order.id}</div><div className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</div></td><td className="px-4 py-3 font-medium">₹{order.totalAmount}</td><td className="px-4 py-3"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">{order.status}</span></td></tr>))}
                {orders.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No orders yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800"><MessageSquare size={20} /> Recent Enquiries</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 uppercase text-xs"><tr><th className="px-4 py-3">Name / Contact</th><th className="px-4 py-3">Message</th></tr></thead>
              <tbody className="divide-y">
                {enquiries.map(enq => (<tr key={enq.id} className="hover:bg-gray-50"><td className="px-4 py-3"><div className="font-bold text-gray-800">{enq.name}</div><div className="text-xs text-gray-500">{enq.phone}</div></td><td className="px-4 py-3"><div className="max-w-xs truncate text-gray-600">{enq.message}</div><div className="text-xs text-gray-400 mt-1">{new Date(enq.date).toLocaleDateString()}</div></td></tr>))}
                {enquiries.length === 0 && <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-500">No enquiries yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <StoreProvider>
        <div className="flex flex-col min-h-screen font-sans text-gray-900">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          {/* AI Assistant Removed */}
          <WhatsAppButton />
          <Footer />
        </div>
      </StoreProvider>
    </Router>
  );
};

export default App;