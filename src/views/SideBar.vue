<template>
  <div class="side-bar" :class="{ expand: isExpand }">
    <div class="side-bar-expand">
      <el-icon size="20px" :class="['active']" @click="toggleExpand">
        <ArrowRightBold v-if="isExpand" />
        <ArrowLeftBold v-else />
      </el-icon>
    </div>
    <ElButton
      style="width: 100%; margin-top: 10px"
      title="新增会话"
      :size="!isExpand ? 'large' : 'small'"
      type="primary"
      @click="addSession"
    >
      <ElIcon :size="!isExpand ? '20px' : '16px'">
        <Plus />
      </ElIcon>
      <span v-if="!isExpand">新增会话</span>
    </ElButton>
    <div class="session-list">
      <div class="session-item" v-for="session in sessions" :key="session.id">
        <span>{{ session.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue';
import { ElIcon, ElButton } from 'element-plus';
import { ArrowLeftBold, ArrowRightBold, Plus } from '@element-plus/icons-vue';
import { useSessionStore } from '@/stores/session';
import { storeToRefs } from 'pinia';
import { randomString } from '@/utils/random-string';
const sessionStore = useSessionStore();
const { sessions } = storeToRefs(sessionStore);

const isExpand = ref(false);

const toggleExpand = () => {
  isExpand.value = !isExpand.value;
};

const addSession = () => {
  console.log('addSession');
  console.log('useId()', useId());
  sessions.value.push({
    id: randomString(),
    name: '新会话',
    content: [],
  });
};
</script>
<style scoped lang="less">
.side-bar {
  width: 200px;
  height: 100%;
  background-color: #292a2d;
  color: #fff;
  transition: width 0.3s ease;
  position: relative;
  padding: 10px;
}
.side-bar-expand {
  position: absolute;
  cursor: pointer;
  width: 20px;
  height: 20px;
  top: 50%;
  right: -10px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.side-bar.expand {
  width: 60px;
}
.active {
  color: #fff;
}
.session-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}
.session-item {
  cursor: pointer;
}
</style>
