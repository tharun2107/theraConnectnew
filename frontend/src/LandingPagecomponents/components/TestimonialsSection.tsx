import { Card, CardContent } from "./ui/card";
import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Parent",
    content: "TheraConnect transformed how we approach my daughter's therapy. The convenience of home sessions and the quality of therapists exceeded our expectations.",
    rating: 5,
    avatar: "SJ"
  },
  {
    name: "Dr. Michael Chen",
    role: "Licensed Therapist",
    content: "As a therapist, I love how TheraConnect streamlines my practice. The scheduling, payments, and progress tracking tools are incredibly intuitive.",
    rating: 5,
    avatar: "MC"
  },
  {
    name: "Emma Rodriguez",
    role: "Parent",
    content: "Finding the right therapist for my son was always challenging. TheraConnect made it simple, and the results have been amazing.",
    rating: 5,
    avatar: "ER"
  },
  {
    name: "Dr. Amanda Foster",
    role: "Child Psychologist",
    content: "The platform's security features and HIPAA compliance give me confidence that my patients' information is always protected.",
    rating: 5,
    avatar: "AF"
  },
  {
    name: "James Mitchell",
    role: "Parent",
    content: "The progress tracking feature helps me stay involved in my child's therapy journey. It's reassuring to see the improvements over time.",
    rating: 5,
    avatar: "JM"
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: rating }).map((_, i) => (
      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            What Our <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Community</span> Says
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hear from families and therapists who have experienced the difference 
            that TheraConnect makes in their therapy journey.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mt-6"></div>
        </div>

        {/* Testimonials Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Card className="gradient-card border-0 shadow-strong hover-glow max-w-3xl mx-auto">
                    <CardContent className="p-8 text-center">
                      {/* Quote Icon */}
                      <div className="mb-6">
                        <Quote className="w-12 h-12 text-primary/30 mx-auto" />
                      </div>

                      {/* Testimonial Text */}
                      <blockquote className="text-xl text-muted-foreground leading-relaxed mb-8 italic">
                        "{testimonial.content}"
                      </blockquote>

                      {/* Rating */}
                      <div className="flex justify-center mb-6">
                        {renderStars(testimonial.rating)}
                      </div>

                      {/* Author */}
                      <div className="flex items-center justify-center space-x-4">
                        <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                          {testimonial.avatar}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-foreground">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'gradient-primary shadow-glow' 
                    : 'bg-primary/20 hover:bg-primary/40'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 animate-fade-in-up">
          <div className="text-center">
            <div className="text-4xl font-bold text-gradient mb-2">500+</div>
            <div className="text-muted-foreground">Verified Therapists</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gradient mb-2">10k+</div>
            <div className="text-muted-foreground">Successful Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gradient mb-2">98%</div>
            <div className="text-muted-foreground">Family Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;