import { createApp } from 'vue'

import App from '@/App.vue'
import { LocalStorageProgressStore } from '@/infrastructure/storage/localStorageProgressStore'
import { createGameSession, gameSessionKey } from '@/presentation/composables/gameSession'
import '@/presentation/styles/tokens.css'
import '@/presentation/styles/base.css'

// Composition root: the layers are assembled here (infrastructure → application port → presentation).
const progressStore = new LocalStorageProgressStore(window.localStorage)

const app = createApp(App)
app.provide(gameSessionKey, createGameSession(progressStore))
app.mount('#app')
