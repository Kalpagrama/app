<template lang="pug">
.row
  slot(name="action" :start="start" :bookmark="bookmark")
  q-btn(
    v-if="!$scopedSlots.action"
    @click="start()"
    round flat no-caps
    :color="bookmark ? activeColor : inactiveColor"
    :icon="bookmark ? 'bookmark' : 'bookmark_outline'"
    :loading="loading")
    q-tooltip(dense dark) Добавить в закладки
    //- :icon="bookmark ? 'bookmark_outline' : 'bookmark_outline'"
    //- q-badge(floating transparent)
    //- q-icon(
      v-if="bookmark"
      name="notifications_none"
      size="12px"
      :color="'white'"
      :style=`{
        position: 'absolute', zIndex: 10,
        top: '13px',
        //- top: '2px', right: '2px',
        //- top: '-2px', left: '15px',
      }`)
    //- q-menu(
      dark)
      .row
        img(
          :style=`{
            height: '50px',
            borderRadius: '10px',
          }`
          ).br
        .row.full-width
          span {{ name }}
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
          let {items: [bookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.oid}})
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
        if (this.$store.getters.isGuest) {
          let authGuard = {
            message: 'Чтобы добавить в закладки, войдите в аккаунт.'
          }
          this.$store.commit('ui/stateSet', ['authGuard', authGuard])
        }
        else {
          this.loading = true
          await this.$systemUtils.vibrate(500)
          // await this.$wait(500)
          let {items: [bookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.oid}})
          this.$log('start [bookmark]', bookmark)
          if (bookmark) {
            this.$log('bookmark DELETE')
            await bookmark.remove(true)
            if (!await UserApi.isSubscribed(this.oid)) await UserApi.unSubscribe(this.oid)
            bookmark = null
          }
          else {
            this.$log('bookmark CREATE')
            // TODO: where to handle bookmarkInput create?
            let bookmarkInput = {
              type: this.type,
              oid: this.oid,
              name: this.name,
              thumbUrl: this.thumbUrl,
              ...this.fields || {},
              isSubscribed: true
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
      }
      catch (e) {
        this.$log('start error', e)
        this.loading = false
      }
    }
  }
}
</script>
