<template lang="pug">
.row
  //- transition-show="none" transition-hide="none"
  q-dialog(
    v-model="showDialog"
    position="bottom"
    :maximized="$q.screen.width < 800")
    feeds-selector(
      :oid="oid"
      :bookmark="bookmark"
      :style=`{
        height: $q.screen.width < 800 ? $q.screen.height+'px' : '600px',
        maxWidth: $q.screen.width < 800 ? '100%' : '500px',
      }`
      @close="showDialog = false")
  slot(name="action" :start="start" :bookmark="bookmark")
  q-btn(
    v-if="!$scopedSlots.action"
    @click="start()"
    round flat no-caps
    :color="bookmark ? activeColor : inactiveColor"
    :icon="bookmark ? 'bookmark' : 'bookmark_outline'"
    :loading="loading"
    )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'kalpaBookmark',
  props: {
    oid: {type: String},
    type: {type: String},
    name: {type: String},
    thumbUrl: {type: String},
    isActive: {type: Boolean},
    fields: {type: Object},
    inactiveColor: {type: String, default: 'white'},
    activeColor: {type: String, default: 'green'},
  },
  components: {
    feedsSelector: () => import('./feeds_selector.vue')
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
    },
    bookmark: {
      handler (to, from) {
        this.$log('bookmark TO', to)
        if (to) this.$emit('bookmark', to)
      }
    }
  },
  methods: {
    async start () {
      try {
        this.$log('start')
        this.loading = true
        let [bookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.oid}})
        // await UserApi.subscribe(this.oid)
        if (bookmark) {
          // this.bookmark = bookmark
          this.showDialog = true
        }
        else {
          // TODO: where to handle bookmarkInput create?
          let bookmarkInput = {
            oid: this.oid,
            type: this.type,
            name: this.name,
            thumbUrl: this.thumbUrl,
            wsItemType: 'WS_BOOKMARK',
            spheres: [],
            feeds: [],
            ...this.fields || {},
          }
          bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
          // subscribe to this oid...
          if (!await UserApi.isSubscribed(this.oid)) await UserApi.subscribe(this.oid)
        }
        this.$log('start done')
        this.bookmark = bookmark
        this.loading = false
        // this.showDialog = true
      }
      catch (e) {
        this.$log('start error', e)
      }
    }
  }
}
</script>
