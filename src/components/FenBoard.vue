<template>
    <div class="container">   
        <label class="fen-label" for="fen-input">
            FEN
        </label>
        <input :value="fen" @input="$emit('update-fen', $event.target.value)" class="fen-input" >
    </div>
</template>

<script>
export default {
    props: ['fen'],
    emits: ['update-fen'],
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Paytone+One&display=swap');

input {
    border-radius: 15px;
    border: none;
    margin-left: 10px;
    width: 100%;
    height: 30px;
    font-size: 15px;
    color: black;
    font-family: "Montserrat", sans-serif;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
    background: white;
    border: 1px solid #7f48e6;
}

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
</style>