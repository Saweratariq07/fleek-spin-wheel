import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Store, Link2, Unlink, CheckCircle2, XCircle, ExternalLink, Copy, RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ShopInfo {
    domain: string;
    name?: string;
    email?: string;
    plan?: string;
    connected: boolean;
}

export function ShopifySettings() {
    const [shopDomain, setShopDomain] = useState('');
    const [connectedShop, setConnectedShop] = useState<ShopInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    // Check if any shop is already connected
    useEffect(() => {
        checkConnectedShop();
    }, []);

    const checkConnectedShop = async () => {
        setChecking(true);
        try {
            // Try to get shop from localStorage first
            const savedDomain = localStorage.getItem('shopify_shop_domain');
            if (savedDomain) {
                const res = await fetch(`${API_BASE}/api/shopify/shop/${savedDomain}`);
                if (res.ok) {
                    const data = await res.json();
                    setConnectedShop({
                        domain: savedDomain,
                        name: data.shop?.name || savedDomain,
                        email: data.shop?.email,
                        plan: data.shop?.plan_name,
                        connected: true,
                    });
                } else {
                    localStorage.removeItem('shopify_shop_domain');
                }
            }
        } catch (error) {
            console.error('Error checking shop:', error);
        } finally {
            setChecking(false);
        }
    };

    const handleConnect = () => {
        if (!shopDomain) {
            toast.error('Please enter your Shopify store domain');
            return;
        }

        // Clean up the domain
        let domain = shopDomain.trim().toLowerCase();
        domain = domain.replace(/^https?:\/\//, '');
        domain = domain.replace(/\/$/, '');
        if (!domain.includes('.myshopify.com')) {
            domain = `${domain}.myshopify.com`;
        }

        setLoading(true);

        // Save domain to localStorage before redirect
        localStorage.setItem('shopify_shop_domain', domain);

        // Redirect to Shopify OAuth
        const authUrl = `${API_BASE}/api/shopify/auth?shop=${encodeURIComponent(domain)}`;
        window.location.href = authUrl;
    };

    const handleDisconnect = async () => {
        if (!connectedShop) return;

        if (!confirm('Are you sure you want to disconnect this shop? This will disable real Shopify discount codes.')) {
            return;
        }

        try {
            // Just clear local state - actual disconnection happens via Shopify
            localStorage.removeItem('shopify_shop_domain');
            setConnectedShop(null);
            toast.success('Shop disconnected');
        } catch (error) {
            toast.error('Failed to disconnect shop');
        }
    };

    const copyDomain = () => {
        if (connectedShop?.domain) {
            navigator.clipboard.writeText(connectedShop.domain);
            toast.success('Domain copied to clipboard');
        }
    };

    if (checking) {
        return (
            <Card>
                <CardContent className="py-8">
                    <div className="flex items-center justify-center gap-3">
                        <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                        <span className="text-gray-600">Checking Shopify connection...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Connection Status */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                                <Store className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle>Shopify Connection</CardTitle>
                                <CardDescription>
                                    Connect your Shopify store to create real discount codes
                                </CardDescription>
                            </div>
                        </div>
                        {connectedShop?.connected ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Connected
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                <XCircle className="w-3 h-3 mr-1" />
                                Not Connected
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {connectedShop?.connected ? (
                        <div className="space-y-4">
                            {/* Connected Shop Info */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-green-800">
                                            {connectedShop.name || connectedShop.domain}
                                        </h4>
                                        <p className="text-sm text-green-600 mt-1 flex items-center gap-2">
                                            <Link2 className="w-4 h-4" />
                                            {connectedShop.domain}
                                            <button onClick={copyDomain} className="hover:text-green-800">
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </p>
                                        {connectedShop.email && (
                                            <p className="text-sm text-green-600 mt-1">
                                                {connectedShop.email}
                                            </p>
                                        )}
                                    </div>
                                    <a
                                        href={`https://${connectedShop.domain}/admin`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 hover:text-green-800"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>

                            {/* Features Enabled */}
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span className="text-sm">Real Shopify discount codes</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span className="text-sm">Codes visible in Shopify Admin</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span className="text-sm">Works in Shopify checkout</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span className="text-sm">Auto code expiration</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleDisconnect}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                                <Unlink className="w-4 h-4 mr-2" />
                                Disconnect Shop
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <p className="text-amber-800 text-sm">
                                    <strong>Note:</strong> Without a connected Shopify store, discount codes will be
                                    generated locally and won't appear in your Shopify admin or work at checkout.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="shop-domain">Shopify Store Domain</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="shop-domain"
                                        placeholder="your-store.myshopify.com"
                                        value={shopDomain}
                                        onChange={(e) => setShopDomain(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={handleConnect}
                                        disabled={loading}
                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                    >
                                        {loading ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Link2 className="w-4 h-4 mr-2" />
                                                Connect
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Enter your store's .myshopify.com domain (e.g., my-store.myshopify.com)
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* API Credentials (for advanced users) */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">API Configuration</CardTitle>
                    <CardDescription>
                        Advanced settings for developers
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-gray-600">Client ID</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1 font-mono">
                                    3c840cbc8d081b088f2fa75208beebf0
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText('3c840cbc8d081b088f2fa75208beebf0');
                                        toast.success('Copied!');
                                    }}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div>
                            <Label className="text-gray-600">API Scopes</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <Badge variant="secondary">read_products</Badge>
                                <Badge variant="secondary">write_discounts</Badge>
                                <Badge variant="secondary">read_discounts</Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
