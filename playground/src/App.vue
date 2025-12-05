<script setup>
const message = import.meta.env.VITE_MESSAGE
</script>

<template>
  <div class="h-screen w-screen flex justify-center items-center">
    <h1>{{ message }}</h1>
  </div>
</template>
