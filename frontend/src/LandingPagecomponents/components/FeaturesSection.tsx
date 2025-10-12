import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Shield, Video, Calendar, CreditCard, Bell, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure Authentication & Privacy",
    description: "HIPAA-compliant platform with end-to-end encryption to protect your family's sensitive information."
  },
  {
    icon: Video,
    title: "Real-Time Video Sessions",
    description: "High-quality video calls with screen sharing, interactive tools, and secure session recording."
  },
  {
    icon: Calendar,
    title: "Smart Booking & Scheduling",
    description: "Easy appointment scheduling with calendar integration, automated reminders, and rescheduling options."
  },
  {
    icon: CreditCard,
    title: "Safe Payments & Transactions",
    description: "Secure payment processing with multiple options, insurance integration, and transparent pricing."
  },
  {
    icon: Bell,
    title: "In-App Notifications & Reminders",
    description: "Stay connected with timely reminders, session notifications, and important updates from your therapist."
  },
  {
    icon: BarChart3,
    title: "Progress Reports & History",
    description: "Track your child's progress with detailed reports, session notes, and milestone achievements."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Everything You Need for{" "}
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Successful Therapy
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Our comprehensive platform provides all the tools families and therapists need 
            for effective, secure, and convenient therapy sessions.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full mx-auto mt-6"></div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white h-full">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            Ready to experience the future of therapy?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105">
              Start Free Trial
            </button>
            <button className="px-8 py-3 border-2 border-cyan-500 text-cyan-600 font-bold rounded-lg hover:bg-cyan-500 hover:text-white transition-all duration-300 hover:scale-105">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;