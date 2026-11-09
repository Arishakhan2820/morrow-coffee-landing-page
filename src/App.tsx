import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Coffee,
  Droplets,
  Facebook,
  Instagram,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Menu,
  Milk,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import ScrollSequence from "./components/ScrollSequence";

gsap.registerPlugin(ScrollTrigger);

type Drink = {
  id: string;
  name: string;
  note: string;
  description: string;
  tastingNote: string;
  price: string;
  image: string;
  hoverImage: string;
};

const drinks: Drink[] = [
  {
    id: "caramel-latte",
    name: "Caramel Latte",
    note: "SWEET · CREAMY · SMOOTH",
    description: "Velvety iced coffee layered with milk and a warm caramel finish.",
    tastingNote: "Espresso, chilled milk, caramel and a soft cloud of cream.",
    price: "$6.25",
    image: "/products/caramel-latte/product.webp",
    hoverImage: "/products/caramel-latte/product-hover.webp",
  },
  {
    id: "classic-iced-coffee",
    name: "Classic Iced Coffee",
    note: "BOLD · BALANCED · COLD",
    description: "A clean, full-bodied coffee poured over ice and made to linger.",
    tastingNote: "Slow-brewed coffee, fresh ice and a touch of silky milk.",
    price: "$5.25",
    image: "/products/classic-iced-coffee/product-hover.webp",
    hoverImage: "/products/classic-iced-coffee/product.webp",
  },
  {
    id: "cookies-and-cream",
    name: "Cookies & Cream",
    note: "DARK COCOA · CREAM · CRUNCH",
    description: "Rich coffee, cool cream and a little chocolate-cookie indulgence.",
    tastingNote: "Espresso, cream, chocolate-cookie crumble and a cocoa finish.",
    price: "$6.50",
    image: "/products/cookies-and-cream/product-hover.webp",
    hoverImage: "/products/cookies-and-cream/product.webp",
  },
  {
    id: "dark-chocolate-black",
    name: "Dark Chocolate Black",
    note: "DEEP · DARK · INTENSE",
    description: "Bright, chilled coffee with a lasting ribbon of dark chocolate.",
    tastingNote: "Chilled black coffee finished with bittersweet dark chocolate.",
    price: "$5.75",
    image: "/products/dark-chocolate-black/product.webp",
    hoverImage: "/products/dark-chocolate-black/product-hover.webp",
  },
  {
    id: "dark-chocolate-iced",
    name: "Dark Chocolate Iced",
    note: "COOL · SILKY · COCOA",
    description: "A smooth iced blend with deep cocoa notes and a creamy finish.",
    tastingNote: "Espresso, ice, dark chocolate and a smooth milk finish.",
    price: "$5.95",
    image: "/products/dark-chocolate-iced/product.webp",
    hoverImage: "/products/dark-chocolate-iced/product-hover.webp",
  },
  {
    id: "vanilla-iced-coffee",
    name: "Vanilla Iced Coffee",
    note: "SOFT · AROMATIC · EASY",
    description: "A familiar coffee-and-cream moment with a gentle vanilla lift.",
    tastingNote: "Cold coffee, vanilla, chilled milk and plenty of ice.",
    price: "$5.75",
    image: "/products/vanilla-iced-coffee/product.webp",
    hoverImage: "/products/vanilla-iced-coffee/product-hover.webp",
  },
];

const ingredients = [
  {
    icon: Coffee,
    name: "100% Single-Origin Arabica Beans",
    tagline: "The Pure Heart of Our Coffee",
    description:
      "Carefully sourced from high-altitude estates, our premium Arabica beans are medium-dark roasted to unlock rich chocolatey tones and smooth acidity with zero bitterness.",
  },
  {
    icon: Droplets,
    name: "Slow Cold-Drip Extraction",
    tagline: "Brewed Patiently for 16 Hours",
    description:
      "We never rush goodness. Steeped in icy water for 16 long hours, our cold brew extracts maximum flavor with 67% less acidity than traditional hot coffee.",
  },
  {
    icon: Milk,
    name: "Velvet Whole Milk & Plant-Based Alternatives",
    tagline: "Creamy, Rich & Perfectly Balanced",
    description:
      "Blended with rich farm-fresh whole milk for that signature velvety texture. Prefer dairy-free? Switch effortlessly to our creamy Oat, Almond, or Coconut blends.",
  },
  {
    icon: Leaf,
    name: "Pure Organic Sweeteners & Natural Extracts",
    tagline: "Naturally Sweetened, Zero Refined Sugars",
    description:
      "Infused with pure Madagascar vanilla beans, raw organic cane sugar, and artisan dark chocolate. Sweetened just enough to highlight—never mask—the rich espresso flavor.",
  },
] as const;

