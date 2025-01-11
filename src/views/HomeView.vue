<template>
  <div class="chat-container">
    <div class="top-bar"></div>
    <!-- 顶部标题栏 -->
    <div class="header">
      <h3>新对话</h3>
      <ElSpace>
        <ElIcon class="pin-btn" :class="{ active: isPinned }" @click="togglePin" title="窗口置顶">
          <Lock v-if="isPinned" />
          <Unlock v-else />
        </ElIcon>
        <ElIcon class="pin-btn" color="#fff" @click="editAppKey" title="设置API Key">
          <Setting />
        </ElIcon>
      </ElSpace>
    </div>

    <!-- 聊天内容区域 -->
    <div class="chat-content" v-if="!hasAppKey">
      <div class="message system">
        <div class="avatar">
          <img
            src="https://himg.bdimg.com/sys/portraitn/item/public.1.9a8e53e7.iaOFX4hNCDVjKfyipptNYQ"
          />
        </div>
        <div class="message-content">
          <p>
            请先<a href="javascript:;" @click="editAppKey">设置API Key</a>，才能使用DeepSeek Chat
          </p>
        </div>
      </div>
    </div>
    <div v-else class="chat-content" ref="chatContentRef">
      <!-- 历史消息 -->
      <template v-for="(msg, index) in messages" :key="index">
        <!-- 跳过系统消息 -->
        <div :class="['message', msg.role]">
          <div class="avatar">
            <img
              src="https://himg.bdimg.com/sys/portraitn/item/public.1.9a8e53e7.iaOFX4hNCDVjKfyipptNYQ"
              :alt="msg.role"
            />
          </div>
          <div class="message-content">
            <p v-html="renderMarkdown(msg.content)"></p>
            <div class="message-actions">
              <ElIcon size="20" color="#fff" class="action-btn" @click="copyMessage(msg.content)">
                <CopyDocument />
              </ElIcon>
              <button v-if="msg.role === 'assistant'" class="action-btn">
                <i class="fas fa-thumbs-up"></i>
              </button>
              <button v-if="msg.role === 'assistant'" class="action-btn">
                <i class="fas fa-thumbs-down"></i>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- 正在输入的消息 -->
      <div v-if="chatContent" class="message assistant">
        <div class="avatar">
          <img
            src="https://himg.bdimg.com/sys/portraitn/item/public.1.9a8e53e7.iaOFX4hNCDVjKfyipptNYQ"
            alt="assistant"
          />
        </div>
        <div class="message-content">
          <p v-html="renderMarkdown(chatContent)"></p>
        </div>
      </div>
    </div>

    <!-- 底部输入区域 -->
    <div class="input-area" v-if="hasAppKey">
      <div class="input-container">
        <textarea
          v-model="inputMessage"
          ref="inputMessageRef"
          placeholder="给 DeepSeek 发送消息"
          @keyup.enter="sendMessage"
          :disabled="isLoading"
        ></textarea>
        <ElIcon class="send-btn" @click="sendMessage" :disabled="!inputMessage || isLoading">
          <Top v-if="!isLoading" />
          <Loading v-else />
        </ElIcon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, onUnmounted, computed } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import K from '/electron/APP_KEY?raw';
import { Setting, Lock, Unlock, CopyDocument, Top, Loading } from '@element-plus/icons-vue';
import { ElSpace, ElIcon, ElMessage, ElMessageBox } from 'element-plus';

