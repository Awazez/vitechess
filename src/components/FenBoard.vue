<template>
    <div class="container">   
<label class="fen-label" for="fen-input">
    FEN
</label>
    <input v-model="fen" @input="updateFen" class="fen-input" >
</div>
</template>

<script>
export default {
    data() {
        return {
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        };
    },
    mounted() {
        this.updateFen();  // Emit initial value after DOM is ready
    },

    methods: {
        updateFen() {
            this.$emit('update-fen', this.fen);
            console.log(this.fen);
        }
    }
}
</script>



<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Paytone+One&display=swap');

.container {
    width: 605px;
    margin-top: 50px;
    padding: 15px;
}

.fen-label {
    color: black;
    font-family: "Montserrat", sans-serif;
    font-optical-sizing: auto;
    font-weight: 500;
    font-style: normal;
}

.fen-input {
    width: 90%;
    height: 30px;
    font-size: 15px;
    color: black;
    font-family: "Montserrat", sans-serif;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
    background: white;
    border: 1px solid black;
}



</style>