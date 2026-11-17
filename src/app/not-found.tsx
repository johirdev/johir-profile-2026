"use client";
import Link from 'next/link';
import './not-found.css'

export default function NotFound() {
  
  return (
    <>
      <main className="my-custom-face-container flex flex-col items-center justify-center">
        <svg className="face" viewBox="0 0 320 380">
          <g
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="25"
          >
            <g className="face__eyes" transform="translate(0,112.5)">
              <g transform="translate(15,0)">
                <polyline
                  className="face__eye-lid"
                  points="37,0 0,120 75,120"
                ></polyline>
                <polyline
                  className="face__pupil"
                  points="55,120 55,155"
                  stroke-dasharray="35 35"
                ></polyline>
              </g>
              <g transform="translate(230,0)">
                <polyline
                  className="face__eye-lid"
                  points="37,0 0,120 75,120"
                ></polyline>
                <polyline
                  className="face__pupil"
                  points="55,120 55,155"
                  stroke-dasharray="35 35"
                ></polyline>
              </g>
            </g>
            <rect
              className="face__nose"
              x="132.5"
              y="112.5"
              width="55"
              height="155"
              rx="4"
              ry="4"
            ></rect>
            <g transform="translate(65,334)" stroke-dasharray="102 102">
              <path
                className="face__mouth-left"
                d="M 0 30 C 0 30 40 0 95 0"
              ></path>
              <path
                className="face__mouth-right"
                d="M 95 0 C 150 0 190 30 190 30"
              ></path>
            </g>
          </g>
        </svg>
        <div className="mt-20 flex flex-col items-center text-center gap-5">
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 tracking-wide">
            This is not the page you{"'"}re looking for
          </p>

          <Link
            href="/"
            className="group relative inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_25px_rgba(0,191,255,0.25)] hover:shadow-[0_0_40px_rgba(0,191,255,0.35)]"
          >
            <span className="relative z-10">Go Home</span>

            {/* subtle glow animation */}
            <span className="absolute inset-0 rounded-xl bg-cyan-400 opacity-0 group-hover:opacity-20 blur-md transition-all duration-300" />
          </Link>
        </div>
      </main>
    </>
  );
}