const chatContentRef = ref<HTMLDivElement | null>(null);
const inputMessageRef = ref<HTMLTextAreaElement | null>(null);
const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        }</code></pre>`;
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

const isLoading = ref(false);
const inputMessage = ref('');
const chatContent = ref('');
const API_KEY = ref('');
const isPinned = ref(false);

const hasAppKey = computed(() => {
  return API_KEY.value !== '';
});

const sendMessage = () => {
  if (inputMessage.value && !isLoading.value) {
    console.log(inputMessage.value);
    chat(inputMessage.value);
    inputMessage.value = '';
    scrollToBottom();
  }
};

const renderMarkdown = (text: string) => {
  return md.render(text);
};

const messages = reactive([
  {
    content: '你好我是一个AI助手',
    role: 'system',
  },
]);

const handleLinkClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const link = target.closest('a');
  if (link) {
    event.preventDefault();
    const href = link.getAttribute('href');
    window.open(href!);
  }
};

onMounted(() => {
  if (window.ipcRenderer) {
    window.ipcRenderer.invoke('get-app-key').then((appKey: string) => {
      API_KEY.value = appKey;
    });
  } else {
    API_KEY.value = K;
  }
  inputMessageRef.value?.focus();

  const chatContent = chatContentRef.value;
  if (chatContent) {
    chatContent.addEventListener('click', handleLinkClick);
  }
});

const copyMessage = (message: string) => {
  navigator.clipboard.writeText(message);
  console.log('复制成功');
  ElMessage.success('复制成功');
  // window.ipcRenderer?.invoke('copy-message', message);
};

async function chat(message: string) {
  isLoading.value = true;
  messages.push({
    content: message,
    role: 'user',
  });
  scrollToBottom();

  const data = {
    messages,
    model: 'deepseek-chat',
    frequency_penalty: 0,
    max_tokens: 2048,
    presence_penalty: 0,
    response_format: {
      type: 'text',
    },
    stop: null,
    stream: true,
    stream_options: null,
    temperature: 1,
    top_p: 1,
    tools: null,
    tool_choice: 'none',
    logprobs: false,
    top_logprobs: null,
  };

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY.value}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        const message = line.replace(/^data: /, '');
        if (message === '[DONE]') {
          messages.push({
            content: result,
            role: 'assistant',
          });
          chatContent.value = '';
          scrollToBottom();
          break;
        }

        try {
          const parsed = JSON.parse(message);
          if (parsed.choices[0].delta.content) {
            result += parsed.choices[0].delta.content;
            chatContent.value = result;
            scrollToBottom();
          }
        } catch (error) {
          console.error('Could not JSON parse stream message', message, error);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    isLoading.value = false;
    nextTick(() => {
      inputMessageRef.value?.focus();
    });
  }
}

const scrollToBottom = () => {
  if (chatContentRef.value) {
    setTimeout(() => {
      chatContentRef.value!.scrollTop = chatContentRef.value!.scrollHeight;
    }, 0);
  }
};

const togglePin = async () => {
  if (window.ipcRenderer) {
    const result = await window.ipcRenderer.togglePin(!isPinned.value);
    isPinned.value = result;
  }
};

const editAppKey = () => {
  ElMessageBox.prompt('请输入API Key', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入API Key',
    inputValue: API_KEY.value,
    inputValidator: (value: string) => {
      if (!value) {
        return 'API Key不能为空';
      }
      return true;
    },
  }).then(({ value }) => {
    console.log(value);
    if (value) {
      API_KEY.value = value;
      window.ipcRenderer?.invoke('edit-app-key', value);
    }
  });
};

onUnmounted(() => {
  const chatContent = chatContentRef.value;
  if (chatContent) {
    chatContent.removeEventListener('click', handleLinkClick);
  }
});
</script>

<style scoped lang="less">
.top-bar {
  height: 30px;
  background-color: #292a2d;
  width: 100%;
  cursor: move;
  app-region: drag;
}
/* 使scoped样式中的deep选择器也能影响markdown渲染的内容 */
:deep(.hljs) {
  background: #292a2d;
  border-radius: 4px;
  padding: 1em;
  margin: 0.5em 0;
}

:deep(pre) {
  overflow-x: auto;
}

:deep(code) {
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}

:deep(p) {
  margin: 4px 0;
}

:deep(a) {
  color: #4a90e2;
  text-decoration: none;
}

:deep(a:hover) {
  text-decoration: underline;
}

:deep(ul),
:deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

:deep(blockquote) {
  border-left: 4px solid #4a90e2;
  margin: 0.5em 0;
  padding-left: 1em;
  color: #888;
}

.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #292a2d;
  color: #ffffff;
}

.header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #3d3d3d;

  .pin-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 20px;
    transition: all 0.3s ease;
    padding: 2px;
    &:hover {
      color: #4a90e2;
    }

    &.active {
      color: #4a90e2;
      // transform: rotate(45deg);
    }
  }
}

h1 {
  text-align: left;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  text-align: left;
  scroll-behavior: smooth;
  /* 滚动条整体部分 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
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
}

.message {
  display: flex;
  margin-bottom: 1rem;
}

.message.assistant {
  justify-content: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  margin: 0 1rem;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message.assistant .message-content {
  text-align: left;
}

.message.user .message-content {
  text-align: right;
}

.message-content p {
  background: #424242;
  padding: 1rem;
  border-radius: 8px;
  display: inline-block;
  max-width: 100%;
  position: relative;
}

.message.assistant .message-content p::before,
.message.system .message-content p::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 14px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #424242;
}

.message.user .message-content p::before {
  content: '';
  position: absolute;
  right: -8px;
  top: 14px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 8px solid #4a90e2;
}

.message.user .message-content p {
  background: #4a90e2;
}

.message-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
}

.message.user .message-actions {
  justify-content: flex-end;
}

.action-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
}

.input-area {
  padding: 1rem;
  border-top: 1px solid #3d3d3d;
}

.input-container {
  background-color: #424242;
  border-radius: 8px;
  padding: 1rem;
  position: relative;
}

textarea {
  width: 100%;
  min-height: 60px;
  background: none;
  border: none;
  color: white;
  resize: none;
  outline: none;
  padding-right: 40px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.new-tag {
  background-color: #4a90e2;
  color: white;
  font-size: 0.75rem;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.send-btn {
  position: absolute;
  width: 2rem;
  height: 2rem;
  right: 1rem;
  bottom: 1rem;
  background: #4a90e2;
  border-radius: 50%;
  border: none;
  color: #fff;
  cursor: pointer;
  // padding: 0.5rem;
  font-size: 1.2rem;
  transition: color 0.3s ease;
}

.send-btn:hover {
  color: #357abd;
}

.send-btn:disabled {
  color: #666;
  cursor: not-allowed;
}

textarea:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
