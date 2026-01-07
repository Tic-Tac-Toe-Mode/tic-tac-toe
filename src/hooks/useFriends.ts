import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend_name?: string;
}

export interface FriendChallenge {
  id: string;
  challenger_id: string;
  challenger_name: string;
  challenged_id: string;
  challenged_name: string;
  game_id: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
}

export const useFriends = (playerId: string, playerName: string) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [challenges, setChallenges] = useState<FriendChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFriends = async () => {
    if (!playerId) return;
    
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .or(`user_id.eq.${playerId},friend_id.eq.${playerId}`)
      .eq('status', 'accepted');
    
    if (!error && data) {
      setFriends(data as Friend[]);
    }
  };

  const fetchPendingRequests = async () => {
    if (!playerId) return;
    
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('friend_id', playerId)
      .eq('status', 'pending');
    
    if (!error && data) {
      setPendingRequests(data as Friend[]);
    }
  };

  const fetchChallenges = async () => {
    if (!playerId) return;
    
    const { data, error } = await supabase
      .from('friend_challenges')
      .select('*')
      .eq('challenged_id', playerId)
      .eq('status', 'pending');
    
    if (!error && data) {
      setChallenges(data as FriendChallenge[]);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!playerId || friendId === playerId) return false;
    setIsLoading(true);
    
    const { error } = await supabase
      .from('friends')
      .insert({
        user_id: playerId,
        friend_id: friendId,
        status: 'pending'
      });
    
    setIsLoading(false);
    
    if (error) {
      if (error.code === '23505') {
        toast.error('Friend request already sent');
      } else {
        toast.error('Failed to send friend request');
      }
      return false;
    }
    
    toast.success('Friend request sent!');
    return true;
  };

  const acceptFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', requestId);
    
    if (error) {
      toast.error('Failed to accept request');
      return false;
    }
    
    toast.success('Friend request accepted!');
    fetchFriends();
    fetchPendingRequests();
    return true;
  };

  const declineFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', requestId);
    
    if (error) {
      toast.error('Failed to decline request');
      return false;
    }
    
    fetchPendingRequests();
    return true;
  };

  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendshipId);
    
    if (error) {
      toast.error('Failed to remove friend');
      return false;
    }
    
    toast.success('Friend removed');
    fetchFriends();
    return true;
  };

  const challengeFriend = async (friendId: string, friendName: string) => {
    if (!playerId) return null;
    setIsLoading(true);
    
    // Create a new game first
    const { data: gameData, error: gameError } = await supabase
      .from('online_games')
      .insert({
        player_x_id: playerId,
        player_x_name: playerName,
        status: 'waiting'
      })
      .select()
      .single();
    
    if (gameError || !gameData) {
      setIsLoading(false);
      toast.error('Failed to create challenge game');
      return null;
    }
    
    // Create the challenge
    const { data: challengeData, error: challengeError } = await supabase
      .from('friend_challenges')
      .insert({
        challenger_id: playerId,
        challenger_name: playerName,
        challenged_id: friendId,
        challenged_name: friendName,
        game_id: gameData.id,
        status: 'pending'
      })
      .select()
      .single();
    
    setIsLoading(false);
    
    if (challengeError) {
      toast.error('Failed to send challenge');
      return null;
    }
    
    toast.success(`Challenge sent to ${friendName}!`);
    return challengeData;
  };

  const acceptChallenge = async (challenge: FriendChallenge) => {
    if (!challenge.game_id) return null;
    
    // Update the game to add player O
    const { error: gameError } = await supabase
      .from('online_games')
      .update({
        player_o_id: playerId,
        player_o_name: playerName,
        status: 'playing'
      })
      .eq('id', challenge.game_id);
    
    if (gameError) {
      toast.error('Failed to join game');
      return null;
    }
    
    // Update challenge status
    await supabase
      .from('friend_challenges')
      .update({ status: 'accepted' })
      .eq('id', challenge.id);
    
    fetchChallenges();
    return challenge.game_id;
  };

  const declineChallenge = async (challengeId: string) => {
    await supabase
      .from('friend_challenges')
      .update({ status: 'declined' })
      .eq('id', challengeId);
    
    fetchChallenges();
  };

  // Subscribe to realtime challenges
  useEffect(() => {
    if (!playerId) return;
    
    fetchFriends();
    fetchPendingRequests();
    fetchChallenges();
    
    const channel = supabase
      .channel('friend-challenges')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_challenges',
          filter: `challenged_id=eq.${playerId}`
        },
        (payload) => {
          const challenge = payload.new as FriendChallenge;
          setChallenges(prev => [...prev, challenge]);
          toast.info(`${challenge.challenger_name} challenged you!`, {
            duration: 10000
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [playerId]);

  return {
    friends,
    pendingRequests,
    challenges,
    isLoading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    challengeFriend,
    acceptChallenge,
    declineChallenge,
    refreshFriends: fetchFriends
  };
};