function DrinkCard({ drink, featured = false }: { drink: Drink; featured?: boolean }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsId = useId();
  const orderHref = `mailto:hello@morrowcoffee.example?subject=${encodeURIComponent(`Order ${drink.name}`)}`;

  return (
    <article className={`drink-card${featured ? " signature-card" : ""}`}>
      <a className="drink-visual" href={orderHref} aria-label={`Order ${drink.name}`}>
        <img className="drink-image drink-image-main" src={drink.image} alt={drink.name} loading="lazy" />
        <img
          className="drink-image drink-image-hover"
          src={drink.hoverImage}
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
        <span className="drink-visual-note">{drink.note}</span>
      </a>
      <div className="drink-information">
        <div className="drink-title-row">
          <h3>{drink.name}</h3>
          <span className="drink-price">{drink.price}</span>
        </div>
        <p>{drink.description}</p>
        {featured ? (
          <a className="drink-order-link" href={orderHref}>
            Order now <ArrowUpRight size={15} strokeWidth={1.5} />
          </a>
        ) : (
          <>
            <div className="drink-actions">
              <button
                aria-expanded={detailsOpen}
                aria-controls={detailsId}
                className="drink-view-button"
                onClick={() => setDetailsOpen((open) => !open)}
                type="button"
              >
                {detailsOpen ? "Close details" : "View details"}
              </button>
              <a
                aria-label={`Order ${drink.name}`}
                className="drink-order-link"
                href={orderHref}
              >
                Order now <ArrowUpRight size={15} strokeWidth={1.5} />
              </a>
            </div>
            {detailsOpen && (
              <p className="drink-tasting-note" id={detailsId}>
                {drink.tastingNote}
              </p>
            )}
          </>
        )}
      </div>
    </article>
  );
}

