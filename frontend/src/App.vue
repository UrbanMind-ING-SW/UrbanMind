<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
/* Reset globale per assicurarsi che l'app occupi tutto lo schermo */
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
  min-height: 100vh;
}

/* Rimuoviamo 'scoped' per questi stili perché devono applicarsi a tutta la pagina */
</style>