////////////////////////////////////////////////////////////////////////////////////////////
// data model for cards and game state

export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
export const SUITS = ["♦️", "♥️", "♣️", "♠️"]

export type CardId = string
export type LocationType = "unused" | "last-card-played" | "player-hand"

export interface Card {
  id: CardId
  rank: typeof RANKS[number]
  suit: typeof SUITS[number]
  locationType: LocationType
  playerIndex: number | null
  positionInLocation: number | null
}

/**
 * determines whether one can play a card given the last card played
 */
export function areCompatible(card: Card, lastCardPlayed: Card) {
  return card.rank === lastCardPlayed.rank || card.suit === lastCardPlayed.suit 
}

export type GamePhase = "play" | "game-over"

export type PlayerState= "bust" | "giveup" | "draw"

export type NameType = "name" | "given_name"

//initial value of playStates: an array in which all elements are "draw"
//initial value of points: an array in which all elements are 0
export interface GameState {
  playerNames: string[]
  cardsById: Record<CardId, Card>
  currentTurnPlayerIndex: number
  phase: GamePhase
  playCount: number
  playerStates : PlayerState[]
  points : number[]
  winner : number
  winningPoint:number
}

export interface Config{
  numberOfDecks:number
  rankLimit:number
  winningPoint:number
}

/**
 * @returns an array of the number of the cards in each player's hand
 */
export function computePlayerCardCounts({ playerNames, cardsById }: GameState) {
  const counts = playerNames.map(_ => 0)
  Object.values(cardsById).forEach(({ playerIndex }) => {
    if (playerIndex != null) {
      ++counts[playerIndex]
    }
  })
  return counts
}

/**
 * @returns an number of point of currentplayer's cards
 */
 export function computePlayerPoint(gamestate:GameState,playerIndex:number) {
  const cards=extractPlayerCards(gamestate.cardsById,playerIndex)
  let point=cards.reduce((accumulator, currentCard) => {
    let currentPoint
    if(currentCard.rank=='A'){
      currentPoint=1
    }else if(currentCard.rank=='J'||currentCard.rank=='Q'||currentCard.rank=='K'){
      currentPoint=10
    }else{
      currentPoint=parseInt(currentCard.rank)
    }
    return accumulator+currentPoint
  }
  ,0)
  return point
}

/**
 * return an array including a list of the players who have only 2 cards left in their hand or fewer.
 */
export function findFewCardsPlayers(gamestate: GameState) {
  const playerCardCounts=computePlayerCardCounts(gamestate)
  const fewCardsPlayers : number[]=[]
  for (let i:number = 0; i < playerCardCounts.length;i++){
    if (playerCardCounts[i] <=2 ){
      fewCardsPlayers.push(i)
    }
  }
  return fewCardsPlayers
}


/**
 * finds the last played card
 */
export function getLastPlayedCard(cardsById: Record<CardId, Card>) {
  return Object.values(cardsById).find(c => c.locationType === "last-card-played") || null
}

/**
 * extracts the cards that are currently in the given player's hand
 */
 export function extractPlayerCards(cardsById: Record<CardId, Card>, playerIndex: number): Card[] {
  return Object.values(cardsById).filter(({ playerIndex: x }) => x === playerIndex)
}

/**
 * determines if someone has won the game 
 */
//playerStates "bust" | "giveup" | "draw"
 export function determineWinner(state: GameState, winningPoint: number) {
  //if a player has points exactly equal to winningPoint, she wins, return her index
  const winnerIndex=state.points.findIndex((point)=>point==winningPoint)
  if(winnerIndex!=-1)
    return winnerIndex
  // if any player bust or no player continue drawing, compare points
  if(state.playerStates.includes("bust")||!state.playerStates.includes("draw")){
    let maxPoint=0,indexOfMax=-1;
    state.points.forEach((value,index)=>{
      if(state.playerStates[index]!="bust" && value>maxPoint){
        indexOfMax=index
        maxPoint=value
      }
    })
    if(indexOfMax!=-1) return indexOfMax
  }
}

/**
 * creates an empty GameState
 */
 export function createEmptyGame(playerNames: string[], numberOfDecks = 5, rankLimit = Infinity, winningPoint=21): GameState {
  const cardsById: Record<CardId, Card> = {}
  let cardId = 0

  for (let i = 0; i < numberOfDecks; i++) {
    for (const suit of SUITS) {
      for (const rank of RANKS.slice(0, rankLimit)) {
        const card: Card = {
          suit,
          rank,
          id: String(cardId++),
          locationType: "unused",
          playerIndex: null,
          positionInLocation: null,
        }
        cardsById[card.id] = card
      }
    }
  }

  return {
    playerNames:[...playerNames],
    cardsById,
    currentTurnPlayerIndex: 0,
    phase: "play",
    playCount: 0,
    playerStates : new Array(playerNames.length).fill("draw"),
    points : new Array(playerNames.length).fill(0),
    winner : -1,
    winningPoint
  }
}

