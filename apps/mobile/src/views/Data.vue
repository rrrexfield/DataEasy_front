<template>
  <div class="data-page">
    <van-nav-bar
      title="数据管理"
      fixed
      placeholder
    />

    <div class="data-content">
      <van-search
        v-model="searchText"
        placeholder="搜索数据"
        @search="onSearch"
      />

      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-cell
            v-for="item in filteredDataList"
            :key="item.id"
            :title="item.name"
            is-link
            @click="handleView(item)"
          >
            <template #label>
              <div class="cell-label-wrap">
                <div class="study-area">{{ item.studyArea }}</div>
                <div class="meta-row">
                  <van-tag
                    type="primary"
                    class="data-meta-tag"
                  >
                    UUID: {{ item.id }}
                  </van-tag>
                  <van-tag
                    type="primary"
                    class="data-meta-tag"
                  >
                    {{ item.type }}
                  </van-tag>
                </div>
              </div>
            </template>
          </van-cell>
        </van-list>
      </van-pull-refresh>
    </div>

    <AppTabbar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useInversionData } from '@/composables/useDatabase'

const router = useRouter()
const searchText = ref('')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const { dataList, refresh } = useInversionData()

const filteredDataList = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  if (!keyword) return dataList.value

  return dataList.value.filter((item) => {
    return (
      item.name.toLowerCase().includes(keyword)
      || item.studyArea.toLowerCase().includes(keyword)
      || item.type.toLowerCase().includes(keyword)
    )
  })
})

const onSearch = () => {
  showToast(`匹配到 ${filteredDataList.value.length} 条记录`)
}

const onRefresh = () => {
  refresh()
  refreshing.value = false
  showToast('刷新成功')
}

const onLoad = () => {
  loading.value = false
  finished.value = true
}

const handleView = (item: any) => {
  showToast(`已选择 ${item.name}`)
  router.push({ path: '/home', query: { dataId: item.id } })
}
</script>

<style scoped lang="scss">
.data-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg-primary;
}

.data-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: calc(96px + env(safe-area-inset-bottom));

  .cell-label-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    margin-top: 2px;
  }

  .study-area {
    color: #aab0b7;
    font-size: 12px;
    line-height: 1.4;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .data-meta-tag {
    border-radius: 6px;
    padding: 2px 10px;
    line-height: 1.3;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
