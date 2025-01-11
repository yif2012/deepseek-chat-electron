<template>
  <RouterView></RouterView>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';

export default defineComponent({
  name: 'App',
  components: {
    RouterView,
  },
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  /* 滚动条整体部分 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    border-radius: 4px;
  }

  /* 滚动条轨道 */
  &::-webkit-scrollbar-track {
    background: #292a2d;
    border-radius: 4px;
  }

  /* 滚动条滑块 */
  &::-webkit-scrollbar-thumb {
    background: #4a4a4a;
    border-radius: 4px;
    transition: background 0.3s ease;

    &:hover {
      background: #5a5a5a;
    }
  }

  /* Firefox 滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #4a4a4a #292a2d;
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    border-radius: 4px;
  }
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
