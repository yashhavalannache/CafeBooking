import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, Star, Wifi, Coffee, Cake, Zap, Award,
  MapPin, Phone, Mail, Clock, ChevronLeft, ChevronRight, Quote, Heart, ShieldCheck,
  Eye, Flame, Disc, Volume2, VolumeX, Play, Pause, Music, ClipboardText
} from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import SteamAnimation from '../components/SteamAnimation';
import { supabase, type MenuItem, type Review, type GalleryImage, type Category } from '../lib/supabase';
import { SkeletonCard } from '../components/Skeleton';

// Dummy Testimonials Fallback Data
const DUMMY_REVIEWS: Review[] = [
  {
    id: 'dummy-1',
    customer_name: 'Aanya Sharma',
    comment: 'The single-origin pour-over is absolutely mind-blowing. Finding a cafe that roasts its own beans in house with such precision is rare. The ambience makes it perfect for working!',
    rating: 5,
    customer_avatar: 'https://i.pinimg.com/736x/0d/7d/85/0d7d8583b813c9a7b930323b29a59c66.jpg',
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'dummy-2',
    customer_name: 'Rohan Mehta',
    comment: 'Brewed & Bliss has the best sourdough croissants in town. Pair that with their classic cappuccino, and you have the perfect morning. Truly an exceptional experience every single time.',
    rating: 5,
    customer_avatar: 'https://i.pinimg.com/736x/76/23/05/762305954d71bbb8ecfb936ffaaa67df.jpg',
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'dummy-3',
    customer_name: 'Priya Nair',
    comment: 'Incredibly cozy aesthetic, exceptionally fast service, and outstanding baristas who really take time to explain different profiles. It has officially become my favorite weekend getaway spot.',
    rating: 4,
    customer_avatar: 'https://i.pinimg.com/736x/76/23/05/762305954d71bbb8ecfb936ffaaa67df.jpg',
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'dummy-4',
    customer_name: 'Vikram Malhotra',
    comment: 'The attention to detail here is brilliant—from the specialized glassware to the premium local beans from Chikmagalur farms. An absolute paradise for serious coffee aficionados.',
    rating: 5,
    customer_avatar: 'https://i.pinimg.com/736x/65/24/d8/6524d84dd23bcaae1cbba1b863ed8a94.jpg',
    is_featured: true,
    created_at: new Date().toISOString()
  },
  {
  id: 'dummy-5',
  customer_name: 'Yash Havalannache',
  comment: 'Loved the ambience and smooth reservation experience. Everything felt well-organized and premium, from booking to seating. Definitely coming back again!',
  rating: 5,
  customer_avatar: 'https://i.pinimg.com/736x/32/b3/df/32b3df741820f437060be2ecb8070d44.jpg',
  is_featured: true,
  created_at: new Date().toISOString()
},
];

// Aesthetic Dummy Gallery Fallback Data
const DUMMY_GALLERY: GalleryImage[] = [
  {
    id: 'gal-1',
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
    caption: 'Our signature minimal, sunlit reading corner.',
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'gal-2',
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=600',
    caption: 'Precision latte art poured with fresh, in-house roasted milk.',
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'gal-3',
    image_url: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=600',
    caption: 'Slow mornings with pour-over filter sessions.',
    sort_order: 3,
    created_at: new Date().toISOString()
  },
  {
    id: 'gal-4',
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600',
    caption: 'Freshly pulled artisan double espresso shots.',
    sort_order: 4,
    created_at: new Date().toISOString()
  },
  {
    id: 'gal-5',
    image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800',
    caption: 'Muted tones and cozy modern European interior design.',
    sort_order: 5,
    created_at: new Date().toISOString()
  },
  {
    id: 'gal-6',
    image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=600',
    caption: 'Warm, hand-baked artisanal pastries served daily.',
    sort_order: 6,
    created_at: new Date().toISOString()
  }
];

