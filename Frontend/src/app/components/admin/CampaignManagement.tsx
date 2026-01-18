import { useState , useEffect} from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import axios from 'axios';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Plus, Pencil, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';


const API_BASE = 'http://localhost:5000/api/admin';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  totalSpins: number;
  startDate: string;
  endDate: string;
  spinsLimit: number;
  prizes: Prize[];
}

interface Prize {
  id: string;
  type: string;
  value: string;
  probability: number;
}

export function CampaignManagement() {
   const [shopId, setShopId] = useState('shop-123'); // Dummy shop  ID
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    active: true,
    startDate: '',
    endDate: '',
    spinsLimit: '',
    status: 'active' as 'active' | 'inactive',
  });
   const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/shops/${shopId}/campaigns`);
      setCampaigns(res.data.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      alert('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    fetchCampaigns();
  }, [shopId]);

  const handleSave = async (e: any) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.spinsLimit) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const payload = {
        name: formData.name,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        spinsLimit: parseInt(formData.spinsLimit),
      };
      if (selectedCampaign) {
        // Update
        await axios.put(`${API_BASE}/campaigns/${selectedCampaign.id}`, payload);
        toast.success('Campaign updated successfully!');
      } else {
        // Create
        await axios.post(`${API_BASE}/shops/${shopId}/campaigns`, {
          shopId,
          ...payload,
        });
        toast.success('Campaign created successfully!');
      }
      setShowModal(false);
      setFormData({
        name: '',
        active: true,
        startDate: '',
        endDate: '',
        spinsLimit: '',
        status: 'active',
      });
      setSelectedCampaign(null);
      fetchCampaigns();
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Failed to save campaign');
    }
  };

  // Delete campaign
  const handleDelete = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await axios.delete(`${API_BASE}/campaigns/${campaignId}`);
        toast.success('Campaign deleted successfully!');
        fetchCampaigns();
      } catch (error) {
        console.error('Error deleting campaign:', error);
        toast.error('Failed to delete campaign');
      }
    }
  };

  // Toggle campaign status
  const toggleCampaignStatus = async (campaignId: string) => {
    try {
      const campaign = campaigns.find(c => c.id === campaignId);
      if (campaign) {
        const newStatus = campaign.status === 'active' ? 'inactive' : 'active';
        await axios.put(`${API_BASE}/campaigns/${campaignId}`, { status: newStatus });
        toast.success('Campaign status updated!');
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast.error('Failed to update campaign status');
    }
  };

  // Open create/edit modal
  const handleOpenModal = (campaign: Campaign | null = null) => {
    if (campaign) {
      setSelectedCampaign(campaign);
      setFormData({
        name: campaign.name,
        active: campaign.status === 'active',
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        spinsLimit: campaign.spinsLimit.toString(),
        status: campaign.status,
      });
    } else {
      setSelectedCampaign(null);
      setFormData({
        name: '',
        active: true,
        startDate: '',
        endDate: '',
        spinsLimit: '',
        status: 'active',
      });
    }
    setShowModal(true);
  };

  const handleCreateCampaign = () => handleSave({ preventDefault: () => {} } as any);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-gray-900">Campaign Management</h2>
          <p className="text-gray-600 mt-1">Create and manage your spin wheel campaigns</p>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedCampaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
              <DialogDescription>
                {selectedCampaign ? 'Update your spin wheel campaign' : 'Set up a new spin wheel campaign for your store'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name *</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Summer Sale 2025"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date *</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date *</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="spins-limit">Spins Limit *</Label>
                <Input
                  id="spins-limit"
                  type="number"
                  placeholder="e.g., 5000"
                  value={formData.spinsLimit}
                  onChange={(e) => setFormData({ ...formData, spinsLimit: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Campaign Status</Label>
                  <p className="text-sm text-gray-500">Enable or disable this campaign</p>
                </div>
                <Switch
                  checked={formData.status === 'active'}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, status: checked ? 'active' : 'inactive' })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                {selectedCampaign ? 'Update Campaign' : 'Create Campaign'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaigns Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <CardDescription className="mt-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3 h-3" />
                      {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                    </div>
                  </CardDescription>
                </div>
                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                  {campaign.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Total Spins</span>
                  </div>
                  <span className="font-bold text-purple-600">{campaign.totalSpins.toLocaleString()}</span>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Limit</span>
                    <span className="font-medium">{campaign.spinsLimit.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-linear-to-r from-purple-600 to-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${(campaign.totalSpins / campaign.spinsLimit) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    {Math.round((campaign.totalSpins / campaign.spinsLimit) * 100)}% used
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenModal(campaign)}
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleCampaignStatus(campaign.id)}
                  >
                    {campaign.status === 'active' ? 'Pause' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(campaign.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-4">Create your first spin wheel campaign to get started</p>
              <Button onClick={() => handleOpenModal()} className="bg-purple-600 hover:bg-purple-700">
                Create Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}