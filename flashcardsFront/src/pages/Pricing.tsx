import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { AuthLayout } from '../Layouts/AuthLayout';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '1,000 tokens per month',
      'Basic flashcards',
      'Up to 10 lessons',
      'Community support',
    ],
    buttonText: 'Current Plan',
    popular: false,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '$9.99',
    period: 'per month',
    features: [
      '10,000 tokens per month',
      'Advanced flashcards',
      'Unlimited lessons',
      'Priority support',
      'Export to PDF',
    ],
    buttonText: 'Upgrade to Basic',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$19.99',
    period: 'per month',
    features: [
      'Unlimited tokens',
      'Advanced flashcards',
      'Unlimited lessons',
      'Priority support',
      'Export to PDF',
      'AI-powered study plans',
      'Progress analytics',
    ],
    buttonText: 'Upgrade to Premium',
    popular: false,
  },
];

export const Pricing = () => {
  
  return (
    <AuthLayout title="Pricing Plans">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="flex-1 flex flex-col">        
          <main className="flex-1">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Choose the Perfect Plan
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Select the plan that fits your learning needs
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative ${plan.popular ? 'ring-2 ring-medical-500 dark:ring-medical-400 shadow-xl' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <span className="bg-medical-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{plan.price}</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.popular ? 'primary' : 'outline'}
                      className="w-full"
                      onClick={() => {
                        // TODO: Handle plan upgrade
                        console.log(`Upgrade to ${plan.id}`);
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </Card>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Have questions? Contact our support team
                </p>
                <Link to="/dashboard">
                  <Button variant="outline">Back to Dashboard</Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthLayout>
  );
};