/**
 * looks through the cards for a random card in the unused state -- 
 * basically, equivalent to continuously shuffling the deck of discarded cards
 */
export function findNextCardToDraw(cardsById: Record<CardId, Card>): CardId | null {
  const unplayedCardIds = Object.keys(cardsById).filter(cardId => cardsById[cardId].locationType === "unused")
  if (unplayedCardIds.length === 0) {
    return null
  }
  return unplayedCardIds[Math.floor(Math.random() * unplayedCardIds.length)]
}

////////////////////////////////////////////////////////////////////////////////////////////
// player actions
export type ActionType = "draw-card" |  "give-up"

export interface Action {
  action: ActionType
  playerIndex: number
}

//move to next player whose playerstate is not giveup
function moveToNextPlayer(state: GameState) {
  //state.currentTurnPlayerIndex = (state.currentTurnPlayerIndex + 1) % state.playerNames.length
  //state.playerNames.length
  let nextIndex = (state.currentTurnPlayerIndex + 1) % state.playerNames.length
  while(state.playerStates[nextIndex] == "giveup"){
    nextIndex = (nextIndex + 1) % state.playerNames.length
  }
  state.currentTurnPlayerIndex=nextIndex
}

function moveCardToPlayer({ currentTurnPlayerIndex, cardsById }: GameState, card: Card) {
  // add to end position
  const currentCardPositions = extractPlayerCards(cardsById, currentTurnPlayerIndex).map(x => x.positionInLocation)

  // update state
  card.locationType = "player-hand"
  card.playerIndex = currentTurnPlayerIndex
  card.positionInLocation = Math.max(-1, ...currentCardPositions) + 1
}

// function moveCardToLastPlayed({ currentTurnPlayerIndex, cardsById }: GameState, card: Card) {
//   // change current last-card-played to unused
//   Object.values(cardsById).forEach(c => {
//     if (c.locationType === "last-card-played") {
//       c.locationType = "unused"
//     }
//   })

//   // update state
//   card.locationType = "last-card-played"
//   card.playerIndex = null
//   card.positionInLocation = null
// }

/**
 * updates the game state based on the given action
 * @returns an array of cards that were updated, or an empty array if the action is disallowed
 */
export function doAction(state: GameState, action: Action): Card[] {
  const changedCards: Card[] = []
  if (state.phase === "game-over") {
    // game over already
    return []
  }
  if (action.playerIndex !== state.currentTurnPlayerIndex) {
    // not your turn
    return []
  }

  if (action.action === "draw-card") {
    const cardId = findNextCardToDraw(state.cardsById)
    if (cardId == null) {
      return []
    }
    const card = state.cardsById[cardId]
    moveCardToPlayer(state, card)
    changedCards.push(card)
    //calculate point for the current player
    let currentPoint=computePlayerPoint(state,action.playerIndex)
    state.points[action.playerIndex]=currentPoint
    //update the playerstates based on the point of current player
    if(currentPoint>state.winningPoint){
      state.playerStates[action.playerIndex]="bust"
    }else{
      state.playerStates[action.playerIndex]="draw"
    }
  }
  // if the player choose to give up, then she cannot draw cards during next rounds
  //update the playerStates
  else if (action.action === "give-up"){
    state.playerStates[action.playerIndex] = "giveup"
  }

  const winner = determineWinner(state, state.winningPoint)
  if (winner != null) {
    state.winner = winner
    state.phase = "game-over"
  }

  ++state.playCount

  if(state.phase != "game-over"){
    moveToNextPlayer(state)
  }

  return changedCards
}

export function formatCard(card: Card, includeLocation = false) {
  let paddedCardId = card.id
  while (paddedCardId.length < 3) {
    paddedCardId = " " + paddedCardId
  }
  return `[${paddedCardId}] ${card.rank}${card.suit}${(card.rank.length === 1 ? " " : "")}`
    + (includeLocation
      ? ` ${card.locationType} ${card.playerIndex ?? ""}`
      : ""
    )
}

export function printState({ playerNames, cardsById, currentTurnPlayerIndex, phase, playCount }: GameState) {
  const lastPlayedCard = getLastPlayedCard(cardsById)
  console.log(`#${playCount} ${phase} ${lastPlayedCard ? formatCard(lastPlayedCard) : ""}`)
  playerNames.forEach((name, playerIndex) => {
    const cards = extractPlayerCards(cardsById, playerIndex)
    console.log(`${name}: ${cards.map(card => formatCard(card)).join(' ')} ${playerIndex === currentTurnPlayerIndex ? ' *TURN*' : ''}`)
  })
}

/**
 * @returns only those cards that the given player has any "business" seeing
 */
export function filterCardsForPlayerPerspective(cards: Card[], playerIndex: number) {
  return cards.filter(card => card.playerIndex == null || card.playerIndex === playerIndex)
}