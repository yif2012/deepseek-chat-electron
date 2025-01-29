import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Session {
  id: string;
  name: string;
  content: string[];
}

export const useSessionStore = defineStore('session', async () => {
  const sessions = ref<Session[]>([]);
  const inElectron = window.ipcRenderer !== undefined;
  if (!inElectron) {
    sessions.value = JSON.parse(localStorage.getItem('sessions') || '[]');
  } else {
    const s = await window.ipcRenderer.invoke('get-sessions');
    console.log('s', s);
    sessions.value = JSON.parse(s);
  }
  return { sessions };
});
