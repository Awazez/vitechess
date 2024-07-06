<template>
  <div class="container">
    <div>
      <ChessBoard :fen="currentFen"/>
    <div>
      <FenBoard @update-fen="handleUpdateFen"/>
    <PgnBoard/>
    </div>
    <div>
      <FrameBoard/>
    </div>
    </div>
  
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import ChessBoard from './components/ChessBoard.vue';
import FenBoard from './components/FenBoard.vue'
import PgnBoard from './components/PgnBoard.vue'
import FrameBoard from './components/FrameBoard.vue'


export default {
  name: 'App',
  components: {
    ChessBoard,
    FenBoard,
    PgnBoard,
    FrameBoard
  },
  data() {
    return {
      currentFen:''

    };
  },
  methods: {
    handleUpdateFen(fen: string){
      this.currentFen = fen;
    }

  }
};
</script>
<style scoped>

.container {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 40px;
}
</style>

