import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Code, Server, Database, Shield, Cloud, Bot, Plug, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CostBreakdown from './CostBreakdown';
import { CostEstimate } from '@/types/sermon';

const costEstimate: CostEstimate = {
  development: {
    frontend: 15000,
    backend: 12000,
    database: 8000,
    auth: 5000,
    fileStorage: 6000,
    aiIntegration: 10000,
    thirdPartyIntegrations: 8000
  },
  hosting: {
    monthly: 150,
    yearly: 1800
  },
  maintenance: {
    monthly: 800,
    yearly: 9600
  },
  total: {
    initial: 64000,
    yearOne: 75400
  }
};

const CostEstimator: React.FC = () => {
  const [showDetailed, setShowDetailed] = useState(false);

  const developmentBreakdowns = [
    {
      category: 'Frontend Development',
      cost: 15000,
      timeEstimate: '3-4 weeks',
      complexity: 'Medium' as const,
      details: [
        'React/TypeScript application with modern UI components',
        'Responsive design for desktop, tablet, and mobile',
        'Complex sermon planning interface with drag-drop',
        'Real-time collaboration features',
        'Advanced filtering and search functionality',
        'Custom calendar integration and scheduling'
      ]
    },
    {
      category: 'Backend Development',
      cost: 12000,
      timeEstimate: '2-3 weeks',
      complexity: 'High' as const,
      details: [
        'RESTful API with Node.js/Express or Python/Django',
        'Real-time WebSocket connections for collaboration',
        'Complex business logic for sermon planning workflow',
        'File upload/processing pipeline',
        'Email notification system',
        'API rate limiting and security middleware'
      ]
    },
    {
      category: 'Database Architecture',
      cost: 8000,
      timeEstimate: '1-2 weeks',
      complexity: 'High' as const,
      details: [
        'PostgreSQL database design with complex relationships',
        'Data migration scripts and seeding',
        'Performance optimization and indexing',
        'Backup and recovery procedures',
        'Database monitoring and alerting setup'
      ]
    },
    {
      category: 'Authentication & Security',
      cost: 5000,
      timeEstimate: '1 week',
      complexity: 'Medium' as const,
      details: [
        'JWT-based authentication system',
        'Role-based access control (RBAC)',
        'OAuth integration (Google, Microsoft)',
        'Password security and 2FA implementation',
        'Security auditing and compliance'
      ]
    },
    {
      category: 'File Storage System',
      cost: 6000,
      timeEstimate: '1-2 weeks',
      complexity: 'Medium' as const,
      details: [
        'AWS S3 or similar cloud storage integration',
        'Image/video processing and optimization',
        'File versioning and backup systems',
        'CDN setup for fast global delivery',
        'Secure file sharing and permissions'
      ]
    },
    {
      category: 'AI Integration',
      cost: 10000,
      timeEstimate: '2 weeks',
      complexity: 'High' as const,
      details: [
        'OpenAI GPT-4 API integration for content generation',
        'Custom prompt engineering for sermon content',
        'AI-powered scripture suggestion system',
        'Automated outline and talking points generation',
        'Content quality filtering and moderation'
      ]
    },
    {
      category: 'Third-party Integrations',
      cost: 8000,
      timeEstimate: '2 weeks',
      complexity: 'Medium' as const,
      details: [
        'Planning Center Services API integration',
        'Google Calendar and Outlook synchronization',
        'Social media platform APIs (Facebook, Instagram)',
        'Email marketing platform integration (Mailchimp)',
        'Church management system connectors'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Development Cost Breakdown</h1>
        <p className="text-muted-foreground">Detailed analysis of why professional development costs $64,000</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Breakdown</TabsTrigger>
          <TabsTrigger value="timeline">Timeline & ROI</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="h-6 w-6" />
                Why $64,000 for Development?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Professional Development Rate</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Senior developers charge $80-120/hour. We're using $80/hour as a conservative estimate.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Development Hours:</span>
                      <span className="font-semibold">800 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate per Hour:</span>
                      <span className="font-semibold">$80</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Cost:</span>
                      <span>$64,000</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Complexity Factors</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Real-time collaboration system</li>
                    <li>✓ AI content generation integration</li>
                    <li>✓ Complex calendar scheduling</li>
                    <li>✓ Multi-platform integrations</li>
                    <li>✓ Advanced security & authentication</li>
                    <li>✓ File management & processing</li>
                    <li>✓ Mobile-responsive design</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {developmentBreakdowns.map((breakdown, index) => (
              <CostBreakdown key={index} {...breakdown} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Development Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded">
                    <span>Phase 1: Core Features</span>
                    <Badge>6-8 weeks</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded">
                    <span>Phase 2: Advanced Features</span>
                    <Badge>4-6 weeks</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded">
                    <span>Phase 3: Testing & Launch</span>
                    <Badge>2-3 weeks</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Timeline:</span>
                    <span>3-4 months</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Return on Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded">
                    <p className="text-2xl font-bold text-green-700">Time Savings</p>
                    <p className="text-sm text-green-600">10+ hours/week saved on planning</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <p className="text-2xl font-bold text-blue-700">Team Efficiency</p>
                    <p className="text-sm text-blue-600">Better collaboration & coordination</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded">
                    <p className="text-2xl font-bold text-purple-700">Content Quality</p>
                    <p className="text-sm text-purple-600">AI-assisted sermon development</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CostEstimator;