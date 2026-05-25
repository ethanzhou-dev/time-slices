import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// 模拟历史数据
const historicalEvents = [
  {
    id: 1,
    year: '1995',
    title: 'The Dawn of Web',
    description: 'The early days of the world wide web marked a significant turning point in human communication, introducing HTML and the first browsers.',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 2,
    year: '2001',
    title: 'Rise of Mobile',
    description: 'Mobile phones started becoming ubiquitous, paving the way for the smartphone revolution that would change connectivity forever.',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 3,
    year: '2007',
    title: 'Smartphone Era',
    description: 'The introduction of modern touch-based smartphones redefined personal computing, bringing the internet into our pockets.',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 4,
    year: '2015',
    title: 'Cloud & Big Data',
    description: 'The shift to cloud computing enabled massive scalability, transforming how businesses and individuals store and process information.',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 5,
    year: '2024',
    title: 'AI Revolution',
    description: 'Artificial intelligence and machine learning reached unprecedented heights, fundamentally altering creative and technical industries.',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop',
  }
];

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // 1. Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // 2. Setup GSAP ScrollTrigger for horizontal scroll on desktop
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    let pinScrollTrigger: ScrollTrigger | null = null;
    let cardTriggers: ScrollTrigger[] = [];

    if (isDesktop && containerRef.current && timelineRef.current) {
      const timelineWidth = timelineRef.current.scrollWidth;
      const windowWidth = window.innerWidth;
      
      // Calculate how far to move left
      const xTranslate = -(timelineWidth - windowWidth);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1, // Smooth scrub
          start: 'top top',
          end: () => `+=${timelineWidth}`, // Scroll distance equals content width
          invalidateOnRefresh: true,
        }
      });

      tl.to(timelineRef.current, {
        x: xTranslate,
        ease: 'none',
      });

      pinScrollTrigger = tl.scrollTrigger as ScrollTrigger;

      // Parallax effect for year watermarks
      gsap.utils.toArray<HTMLElement>('.year-watermark').forEach((yearElem) => {
        gsap.to(yearElem, {
          x: () => (timelineWidth - windowWidth) * 0.2, // Move slower than content (parallax)
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: () => `+=${timelineWidth}`,
            scrub: 1,
            invalidateOnRefresh: true,
          }
        });
      });

      // Fade-in-up animation for cards entering from right (in horizontal scroll context)
      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        
        // Use container scroll progression to trigger card animations
        const trigger = ScrollTrigger.create({
          trigger: containerRef.current,
          start: () => `top top-=${index * (windowWidth * 0.6)}`, // Rough estimation for trigger point
          end: () => `top top-=${(index + 1) * (windowWidth * 0.6)}`,
          onEnter: () => {
             gsap.fromTo(card.querySelector('.card-content'), 
               { y: 50, opacity: 0 },
               { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
             );
          },
          // Allows reverse animation if needed, or just let them stay visible
        });
        cardTriggers.push(trigger);
      });
    } else {
      // Mobile vertical scroll animations
      cardsRef.current.forEach((card) => {
        if (!card) return;
        
        const trigger = ScrollTrigger.create({
          trigger: card,
          start: 'top 85%',
          onEnter: () => {
            gsap.fromTo(card.querySelector('.card-content'), 
              { y: 50, opacity: 0 },
              { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
            );
          },
          once: true
        });
        cardTriggers.push(trigger);
      });
    }

    // Cleanup
    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
      if (pinScrollTrigger) pinScrollTrigger.kill();
      cardTriggers.forEach(t => t.kill());
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-300 font-sans overflow-x-hidden selection:bg-amber-500/30">
      
      {/* Intro Section */}
      <section className="h-screen flex items-center justify-center relative z-10 px-6">
        <div className="text-center max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            The Flow of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">History</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400">
            Scroll down to journey through time. A cinematic timeline experience.
          </p>
        </div>
      </section>

      {/* Timeline Horizontal Scroll Section */}
      <section ref={containerRef} className="relative h-screen flex flex-col justify-center">
        
        {/* The horizontal scrolling track */}
        <div 
          ref={timelineRef} 
          className="flex flex-col md:flex-row md:items-center px-6 md:px-[10vw] gap-y-24 md:gap-y-0 md:gap-x-[20vw] py-24 md:py-0 w-full md:w-max relative z-20"
        >
          {historicalEvents.map((event, index) => (
            <div 
              key={event.id}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              className="relative w-full md:w-[450px] shrink-0 flex flex-col justify-center"
            >
              {/* Giant Background Year Watermark */}
              <div className="year-watermark absolute -top-12 md:-top-24 md:-left-20 -z-10 text-8xl md:text-[180px] font-black text-zinc-800/30 leading-none select-none tracking-tighter">
                {event.year}
              </div>

              {/* Card Content */}
              <div className="card-content opacity-0 translate-y-12 transition-none">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-8 border border-zinc-800 shadow-2xl group">
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/20 to-transparent opacity-60 z-10"></div>
                  <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  
                  {/* Glowing small year badge on image */}
                  <div className="absolute bottom-6 left-6 z-20 flex items-center gap-4">
                    <span className="text-amber-300 font-mono text-xl font-medium drop-shadow-md">
                      {event.year}
                    </span>
                    <div className="h-[1px] w-12 bg-amber-300/50"></div>
                  </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4 tracking-wide">
                  {event.title}
                </h2>
                
                <p className="text-zinc-400 leading-relaxed text-lg">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Outro Section */}
      <section className="h-[70vh] flex items-center justify-center relative z-10 px-6 border-t border-zinc-900">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-zinc-100">
            The Future Awaits
          </h2>
          <p className="text-zinc-500 text-lg">
            What will the next milestone be?
          </p>
        </div>
      </section>
      
    </div>
  );
}
