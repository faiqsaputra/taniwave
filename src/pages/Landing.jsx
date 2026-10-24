import React from 'react';
import { Leaf, Droplets, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import FIELD_IMAGE from '../assets/image/pertanian.png';


function FloatingIndicator({
  icon: Icon,
  label,
  value,
  position,
  delay = false,
}) {
  return (
    <div
      className={`absolute z-20 ${position} ${delay ? 'animate-float-delayed' : 'animate-float'
        }`}
    >
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-[#1C1810]/85 py-1.5 pl-1.5 pr-3 shadow-xl backdrop-blur-xl sm:gap-3 sm:py-2 sm:pl-2 sm:pr-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C89B3C] text-[#1C1810] sm:h-10 sm:w-10">
          <Icon size={17} strokeWidth={2.2} />
        </div>

        <div>
          <p className="text-[9px] font-medium leading-tight text-white/75 sm:text-xs">
            {label}
          </p>

          <p className="mt-0.5 whitespace-nowrap text-[11px] font-bold text-white sm:text-sm">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-8px);
            }
          }

          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .animate-float {
            animation: float 4s ease-in-out infinite;
          }

          .animate-float-delayed {
            animation: float 5s ease-in-out 1s infinite;
          }

          .animate-spin-slow {
            animation: spin-slow 24s linear infinite;
          }

          @media (max-height: 700px) {
            .landing-header {
              margin-bottom: 1.25rem;
            }

            .landing-badge {
              margin-bottom: 0.625rem;
            }

            .landing-title {
              font-size: clamp(1.7rem, 5.2vh, 2rem);
              line-height: 1.05;
            }

            .landing-description {
              margin-top: 0.625rem;
              font-size: 0.75rem;
              line-height: 1.3rem;
            }

            .landing-actions {
              margin-top: 0.75rem;
            }

            .landing-hero {
              padding-top: 1rem;
              padding-bottom: 0.75rem;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .animate-float,
            .animate-float-delayed,
            .animate-spin-slow {
              animation: none;
            }
          }
        `}
      </style>

      <main className="relative flex h-dvh w-full flex-col overflow-hidden bg-[#F4EFE3] font-sans text-[#1C1810] selection:bg-[#C89B3C] selection:text-[#1C1810]">

        {/* HEADER & HERO */}
        <section className="landing-hero relative z-10 mx-auto w-full max-w-7xl shrink-0 px-5 pb-3 pt-5 sm:px-10 sm:pb-8 sm:pt-8 lg:px-16">

          {/* Header */}
          <header className="landing-header mb-6 flex items-center justify-between sm:mb-12 lg:mb-16">
            <Link
              to="/"
              aria-label="TaniWave, halaman utama"
              className="group inline-flex items-center gap-2.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C89B3C] shadow-sm transition-transform duration-300 group-hover:rotate-6 sm:h-11 sm:w-11 sm:rounded-2xl">
                <Sprout
                  size={21}
                  strokeWidth={2.2}
                  className="text-[#1C1810]"
                />
              </div>

              <span className="text-lg font-extrabold tracking-tight text-[#1C1810] sm:text-2xl">
                TaniWave
              </span>
            </Link>

            <div className="flex items-center gap-2 rounded-full border border-[#C89B3C]/40 bg-white/50 px-3 py-1.5 sm:px-4 sm:py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A77820] sm:h-2 sm:w-2" />

              <span className="text-[9px] font-bold tracking-wide text-[#5B5142] sm:text-xs">
                SMART AGRICULTURE
              </span>
            </div>
          </header>

          {/* Hero Content */}
          <div className="max-w-3xl">

            

            <h1 className="landing-title text-[2rem] font-extrabold leading-[1.08] tracking-tight text-[#1C1810] sm:text-6xl lg:text-7xl">
              Selamat Datang di
              <br />

              <span className="text-[#A77820]">
                Masa Depan
              </span>

              <br />

              <span className="inline-flex items-center gap-2">
                <span className="text-[#A77820]">
                  Pertanian
                </span>

                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#C89B3C] text-[#A77820] sm:h-12 sm:w-12">
                  <Leaf size={19} strokeWidth={1.8} className="sm:hidden" />
                  <Leaf size={27} strokeWidth={1.8} className="hidden sm:block" />
                </span>
              </span>
            </h1>

            <p className="landing-description mt-3 max-w-md text-xs font-medium leading-5 text-[#5B5142] sm:mt-6 sm:text-base sm:leading-8 lg:text-lg">
              Memberdayakan petani muda dengan informasi, teknologi, dan
              solusi cerdas untuk pertanian yang lebih produktif dan
              berkelanjutan.
            </p>

            {/* CTA */}
            <div className="landing-actions mt-4 sm:mt-8">
              <Link
                to="/dashboard"
                className="group inline-flex min-h-10 items-center justify-center gap-3 rounded-full bg-[#C89B3C] px-6 py-2.5 text-xs font-bold text-[#1C1810] shadow-[0_6px_20px_rgba(122,83,20,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#D7AD5B] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A641D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4EFE3] sm:min-h-12 sm:px-7 sm:py-3.5 sm:text-sm"
              >
                Mulai Sekarang

                <span className="text-base transition-transform duration-300 group-hover:translate-x-1 sm:text-lg">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>
        {/* VISUAL: MENGISI SISA LAYAR */}
        <section className="relative min-h-0 flex-1 overflow-hidden">

          {/* Background Image */}
          <div
            aria-hidden="true"
            className="absolute inset-0 scale-[1.02] bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${FIELD_IMAGE})`,
            }}
          />

          {/* Gradient agar gambar menyatu dengan hero */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
        linear-gradient(
          to bottom,
          #F4EFE3 0%,
          rgba(244, 239, 227, 0.92) 7%,
          rgba(244, 239, 227, 0.68) 18%,
          rgba(244, 239, 227, 0.30) 32%,
          rgba(244, 239, 227, 0.05) 48%,
          rgba(28, 24, 16, 0.25) 70%,
          rgba(28, 24, 16, 0.78) 100%
        )
      `,
            }}
          />

          <div className="relative mx-auto h-full min-h-0 w-full max-w-7xl">

            {/* Growth Indicator */}
            <FloatingIndicator
              icon={Leaf}
              label="Pertumbuhan tanaman"
              value="+14 cm"
              position="left-[5%] top-[12%] sm:left-[10%] sm:top-[15%] lg:left-[15%]"
            />

            {/* Center Circle */}
            <div className="absolute left-1/2 top-[38%] z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="relative flex h-28 w-28 items-center justify-center sm:h-48 sm:w-48 lg:h-56 lg:w-56">

                <div className="animate-spin-slow absolute inset-0 rounded-full border-2 border-dashed border-white/70" />

                <div className="absolute inset-2 rounded-full border border-white/30 sm:inset-4" />

                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/15 shadow-2xl backdrop-blur-sm sm:h-28 sm:w-28">
                  <Sprout
                    size={32}
                    strokeWidth={1.4}
                    className="text-white sm:hidden"
                  />

                  <Sprout
                    size={48}
                    strokeWidth={1.4}
                    className="hidden text-white sm:block"
                  />
                </div>

              </div>
            </div>

            {/* Humidity Indicator */}
            <FloatingIndicator
              icon={Droplets}
              label="Kelembapan tanah"
              value="78%"
              position="right-[4%] top-[57%] sm:right-[10%] sm:top-[55%] lg:right-[15%]"
              delay
            />

            {/* Bottom Caption */}
            <div className="absolute bottom-4 left-5 right-5 z-20 sm:bottom-10 sm:left-10 sm:right-10 lg:left-16 lg:right-16">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#F0CF86] sm:text-xs">
                Grow with technology
              </p>

              <p className="mt-1 max-w-xs text-base font-bold leading-snug text-white sm:mt-2 sm:text-2xl">
                Pertanian cerdas,
                <br />
                masa depan berkualitas.
              </p>
            </div>

          </div>
        </section>
      </main>
    </>
  );
}