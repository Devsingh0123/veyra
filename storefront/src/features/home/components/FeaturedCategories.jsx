import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const FEATURED_CATS = [
  {
    title: 'Flagship Electronics',
    subtitle: 'Audio, Wearables & Smart Tech',
    slug: 'electronics',
    image:
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    tag: 'Trending',
  },
  {
    title: 'Apparel & Couture',
    subtitle: 'Minimalist Wardrobe Essentials',
    slug: 'fashion',
    image:
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80',
    tag: 'New Season',
  },
  {
    title: 'Home & Modern Living',
    subtitle: 'Aesthetic Decor & Workspaces',
    slug: 'home-living',
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80',
    tag: 'Popular',
  },
  {
    title: 'Beauty & Wellness',
    subtitle: 'Clean Care & Luxury Aromas',
    slug: 'beauty-wellness',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
    tag: 'Curated',
  },
];

export default function FeaturedCategories() {
  return (
    <section className="py-12 md:py-16 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Department Discovery
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Shop by Curated Collections
            </h2>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            <span>Browse All Departments</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED_CATS.map((cat) => (
            <Link
              key={cat.slug}
              to={`/catalog?category=${cat.slug}`}
              className="group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 h-72 p-5 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10"
            >
              {/* Background Image with Dark Vignette */}
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              {/* Tag */}
              <div className="relative z-10 mb-auto">
                <span className="inline-block rounded-md bg-indigo-600/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  {cat.tag}
                </span>
              </div>

              {/* Title & Arrow */}
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition">
                    {cat.title}
                  </h3>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm group-hover:bg-indigo-600 transition">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-300">{cat.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