// Timeline roadmap data
const TIMELINE_STEPS = [
  {
    id: 1,
    title: 'Step 1: Ethical Sourcing',
    subtitle: 'From Coorg & Chikmagalur Farms',
    icon: Eye,
    image: 'https://i.pinimg.com/736x/87/3b/d1/873bd1d36a00a0df6ff28ddc8a6a3f26.jpg',
    desc: 'We partner directly with heritage organic estates in Southern India. Every single cherry is hand-harvested at peak ripeness, ensuring sustainable fair-wage practices and unparalleled quality control right at the root.'
  },
  {
    id: 2,
    title: 'Step 2: Micro-Roasting',
    subtitle: 'In-House Flavor Profiling',
    icon: Flame,
    image: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?auto=format&fit=crop&q=80&w=800',
    desc: 'Our green beans undergo precision profile roasting right inside the cafe. From bright, fruit-forward light roasts to complex, velvety dark profiles, we manipulate heat curves daily to crack open distinct sensory notes.'
  },
  {
    id: 3,
    title: 'Step 3: Artisanal Brewing',
    subtitle: 'The Barista\'s Touch',
    icon: Disc,
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=800',
    desc: 'Brewing is a science. Whether dialing in an extraction on our custom espresso machine or measuring precise ratios for a slow-pouring V60 drop, our master baristas craft every single cup with uncompromising technical care.'
  }
];

// Sip & Sound Playable Tracks
const CAFE_TRACKS = [
  { name: 'Lo-Fi Jazz Blend', url: 'https://archive.org/download/lofi-jazz-chill-hop-beats/Lofi%20Jazz%20Chill%20Hop%20Beats.mp3' },
  { name: 'Rainy Cafe Ambient', url: 'https://archive.org/download/ambient-cafe-soundscape/cafe_rain.mp3' }
];

function useCounter(target: number, inView: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = Date.now();
    const step = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return value;
}

