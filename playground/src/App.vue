<script setup>
import env from 'virtual:typenv/runtime'

const message = import.meta.env.VITE_MESSAGE
</script>

<template>
  <div class="h-screen w-screen flex justify-center items-center">
    <h1>{{ message }}</h1>
    <h1>{{ env.VITE_MESSAGE }}</h1>
  </div>
</template>
