import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Lightbulb, Tag } from 'lucide-react';
import { SermonIdea } from '@/types/sermon';

interface SermonIdeasListProps {
  ideas: SermonIdea[];
  onAddIdea: () => void;
  onSelectIdea: (idea: SermonIdea) => void;
}

const SermonIdeasList: React.FC<SermonIdeasListProps> = ({ ideas, onAddIdea, onSelectIdea }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          Sermon Ideas
        </h2>
        <Button onClick={onAddIdea} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Idea
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => (
          <Card 
            key={idea.id} 
            className="hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => onSelectIdea(idea)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {idea.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {idea.description}
              </p>
              
              {idea.scriptures.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Scriptures:</p>
                  <p className="text-sm">{idea.scriptures.join(', ')}</p>
                </div>
              )}
              
              {idea.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {idea.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SermonIdeasList;