<template>
  <div>
    <b-button class="mx-2 my-2" size="sm" @click="socket.emit('new-game')">New Game</b-button>
    <b-badge class="mr-2 mb-2" :variant="myTurn ? 'primary' : 'secondary'">turn: {{ currentTurnPlayerIndex }}</b-badge>
    <b-badge class="mr-2 mb-2">Current Player States:{{ playerStates }}</b-badge>
    <!-- <b-badge class="mr-2 mb-2">Current Player Points:{{ points }}</b-badge> -->
    <b-badge class="mr-2 mb-2">{{ phase }}</b-badge>
    <b-badge class="mr-2 mb-2">Winner:{{ playerUserIds.slice(winner,winner+1) }}</b-badge>
    <!-- <b-badge class="mr-2 mb-2">Players:{{ playerUserIds }}</b-badge> -->

    <b-badge class="mr-2 mb-2">Winning Point:{{ currentConfig.winningPoint }}</b-badge>
    <div
      v-for="card in cards"
      :key="card.id"
    >
      <!-- <pre>{{ formatCard(card, true) }}</pre> -->
      <AnimatedCard :card="card" />
    </div>

    <b-button class="mx-2 my-2" size="sm" @click="drawCard" :disabled="!ableToPlay">Draw Card</b-button>
    <b-button class="mx-2 my-2" size="sm" @click="giveUp" :disabled="!ableToPlay">Give Up</b-button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref } from 'vue'
import { io } from "socket.io-client"
import { Config, Card, GamePhase, Action, formatCard, CardId, areCompatible, PlayerState } from "../../../server/model"
import AnimatedCard from './AnimatedCard.vue';


const socket = io()
const playerIndex: Ref<number | "all"> = ref("all")
const currentConfig : Ref<Config> = ref({ numberOfDecks: 0 , rankLimit: 0, winningPoint: 21, playerNumber:2 })

const cards: Ref<Card[]> = ref([])
const currentTurnPlayerIndex = ref(-1)
const phase = ref("")
const playCount = ref(-1)
const fewCardsPlayers: Ref<string[]> = ref([])
const playerStates : Ref<PlayerState[]> = ref([])
const points : Ref<number[]> = ref([])
const winner: Ref<number> = ref(-1)
const playerUserIds: Ref<string[]> = ref([])

const myTurn = computed(() => currentTurnPlayerIndex.value === playerIndex.value && phase.value !== "game-over")
// const ableToPlay = computed(
//   () => currentTurnPlayerIndex.value === playerIndex && phase.value !== "game-over" && playerStates.value[playerIndex] == "draw")
const ableToPlay = computed( function ifAbleToPlay (){
  if(typeof playerIndex.value !== "number")
  return false
  else {
    return (currentTurnPlayerIndex.value === playerIndex.value && phase.value !== "game-over" && playerStates.value[playerIndex.value] == "draw")
  }
}
)

onMounted(() => { 
  socket.emit("get-config") 
  socket.emit("get-playerUserIds") 

  socket.on("get-config-reply", ( newNumberOfDecks : number, newRankLimit : number, newWinningPoint: number) => {
  currentConfig.value.numberOfDecks=newNumberOfDecks
  currentConfig.value.rankLimit=newRankLimit
  currentConfig.value.winningPoint=newWinningPoint
})

})


socket.on("all-cards", (allCards: Card[]) => {
  cards.value = allCards
})

socket.on("updated-cards", (updatedCards: Card[]) => {
  applyUpdatedCards(updatedCards)
})

socket.on("get-playerUserIds-reply", (newPlayerUserIds:string[]) =>{
  playerUserIds.value = newPlayerUserIds

})


socket.on("game-state", (newPlayerIndex: number, newCurrentTurnPlayerIndex: number, newPhase: GamePhase, newPlayCount: number, newPlayerStates: PlayerState[], newPoints: number[], newWinner: number) => {
  if (newPlayerIndex != null) {
    playerIndex.value = newPlayerIndex
  }
  currentTurnPlayerIndex.value = newCurrentTurnPlayerIndex
  phase.value = newPhase
  playCount.value = newPlayCount
  playerStates.value = newPlayerStates
  points.value = newPoints
  winner.value = newWinner
})

function doAction(action: Action) {
  return new Promise<Card[]>((resolve, reject) => {
    socket.emit("action", action)
    socket.once("updated-cards", (updatedCards: Card[]) => {
      resolve(updatedCards)
    })
  })
}

async function drawCard() {
  if (typeof playerIndex.value === "number") {
    const updatedCards = await doAction({ action: "draw-card", playerIndex: playerIndex.value })
    if (updatedCards.length === 0) {
      alert("didn't work")
    }
  }
}

async function giveUp() {
  if (typeof playerIndex.value === "number") {
    const updatedCards = await doAction({ action: "give-up", playerIndex: playerIndex.value })
  }
}


async function applyUpdatedCards(updatedCards: Card[]) {
  for (const x of updatedCards) {
    const existingCard = cards.value.find(y => x.id === y.id)
    if (existingCard) {
      Object.assign(existingCard, x)
    } else {
      cards.value.push(x)
    }
  }
}
</script>