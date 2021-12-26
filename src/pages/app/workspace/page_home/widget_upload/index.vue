<style lang="sass">
.create-item
  color: #424242
  &:hover
    color: #4caf50 !important
</style>

<template lang="pug">
.row.full-width.justify-center.b-35.br-10
  .row.full-width.q-pa-sm
    q-input(
      v-model="url"
      color="green"
      type="text" inputmode="url"
      :placeholder="$t('Enter link here')"
      :dark="urlInputFocused"
      :loading="urlLoading"
      :debounce="500"
      borderless
      :input-style=`{
        padding: '12px',
        borderRadius: '10px',
        color: 'white'
      }`
      :style=`{
        borderRadius: '10px',
        color: 'white',
        border: '2px solid rgb(76,175,79)',
        // height: '50px'
        //- paddingRight: '10px',
      }`
      @focus="urlInputFocused = true"
      @blur="urlInputFocused = false"
      ).col.full-width.text-white.b-40
    //- upload
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).q-pl-xs
      q-btn(
        outline color="grey-8" no-caps
        icon="file_upload"
        :to="'/workspace/edit?mode=upload'"
        ).full-width.full-height
        //component(
        //  is='view-upload'
        //  @started="pageStarted = true")
        q-tooltip(dense dark) {{$t('Upload content')}}
        //span.text-grey-6 {{$t('Create')}}
    div(:style=`{textAlign: 'center'}`).row.full-width.content-center.justify-center.items-center
      small.text-grey-5 {{$t('Вы можете добавлять с YouTube.')}}
    slot(name="bottom")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ContentApi } from 'src/api/content'
import { UserApi } from 'src/api/user'
import viewUpload from 'src/pages/app/workspace/page_edit/view_upload'

export default {
  name: 'widgetUpload',
  components: {
    viewUpload,
  },
  data () {
    return {
      url: '',
      urlLoading: false,
      urlInputFocused: false,
    }
  },
  watch: {
    url: {
      async handler (to, from) {
        if (this.isURL(to)) {
          this.urlLoading = true
          await this.contentKalpaFound(await ContentApi.contentCreateFromUrl(to, true))
          this.$ym('CONTENT_ADDED')
          this.urlLoading = false
        }
        else {
          // this.$emit('searchString', to)
        }
      }
    }
  },
  methods: {
    isURL (str) {
      let a = document.createElement('a')
      a.href = str
      return (a.host && a.host !== window.location.host)
    },
    async contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
      // this.$emit('contentKalpa', contentKalpa)
      let {items: [bookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_CONTENT, oid: contentKalpa.oid}})
      if (bookmark) {
        // revive from dead ?
        // await bookmark.restoreFromTrash()
      }
      else {
        let bookmarkInput = {
          type: contentKalpa.type,
          oid: contentKalpa.oid,
          name: contentKalpa.name,
          thumbUrl: contentKalpa.thumbUrl,
          isSubscribed: true
        }
        if (contentKalpa.contentAuthor && contentKalpa.contentAuthor.oid === this.$store.getters.currentUser.oid){
          // бэкенд сам добавляет в "мой контент"
        } else {
          bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
        }
        if (!await UserApi.isSubscribed(contentKalpa.oid)) await UserApi.subscribe(contentKalpa.oid)
      }
      // go to content
      this.$emit('uploaded', { contentKalpa, bookmark })
    }
  },
  mounted () {
    this.$log('mounted')
    // let t = navigator.clipboard.readText()
    // this.$log('t', t)
  }
}
</script>
