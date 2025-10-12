import familyImage from "../../assets/family-therapist-illustration.jpg";

const VisionSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Image */}
          <div className="relative animate-fade-in-up">
            <div className="relative">
              <img
                src={familyImage}
                alt="Happy family with therapist showing care and support"
                className="w-full h-auto rounded-2xl shadow-medium hover-lift"
              />
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary/20 rounded-full animate-float"></div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary/30 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-6 animate-slide-in-right">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Mission</span>
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            </div>
            
            <div className="space-y-4">
              <p className="text-lg text-gray-600 leading-relaxed">
                At TheraConnect, we aim to make therapy accessible, secure, and seamless 
                for every child. We believe that mental health support should be available 
                when and where families need it most.
              </p>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Our platform bridges the gap between families seeking help and qualified 
                therapists ready to provide compassionate, professional care through 
                innovative technology.
              </p>
            </div>

            {/* Mission Points */}
            <div className="grid sm:grid-cols-2 gap-4 pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Accessible Care</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Verified Therapists</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Secure Platform</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">Family-Centered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;