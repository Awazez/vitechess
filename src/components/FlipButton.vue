<template>
    <img :src="img" @click="flipBoard" class="flip-icon">
  </template>
  
  <script>
  import img from '../assets/change_icon.svg';
  
  export default {
    data() {
      return {
        img: img
      };
    },
    methods: {
      flipBoard() {
        this.$emit('flip');
      }
    }
  };
  </script>
  
  <style scoped>
  .flip-icon {
    cursor: pointer;
    width: 40px;
    height: 40px;
  }
  </style>