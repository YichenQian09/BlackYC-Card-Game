<template>
  <div>
    <b-navbar toggleable="lg" type="dark" :variant="user?.roles?.includes('administrator') ? 'info' : 'primary'">
      <b-navbar-brand href="#">
        <span v-if="user?.name && user?.roles?.includes('player')">Welcome, {{ displayname.value=="name"? user.name:user.given_name }}</span>
        <span v-else-if="user?.name && user?.roles?.includes('administrator')">Welcome, administrator {{ displayname.value=="name"? user.name:user.given_name }}</span>
        <span v-else>Card Game</span>
      </b-navbar-brand>
      <b-navbar-nav>
        <b-nav-item v-if="user?.roles?.includes('player')" href="/game">Start Game</b-nav-item>
        <b-nav-item v-if="user?.roles?.includes('administrator')" href="/config">Configuration</b-nav-item>
        <b-nav-item v-if="user?.roles?.includes('administrator')" href="/admin">Game State</b-nav-item>
        <b-nav-item v-if="user?.name == null" href="/api/login">Login</b-nav-item>
        <b-nav-item v-if="user?.name" @click="logout">Logout</b-nav-item>
        <form method="POST" action="/api/logout" id="logoutForm" />
      </b-navbar-nav>
    </b-navbar>
    <router-view />
    <!-- <span>{{displayname}}</span> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, provide, Ref } from 'vue'
import { io } from "socket.io-client"
import { NameType } from "../../server/model"

const socket = io()
const displayname: Ref<NameType> = ref("name")
const user = ref({} as any)
provide("user", user)

onMounted(async () => {
  user.value = await (await fetch("/api/user")).json()
  //socket.emit("get-displayname")
})

function logout() {
  ;(window.document.getElementById('logoutForm') as HTMLFormElement).submit()  
}

socket.on("get-displayname-reply", (newdisplayName:NameType) => {
  displayname.value = newdisplayName
})
</script>