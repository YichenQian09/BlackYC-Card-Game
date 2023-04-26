<template>
  <div>
    <b-badge class="mr-2 mb-2">Current Player States:{{ playerStates }}</b-badge>
    <b-badge class="mr-2 mb-2">Current Player Points:{{ points }}</b-badge>
    <h2>Player Information</h2>
    <b-button @click="refresh" class="mb-2">Refresh</b-button>
    <b-table :items="players" >
      <template #cell(operatorId)="cellScope">
        <span >
          {{ cellScope.value }}
        </span>
      </template>
    </b-table>
  </div>




</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref } from 'vue'
import { io } from "socket.io-client"
import { Card, GamePhase, Action, formatCard, CardId, areCompatible, PlayerState } from "../../../server/model"

// start off with configuration by default
const socket = io()
const playerIndex: Ref<number | "all"> = ref("all")
const currentTurnPlayerIndex = ref(-1)
const phase = ref("")
const playCount = ref(-1)
const playerStates : Ref<PlayerState[]> = ref([])
const points : Ref<number[]> = ref([])
const winner: Ref<number> = ref(-1)
const players: Ref<string[]> = ref([])

onMounted(() => { socket.emit("get-config") })

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

async function refresh() {
  players.value = await (await fetch("/api/players/")).json()
}



</script>