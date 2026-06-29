import React, { useEffect, useState, useMemo } from 'react';
import { Search, Filter, Star, Clock, SlidersHorizontal, X, Heart, ChevronDown } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { supabase, type MenuItem, type Category } from '../lib/supabase';
import { SkeletonCard } from '../components/Skeleton';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'prep';

const CATEGORY_ICONS: Record<string, string> = {
  Coffee: '☕', Tea: '🍵', 'Cold Coffee': '🧊', Smoothies: '🥤',
  Sandwiches: '🥪', Pizza: '🍕', Burgers: '🍔', Pasta: '🍝',
  Desserts: '🍮', Cakes: '🎂',
};

function MenuCard({ item }: { item: MenuItem & { categories?: Category } }) {
  const [fav, setFav] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-lift bg-white rounded-2xl overflow-hidden shadow-md border border-[#E6D3B3]/50 group flex flex-col">
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        <img
          src={item.image_url || 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg'}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {item.is_bestseller && (
            <span className="bg-[#D4AF37] text-[#2E1A12] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide">Bestseller</span>
          )}
          {item.is_todays_special && (
            <span className="bg-[#4E342E] text-[#FFF8E7] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Today's Special</span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => setFav(!fav)}
            className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
          >
            <Heart className={`w-4 h-4 transition-colors ${fav ? 'fill-red-400 text-red-400' : 'text-white'}`} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          {item.is_vegetarian && (
            <span className="bg-green-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded border border-green-400 uppercase">Veg</span>
          )}
          <span className="ml-auto text-white font-bold text-xl">₹{item.price}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-[#6F4E37]/10 text-[#6F4E37] px-2 py-0.5 rounded-full font-medium">
            {CATEGORY_ICONS[item.categories?.name || ''] || '🍽️'} {item.categories?.name}
          </span>
        </div>
        <h3 className="font-display font-semibold text-[#2E1A12] text-lg leading-tight mb-1">{item.name}</h3>
        <p className="text-sm text-[#4E342E]/75 leading-relaxed mb-3 line-clamp-2">{item.description}</p>

        {expanded && item.ingredients && (
          <div className="mb-3 p-3 bg-[#FFF8E7] rounded-xl border border-[#E6D3B3]">
            <p className="text-xs font-semibold text-[#6F4E37] mb-1 uppercase tracking-wide">Ingredients</p>
            <p className="text-xs text-[#4E342E]/70 leading-relaxed">{item.ingredients}</p>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-[#E6D3B3] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
              <span className="text-xs font-semibold text-[#4E342E]">{Number(item.rating).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#6F4E37]/60" />
              <span className="text-xs text-[#6F4E37]/60">{item.prep_time}m</span>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[#6F4E37] font-medium hover:text-[#D4AF37] transition-colors flex items-center gap-0.5"
          >
            {expanded ? 'Less' : 'Details'}
            <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [items, setItems] = useState<(MenuItem & { categories?: Category })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sort, setSort] = useState<SortOption>('default');
  const [vegOnly, setVegOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
useEffect(() => {
  async function loadMenu() {
    setLoading(true);

    try {
      const itemsRes = await supabase
        .from("menu_items")
        .select("*, categories(*)")
        .eq("is_available", true);

      console.log("Items Error:", JSON.stringify(itemsRes.error, null, 2));
      console.log("Items Data:", itemsRes.data);


      const catRes = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");

      console.log("Categories Error:", JSON.stringify(catRes.error, null, 2));
      console.log("Categories Data:", catRes.data);

      if (itemsRes.error) {
        console.error(itemsRes.error);
      }

      if (catRes.error) {
        console.error(catRes.error);
      }

      setItems(itemsRes.data ?? []);
      setCategories(catRes.data ?? []);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }

  loadMenu();
}, []);

  const filtered = useMemo(() => {
    let out = [...items];
    if (search) out = out.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase()));
    if (activeCategory !== 'all') out = out.filter(i => i.categories?.name === activeCategory);
    if (vegOnly) out = out.filter(i => i.is_vegetarian);
    if (sort === 'price-asc') out.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') out.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') out.sort((a, b) => b.rating - a.rating);
    else if (sort === 'prep') out.sort((a, b) => a.prep_time - b.prep_time);
    return out;
  }, [items, search, activeCategory, vegOnly, sort]);

  const todaySpecials = items
  .filter(i => i.is_todays_special)
  .slice(0, 6);

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      {/* Header */}
      <div className="bg-[#2E1A12] pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-3">Our Menu</p>
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-[#FFF8E7] mb-4">
              Crafted with <span className="text-gold-gradient italic">Passion</span>
            </h1>
            <p className="text-[#E6D3B3]/70 max-w-xl mx-auto">
              From morning espresso to evening desserts — our menu is a celebration of flavour.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Today's Specials */}
        {todaySpecials.length > 0 && (
          <AnimatedSection className="mb-12">
            <div className="bg-gradient-to-r from-[#4E342E] to-[#2E1A12] rounded-2xl p-6 border border-[#D4AF37]/20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center">
                  <Star className="w-4 h-4 text-[#2E1A12] fill-[#2E1A12]" />
                </div>
                <h2 className="font-display text-2xl font-bold text-[#FFF8E7]">Today's Specials</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {todaySpecials.map(item => (
                  <div key={item.id} className="flex gap-3 bg-white/5 rounded-xl p-3 border border-[#D4AF37]/15 hover:border-[#D4AF37]/35 transition-colors">
                    <img
                      src={item.image_url || ''}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#FFF8E7] text-sm truncate">{item.name}</p>
                      <p className="text-xs text-[#E6D3B3]/60 line-clamp-1 mt-0.5">{item.description}</p>
                      <p className="text-[#D4AF37] font-bold text-sm mt-1">₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Search + Filter Bar */}
        <AnimatedSection className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F4E37]/50" />
              <input
                type="text"
                placeholder="Search for a dish or drink…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E6D3B3] rounded-xl text-[#2E1A12] placeholder-[#6F4E37]/40 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6F4E37]/60 hover:text-[#6F4E37]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortOption)}
                className="px-4 py-3.5 bg-white border border-[#E6D3B3] rounded-xl text-[#4E342E] text-sm focus:outline-none focus:border-[#D4AF37] cursor-pointer"
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="prep">Quickest</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3.5 rounded-xl border text-sm font-medium transition-colors ${
                  vegOnly || showFilters ? 'bg-[#4E342E] text-[#FFF8E7] border-[#4E342E]' : 'bg-white border-[#E6D3B3] text-[#4E342E] hover:border-[#D4AF37]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters {vegOnly && '(1)'}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-3 p-4 bg-white rounded-xl border border-[#E6D3B3] flex flex-wrap gap-3 items-center">
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  vegOnly ? 'bg-green-600 text-white border-green-600' : 'bg-white text-[#4E342E] border-[#E6D3B3] hover:border-green-400'
                }`}
              >
                <span className="w-3 h-3 rounded border-2 border-green-500 flex items-center justify-center">
                  {vegOnly && <span className="w-1.5 h-1.5 rounded-sm bg-green-500" />}
                </span>
                Vegetarian Only
              </button>
            </div>
          )}
        </AnimatedSection>

        {/* Category Tabs */}
        <AnimatedSection className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === 'all'
                  ? 'bg-[#4E342E] text-[#FFF8E7] shadow-md'
                  : 'bg-white text-[#4E342E] border border-[#E6D3B3] hover:border-[#D4AF37]'
              }`}
            >
              All ({items.length})
            </button>
            {categories.map(cat => {
              const count = items.filter(i => i.categories?.name === cat.name).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat.name
                      ? 'bg-[#4E342E] text-[#FFF8E7] shadow-md'
                      : 'bg-white text-[#4E342E] border border-[#E6D3B3] hover:border-[#D4AF37]'
                  }`}
                >
                  <span>{CATEGORY_ICONS[cat.name] || '🍽️'}</span>
                  {cat.name}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat.name ? 'bg-white/20 text-[#FFF8E7]' : 'bg-[#6F4E37]/10 text-[#6F4E37]'
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>
        </AnimatedSection>

        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[#6F4E37]/70">
            {filtered.length === 0 ? 'No items found' : `Showing ${filtered.length} item${filtered.length !== 1 ? 's' : ''}`}
            {search && <span> for "<span className="text-[#4E342E] font-medium">{search}</span>"</span>}
          </p>
          {(search || activeCategory !== 'all' || vegOnly || sort !== 'default') && (
            <button
              onClick={() => { setSearch(''); setActiveCategory('all'); setVegOnly(false); setSort('default'); }}
              className="text-xs text-[#D4AF37] hover:text-[#C8A228] font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">☕</div>
            <h3 className="font-display text-2xl font-semibold text-[#2E1A12] mb-2">Nothing found</h3>
            <p className="text-[#6F4E37]/70 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item, i) => (
              <AnimatedSection key={item.id} delay={Math.min(i * 40, 400)}>
                <MenuCard item={item} />
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
