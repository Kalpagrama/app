<template lang="pug">
.row
  q-dialog(
    v-model="showDialog"
    )
    feeds(
      :oid="oid" :bookmark="bookmark"
      @close="showDialog = false")
  slot(name="action" :start="start" :bookmark="bookmark")
  q-btn(
    v-if="!$scopedSlots.action"
    @click="start()"
    round flat no-caps
    :color="bookmark ? 'green' : 'white'"
    :icon="bookmark ? 'bookmark' : 'bookmark_outline'"
    :loading="loading"
    )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'kalpaBookmark',
  props: ['oid', 'type', 'name', 'thumbUrl', 'isActive'],
  components: {
    feeds: () => import('./feeds.vue')
  },
  data () {
    return {
      showDialog: false,
      bookmark: null,
      loading: false
    }
  },
  watch: {
    isActive: {
      immediate: true,
      async handler (to, from) {
        // this.$log('isActive TO', to)
        if (to) {
          let [bookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.oid}})
          if (bookmark) this.bookmark = bookmark
        }
      }
    }
  },
  methods: {
    async start () {
      try {
        this.$log('start')
        this.loading = true
        let [bookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.oid}})
        if (bookmark) {
          // this.bookmark = bookmark
        }
        else {
          // TODO: where to handle bookmarkInput create?
          let bookmarkInput = {
            oid: this.oid,
            type: this.type,
            name: this.name,
            thumbUrl: this.thumbUrl,
            wsItemType: 'WS_BOOKMARK',
            spheres: []
          }
          bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
          // await UserApi.subscribe(this.oid)
        }
        this.$log('start done')
        this.bookmark = bookmark
        this.loading = false
        this.showDialog = true
      }
      catch (e) {
        this.$log('start error', e)
      }
    }
  }
}
</script>
