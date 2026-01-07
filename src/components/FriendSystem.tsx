import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFriends, Friend, FriendChallenge } from '@/hooks/useFriends';
import { ArrowLeft, UserPlus, Users, Swords, Check, X, Trash2, Search, Bell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FriendSystemProps {
  playerId: string;
  playerName: string;
  onBack: () => void;
  onJoinGame: (gameId: string) => void;
}

export const FriendSystem = ({ playerId, playerName, onBack, onJoinGame }: FriendSystemProps) => {
  const {
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
    declineChallenge
  } = useFriends(playerId, playerName);

  const [tab, setTab] = useState<'friends' | 'requests' | 'challenges'>('friends');
  const [friendIdInput, setFriendIdInput] = useState('');

  const handleAddFriend = async () => {
    if (!friendIdInput.trim()) {
      toast.error('Please enter a player ID');
      return;
    }
    
    const success = await sendFriendRequest(friendIdInput.trim());
    if (success) {
      setFriendIdInput('');
    }
  };

  const handleChallenge = async (friend: Friend) => {
    const friendId = friend.user_id === playerId ? friend.friend_id : friend.user_id;
    // For now we'll use the ID as name - in a real app you'd look up the name
    await challengeFriend(friendId, friendId.slice(0, 8));
  };

  const handleAcceptChallenge = async (challenge: FriendChallenge) => {
    const gameId = await acceptChallenge(challenge);
    if (gameId) {
      onJoinGame(gameId);
    }
  };

  const getFriendId = (friend: Friend) => {
    return friend.user_id === playerId ? friend.friend_id : friend.user_id;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md p-6 space-y-4 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Friends
          </h2>
        </div>

        {/* Add Friend */}
        <div className="flex gap-2">
          <input
            type="text"
            value={friendIdInput}
            onChange={(e) => setFriendIdInput(e.target.value)}
            placeholder="Enter player ID"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:border-primary outline-none"
          />
          <Button onClick={handleAddFriend} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          </Button>
        </div>

        {/* Your ID */}
        <div className="p-2 bg-muted rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Your Player ID</p>
          <p className="text-sm font-mono select-all">{playerId}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab('friends')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === 'friends' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`flex-1 py-2 text-sm font-medium transition-colors relative ${
              tab === 'requests' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('challenges')}
            className={`flex-1 py-2 text-sm font-medium transition-colors relative ${
              tab === 'challenges' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            Challenges
            {challenges.length > 0 && (
              <span className="absolute -top-1 right-2 w-5 h-5 bg-yellow-500 text-white rounded-full text-xs flex items-center justify-center">
                {challenges.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[200px] max-h-[300px] overflow-y-auto">
          {tab === 'friends' && (
            <div className="space-y-2">
              {friends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No friends yet</p>
                  <p className="text-xs">Add friends using their Player ID</p>
                </div>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{getFriendId(friend).slice(0, 12)}...</p>
                      <p className="text-xs text-muted-foreground">Friend</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleChallenge(friend)}
                        title="Challenge to a match"
                      >
                        <Swords className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFriend(friend.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'requests' && (
            <div className="space-y-2">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pending requests</p>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{request.user_id.slice(0, 12)}...</p>
                      <p className="text-xs text-muted-foreground">Wants to be your friend</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => acceptFriendRequest(request.id)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => declineFriendRequest(request.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'challenges' && (
            <div className="space-y-2">
              {challenges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Swords className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No challenges</p>
                  <p className="text-xs">Challenge a friend to play!</p>
                </div>
              ) : (
                challenges.map((challenge) => (
                  <div key={challenge.id} className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{challenge.challenger_name}</p>
                      <p className="text-xs text-muted-foreground">Challenges you to a match!</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleAcceptChallenge(challenge)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => declineChallenge(challenge.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
