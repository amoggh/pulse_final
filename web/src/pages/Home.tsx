import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import TextType from '../components/TextType'
import PulseAnimation from '../components/PulseAnimation'
import SmoothScroll from '../components/SmoothScroll'
import CountUp from '../components/CountUp'
import AnimatedNav from '../components/AnimatedNav'

interface TokenPayload {
  sub: string
  role?: string
}

const featureIconMap = {
  analytics: (
    <svg viewBox="0 0 32 32" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 26V14" strokeLinecap="round" />
      <path d="M13 26V8" strokeLinecap="round" />
      <path d="M20 26V4" strokeLinecap="round" />
      <path d="M27 26V16" strokeLinecap="round" />
      <path d="M4 26h24" strokeLinecap="round" />
    </svg>
  ),
  lightning: (
    <svg viewBox="0 0 32 32" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 3 8 18h8l-2 11 10-15h-8z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 32 32" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 21.5a5 5 0 0 1 0-7l3-3a5 5 0 0 1 7 7l-1 1" strokeLinecap="round" />
      <path d="M21 10.5a5 5 0 0 1 0 7l-3 3a5 5 0 0 1-7-7l1-1" strokeLinecap="round" />
    </svg>
  ),
  trend: (
    <svg viewBox="0 0 32 32" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="m4 20 7-8 6 6 11-12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 6h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 32 32" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 28s10-4 10-14V8l-10-4-10 4v6c0 10 10 14 10 14z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16l2 2 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 32 32" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="16" cy="12" r="4.5" />
      <path d="M8 26c0-4.2 3.6-7.5 8-7.5s8 3.3 8 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
} as const

type FeatureIconKey = keyof typeof featureIconMap

const features: Array<{ title: string; description: string; icon: FeatureIconKey }> = [
  {
    title: 'Advanced Analytics',
    description: 'Leverage cutting-edge AI and machine learning for accurate predictions and insights.',
    icon: 'analytics',
  },
  {
    title: 'Real-Time Alerts',
    description: 'Get instant notifications about critical situations and capacity changes.',
    icon: 'lightning',
  },
  {
    title: 'Seamless Integration',
    description: 'Connect with existing hospital systems and workflows effortlessly.',
    icon: 'link',
  },
  {
    title: 'Resource Optimization',
    description: 'Maximize efficiency by intelligently allocating staff and equipment.',
    icon: 'trend',
  },
  {
    title: 'Data Security',
    description: 'Enterprise-grade security ensures patient data privacy and compliance.',
    icon: 'shield',
  },
  {
    title: 'Patient-Centric',
    description: 'Designed with both patients and healthcare providers in mind.',
    icon: 'users',
  },
]

export default function Home() {
  const location = useLocation()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [heroLineOneComplete, setHeroLineOneComplete] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('pulse_token')
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token)
        setUserEmail(decoded.sub)
        setIsLoggedIn(true)
      } catch (error) {
        // Invalid token
        setIsLoggedIn(false)
        setUserEmail(null)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('pulse_token')
    setUserEmail(null)
    setIsLoggedIn(false)
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SmoothScroll />
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 rounded-b-2xl mx-4 mt-2">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Left */}
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-white hover:text-neutral-300 transition-colors">
                PULSE
              </Link>
            </div>

            {/* Navigation Links - Center (Desktop) */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <AnimatedNav
                items={[
                  { label: 'About', onClick: () => scrollToSection('about') },
                  { label: 'Facts', onClick: () => scrollToSection('facts') },
                  { label: 'Features', onClick: () => scrollToSection('features') },
                  { label: 'Benefits', onClick: () => scrollToSection('benefits') },
                  { label: 'Dashboard', href: '/dashboard' },
                ]}
                activeHref={location.pathname}
                baseColor="#fff"
                pillColor="rgba(132, 0, 255, 0.15)"
                hoverTextColor="#fff"
              />
            </div>

            {/* User Profile - Right */}
            <div className="flex items-center gap-4">
              {isLoggedIn && userEmail ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 bg-neutral-900">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{userEmail}</div>
                      <div className="text-xs text-neutral-400">Account</div>
                    </div>
                  </div>
                  <div className="sm:hidden">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="hidden sm:block px-4 py-2 text-sm text-neutral-300 hover:text-white border border-neutral-700 rounded-lg hover:border-neutral-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-neutral-300 hover:text-white"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-neutral-800">
              <div className="flex flex-col gap-4 pt-4">
                <button
                  onClick={() => {
                    scrollToSection('about')
                    setMobileMenuOpen(false)
                  }}
                  className="text-left text-neutral-300 hover:text-white transition-colors py-2"
                >
                  About
                </button>
                <button
                  onClick={() => {
                    scrollToSection('facts')
                    setMobileMenuOpen(false)
                  }}
                  className="text-left text-neutral-300 hover:text-white transition-colors py-2"
                >
                  Facts
                </button>
                <button
                  onClick={() => {
                    scrollToSection('features')
                    setMobileMenuOpen(false)
                  }}
                  className="text-left text-neutral-300 hover:text-white transition-colors py-2"
                >
                  Features
                </button>
                <button
                  onClick={() => {
                    scrollToSection('benefits')
                    setMobileMenuOpen(false)
                  }}
                  className="text-left text-neutral-300 hover:text-white transition-colors py-2"
                >
                  Benefits
                </button>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-neutral-300 hover:text-white transition-colors py-2"
                >
                  Dashboard
                </Link>
                {isLoggedIn && (
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="text-left text-neutral-300 hover:text-white transition-colors py-2 border-t border-neutral-800 pt-4"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 pt-24 overflow-hidden border-b border-purple-500/20">
        {/* Pulse Animation Background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <PulseAnimation
            color={[1.0, 0.2, 0.3]}
            pulseSpeed={1.5}
            glowIntensity={0.4}
            className="w-full h-full"
          />
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight tracking-tight">
            <TextType
              text="Prevention is better than cure"
              as="span"
              typingSpeed={50}
              initialDelay={300}
              showCursor={true}
              cursorCharacter="|"
              cursorBlinkDuration={0.8}
              className="text-gradient drop-shadow-lg"
              loop={false}
              onSentenceComplete={() => setHeroLineOneComplete(true)}
            />
          </h1>
          <p className="text-2xl md:text-3xl lg:text-4xl text-neutral-300 mb-12">
            {heroLineOneComplete && (
              <TextType
                text="Not only for the patients, but for hospitals too"
                as="span"
                typingSpeed={50}
                initialDelay={0}
                showCursor={true}
                cursorCharacter="|"
                cursorBlinkDuration={0.8}
                className="text-neutral-300"
                loop={false}
              />
            )}
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link
              to="/login"
              className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Get Started
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 glass-button text-white font-semibold rounded-full hover:scale-105 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* What is this website about Section */}
      <section id="about" className="py-24 px-6 relative border-b border-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center text-gradient-primary">What is PULSE?</h2>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="p-8 glass-panel rounded-2xl pulse-glow-border">
              <h3 className="text-2xl font-semibold mb-3">What is PULSE?</h3>
              <p className="text-neutral-400 mb-4">
                PULSE is an agentic AI system that stands for Predictive Unified Load and Surge Estimator. It is a revolutionary healthcare management platform designed to predict, unify,
                load balance, and estimate surge capacity for hospitals. Our mission is to transform
                healthcare delivery by providing intelligent insights that help prevent crises before
                they occur.
              </p>
              <p className="text-neutral-400">
                By leveraging advanced analytics and real-time data, PULSE empowers both patients
                and healthcare providers to make informed decisions, optimize resource allocation,
                and ensure better patient outcomes.
              </p>
            </div>
            <div className="space-y-6">
              <div className="p-6 glass-panel rounded-xl pulse-glow-border hover:bg-white/10 transition-colors">
                <h3 className="text-2xl font-semibold mb-3">Predict</h3>
                <p className="text-neutral-400">
                  Forecast patient influx and resource needs with advanced machine learning models.
                </p>
              </div>
              <div className="p-6 glass-panel rounded-xl pulse-glow-border hover:bg-white/10 transition-colors">
                <h3 className="text-2xl font-semibold mb-3">Unify</h3>
                <p className="text-neutral-400">
                  Integrate data from multiple sources for a comprehensive view of hospital operations.
                </p>
              </div>
              <div className="p-6 glass-panel rounded-xl pulse-glow-border hover:bg-white/10 transition-colors">
                <h3 className="text-2xl font-semibold mb-3">Load Balance</h3>
                <p className="text-neutral-400">
                  Optimize resource distribution across departments and facilities.
                </p>
              </div>
              <div className="p-6 glass-panel rounded-xl pulse-glow-border hover:bg-white/10 transition-colors">
                <h3 className="text-2xl font-semibold mb-3">Surge Estimate</h3>
                <p className="text-neutral-400">
                  Anticipate capacity needs during peak times and emergencies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facts Section */}
      <section id="facts" className="py-24 px-6 relative overflow-hidden border-b border-purple-500/20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-gradient-primary">Key Facts</h2>
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            <div className="text-center p-10 glass-panel rounded-2xl pulse-glow-border transition-all hover:-translate-y-2">
              <div className="text-5xl font-bold mb-4 text-white">
                <CountUp to={80} duration={2} />%
              </div>
              <h3 className="text-xl font-semibold mb-3">Reduction in Wait Times</h3>
              <p className="text-neutral-400">
                Hospitals using predictive analytics see significant improvements in patient flow.
              </p>
            </div>
            <div className="text-center p-10 glass-panel rounded-2xl pulse-glow-border transition-all hover:-translate-y-2">
              <div className="text-5xl font-bold mb-4 text-white">
                <CountUp to={50} duration={2} />+
              </div>
              <h3 className="text-xl font-semibold mb-3">Hospitals Connected</h3>
              <p className="text-neutral-400">
                Our network spans across multiple healthcare facilities nationwide.
              </p>
            </div>
            <div className="text-center p-10 glass-panel rounded-2xl pulse-glow-border transition-all hover:-translate-y-2">
              <div className="text-5xl font-bold mb-4 text-white">
                <CountUp to={24} duration={2} />/7
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Monitoring</h3>
              <p className="text-neutral-400">
                Continuous surveillance and alerts ensure proactive healthcare management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative border-b border-purple-500/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-gradient-primary">Why Choose PULSE?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(feature => (
              <div key={feature.title} className="p-8 glass-panel rounded-2xl pulse-glow-border hover:bg-white/5 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white">
                  {featureIconMap[feature.icon]}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-neutral-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-6 relative overflow-hidden border-b border-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-gradient-primary">Benefits</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-semibold mb-6">For Patients</h3>
              <ul className="space-y-4 text-lg text-neutral-300">
                <li className="flex items-start">
                  <span className="mr-3 text-white">✓</span>
                  <span>Reduced waiting times and faster access to care</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-white">✓</span>
                  <span>Better resource availability when you need it</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-white">✓</span>
                  <span>Improved quality of care through optimized operations</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-white">✓</span>
                  <span>Transparent information about hospital capacity</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-3xl font-semibold mb-6">For Hospitals</h3>
              <ul className="space-y-4 text-lg text-neutral-300">
                <li className="flex items-start">
                  <span className="mr-3 text-white">✓</span>
                  <span>Predictive insights for better planning</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-white">✓</span>
                  <span>Optimized resource allocation and cost savings</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-white">✓</span>
                  <span>Enhanced patient satisfaction and outcomes</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-white">✓</span>
                  <span>Data-driven decision making capabilities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative border-b border-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-gradient">Ready to Transform Healthcare?</h2>
          <p className="text-xl text-neutral-300 mb-10">
            Join us in revolutionizing healthcare management. Get started today and experience
            the power of predictive healthcare analytics.
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link
              to="/login"
              className="px-10 py-5 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)] text-lg"
            >
              Sign Up Now
            </Link>
            <Link
              to="/dashboard"
              className="px-10 py-5 glass-button text-white font-semibold rounded-full hover:scale-105 transition-all text-lg"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-purple-500/20 bg-black/50 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <Link to="/" className="text-2xl font-bold text-white hover:text-neutral-300 transition-colors">
              PULSE
            </Link>
            <p className="text-neutral-400 mt-2 text-sm">
              Predictive Unified Load and Surge Estimator
            </p>
          </div>
          <div className="flex gap-8 text-sm text-neutral-400">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} PULSE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

