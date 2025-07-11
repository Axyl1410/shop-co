<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCounterStore } from '@/stores/counter'
import { motion } from 'motion-v'
import { ref } from 'vue'

const counterStore = useCounterStore()

function setCustomValue() {
  const value = prompt('Enter a number:')
  if (value !== null) {
    const numValue = parseInt(value)
    if (!isNaN(numValue)) {
      counterStore.setCount(numValue)
    }
  }
}

const hehe = ref('0')
</script>

<template>
  <div>
    <div class="counter-section">
      <div>
        <motion.h2 :initial="{ y: -20 }" :animate="{ y: 0 }"
          >Current Count: {{ counterStore.count }}</motion.h2
        >
      </div>

      <h3>Double Count: {{ counterStore.doubleCount }}</h3>

      <div class="flex gap-2">
        <Button @click="counterStore.decrement()" variant="default">Decrement (-1)</Button>

        <Button @click="counterStore.increment()" variant="outline">Increment (+1)</Button>

        <Button @click="counterStore.reset()">Reset</Button>
        <Button @click="setCustomValue()">Set Custom Value</Button>
        <div class="flex max-w-6xl flex-col">
          <Input v-model="hehe" class="max-w-3xl" />
          <p class="max-w-6xl text-center text-6xl text-wrap text-red-500">{{ hehe }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
