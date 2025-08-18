import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail, Trash2, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Collaborator {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'accepted';
  invited_at: string;
  accepted_at?: string;
}

const CollaboratorsPage: React.FC = () => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const fetchCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .order('invited_at', { ascending: false });

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('invite-collaborator', {
        body: { 
          email: inviteEmail, 
          role: inviteRole,
          inviterName: 'Team Admin'
        },
      });

      if (error) throw error;

      if (data?.success) {
        setMessage({ type: 'success', text: data.message });
        fetchCollaborators(); // Refresh the list
        setInviteEmail('');
        setShowInviteForm(false);
      } else {
        setMessage({ type: 'error', text: data?.error || 'Failed to send invitation' });
      }
      
    } catch (error: any) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to send invitation' });
    } finally {
      setIsLoading(false);
    }
  };

  const removeCollaborator = async (id: string) => {
    try {
      const { error } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCollaborators(collaborators.filter(c => c.id !== id));
      setMessage({ type: 'success', text: 'Collaborator removed successfully' });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      setMessage({ type: 'error', text: 'Failed to remove collaborator' });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Collaborators</h1>
          <p className="text-muted-foreground">Manage team access and permissions</p>
        </div>
        <Button onClick={() => setShowInviteForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle>Invite New Collaborator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer - Can view content</SelectItem>
                  <SelectItem value="editor">Editor - Can edit content</SelectItem>
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInvite} disabled={isLoading || !inviteEmail}>
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
              <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({collaborators.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {collaborators.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No collaborators yet. Invite your first team member!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{collaborator.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Invited {new Date(collaborator.invited_at).toLocaleDateString()}
                      {collaborator.accepted_at && (
                        <span> • Joined {new Date(collaborator.accepted_at).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleBadgeColor(collaborator.role)}>
                      {collaborator.role}
                    </Badge>
                    <Badge variant={collaborator.status === 'accepted' ? 'default' : 'secondary'}>
                      {collaborator.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeCollaborator(collaborator.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaboratorsPage;