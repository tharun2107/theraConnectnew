import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Check, Zap, Crown, Star } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for families just beginning their therapy journey",
    icon: Zap,
    features: [
      "Up to 4 therapy sessions per month",
      "Basic progress tracking",
      "Email support",
      "Secure video sessions",
      "Calendar integration",
      "Basic reports"
    ],
    buttonText: "Start Free Trial",
    isPopular: false
  },
  {
    name: "Standard",
    price: "$59",
    period: "/month",
    description: "Most popular choice for regular therapy sessions",
    icon: Star,
    features: [
      "Up to 8 therapy sessions per month",
      "Advanced progress tracking",
      "Priority email & chat support",
      "HD video sessions with recording",
      "Smart scheduling assistant",
      "Detailed progress reports",
      "Family portal access",
      "Mobile app included"
    ],
    buttonText: "Get Started",
    isPopular: true
  },
  {
    name: "Professional",
    price: "$99",
    period: "/month",
    description: "Comprehensive solution for intensive therapy programs",
    icon: Crown,
    features: [
      "Unlimited therapy sessions",
      "Premium progress analytics",
      "24/7 phone & chat support",
      "4K video sessions with recording",
      "AI-powered scheduling",
      "Comprehensive progress reports",
      "Multi-family management",
      "API access",
      "Custom integrations",
      "Dedicated account manager"
    ],
    buttonText: "Contact Sales",
    isPopular: false
  }
];

const PricingSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Choose Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Perfect Plan</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Flexible pricing options designed to fit your family's needs and budget. 
            All plans include our core security and privacy features.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mt-6"></div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`gradient-card border-0 shadow-medium hover-lift transition-smooth relative ${
                plan.isPopular ? 'ring-2 ring-primary shadow-glow scale-105' : ''
              }`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="gradient-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                {/* Plan Icon */}
                <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-medium ${
                  plan.isPopular ? 'gradient-primary' : 'bg-primary/10'
                }`}>
                  <plan.icon className={`w-8 h-8 ${
                    plan.isPopular ? 'text-primary-foreground' : 'text-primary'
                  }`} />
                </div>

                {/* Plan Name */}
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </CardTitle>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gradient">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">
                    {plan.period}
                  </span>
                </div>

                {/* Description */}
                <p className="text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <div className="w-5 h-5 gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button 
                  className={`w-full text-lg py-6 font-semibold transition-smooth ${
                    plan.isPopular 
                      ? 'gradient-primary hover:shadow-glow' 
                      : 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                  }`}
                  variant={plan.isPopular ? "default" : "outline"}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Icons */}
        <div className="text-center mt-16 animate-fade-in-up">
          <p className="text-muted-foreground mb-6">
            Secure payments powered by industry leaders
          </p>
          <div className="flex justify-center items-center space-x-8">
            <div className="bg-white px-6 py-3 rounded-lg shadow-soft">
              <span className="font-semibold text-gray-700">Stripe</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-soft">
              <span className="font-semibold text-gray-700">Razorpay</span>
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12 animate-fade-in-up">
          <div className="gradient-card rounded-2xl p-6 max-w-md mx-auto shadow-medium">
            <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">30-Day Money Back Guarantee</h3>
            <p className="text-sm text-muted-foreground">
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;