import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, Zap, Rocket, Crown } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api/admin';

const iconMap: { [key: string]: any } = {
  Zap,
  Rocket,
  Crown,
};

const defaultPlans = [
  {
    id: 'free',
    name: 'Free',
    icon: Zap,
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    badge: null,
    features: [
      '100 spins per month',
      'Basic email templates',
      'Shopify branding',
      'Standard support',
      '1 active campaign',
      'Basic analytics',
    ],
    limitations: [
      'Limited customization',
      'No advanced analytics',
    ],
    color: 'from-gray-500 to-gray-600',
    buttonText: 'Current Plan',
    buttonVariant: 'outline' as const,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Rocket,
    price: '$29',
    period: 'per month',
    description: 'Best for growing businesses',
    badge: 'Popular',
    badgeColor: 'bg-blue-500',
    features: [
      '1,000 spins per month',
      'Custom email templates',
      'Remove Shopify branding',
      'Advanced analytics',
      '5 active campaigns',
      'Priority support',
      'A/B testing',
      'Custom CSS styling',
    ],
    limitations: [],
    color: 'from-blue-500 to-blue-600',
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'default' as const,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Crown,
    price: '$99',
    period: 'per month',
    description: 'For high-volume stores',
    badge: 'Best Value',
    badgeColor: 'bg-purple-500',
    features: [
      'Unlimited spins',
      'Custom branding',
      'White-label solution',
      'Advanced analytics & reporting',
      'Unlimited campaigns',
      '24/7 priority support',
      'Dedicated account manager',
      'Custom integrations',
      'API access',
      'Multi-store support',
    ],
    limitations: [],
    color: 'from-purple-500 to-purple-600',
    buttonText: 'Upgrade to Enterprise',
    buttonVariant: 'default' as const,
  },
];

export function PricingPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/pricing-plans`);
      if (res.data.data && Array.isArray(res.data.data)) {
        // Map backend data to component format
        const mappedPlans = res.data.data.map((plan: any) => ({
          ...plan,
          icon: iconMap[plan.icon] || Zap,
          buttonVariant: plan.buttonVariant || (plan.id === 'free' ? 'outline' : 'default'),
          color: plan.color || 'from-gray-500 to-gray-600',
          features: plan.features || [],
          limitations: plan.limitations || [],
        }));
        setPlans(mappedPlans);
      } else {
        // Fallback to default plans if API doesn't return data
        setPlans(defaultPlans as any);
      }
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      toast.error('Failed to load pricing plans');
      // Fallback to default plans
      setPlans(defaultPlans as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  const handleSubscribe = (planId: string, planName: string) => {
    if (planId === 'free') {
      toast.info('You are already on the Free plan');
    } else {
      try {
        axios.post(`${API_BASE}/subscribe`, { planId }).then(() => {
          toast.success(`Upgrading to ${planName}...`);
          fetchPlans();
        }).catch(() => {
          toast.error('Failed to upgrade plan');
        });
      } catch (error) {
        toast.error('Failed to upgrade plan');
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 text-lg">
          Select the perfect plan for your business. All plans include core features with no hidden fees.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isPopular = plan.badge === 'Popular';
          
          return (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all hover:shadow-xl ${
                isPopular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 right-0">
                  <Badge className={`${plan.badgeColor} text-white rounded-bl-lg rounded-tr-lg px-4 py-1`}>
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8 pt-10">
                <div className={`w-16 h-16 mx-auto mb-4 bg-linear-to-br ${plan.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">/ {plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <div className="space-y-3">
                  {plan.features.map((feature: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`mt-0.5 p-0.5 bg-linear-to-br ${plan.color} rounded-full`}>
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Limitations:</p>
                    <div className="space-y-2">
                      {plan.limitations.map((limitation: any, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-gray-400 text-xs">•</span>
                          <span className="text-gray-500 text-xs">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  className={`w-full mt-6 ${
                    plan.buttonVariant === 'default' 
                      ? `bg-linear-to-r ${plan.color} hover:opacity-90 text-white` 
                      : ''
                  }`}
                  variant={plan.buttonVariant}
                  size="lg"
                  onClick={() => handleSubscribe(plan.id, plan.name)}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mt-16 pt-12 border-t border-gray-200">
        <h3 className="text-center mb-8 text-gray-900">Frequently Asked Questions</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Can I change plans later?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">What happens if I exceed my spin limit?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Your campaigns will pause automatically. You can upgrade your plan or wait until next month.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Do you offer refunds?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Yes, we offer a 14-day money-back guarantee for all paid plans. No questions asked.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Is there a setup fee?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                No! There are no setup fees or hidden charges. You only pay the monthly subscription.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enterprise Contact */}
      <Card className="max-w-4xl mx-auto bg-linear-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="py-8 text-center">
          <h3 className="text-gray-900 mb-2">Need a custom solution?</h3>
          <p className="text-gray-600 mb-6">
            Our Enterprise plan can be customized to fit your specific needs. Contact us to discuss your requirements.
          </p>
          <Button size="lg" className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            Contact Sales
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
