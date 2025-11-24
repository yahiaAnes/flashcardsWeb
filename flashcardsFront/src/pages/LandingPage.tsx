import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";


// Icons as simple SVG components
const FileTextIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BrainIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const HighlightIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

// const CheckIcon = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//   </svg>
// );

// const StarIcon = () => (
//   <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
//     <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
//   </svg>
// );

// Header Component
const Header = () => {
 const isAuthenticated = useAuth();
 return (
  <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
    <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/" className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <span className="text-xl font-bold text-gray-900">MedCards</span>
      </a>
      <div className="hidden md:flex items-center space-x-8">
        <a href="#features" className="text-gray-600 hover:text-blue-600 transition">Features</a>
        <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition">How It Works</a>
        {/* <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition">Pricing</a> */}
        {!isAuthenticated ? (
            <Link to="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"> Dashboard </Link>
          ) : ( <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 transition font-medium">
                    Login
                </Link>
                <Link to="/register" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg">
                    Sign Up
                </Link>
            </>
        
          )}
      </div>
    </nav>
  </header>
);}

// Hero Section
const Hero = () => (
  <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-blue-50 to-white">
    <div className="container mx-auto max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Transform Your Medical Notes<br />
          <span className="text-blue-600">into Smart Flashcards</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Upload your lessons or PDFs, highlight any text, and AI instantly creates high-quality flashcards. 
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Get Started Free
          </button>
          {/* <button className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transition shadow-md border-2 border-blue-600">
            Try Live Demo
          </button> */}
        </div>
      </div>
      
      {/* Mock illustration */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="h-96 bg-gradient-to-br from-blue-100 via-white to-blue-50 rounded-2xl shadow-2xl border border-blue-100 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-3/4 bg-white rounded-xl shadow-xl p-8 flex flex-col space-y-4">
                <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="flex-1 bg-blue-50 rounded-lg mt-4 flex items-center justify-center">
                  <span className="text-blue-400 text-sm font-medium">AI Processing...</span>
                </div>
              </div>
            </div>
          </div>
          {/* Floating cards decoration */}
          <div className="absolute -top-4 -right-4 w-32 h-24 bg-white rounded-lg shadow-xl transform rotate-6 hidden md:block"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-24 bg-white rounded-lg shadow-xl transform -rotate-6 hidden md:block"></div>
        </div>
      </div>
    </div>
  </section>
);

// Features Section
const Features = () => {
  const features = [
    {
      icon: <FileTextIcon />,
      title: "AI Flashcards from PDF",
      description: "Upload any medical PDF or document and let AI extract key concepts into perfect flashcards."
    },
    {
      icon: <BrainIcon />,
      title: "Smart Medical Summaries",
      description: "Get concise, accurate summaries of complex medical topics with AI-powered comprehension."
    },
    {
      icon: <HighlightIcon />,
      title: "Highlight → Flashcard",
      description: "Simply highlight any text in your notes and instantly convert it to a flashcard."
    },
    {
      icon: <DownloadIcon />,
      title: "Export to Anki",
      description: "Seamlessly export your flashcards to Anki with one click for spaced repetition."
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Medical Students
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to ace your medical exams
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-100 hover:border-blue-200 group">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Upload Your File",
      description: "Drag and drop your medical notes, PDFs, or PowerPoint presentations."
    },
    {
      number: "2",
      title: "Select the Part You Want",
      description: "Highlight specific sections or let AI analyze the entire document."
    },
    {
      number: "3",
      title: "AI Generates Flashcards",
      description: "Get perfectly formatted flashcards instantly, ready for studying."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Three simple steps to better studying
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection lines */}
          <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-blue-200"></div>
          
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Section
// const Pricing = () => {
//   const plans = [
//     {
//       name: "Free",
//       price: "$0",
//       period: "forever",
//       features: [
//         "5 lessons per month",
//         "Basic flashcard generation",
//         "PDF upload support",
//         "Export to Anki"
//       ],
//       cta: "Start Free",
//       popular: false
//     },
//     {
//       name: "Pro",
//       price: "$2",
//       period: "per month",
//       features: [
//         "Unlimited flashcards",
//         "Medical templates",
//         "AI-powered quizzes",
//         "Priority support",
//         "Advanced analytics",
//         "Custom categories"
//       ],
//       cta: "Upgrade to Pro",
//       popular: true
//     }
//   ];

//   return (
//     <section id="pricing" className="py-20 px-4 bg-white">
//       <div className="container mx-auto max-w-5xl">
//         <div className="text-center mb-16">
//           <h2 className="text-4xl font-bold text-gray-900 mb-4">
//             Simple, Affordable Pricing
//           </h2>
//           <p className="text-xl text-gray-600">
//             Choose the plan that's right for you
//           </p>
//         </div>
        
//         <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
//           {plans.map((plan, idx) => (
//             <div key={idx} className={`relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition ${plan.popular ? 'border-2 border-blue-600 transform md:scale-105' : 'border border-gray-200'}`}>
//               {plan.popular && (
//                 <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
//                   <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
//                     Most Popular
//                   </span>
//                 </div>
//               )}
              
//               <div className="text-center mb-6">
//                 <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
//                 <div className="flex items-end justify-center mb-2">
//                   <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
//                   <span className="text-gray-600 ml-2 mb-2">/{plan.period}</span>
//                 </div>
//               </div>
              
//               <ul className="space-y-4 mb-8">
//                 {plan.features.map((feature, fIdx) => (
//                   <li key={fIdx} className="flex items-center">
//                     <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3 flex-shrink-0">
//                       <CheckIcon />
//                     </div>
//                     <span className="text-gray-700">{feature}</span>
//                   </li>
//                 ))}
//               </ul>
              
//               <button className={`w-full py-3 rounded-xl font-semibold transition ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
//                 {plan.cta}
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// Testimonials Section
// const Testimonials = () => {
//   const testimonials = [
//     {
//       name: "Sarah Johnson",
//       role: "3rd Year Med Student",
//       content: "This app saved me hundreds of hours during exam prep. The AI-generated flashcards are incredibly accurate and helped me ace my anatomy finals.",
//       rating: 5
//     },
//     {
//       name: "Michael Chen",
//       role: "Resident, Internal Medicine",
//       content: "The highlight-to-flashcard feature is genius. I can quickly convert lecture notes into study materials during rounds. Game changer!",
//       rating: 5
//     },
//     {
//       name: "Emily Rodriguez",
//       role: "2nd Year Med Student",
//       content: "Best $2/month I've ever spent. The medical templates and AI quizzes make studying so much more efficient. Highly recommend!",
//       rating: 5
//     }
//   ];

//   return (
//     <section className="py-20 px-4 bg-blue-50">
//       <div className="container mx-auto max-w-6xl">
//         <div className="text-center mb-16">
//           <h2 className="text-4xl font-bold text-gray-900 mb-4">
//             Loved by Medical Students
//           </h2>
//           <p className="text-xl text-gray-600">
//             Join thousands of students studying smarter
//           </p>
//         </div>
        
//         <div className="grid md:grid-cols-3 gap-8">
//           {testimonials.map((testimonial, idx) => (
//             <div key={idx} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
//               <div className="flex text-yellow-400 mb-4">
//                 {[...Array(testimonial.rating)].map((_, i) => (
//                   <StarIcon key={i} />
//                 ))}
//               </div>
//               <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
//               <div className="border-t pt-4">
//                 <p className="font-bold text-gray-900">{testimonial.name}</p>
//                 <p className="text-sm text-gray-600">{testimonial.role}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// CTA Section
const CTASection = () => (
  <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
    <div className="container mx-auto max-w-4xl text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
        Start Transforming Your Study Workflow Today
      </h2>
      <p className="text-xl text-blue-100 mb-8">
        Join thousands of medical students who are studying smarter with AI-powered flashcards
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition shadow-lg hover:shadow-xl">
          Get Started Free
        </button>
        {/* <button className="px-8 py-4 bg-blue-800 text-white text-lg font-semibold rounded-xl hover:bg-blue-900 transition border-2 border-white">
          View Pricing
        </button> */}
      </div>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 py-12 px-4">
    <div className="container mx-auto max-w-6xl">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-bold text-white">MedCards</span>
          </div>
          <p className="text-sm text-gray-400">
            AI-powered flashcards for medical students
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-white mb-4">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition">Features</a></li>
            {/* <li><a href="#" className="hover:text-white transition">Pricing</a></li>
            <li><a href="#" className="hover:text-white transition">Demo</a></li> */}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-white mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition">About</a></li>
            <li><a href="#" className="hover:text-white transition">Blog</a></li>
            <li><a href="#" className="hover:text-white transition">Careers</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-white mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition">Privacy</a></li>
            <li><a href="#" className="hover:text-white transition">Terms</a></li>
            <li><a href="#" className="hover:text-white transition">Contact</a></li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-gray-400 mb-4 md:mb-0">
          © 2024 MedCards. All rights reserved.
        </p>
        <div className="flex space-x-6">
          <a href="#" className="text-gray-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
);

// Main LandingPage Page
export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      {/* <Pricing /> */}
      {/* <Testimonials /> */}
      <CTASection />
      <Footer />
    </div>
  );
};
