<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import { RouterLink, RouterView } from 'vue-router'
import 'vue-sonner/style.css'
</script>

<template>
  <Toaster close-button />
  <div class="">
    <header>
      <div class="">
        <nav>
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/about">About</RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>