function StatsSection() {
  const [ref, setRef] = React.useState<Element | null>(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    if (!ref) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(ref);
    return () => obs.disconnect();
  }, [ref]);

  const cups = useCounter(15000, inView);
  const customers = useCounter(4200, inView);
  const items = useCounter(80, inView);
  const years = useCounter(5, inView);

  const stats = [
    { value: cups, suffix: '+', label: 'Cups Served' },
    { value: customers, suffix: '+', label: 'Happy Customers' },
    { value: items, suffix: '+', label: 'Menu Items' },
    { value: years, suffix: ' Yrs', label: 'of Excellence' },
  ];

  return (
    <div ref={setRef as React.RefCallback<HTMLDivElement>} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((s, i) => (
        <div key={i} className="text-center group">
          <p className="font-display text-4xl lg:text-5xl font-bold text-gold-gradient mb-1">
            {s.value.toLocaleString()}{s.suffix}
          </p>
          <p className="text-sm text-[#E6D3B3]/70 font-medium uppercase tracking-wider">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

const whyChooseUs = [
  { icon: Coffee, title: 'Fresh Coffee', desc: 'Single-origin beans, roasted in-house every morning for peak flavour.' },
  { icon: Cake, title: 'Handmade Desserts', desc: 'Artisanal pastries and desserts baked fresh daily with premium ingredients.' },
  { icon: Heart, title: 'Cozy Ambience', desc: 'Thoughtfully designed spaces that feel like a warm embrace on every visit.' },
  { icon: Wifi, title: 'Free WiFi', desc: 'High-speed fibre connection for remote work or casual browsing.' },
  { icon: Zap, title: 'Fast Service', desc: 'Your order prepared and at your table within minutes — always with a smile.' },
  { icon: Award, title: 'Expert Baristas', desc: 'World-class certified baristas who craft each drink with precision and care.' },
];

function MenuItemCard({ item }: { item: MenuItem & { categories?: Category } }) {
  const [fav, setFav] = useState(false);
  return (
    <div 
      className="card-lift bg-white rounded-2xl overflow-hidden border border-[#E6D3B3]/50 group flex flex-col transition-all duration-300"
      style={{ boxShadow: '0 20px 40px -15px rgba(46, 26, 18, 0.08)' }}
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={item.image_url || 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=600'}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          {item.is_bestseller && (
            <span className="bg-[#D4AF37] text-[#2E1A12] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Bestseller</span>
          )}
          {item.is_todays_special && (
            <span className="bg-[#4E342E] text-[#FFF8E7] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Special</span>
          )}
        </div>
        <button
          onClick={() => setFav(!fav)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
        >
          <Heart className={`w-4 h-4 transition-colors ${fav ? 'fill-red-400 text-red-400' : 'text-white'}`} />
        </button>
        <div className="absolute bottom-3 left-3">
          {item.is_vegetarian && (
            <span className="bg-green-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-green-400 tracking-wide">VEG</span>
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-semibold text-[#2E1A12] leading-tight">{item.name}</h3>
          <p className="text-[#6F4E37] font-bold text-lg whitespace-nowrap">₹{item.price}</p>
        </div>
        <p className="text-xs text-[#6F4E37]/70 mb-2">{item.categories?.name}</p>
        <p className="text-sm text-[#4E342E]/80 leading-relaxed line-clamp-2 flex-1">{item.description}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E6D3B3]">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
            <span className="text-xs font-semibold text-[#4E342E]">{Number(item.rating).toFixed(1)}</span>
          </div>
          <span className="text-xs text-[#6F4E37]/60">{item.prep_time} min</span>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="glass-dark rounded-2xl p-6 flex flex-col gap-4 border border-[#D4AF37]/15 h-full">
      <Quote className="w-8 h-8 text-[#D4AF37]/50" />
      <p className="text-sm text-[#E6D3B3]/85 leading-relaxed flex-1 italic">"{review.comment}"</p>
      <div className="flex items-center gap-3">
        <img
          src={review.customer_avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'}
          alt={review.customer_name}
          className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37]/30"
        />
        <div>
          <p className="text-sm font-semibold text-[#FFF8E7]">{review.customer_name}</p>
          <div className="flex gap-0.5 mt-0.5">
            {Array.from({ length: review.rating }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [popularItems, setPopularItems] = useState<(MenuItem & { categories?: Category })[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewIndex, setReviewIndex] = useState(0);
  
  // Roadmap & Step Management
  const [activeStep, setActiveStep] = useState(1);

  // Sip & Sound Ambience Audio Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);
  const [playerExpanded, setPlayerExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Admin Check States
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Fetch backend collections
    Promise.all([
      supabase.from('menu_items').select('*, categories(*)').eq('is_bestseller', true).limit(8),
      supabase.from('reviews').select('*').eq('is_featured', true),
      supabase.from('gallery_images').select('*').order('sort_order'),
    ]).then(([items, rev, gal]) => {
      setPopularItems(items.data || []);
      
      if (rev.data && rev.data.length > 0) {
        setReviews(rev.data);
      } else {
        setReviews(DUMMY_REVIEWS);
      }
      
      if (gal.data && gal.data.length > 0) {
        setGallery(gal.data);
      } else {
        setGallery(DUMMY_GALLERY);
      }
      
      setLoading(false);
    });

    // 2. Separate logic to verify if current user has the 'admin' role
    async function verifyAdminRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile && profile.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Error verifying access role:", err);
      } finally {
        setAuthLoading(false);
      }
    }

    verifyAdminRole();
  }, []);

  // Handle music player events sync inside React updates
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack, volume, isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);
  const handleTrackChange = () => {
    setCurrentTrack((prev) => (prev + 1) % CAFE_TRACKS.length);
    setIsPlaying(true);
  };

  const visibleReviews = 3;
  const maxIndex = Math.max(0, reviews.length - visibleReviews);
  const currentStepData = TIMELINE_STEPS.find(s => s.id === activeStep) || TIMELINE_STEPS[0];

  return (
    <div className="bg-[#FFF8E7] relative min-h-screen overflow-x-hidden selection:bg-[#6F4E37]/20">
      
      {/* ── SUBTLE FILM GRAIN TEXTURE FILTER OVERLAY ── */}
      <div className="pointer-events-none fixed inset-0 z-40 opacity-[0.025] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* NATIVE HTML AUDIO SUB-ELEMENT */}
      <audio
        ref={audioRef}
        src={CAFE_TRACKS[currentTrack].url}
        loop
        preload="auto"
      />

      {/* ── Hero ── */}
      <section className="relative min-h-screen lg:min-h-0 lg:py-32 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/2074130/pexels-photo-2074130.jpeg')" }}
        />
        <div className="absolute inset-0 parallax-overlay" />
        <div className="absolute top-1/4 right-16 w-24 h-24 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 animate-spin-slow hidden lg:block" />
        <div className="absolute bottom-1/3 left-16 w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 animate-float hidden lg:block" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-24 lg:pt-0">
          {/* Live Vibe/Capacity Check Banner */}
          <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/30 px-3.5 py-1.5 rounded-full mb-4 animate-fade-in backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-green-300 font-medium font-sans tracking-wide">
              Live Vibe Check: Cozy & Perfect for Work (65% Seated)
            </span>
          </div>

          <div className="block lg:mt-2">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Coffee className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs uppercase tracking-[0.2em] text-[#E6D3B3] font-medium">Premium Café Experience</span>
            </div>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-6xl xl:text-7xl font-bold text-[#FFF8E7] mb-6 leading-tight animate-fade-in delay-200">
            Brewed for<br />
            <span className="text-gold-gradient italic">Every Moment</span>
          </h1>

          <p className="text-base sm:text-xl text-[#E6D3B3]/80 max-w-2xl mx-auto leading-relaxed mb-8 animate-fade-in delay-300">
            Where exceptional coffee meets warm hospitality. A sanctuary crafted for those who appreciate the art of a perfect brew.
          </p>

          <div className="relative inline-block mb-8 animate-fade-in delay-400">
            <div className="relative w-14 h-14 mx-auto">
              <SteamAnimation />
              <div className="w-14 h-14 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37]/40 flex items-center justify-center backdrop-blur-sm">
                <Coffee className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pb-12 lg:pb-0 animate-fade-in delay-500">
            <Link
              to="/reservations"
              className="w-full sm:w-auto btn-ripple bg-gradient-to-r from-[#D4AF37] to-[#C8A228] text-[#2E1A12] px-8 py-4 rounded-full font-semibold text-base hover:shadow-2xl hover:shadow-[#D4AF37]/30 hover:scale-105 transition-all duration-300"
            >
              Reserve a Table
            </Link>
            <Link
              to="/menu"
              className="w-full sm:w-auto btn-ripple glass text-[#FFF8E7] border border-[#FFF8E7]/20 px-8 py-4 rounded-full font-semibold text-base hover:bg-white/15 hover:scale-105 transition-all duration-300"
            >
              Explore Menu
            </Link>
            
            {!authLoading && isAdmin && (
              <Link
                to="/admin"
                className="w-full sm:w-auto btn-ripple flex items-center justify-center gap-2 bg-red-600/90 text-white border border-red-500 px-8 py-4 rounded-full font-semibold text-base hover:bg-red-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-red-900/20"
              >
                <ShieldCheck className="w-5 h-5" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 animate-bounce">
          <span className="text-[10px] text-[#E6D3B3]/60 uppercase tracking-[0.2em]">Scroll</span>
          <ChevronDown className="w-4 h-4 text-[#E6D3B3]/60" />
        </div>
      </section>


      {/* ── Our Daily Fresh Board (Digital Sidewalk Chalkboard Sign) ── */}
      <section className="py-12 bg-transparent -mt-10 relative z-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection animation="fade-in">
            {/* Wooden Blackboard Frame Styling */}
            <div 
              className="p-5 sm:p-7 bg-[#5D4037] rounded-3xl border-8 border-t-[12px] border-b-[14px] border-[#3E2723] group transform hover:-rotate-1 transition-transform duration-500"
              style={{ boxShadow: '0 30px 60px -20px rgba(46, 26, 18, 0.4)' }}
            >
              {/* Premium Textured Slate Face */}
              <div 
                className="relative bg-[#263238] rounded-xl p-6 sm:p-10 text-center border border-black/30 overflow-hidden"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
              >
                {/* Vintage Chalk dust effect overlays */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.04] pointer-events-none" />
                
                {/* Chalk Header Sign */}
                <div className="flex items-center justify-center gap-2 mb-6 opacity-80 border-b border-dashed border-white/20 pb-4 max-w-xs mx-auto">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-[#FFF8E7] font-bold font-sans">Our Daily Fresh Board</span>
                </div>

                {/* Main Body using a cozy serif/handwritten character */}
                <p className="font-serif italic text-xl sm:text-2xl text-[#FFF8E7] leading-relaxed tracking-wide opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                  "Cloudy Morning in Indiranagar? 🌦️ <br />
                  Today's Perfect Match: Our house-blend <span className="text-[#E6D3B3] not-italic underline decoration-amber-200/40 underline-offset-4">Cortado</span> paired with a warm, flaky <span className="text-[#E6D3B3] not-italic">Almond Croissant</span>."
                </p>

                {/* Subtext Barista Note */}
                <div className="mt-6 pt-4 border-t border-dashed border-white/15 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#E6D3B3]/70 font-sans tracking-wide">
                  <span className="font-bold text-[#FFF8E7]/90 uppercase text-[10px] bg-white/10 px-2 py-0.5 rounded tracking-widest">Barista's Note:</span>
                  <span>Fresh batch out of the oven just 20 minutes ago!</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-[#2E1A12] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <StatsSection />
          </AnimatedSection>
        </div>
      </section>

      {/* ── About ── */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection animation="fade-in-left">
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <img
                    src="https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg"
                    alt="Café interior"
                    className="rounded-2xl object-cover w-full h-64 shadow-xl"
                  />
                  <img
                    src="https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg"
                    alt="Café ambience"
                    className="rounded-2xl object-cover w-full h-64 shadow-xl mt-8"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-36 h-36 rounded-2xl overflow-hidden border-4 border-[#FFF8E7] hidden lg:block" style={{ boxShadow: '0 20px 40px -10px rgba(46, 26, 18, 0.15)' }}>
                  <img
                    src="https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg"
                    alt="Espresso"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C8A228] flex flex-col items-center justify-center shadow-xl hidden lg:flex">
                  <p className="font-display font-bold text-[#2E1A12] text-lg leading-none">5</p>
                  <p className="text-[8px] text-[#2E1A12] font-bold uppercase tracking-wide text-center leading-tight">Years<br/>Since</p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-in-right">
              <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-3">Our Story</p>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#2E1A12] leading-tight mb-6">
                A Passion for<br />
                <span className="text-[#6F4E37] italic">Perfect Coffee</span>
              </h2>
              <p className="text-[#4E342E]/80 leading-relaxed mb-5">
                Brewed & Bliss was born from a simple belief — that great coffee should be an everyday luxury. Founded in 2020 by a pair of coffee-obsessed entrepreneurs, our café has grown into a beloved gathering spot for students, professionals, and families alike.
              </p>
              <p className="text-[#4E342E]/80 leading-relaxed mb-8">
                Every detail, from our single-origin beans sourced directly from Coorg and Chikmagalur farms, to the hand-crafted interiors inspired by European coffee houses, reflects our relentless pursuit of warmth and excellence.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-[#6F4E37]/10 px-4 py-2.5 rounded-xl">
                  <Coffee className="w-4 h-4 text-[#6F4E37]" />
                  <span className="text-sm font-medium text-[#4E342E]">Single-Origin Beans</span>
                </div>
                <div className="flex items-center gap-2 bg-[#6F4E37]/10 px-4 py-2.5 rounded-xl">
                  <Award className="w-4 h-4 text-[#6F4E37]" />
                  <span className="text-sm font-medium text-[#4E342E]">Award-Winning Baristas</span>
                </div>
                <div className="flex items-center gap-2 bg-[#6F4E37]/10 px-4 py-2.5 rounded-xl">
                  <Heart className="w-4 h-4 text-[#6F4E37]" />
                  <span className="text-sm font-medium text-[#4E342E]">Made with Love</span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Interactive Meet Our Roastery Timeline ── */}
      <section className="section-padding bg-transparent border-t border-[#E6D3B3]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-[#6F4E37] font-semibold mb-3">The Journey</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#2E1A12] leading-tight">
              Meet Our Roastery:<br />
              <span className="text-[#6F4E37] italic">Bean to Cup Roadmap</span>
            </h2>
          </AnimatedSection>

          {/* Controller Tabs */}
          <div className="max-w-3xl mx-auto mb-12 flex justify-between items-center relative p-2 bg-[#2E1A12]/5 rounded-2xl border border-[#E6D3B3]">
            {TIMELINE_STEPS.map((step) => {
              const IconComp = step.icon;
              const isActive = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium font-display text-sm transition-all duration-300 z-10 ${
                    isActive
                      ? 'bg-[#2E1A12] text-[#FFF8E7] shadow-md'
                      : 'text-[#4E342E]/70 hover:text-[#2E1A12] hover:bg-[#2E1A12]/5'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#6F4E37]'}`} />
                  <span className="hidden sm:inline">{step.title.split(':')[1]}</span>
                  <span className="sm:hidden">Step {step.id}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Screen Showcase Display */}
          <div 
            className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden border border-[#E6D3B3]/40 grid md:grid-cols-2 min-h-[400px] transition-all duration-300"
            style={{ boxShadow: '0 30px 60px -20px rgba(46, 26, 18, 0.08)' }}
          >
            <div className="relative overflow-hidden h-64 md:h-auto">
              <img
                src={currentStepData.image}
                alt={currentStepData.title}
                className="w-full h-full object-cover animate-fade-in object-center transition-transform duration-700"
                key={currentStepData.image}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
              <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] mb-2">
                {currentStepData.title}
              </span>
              <h3 className="font-display text-2xl lg:text-3xl font-bold text-[#2E1A12] mb-4">
                {currentStepData.subtitle}
              </h3>
              <p className="text-sm text-[#4E342E]/80 leading-relaxed font-sans mb-6">
                {currentStepData.desc}
              </p>
              <div className="w-12 h-1 bg-[#D4AF37] rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="section-padding bg-[#2E1A12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-3">Why Us</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#FFF8E7] leading-tight">
              The Brewed & Bliss<br />
              <span className="text-gold-gradient italic">Difference</span>
            </h2>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 80} className="h-full">
                <div className="card-lift glass-dark rounded-2xl p-6 h-full group">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/25 flex items-center justify-center mb-5 group-hover:bg-[#D4AF37]/25 transition-colors">
                    <item.icon className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <h3 className="font-display font-semibold text-[#FFF8E7] text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-[#E6D3B3]/65 leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Items ── */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-3">Favourites</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#2E1A12] leading-tight mb-4">
              Our Most Loved<br />
              <span className="text-[#6F4E37] italic">Creations</span>
            </h2>
            <p className="text-[#4E342E]/70 max-w-xl mx-auto">The dishes and drinks our customers keep coming back for, crafted daily with the finest ingredients.</p>
          </AnimatedSection>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularItems.map((item, i) => (
                <AnimatedSection key={item.id} delay={i * 60}>
                  <MenuItemCard item={item} />
                </AnimatedSection>
              ))}
            </div>
          )}

          <AnimatedSection className="text-center mt-10">
            <Link
              to="/menu"
              className="btn-ripple inline-flex items-center gap-2 bg-[#4E342E] text-[#FFF8E7] px-8 py-4 rounded-full font-semibold hover:bg-[#6F4E37] hover:shadow-xl transition-all duration-300"
            >
              View Full Menu
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="section-padding bg-[#2E1A12] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#D4AF37]/5 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[#D4AF37]/5 translate-x-1/2 translate-y-1/2 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-3">Testimonials</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#FFF8E7] leading-tight">
              What Our Guests<br />
              <span className="text-gold-gradient italic">Are Saying</span>
            </h2>
          </AnimatedSection>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex gap-6 transition-transform duration-500"
                style={{ transform: `translateX(calc(-${reviewIndex * (100 / visibleReviews)}% - ${reviewIndex * 24 / visibleReviews}px))` }}
              >
                {reviews.map(r => (
                  <div key={r.id} className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                    <ReviewCard review={r} />
                  </div>
                ))}
              </div>
            </div>

            {reviews.length > visibleReviews && (
              <div className="flex justify-center gap-3 mt-8">
                <button
                  onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
                  disabled={reviewIndex === 0}
                  className="w-10 h-10 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setReviewIndex(Math.min(maxIndex, reviewIndex + 1))}
                  disabled={reviewIndex >= maxIndex}
                  className="w-10 h-10 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-3">Gallery</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#2E1A12] leading-tight">
              A Glimpse of<br />
              <span className="text-[#6F4E37] italic">Our World</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 auto-rows-[200px]">
            {gallery.slice(0, 9).map((img, i) => (
              <AnimatedSection
                key={img.id}
                delay={i * 60}
                className={`${i === 0 || i === 4 ? 'row-span-2' : ''} overflow-hidden rounded-2xl group cursor-pointer`}
              >
                <div className="relative w-full h-full overflow-hidden rounded-2xl">
                  <img
                    src={img.image_url}
                    alt={img.caption || ''}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-[#2E1A12]/0 group-hover:bg-[#2E1A12]/40 transition-colors duration-300 flex items-center justify-center">
                    <p className="text-[#FFF8E7] font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-3">
                      {img.caption}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      <section className="section-padding bg-[#2E1A12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-3">Find Us</p>
            <h2 className="font-display text-4xl font-bold text-[#FFF8E7]">
              Visit Us <span className="text-gold-gradient italic">Today</span>
            </h2>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <AnimatedSection animation="fade-in-left">
              <div className="space-y-6">
                {[
                  { icon: MapPin, title: 'Address', text: '42 Coffee Lane, Indiranagar\nBengaluru, Karnataka 560038' },
                  { icon: Phone, title: 'Phone', text: '+91 89 5119 2623' },
                  { icon: Mail, title: 'Email', text: 'thunderbolt1899@gmail.com' },
                ].map(i => (
                  <div key={i.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/25 flex items-center justify-center flex-shrink-0">
                      <i.icon className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">{i.title}</p>
                      <p className="text-[#E6D3B3]/80 text-sm whitespace-pre-line">{i.text}</p>
                    </div>
                  </div>
                ))}

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/25 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold mb-2">Hours</p>
                    <div className="space-y-1 text-sm text-[#E6D3B3]/80">
                      <p>Mon – Fri: 7:00 AM – 10:00 PM</p>
                      <p>Saturday: 8:00 AM – 11:00 PM</p>
                      <p>Sunday: 9:00 AM – 9:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-in-right">
              <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/15 h-[380px]" style={{ boxShadow: '0 30px 60px -20px rgba(0,0,0,0.3)' }}>
                <iframe
                  title="Café Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.8541!2d77.6394!3d12.9784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzQyLjIiTiA3N8KwMzgnMjEuOCJF!5e0!3m2!1sen!2sin!4v1629790000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'sepia(20%) contrast(1.1)' }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/1437318/pexels-photo-1437318.jpeg')" }}
        />
        <div className="absolute inset-0 bg-[#2E1A12]/80" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <AnimatedSection>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-[#FFF8E7] mb-6">
              Ready for an Unforgettable<br />
              <span className="text-gold-gradient italic">Coffee Experience?</span>
            </h2>
            <p className="text-[#E6D3B3]/80 text-lg mb-10">
              Reserve your table today and let us create a moment worth savouring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/reservations"
                className="w-full sm:w-auto btn-ripple bg-gradient-to-r from-[#D4AF37] to-[#C8A228] text-[#2E1A12] px-10 py-4 rounded-full font-semibold text-base hover:shadow-2xl hover:shadow-[#D4AF37]/30 hover:scale-105 transition-all duration-300"
              >
                Reserve a Table
              </Link>
              <Link
                to="/menu"
                className="w-full sm:w-auto btn-ripple glass text-[#FFF8E7] border border-[#FFF8E7]/20 px-10 py-4 rounded-full font-semibold text-base hover:bg-white/15 hover:scale-105 transition-all duration-300"
              >
                View Menu
              </Link>

              {!authLoading && isAdmin && (
                <Link
                  to="/admin"
                  className="w-full sm:w-auto btn-ripple flex items-center justify-center gap-2 bg-red-600/90 text-white border border-red-500 px-10 py-4 rounded-full font-semibold text-base hover:bg-red-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-red-900/20"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Admin Panel
                </Link>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}