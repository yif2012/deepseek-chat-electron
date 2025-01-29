<template>
  <div class="chat">
    <div class="side-bar">
      <SideBar />
    </div>
    <div class="chat-content">
      <ChatContent />
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from './SideBar.vue';
import ChatContent from './ChatContent.vue';
</script>
<style scoped lang="less">
.chat {
  display: flex;
  height: 100vh;
  width: 100vw;
}
.chat-content {
  flex: 1;
}
</style>
