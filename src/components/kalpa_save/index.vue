<template lang="pug">
  q-btn(
    round flat
    icon="bookmark_outline"
    :loading="data.bookmarkCreating"
    :color="data.bookmark ? 'green' : color"
    :dense="dense"
    @click="onClick()"
  )
    q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Save')}}
    q-dialog(
      v-if="data.bookmark"
      v-model="data.bookmarkCreatedDialogShow"
      position="bottom"
      auto-close)
      div(
        :style=`{
        position: 'relative',
        borderRadius: '20px 20px 0 0',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
      }`
      ).row.full-width.q-px-sm.q-pt-sm.b-40
        q-btn(
          flat no-caps color="white" align="left"
          :style=`{
          height: '50px',
        }`
          @click="saveBookmark()"
        ).full-width.q-mb-md
          span.text-white {{ $t('Save to collection') }}
    //- edit bookmark...
    q-dialog(
      v-if="data.bookmark"
      v-model="data.bookmarkEditorDialogShow"
      position="bottom")
      bookmark-editor(
        :bookmark="data.bookmark"
        :showHeader="showHeader"
        @deleted="boookmarkDeleted")
</template>

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'
import { assert } from 'src/system/common/utils'

export default {
  name: 'kalpaSave',
  components: {
    bookmarkEditor
  },
  props: {
    isActive: { type: Boolean },
    itemState: {
      type: Object,
      default () {
        return {}
      }
    },
    color: { type: String, default: 'grey-9' },
    dense: { type: Boolean, default: false },
    item: { type: Object, required: true },
    showHeader: { type: Boolean }
  },
  computed: {
    data () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      assert(this.itemState)
      let key = this.$options.name
      if (!this.itemState[key]) {
        this.$set(this.itemState, key, {
          bookmark: null,
          bookmarkCreating: false,
          bookmarkCreatedDialogShow: false,
          bookmarkEditorDialogShow: false
        })
      }
      return this.itemState[key]
    }
  },
  watch: {
    isActive: {
      immediate: true,
      async handler (to, from) {
        // this.$log('isActive TO', to)
        if (to) {
          this.data.bookmark = await this.getBookmark()
        }
      }
    }
  },
  methods: {
    async getBookmark () {
      // this.$log('getBookmark', this.item.oid)
      if (!this.item.oid) {
        this.$q.notify({ type: 'negative', position: 'bottom', message: this.$t('Cant save this item :(') })
        return
      }
      let { items: [bookmark] } = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
          oid: this.item.oid
        }
      })
      // this.$log('getBookmark', bookmark)
      return bookmark
    },
    async createBookmark (item, fields) {
      this.$log('createBookmark', item)
      this.data.bookmarkCreating = true
      let bookmarkInput = {
        type: item.type,
        oid: item.oid,
        name: item.name,
        thumbUrl: item.thumbUrl,
        isSubscribed: true,
        collections: [],
        ...fields
      }
      let bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
      // await this.$wait(500)
      this.data.bookmarkCreating = false
      return bookmark
    },
    saveBookmark () {
      this.$log('saveBookmark')
      this.data.bookmarkEditorDialogShow = true
    },
    boookmarkDeleted () {
      this.$log('bookmarkDeleted')
      this.data.bookmark = null
      this.data.bookmarkEditorDialogShow = true
    },
    async onClick () {
      // this.$log('onClick', this.item)
      // is we got this bookmark ?
      if (this.$store.getters.isGuest) {
        let authGuard = {
          message: 'Чтобы добавить в закладки, войдите в аккаунт'
        }
        this.$store.commit('ui/stateSet', ['authGuard', authGuard])
      }
      else {
        this.data.bookmark = await this.getBookmark()
        // got bookmark already!, move it to another collections/dimension
        if (this.data.bookmark) {
          this.data.bookmarkEditorDialogShow = true
        }
        // save to collection named all...
        else {
          this.data.bookmark = await this.createBookmark(this.item, {collections: []})
          this.data.bookmarkCreatedDialogShow = true
        }
      }
    }
  }
}
</script>
