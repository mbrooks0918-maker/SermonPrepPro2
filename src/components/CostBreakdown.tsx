import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Wrench, Zap } from 'lucide-react';

interface CostBreakdownProps {
  category: string;
  cost: number;
  timeEstimate: string;
  complexity: 'Low' | 'Medium' | 'High';
  details: string[];
}

const CostBreakdown: React.FC<CostBreakdownProps> = ({
  category,
  cost,
  timeEstimate,
  complexity,
  details
}) => {
  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{category}</CardTitle>
          <Badge className={getComplexityColor(complexity)}>
            {complexity}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {timeEstimate}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            ${(cost / 80).toFixed(0)} hours @ $80/hr
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-4">
          ${cost.toLocaleString()}
        </div>
        <ul className="space-y-2">
          {details.map((detail, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              {detail}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default CostBreakdown;