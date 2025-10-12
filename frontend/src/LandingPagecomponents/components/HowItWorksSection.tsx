import { UserPlus, Search, CreditCard, Video, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Parents and therapists register with secure verification and background checks.",
    number: "01"
  },
  {
    icon: Search,
    title: "Browse Therapists",
    description: "Explore verified therapist profiles, specializations, and real-time availability.",
    number: "02"
  },
  {
    icon: CreditCard,
    title: "Book & Pay",
    description: "Secure appointment booking with integrated payments via Stripe and Razorpay.",
    number: "03"
  },
  {
    icon: Video,
    title: "Attend Session",
    description: "Join high-quality video sessions powered by Zoom with interactive therapy tools.",
    number: "04"
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Receive detailed progress reports, session summaries, and milestone updates.",
    number: "05"
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            How <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">TheraConnect</span> Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started with therapy in just 5 simple steps. Our streamlined process 
            makes it easy for families to connect with the right therapist.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto mt-6"></div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-400 to-blue-400 rounded-full opacity-30"></div>

          {/* Steps */}
          <div className="space-y-12 lg:space-y-16">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-center lg:justify-start mb-4">
                      <span className="text-6xl font-bold text-purple-200 mr-4">
                        {step.number}
                      </span>
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Center Circle (Desktop) */}
                <div className="hidden lg:block">
                  <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center shadow-glow animate-pulse-glow">
                    <div className="w-8 h-8 bg-primary-foreground rounded-full"></div>
                  </div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 hidden lg:block"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in-up">
          <div className="gradient-card rounded-2xl p-8 shadow-medium max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of families who have found the right therapeutic support through TheraConnect.
            </p>
            <button className="px-8 py-4 gradient-primary text-primary-foreground font-semibold rounded-lg hover:shadow-glow transition-smooth text-lg">
              Begin Your Journey
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;