import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminRole } from '@/hooks/useAdminRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, MessageSquare } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  email: string;
  roles: string[];
}

const AdminPanel = () => {
  const { isAdmin, loading, assignAdminRole, removeAdminRole } = useAdminRole();
  const { toast } = useToast();
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      // Load contact messages
      const { data: messages, error: messagesError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;
      setContactMessages(messages || []);

      // Load users with roles separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email');

      if (profilesError) throw profilesError;

      // Get roles for all users
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine users with their roles
      const usersWithRoles = profiles?.map(profile => {
        const userRoleEntries = userRoles?.filter(ur => ur.user_id === profile.user_id) || [];
        const roles = userRoleEntries.length > 0 
          ? userRoleEntries.map(ur => ur.role)
          : ['user'];
        
        return {
          user_id: profile.user_id,
          email: profile.email || '',
          roles
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données admin",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      if (isCurrentlyAdmin) {
        await removeAdminRole(userId);
        toast({
          title: "Succès",
          description: "Rôle admin supprimé",
        });
      } else {
        await assignAdminRole(userId);
        toast({
          title: "Succès", 
          description: "Rôle admin assigné",
        });
      }
      await loadData();
    } catch (error) {
      console.error('Error toggling admin role:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle",
        variant: "destructive",
      });
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', messageId);

      if (error) throw error;
      await loadData();
      
      toast({
        title: "Succès",
        description: "Message marqué comme lu",
      });
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: "Erreur", 
        description: "Impossible de mettre à jour le message",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
            <p className="text-muted-foreground">
              Seuls les administrateurs peuvent accéder à cette section.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Panneau d'Administration</h1>
      </div>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <p>Chargement des utilisateurs...</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <div className="flex gap-1 mt-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant={role === 'admin' ? 'default' : 'secondary'}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant={user.roles.includes('admin') ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => handleToggleAdmin(user.user_id, user.roles.includes('admin'))}
                  >
                    {user.roles.includes('admin') ? 'Supprimer Admin' : 'Faire Admin'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages de Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <p>Chargement des messages...</p>
          ) : contactMessages.length === 0 ? (
            <p className="text-muted-foreground">Aucun message de contact</p>
          ) : (
            <div className="space-y-4">
              {contactMessages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{message.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        De: {message.name} ({message.email})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={message.status === 'read' ? 'secondary' : 'default'}>
                        {message.status === 'read' ? 'Lu' : 'Non lu'}
                      </Badge>
                      {message.status === 'unread' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markMessageAsRead(message.id)}
                        >
                          Marquer comme lu
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm mb-2">{message.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;