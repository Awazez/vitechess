<template>
  <div id="app">
    <ChessBoard />
  </div>
</template>

<script lang="ts">
import ChessBoard from './components/ChessBoard.vue';

export default {
  name: 'App',
  components: {
    ChessBoard,
  },
};
</script>

<style>
#app {
  text-align: center;
  margin-top: 40px;
}
</style>

