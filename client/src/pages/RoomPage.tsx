import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGameSocket } from '../hooks/useGameSocket';
import { useGameStore } from '../store/gameStore';
import PokerTable from '../components/PokerTable';
import CardDeck from '../components/CardDeck';
import TopicPanel from '../components/TopicPanel';
import ResultsPanel from '../components/ResultsPanel';
import ModeratorControls from '../components/ModeratorControls';
import SessionTimer from '../components/SessionTimer';
import SessionLockOverlay from '../components/SessionLockOverlay'; // New import
import { Loader2, AlertCircle, Copy, Check, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { CardValue } from '../types'; // New import

export default function RoomPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { error } = useGameStore();
  const [copied, setCopied] = useState(false);

  const {
    gameState,
    isConnected,
    isJoining,
    selectedCard,
    deck,
    isModerator,
    isDealer,
    isBrb, // New
    canVote,
    castVote,
    revealCards,
    resetRound,
    setTopic,
    changeDeck,
    getVotingHistory,
    setBrb, // New
    assignDealer,
  } = useGameSocket({
    roomSlug: slug || '',
    onKicked: () => navigate('/'),
  });

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardSelect = (value: CardValue) => {
    if (value === '☕') {
      setBrb(true);
    } else {
      castVote(value);
    }
  };

  // Loading state
  if (isJoining || !isConnected) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            {isJoining ? 'Joining room...' : 'Connecting...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !gameState) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Failed to join room
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return null;
  }

  // Exclude observers and BRB players from the voter count
  const voters = gameState.participants.filter((p) => p.role !== 'OBSERVER' && !p.isBrb);
  const votersReady = voters.filter((p) => p.hasVoted).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-2 sm:p-4 lg:p-6 xl:p-8 relative">
      {/* Session Lock Overlay */}
      {isBrb && (
        <SessionLockOverlay onUnlock={() => setBrb(false)} />
      )}

      {/* Header */}
      <div className="max-w-screen-2xl mx-auto mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{gameState.roomName}</h1>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {gameState.participants.length} participant
                {gameState.participants.length !== 1 ? 's' : ''}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <SessionTimer />
            </div>
          </div>
          <button
            onClick={copyRoomLink}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {/* Left sidebar - Topic & Results */}
        <div className="lg:col-span-1 space-y-6">
          <TopicPanel
            currentTopic={gameState.activeTopic}
            onSetTopic={setTopic}
            isModerator={isModerator}
            phase={gameState.phase}
            getVotingHistory={getVotingHistory}
          />

          {gameState.phase === 'REVEALED' && gameState.results && (
            <ResultsPanel results={gameState.results} />
          )}
        </div>

        {/* Center - Poker Table */}
        <div className="lg:col-span-2 xl:col-span-3">
          <PokerTable
            participants={gameState.participants}
            votes={gameState.votes}
            phase={gameState.phase}
            deckType={gameState.deckType}
            isModerator={isModerator}
            dealerId={gameState.dealerId}
            onAssignDealer={assignDealer}
          />

          {/* Card selection */}
          {canVote && (
            <div className="mt-6">
              <CardDeck
                deck={deck}
                selectedCard={selectedCard}
                onSelectCard={handleCardSelect}
                disabled={gameState.phase !== 'VOTING'}
                deckType={gameState.deckType}
              />
            </div>
          )}
        </div>

        {/* Right sidebar - Moderator controls */}
        <div className="lg:col-span-1">
          {(isModerator || isDealer) && (
            <ModeratorControls
              phase={gameState.phase}
              deckType={gameState.deckType}
              votersReady={votersReady}
              totalVoters={voters.length}
              onReveal={revealCards}
              onReset={resetRound}
              onChangeDeck={changeDeck}
            />
          )}

          {/* Error notification */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
