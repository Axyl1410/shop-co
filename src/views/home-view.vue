<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ServerAxiosConfig } from '@/constant/axios-config'
import type { User } from '@/types'
import { useQuery } from '@tanstack/vue-query'
import axios from 'axios'
import { watch } from 'vue'
import { toast } from 'vue-sonner'

const { data, isError, error, isLoading } = useQuery<User[]>({
  queryKey: ['users'],
  queryFn: async (): Promise<User[]> => {
    const response = await axios(`${ServerAxiosConfig.baseURL}users`)
    return response.data
  },
})

watch([isError], ([newIsError]) => {
  if (newIsError) {
    toast.error('error')
  }
})

const handleClick = () => {
  toast('test')
}
</script>

<template>
  <main>
    <div v-if="isError">{{ error }}</div>
    <div v-if="isLoading">Loading...</div>
    <div v-if="data">
      <div v-for="user in data" :key="user.id">
        <div>{{ user.ten }}</div>
      </div>
    </div>
  </main>
  <Button @click="handleClick">Click me</Button>
</template>
