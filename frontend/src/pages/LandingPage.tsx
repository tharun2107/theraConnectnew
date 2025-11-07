import React from 'react'
import { Link } from 'react-router-dom'
import LandingNavbar from '../components/LandingNavbar'
import { Heart, Users, Stethoscope, Shield, Star, Play } from 'lucide-react'

const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white overflow-hidden">
      {/* Navbar */}
      <LandingNavbar />

      {/* Hero Section with diagonal square grid */}
      <section className="relative py-24 text-center overflow-hidden group">
        {/* Light mode diagonal squares */}
        <div
          className="absolute inset-0 dark:hidden transition-all duration-700 ease-in-out opacity-70 group-hover:opacity-100 group-hover:scale-105 group-hover:brightness-200"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          }}
        />

        {/* Dark mode diagonal squares */}
        <div
          className="absolute inset-0 hidden dark:block transition-all duration-700 ease-in-out opacity-70 group-hover:opacity-100 group-hover:scale-105 group-hover:brightness-125"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
            Connect with the Best
            <span className="text-primary-600 dark:text-primary-400 block">
              Therapy Services
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Therabee bridges the gap between families seeking quality therapy and professional therapists, making mental health support accessible and convenient.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register/parent"
              className="btn btn-primary btn-lg flex items-center justify-center space-x-2 hover:scale-105 transition-transform"
            >
              <Users className="h-5 w-5" />
              <span>Join as Parent</span>
            </Link>
            <Link
              to="/login"
              className="btn btn-outline btn-lg flex items-center justify-center space-x-2 hover:scale-105 transition-transform"
            >
              <span>Sign In</span>
            </Link>
            <button className="btn btn-outline btn-lg flex items-center justify-center space-x-2 hover:scale-105 transition-transform">
              <Play className="h-5 w-5" />
              <span>Watch Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Why Choose Therabee?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            A comprehensive platform that makes therapy accessible, convenient, and effective.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="p-6 rounded-xl bg-gray-100 dark:bg-black dark:border dark:border-gray-700 hover:shadow-lg transition-all">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Families</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Easily find qualified therapists, manage your children's therapy sessions, and track progress all in one place.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-100 dark:bg-black dark:border dark:border-gray-700 hover:shadow-lg transition-all">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Therapists</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your schedule, connect with families, and grow your practice with our professional tools and support.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gray-100 dark:bg-black dark:border dark:border-gray-700 hover:shadow-lg transition-all">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure & Reliable</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is protected with enterprise-grade security, ensuring privacy and confidentiality for all users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Getting started with Therabee is simple and straightforward
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {['Sign Up', 'Connect', 'Thrive'].map((step, i) => (
              <div key={i} className="text-center bg-gray-100 dark:bg-black dark:border dark:border-gray-700 p-6 rounded-xl">
                <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step === 'Sign Up' && 'Create your account as a parent and complete your profile.'}
                  {step === 'Connect' && 'Parents can browse therapists and book sessions.'}
                  {step === 'Thrive' && 'Start your therapy journey with professional support and convenient scheduling.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 relative z-10">
          <div>
            <div className="text-4xl font-bold mb-2">500+</div>
            <div className="text-gray-600 dark:text-gray-300">Active Therapists</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">2,000+</div>
            <div className="text-gray-600 dark:text-gray-300">Families Served</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">10,000+</div>
            <div className="text-gray-600 dark:text-gray-300">Sessions Completed</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">98%</div>
            <div className="text-gray-600 dark:text-gray-300">Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Real stories from families and therapists who trust Therabee
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              { name: 'Sarah Johnson', role: 'Parent', text: 'Therabee made it so easy to find the right therapist for my daughter.' },
              { name: 'Dr. Michael Chen', role: 'Child Psychologist', text: 'As a therapist, Therabee has helped me grow my practice significantly.' },
              { name: 'Emily Rodriguez', role: 'Parent', text: 'The convenience of online sessions and the quality of therapists has been life-changing.' }
            ].map((t, i) => (
              <div key={i} className="bg-gray-100 dark:bg-black dark:border dark:border-gray-700 p-6 rounded-lg hover:shadow-lg transition-all">
                <div className="flex items-center justify-center mb-4 space-x-1">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-5 w-5 text-yellow-400" />)}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{t.text}</p>
                <div className="font-semibold">{t.name}</div>
                <div className="text-gray-500 dark:text-gray-400">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of families who trust Therabee for their therapy needs
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* Registration removed: OAuth-only sign-in */}
            <Link to="/login" className="btn border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 z-10 bg-gray-100 dark:bg-black border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Therabee</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Connecting families with qualified therapists for accessible, convenient, and effective mental health support.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">For Families</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-white transition-colors">Find Therapists</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-white transition-colors">Book Sessions</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-white transition-colors">Manage Children</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-white transition-colors">Track Progress</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">For Therapists</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-white transition-colors">Join Our Network</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-white transition-colors">Manage Schedule</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-white transition-colors">Connect with Families</a></li>
                <li><a href="#" className="hover:text-primary-600 dark:hover:text-white transition-colors">Grow Your Practice</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-600 dark:text-gray-400 text-sm">
            <span>© {new Date().getFullYear()} Therabee. All rights reserved.</span>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-primary-600 dark:hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-primary-600 dark:hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-primary-600 dark:hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
