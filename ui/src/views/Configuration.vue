<template>
  <div>  
    <b-badge class="mr-2 mb-2">{{ currentConfig.rankLimit }}</b-badge>
      <b-row>
        <b-col xs="12" sm="9">
          <b-form>
            <b-form-group
            label="Number of Decks:"
            label-for="numberOfDecks"
            > 
            <b-form-input id="numberOfDecks" type="number" v-model.number="currentConfig.numberOfDecks" placeholder="please type in a number" />
            </b-form-group>
            <b-form-group
            label="Rank Limit:"
            label-for="rankLimit"
            > 
            <b-form-input id="rankLimit" type="number" v-model.number="currentConfig.rankLimit" placeholder="please type in a number" />
            </b-form-group>
            <b-form-group
            label="Winning Point:"
            label-for="winningPoint"
            > 
            <b-form-input id="winningPoint" type="number" v-model.number="currentConfig.winningPoint" placeholder="please type in a number" />
            </b-form-group>
            <!-- <b-form-group
            label="Player Number:"
            label-for="playerNumber"
            > 
            <b-form-input id="playerNumber" type="number" v-model.number="currentConfig.playerNumber" placeholder="please type in a number" />
            </b-form-group> -->
            <b-form-group
            label="Display name:"
            label-for="displayName"
            > 
            <!-- <b-form-input id="displayName" type="radio" v-model.number="currentConfig.playerNumber" placeholder="please type in a number" /> -->
            <input type="radio" id="name" name="name_format" value="name" v-model="config_displayname"/>
            <label for="html">name</label><br>
            <input type="radio" id="firstname" name="name_format" value="given_name" v-model="config_displayname">
            <label for="css">firstname</label>
            </b-form-group>
          </b-form>
        </b-col>
        <b-col xs="12" sm="9">
          <b-button class="mx-2 my-2" size="sm" @click="updateConfig">Submit</b-button>
        </b-col>
      </b-row>
  </div>

</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref } from 'vue'
import { io } from "socket.io-client"
import { Config, NameType } from "../../../server/model"

// start off with configuration by default
const socket = io()
const currentConfig : Ref<Config> = ref({ numberOfDecks: 0 , rankLimit: 0, winningPoint: 21})
const config_displayname: Ref<NameType> = ref("name")
  const busy=ref(false)
//socket.emit("get-config")
onMounted(() => { socket.emit("get-config") })

socket.on("get-config-reply", ( newNumberOfDecks : number, newRankLimit : number, newWinningPoint: number) => {
  currentConfig.value.numberOfDecks=newNumberOfDecks
  currentConfig.value.rankLimit=newRankLimit
  currentConfig.value.winningPoint=newWinningPoint
})

function updateConfig(){
  socket.emit('update-config', currentConfig.value, config_displayname)
}

socket.on("update-config-reply", ( a : boolean ) => {
  if (a === true)
  console.log('done')
})

socket.on("get-displayname-reply", (newdisplayName:NameType) => {
  config_displayname.value = newdisplayName
})



</script>