import React, { useState } from 'react';
import './App.css';

const suits = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function createDeck() {
  let deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Hand Evaluation Functions
function evaluateHand(hand) {
  if (isStraightFlush(hand)) return { rank: 1, highestCard: getHighestCard(hand) };
  if (isThreeOfAKind(hand)) return { rank: 2, highestCard: getHighestCard(hand) };
  if (isStraight(hand)) return { rank: 3, highestCard: getHighestCard(hand) };
  if (isFlush(hand)) return { rank: 4, highestCard: getHighestCard(hand) };
  if (isPair(hand)) return { rank: 5, highestCard: getHighestCard(hand) };
  return { rank: 6, highestCard: getHighestCard(hand) }; // High Card
}

function isStraightFlush(hand) {
  return isFlush(hand) && isStraight(hand);
}

function isThreeOfAKind(hand) {
  return hand[0].value === hand[1].value && hand[1].value === hand[2].value;
}

function isStraight(hand) {
  const valuesIndex = hand.map(card => values.indexOf(card.value)).sort((a, b) => a - b);
  return valuesIndex[2] - valuesIndex[1] === 1 && valuesIndex[1] - valuesIndex[0] === 1;
}

function isFlush(hand) {
  return hand.every(card => card.suit === hand[0].suit);
}

function isPair(hand) {
  const values = hand.map(card => card.value);
  return values[0] === values[1] || values[1] === values[2] || values[0] === values[2];
}

function getHighestCard(hand) {
  return Math.max(...hand.map(card => values.indexOf(card.value)));
}

function determineWinner(player1Hand, player2Hand) {
  const player1Rank = evaluateHand(player1Hand);
  const player2Rank = evaluateHand(player2Hand);
  if (player1Rank.rank < player2Rank.rank) return 1; // Player 1 wins
  if (player1Rank.rank > player2Rank.rank) return 2; // Player 2 wins
  return player1Rank.highestCard > player2Rank.highestCard ? 1 : 2; // Tie-break on highest card
}

function App() {
  const [deck, setDeck] = useState(shuffle(createDeck())); // Create and shuffle deck
  const [player1Hand, setPlayer1Hand] = useState([]); // Player 1's hand
  const [player2Hand, setPlayer2Hand] = useState([]); // Player 2's hand
  const [currentPlayer, setCurrentPlayer] = useState(1); // Track current player
  const [drawCount, setDrawCount] = useState(0); // Count how many cards the player has drawn
  const [gameOver, setGameOver] = useState(false); // Track game over state
  const [winner, setWinner] = useState(null); // Track winner

  function drawCard() {
    if (deck.length === 0) {
      alert('Deck is empty. Reset the game.');
      return;
    }

    const card = deck[0];
    setDeck(deck.slice(1)); // Remove the drawn card from the deck

    if (currentPlayer === 1 && player1Hand.length < 3) {
      setPlayer1Hand(prevHand => [...prevHand, card]);
      setDrawCount(drawCount + 1);

      if (player1Hand.length + 1 === 3) {
        setCurrentPlayer(2); // After 3 cards, switch to Player 2
        setDrawCount(0); // Reset the draw count for Player 2
      }
    } else if (currentPlayer === 2 && player2Hand.length < 3) {
      setPlayer2Hand(prevHand => [...prevHand, card]);
      setDrawCount(drawCount + 1);

      if (player2Hand.length + 1 === 3) {
        // Ensure Player 2's final card is drawn before evaluating
        setTimeout(() => {
          const gameWinner = determineWinner([...player1Hand], [...player2Hand, card]);
          setWinner(gameWinner); // Set the winner to display below Player 2's cards
          setGameOver(true); // End the game
        }, 100); // Small delay to ensure the last card is rendered
      }
    }
  }

  // Reset the game
  function resetGame() {
    setDeck(shuffle(createDeck())); // Shuffle new deck
    setPlayer1Hand([]); // Reset Player 1's hand
    setPlayer2Hand([]); // Reset Player 2's hand
    setCurrentPlayer(1); // Reset to Player 1's turn
    setGameOver(false); // Clear game over state
    setDrawCount(0); // Reset draw count
    setWinner(null); // Clear the winner state
  }

  function getCardImage(card) {
    const cardValue = card.value === '10' ? '0' : card.value; // API uses 0 for 10
    return `https://deckofcardsapi.com/static/img/${cardValue}${card.suit[0]}.png`;
  }

  return (
    <div className="App">
      <h1>Three-Cards</h1>
      {gameOver ? (
        <button onClick={resetGame}>Reset Game</button>
      ) : (
        <button onClick={drawCard}>
          {currentPlayer === 1
            ? `Player 1: Draw Card (${drawCount + 0}/3)`
            : `Player 2: Draw Card (${drawCount + 0}/3)` }
        </button>
      )}

      {/* Display Player 1's Hand */}
      <div>
        <h2>Player 1's Hand</h2>
        <div className="cards">
          {player1Hand.length > 0 ? (
            player1Hand.map((card, index) => (
              <img key={index} src={getCardImage(card)} alt={`${card.value} of ${card.suit}`} className="card-image" />
            ))
          ) : (
            <p>No cards drawn yet</p>
          )}
        </div>
      </div>

      {/* Display Player 2's Hand */}
      <div>
        <h2>Player 2's Hand</h2>
        <div className="cards">
          {player2Hand.length > 0 ? (
            player2Hand.map((card, index) => (
              <img key={index} src={getCardImage(card)} alt={`${card.value} of ${card.suit}`} className="card-image" />
            ))
          ) : (
            <p>No cards drawn yet</p>
          )}
        </div>
      </div>

      {/* Display the winner below Player 2's hand */}
      {winner && (
        <div>
          <h2>{`Player ${winner} wins!`}</h2>
        </div>
      )}
    </div>
  );
}

export default App;
