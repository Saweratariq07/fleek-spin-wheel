import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Sparkles, Zap, TrendingUp, Users, Gift, Shield, ChartBar } from 'lucide-react';

interface LandingPageProps {
  onStartSpin: () => void;
  onViewAdmin: () => void;
}

export function LandingPage({ onStartSpin, onViewAdmin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
            <h1 className="text-white"> Fleek Spin Wheel</h1>
            <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
          </div>
          <p className="text-white/90 text-xl mb-8">
            Engage customers, boost conversions, and increase sales with an interactive spin wheel experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={onStartSpin}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-lg px-8 py-6 rounded-full shadow-2xl transform transition-all hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Try Spin Wheel Demo
            </Button>
            <Button
              size="lg"
              onClick={onViewAdmin}
              variant="outline"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/50 font-bold text-lg px-8 py-6 rounded-full"
            >
              View Admin Dashboard
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          <Card className="bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Interactive & Engaging</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Capture attention with a smooth, animated spin wheel that keeps customers engaged and excited
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Boost Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Increase conversion rates by up to 50% with gamified discount codes and special offers
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Grow Your List</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Collect valuable email addresses while providing instant value to your customers
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Customizable Prizes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Set up percentage discounts, free shipping, fixed amounts, and more with full control
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <ChartBar className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Track spins, conversions, and ROI with detailed analytics and reporting dashboards
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Easy to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Set up in minutes with no coding required. Mobile responsive and fully customizable
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid gap-6 md:grid-cols-4 mb-16">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
            <p className="text-4xl font-bold text-white mb-2">50%+</p>
            <p className="text-white/80">Conversion Increase</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
            <p className="text-4xl font-bold text-white mb-2">10K+</p>
            <p className="text-white/80">Happy Merchants</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
            <p className="text-4xl font-bold text-white mb-2">2.5M+</p>
            <p className="text-white/80">Spins Per Month</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
            <p className="text-4xl font-bold text-white mb-2">4.9★</p>
            <p className="text-white/80">Average Rating</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-white mb-4">Ready to Increase Your Sales?</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of successful Shopify merchants using our spin wheel to grow their business
          </p>
          <Button
            size="lg"
            onClick={onStartSpin}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform transition-all hover:scale-105"
          >
            Start Your Free Trial
          </Button>
          <p className="text-white/70 text-sm mt-4">No credit card required • 14-day free trial</p>
        </div>
      </div>
    </div>
  );
}