export default function App() {
  const lenisRef = useRef<Lenis | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = reducedMotion
      ? null
      : new Lenis({
          autoRaf: false,
          duration: 0.9,
          smoothWheel: true,
          touchMultiplier: 1.3,
        anchors: { duration: 0.7 },
      });
    lenisRef.current = lenis;

    const onScroll = () => ScrollTrigger.update();
    const onTick = (time: number) => lenis?.raf(time * 1000);

    lenis?.on("scroll", onScroll);
    if (lenis) gsap.ticker.add(onTick);

    const context = gsap.context(() => {
      if (reducedMotion) return;

      gsap.fromTo(
        ".brand-drink-art-primary",
        {
          y: () => (window.matchMedia("(max-width: 760px)").matches ? 0 : 70),
          rotate: () => (window.matchMedia("(max-width: 760px)").matches ? 0 : -5),
          scale: () => (window.matchMedia("(max-width: 760px)").matches ? 1 : 0.9),
        },
        {
          y: () => (window.matchMedia("(max-width: 760px)").matches ? 0 : -50),
          rotate: () => (window.matchMedia("(max-width: 760px)").matches ? 0 : 5),
          scale: () => (window.matchMedia("(max-width: 760px)").matches ? 1 : 1.04),
          ease: "none",
          scrollTrigger: {
            trigger: ".brand-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 34 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 86%",
              once: true,
            },
          },
        );
      });
    });

    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      context.revert();
      lenis?.off("scroll", onScroll);
      lenis?.destroy();
      lenisRef.current = null;
      gsap.ticker.remove(onTick);
    };
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileNavOpen]);

  const handleBackToTop = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.history.replaceState(null, "", "#home");
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    }
  };

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main">
        <ScrollSequence
          header={
            <header className="site-header">
              <a aria-label="Morrow home" className="wordmark" href="#home" onClick={handleBackToTop}>
                morrow<span className="wordmark-period">.</span>
              </a>
              <nav
                aria-label="Main navigation"
                className={`desktop-nav${mobileNavOpen ? " is-open" : ""}`}
                id="primary-navigation"
              >
                <a href="#home" onClick={() => setMobileNavOpen(false)}>Home</a>
                <a href="#signature" onClick={() => setMobileNavOpen(false)}>Signature</a>
                <a href="#brand" onClick={() => setMobileNavOpen(false)}>Our mood</a>
                <a href="#collection" onClick={() => setMobileNavOpen(false)}>Drinks</a>
                <a href="#ingredients" onClick={() => setMobileNavOpen(false)}>Ingredients</a>
                <a href="#why-us" onClick={() => setMobileNavOpen(false)}>Why Morrow</a>
                <a className="mobile-nav-order" href="#collection" onClick={() => setMobileNavOpen(false)}>
                  Order a drink <ArrowUpRight size={14} strokeWidth={1.5} />
                </a>
              </nav>
              <a className="header-cta" href="#collection" onClick={() => setMobileNavOpen(false)}>
                Order a drink <ArrowUpRight size={14} strokeWidth={1.5} />
              </a>
              <button
                aria-controls="primary-navigation"
                aria-expanded={mobileNavOpen}
                aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
                className="mobile-menu-toggle"
                onClick={() => setMobileNavOpen((open) => !open)}
                ref={mobileMenuButtonRef}
                type="button"
              >
                {mobileNavOpen ? <X size={21} strokeWidth={1.6} /> : <Menu size={21} strokeWidth={1.6} />}
              </button>
            </header>
          }
          opening={
            <>
              <div className="opening-light" aria-hidden="true" />
              <div className="opening-copy">
                <motion.span
                  className="opening-kicker"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.12 }}
                >
                  AN ICED COFFEE, RECONSIDERED
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  Make room
                  <br />
                  for <em>nothing.</em>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.85, delay: 0.48 }}
                >
                  A little less hurry.
                  <br />
                  A lot more here.
                </motion.p>
              </div>
            </>
          }
        />

        <section aria-labelledby="signature-heading" className="signature-section" id="signature">
          <div className="section-intro reveal">
            <span className="section-index">02 / SIGNATURE DRINKS</span>
            <h2 id="signature-heading">
              Meet Your <em>New Obsession.</em>
            </h2>
            <p>Made slowly. Remembered long after the last sip.</p>
          </div>
          <div className="signature-grid">
            {[drinks[0], drinks[2], drinks[1]].map((drink) => (
              <div className="reveal" key={drink.id}>
                <DrinkCard drink={drink} featured />
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="brand-heading" className="brand-section" id="brand">
          <div className="brand-copy reveal">
            <span className="section-index">03 / BRAND EXPERIENCE</span>
            <h2 id="brand-heading">
              Not Just Coffee.
              <br />
              <em>It&apos;s a Mood.</em>
            </h2>
            <p>
              A familiar ritual, made a little more special. Thoughtful flavours, a softer
              pace, and a reason to be right where you are.
            </p>
            <a className="editorial-link" href="#collection">
              FIND YOUR MOMENT <ArrowUpRight size={15} strokeWidth={1.5} />
            </a>
          </div>
          <div className="brand-art-stage" aria-label="Iced coffee with splashing caramel, coffee beans and ice">
            <span className="brand-art-halo brand-art-halo-one" aria-hidden="true" />
            <span className="brand-art-halo brand-art-halo-two" aria-hidden="true" />
            <img
              alt=""
              aria-hidden="true"
              className="brand-bean-art brand-bean-art-one"
              src="/assets/coffee-bean.webp"
            />
            <img
              alt=""
              aria-hidden="true"
              className="brand-bean-art brand-bean-art-two"
              src="/assets/coffee-bean.webp"
            />
            <img
              alt="Iced coffee, caramel splash, ice and coffee beans"
              className="brand-drink-art brand-drink-art-primary"
              decoding="async"
              loading="lazy"
              src="/assets/iced-coffee-art.webp"
            />
            <span className="brand-art-caption">A LITTLE SPACE TO SLOW DOWN</span>
          </div>
        </section>

        <section aria-labelledby="collection-heading" className="collection-section" id="collection">
          <div className="collection-heading reveal">
            <div>
              <span className="section-index">04 / THE FULL COLLECTION</span>
              <h2 id="collection-heading">
                Find Your <em>Perfect Sip.</em>
              </h2>
            </div>
            <p>Six little reasons to take the long way round.</p>
          </div>
          <div className="collection-grid">
            {drinks.map((drink) => (
              <div className="reveal" id={`drink-${drink.id}`} key={drink.id}>
                <DrinkCard drink={drink} />
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="ingredients-heading" className="ingredients-section" id="ingredients">
          <div className="ingredients-heading reveal">
            <span className="section-index">05 / OUR COFFEE INGREDIENTS</span>
            <h2 id="ingredients-heading">
              What Makes Our Brew <em>Exceptional?</em>
            </h2>
            <p>
              Premium quality in every single sip. Crafted with passion, chilled to perfection.
            </p>
          </div>
          <div className="ingredients-grid">
            {ingredients.map(({ icon: Icon, name, tagline, description }, index) => (
              <article className="ingredient-card reveal" key={name}>
                <div className="ingredient-card-top">
                  <span className="ingredient-card-icon" aria-hidden="true">
                    <Icon size={25} strokeWidth={1.35} />
                  </span>
                  <span className="ingredient-card-number">0{index + 1}</span>
                </div>
                <h3>{name}</h3>
                <p className="ingredient-card-tagline">{tagline}</p>
                <p className="ingredient-card-description">{description}</p>
              </article>
            ))}
          </div>
          <img
            alt=""
            aria-hidden="true"
            className="ingredients-bean-art"
            decoding="async"
            loading="lazy"
            src="/assets/coffee-bean.webp"
          />
          <span className="ingredients-art-caption" aria-hidden="true">THE GOOD STUFF, NOTHING MORE</span>
        </section>

        <section aria-labelledby="featured-heading" className="featured-section" id="featured">
          <img
            alt=""
            aria-hidden="true"
            className="featured-section-wave"
            decoding="async"
            loading="lazy"
            src="/assets/chocolate-hazelnut-splash.png"
          />
          <div className="featured-visual-stage">
            <img
              alt="Iced coffee poured with milk over ice"
              className="featured-coffee-glass"
              decoding="async"
              loading="lazy"
              src="/assets/iced-coffee-glass.png"
            />
          </div>
          <div className="featured-copy">
            <motion.span
              className="section-index"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6 }}
            >
              07 / THE ONE TO KNOW
            </motion.span>
            <motion.h2
              id="featured-heading"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: 0.08 }}
            >
              One Sip.
              <br />
              <em>Instant Obsession.</em>
            </motion.h2>
            <p>A silky caramel latte with just the right kind of sweetness.</p>
            <a className="featured-button" href="mailto:hello@morrowcoffee.example?subject=Order%20Caramel%20Latte">
              Meet the Caramel Latte <ArrowUpRight size={15} strokeWidth={1.5} />
            </a>
          </div>
          <span className="featured-index">MORROW / 001</span>
        </section>

        <section aria-labelledby="why-heading" className="why-section" id="why-us">
          <div className="section-intro reveal">
            <span className="section-index">08 / THE MORROW WAY</span>
            <h2 id="why-heading">
              Little Things. <em>Done Beautifully.</em>
            </h2>
          </div>
          <div className="values-grid">
            <motion.article className="value-card" whileHover={{ y: -5 }} transition={{ duration: 0.25 }}>
              <motion.span className="value-icon" whileInView={{ rotate: [0, -8, 0] }} viewport={{ once: true }}>
                <Coffee size={25} strokeWidth={1.3} />
              </motion.span>
              <span className="value-number">01</span>
              <h3>Made fresh, always</h3>
              <p>Every cup is prepared to order, with care in every pour.</p>
            </motion.article>
            <motion.article className="value-card" whileHover={{ y: -5 }} transition={{ duration: 0.25 }}>
              <motion.span className="value-icon" whileInView={{ y: [0, -5, 0] }} viewport={{ once: true }}>
                <Droplets size={25} strokeWidth={1.3} />
              </motion.span>
              <span className="value-number">02</span>
              <h3>Quality ingredients</h3>
              <p>Thoughtful ingredients meet flavours worth slowing down for.</p>
            </motion.article>
            <motion.article className="value-card" whileHover={{ y: -5 }} transition={{ duration: 0.25 }}>
              <motion.span className="value-icon" whileInView={{ scale: [1, 1.12, 1] }} viewport={{ once: true }}>
                <Sparkles size={25} strokeWidth={1.3} />
              </motion.span>
              <span className="value-number">03</span>
              <h3>Creamy, memorable moments</h3>
              <p>Silky flavours turn an everyday coffee break into a little ritual.</p>
            </motion.article>
          </div>
        </section>

        <section aria-labelledby="final-heading" className="final-section" id="final">
          <div className="final-glow" aria-hidden="true" />
          <div className="final-copy reveal">
            <span className="section-index">09 / YOUR NEXT MOMENT</span>
            <h2 id="final-heading">
              Your Next Favorite
              <br />
              Is Just a <em>Sip Away.</em>
            </h2>
            <a className="final-button" href="#collection">
              Explore the Drinks <ArrowRight size={16} strokeWidth={1.5} />
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="contact">
        <div className="footer-main">
          <div className="footer-brand">
            <a
              aria-label="Morrow, back to top"
              className="wordmark footer-wordmark"
              href="#home"
              onClick={handleBackToTop}
            >
              morrow<span className="wordmark-period">.</span>
            </a>
            <p>A slower kind of coffee. A little more room to be here.</p>
            <div className="footer-socials" aria-label="Contact and social links">
              <a className="footer-social" aria-label="Instagram" href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                <Instagram size={16} strokeWidth={1.5} />
              </a>
              <a className="footer-social" aria-label="Email" href="mailto:hello@morrowcoffee.example">
                <Mail size={16} strokeWidth={1.5} />
              </a>
              <a className="footer-social" aria-label="Facebook" href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                <Facebook size={16} strokeWidth={1.5} />
              </a>
              <a className="footer-social" aria-label="Call" href="tel:+15550142026">
                <Phone size={16} strokeWidth={1.5} />
              </a>
            </div>
          </div>
          <div className="footer-column">
            <span className="footer-heading">EXPLORE MORROW</span>
            <a href="#home">Home <ArrowRight size={13} /></a>
            <a href="#signature">Signature drinks <ArrowRight size={13} /></a>
            <a href="#brand">Our mood <ArrowRight size={13} /></a>
            <a href="#collection">Full collection <ArrowRight size={13} /></a>
            <a href="#ingredients">Our ingredients <ArrowRight size={13} /></a>
            <a href="#why-us">Why Morrow <ArrowRight size={13} /></a>
          </div>
          <div className="footer-column footer-contact">
            <span className="footer-heading">SAY HELLO</span>
            <a href="mailto:hello@morrowcoffee.example">
              <Mail size={15} strokeWidth={1.5} /> hello@morrowcoffee.example
            </a>
            <a href="tel:+15550142026">
              <Phone size={15} strokeWidth={1.5} /> +1 (555) 014-2026
            </a>
            <a href="https://wa.me/15550142026" target="_blank" rel="noreferrer">
              <MessageCircle size={15} strokeWidth={1.5} /> WhatsApp
            </a>
            <span className="footer-address">
              <MapPin size={15} strokeWidth={1.5} /> Made for the in-between.
            </span>
          </div>
          <a className="footer-order-button" href="#collection">
            Explore drinks <ArrowUpRight size={15} strokeWidth={1.5} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 MORROW COFFEE. TAKE YOUR TIME.</span>
          <a href="#home" onClick={handleBackToTop}>
            BACK TO TOP <ArrowUp size={12} strokeWidth={1.5} />
          </a>
        </div>
      </footer>
      <a className="coffee-bean-top" aria-label="Back to top" href="#home" onClick={handleBackToTop}>
        <img src="/assets/coffee-bean.webp" alt="" />
      </a>
    </>
  );
}
