<template lang="pug">
q-btn(
  round flat
  icon="bookmark_outline"
  :loading="bookmarkCreating"
  :color="bookmark ? 'green' : color"
  :dense="dense"
  @click="onClick()"
  )
  q-tooltip(v-if="$q.platform.is.desktop" dense dark) {{$t('Save')}}
  q-dialog(
    v-if="isActive && bookmark"
    v-model="bookmarkCreatedDialogShow"
    position="bottom"
    auto-close)
    div(
      v-if="isActive && bookmark"
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
    v-if="isActive && bookmark"
    v-model="bookmarkEditorDialogShow"
    position="bottom")
    bookmark-editor(
      v-if="isActive && bookmark"
      :bookmark="bookmark"
      @deleted="boookmarkDeleted")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

import bookmarkEditor from 'src/components/bookmark/bookmark_editor.vue'

export default {
  name: 'kalpaSave',
  components: {
    bookmarkEditor
  },
  props: {
    isActive: {type: Boolean},
    color: {type: String, default: 'grey-9'},
    dense: {type: Boolean, default: false},
    item: {type: Object, required: true},
  },
  data () {
    return {
      bookmark: null,
      bookmarkCreating: false,
      bookmarkCreatedDialogShow: false,
      bookmarkEditorDialogShow: false,
    }
  },
  watch: {
    isActive: {
      immediate: true,
      async handler (to, from) {
        this.$log('isActive TO', to)
        if (to) {
          this.bookmark = await this.getBookmark()
        }
      }
    }
  },
  methods: {
    async getBookmark () {
      this.$log('getBookmark', this.item.oid)
      if (!this.item.oid) {
        this.$q.notify({type: 'negative', position: 'bottom', message: this.$t('Cant save this item :(')})
        return
      }
      let {items: [bookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.item.oid}})
      this.$log('getBookmark', bookmark)
      return bookmark
    },
    async createBookmark (item, fields) {
      this.$log('createBookmark', item)
      this.bookmarkCreating = true
      let bookmarkInput = {
        type: item.type,
        oid: item.oid,
        name: item.name,
        thumbUrl: item.thumbUrl,
        isSubscribed: true,
        collections: [],
        ...fields,
      }
      let bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
      await this.$wait(500)
      this.bookmarkCreating = false
      return bookmark
    },
    saveBookmark () {
      this.$log('saveBookmark')
      this.bookmarkEditorDialogShow = true
    },
    boookmarkDeleted () {
      this.$log('bookmarkDeleted')
      this.bookmark = null
      this.bookmarkEditorDialogShow = true
    },
    async onClick () {
      this.$log('onClick', this.item)
      // is we got this bookmark ?
      this.bookmark = await this.getBookmark()
      // got bookmark already!, move it to another collections/dimension
      if (this.bookmark) {
        this.bookmarkEditorDialogShow = true
      }
      // save to collection named all...
      else {
        this.bookmark = await this.createBookmark(this.item, {collections: ['all']})
        this.bookmarkCreatedDialogShow = true
      }
    },
  }
}
</script>
