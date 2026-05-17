import React from "react";
import { Link } from "react-router-dom";

function About() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <section className="panel-glass max-w-[450px] w-full animate-slide-in">
        <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">About Page</p>
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          About Trace
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-8">
          Routing and Tailwind CSS are now fully operational. This is the About Route demonstrating component separation.
        </p>
        <nav>
          <Link to="/" className="text-primary font-semibold hover:underline flex items-center gap-2">
            <span>←</span> Back Home
          </Link>
        </nav>
      </section>
    </div>
  );
}

export default About;
