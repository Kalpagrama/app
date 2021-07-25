<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
      maxWidth: $store.state.ui.pageWidth+'px',
    }`
    ).row.full-width.q-pa-md
    //- .row.full-width.justify-center.q-pb-md
      span(:style=`{fontSize: '18px',}`).text-white.text-bold {{$t('Add by Link')}}
    div(
      :style=`{borderRadius: '10px'}`
      ).row.full-width.b-40
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
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).q-mx-xs
        q-btn(
          outline color="grey-8" no-caps
          icon="file_upload"
          :to="'/workspace/create/?upload=true'"
          ).full-width.full-height
          //component(
          //  is='view-upload'
          //  @started="pageStarted = true")
          q-tooltip(dense dark) {{$t('Upload content')}}
          //span.text-grey-6 {{$t('Create')}}
      //- create
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`)
        q-btn(
          outline color="grey-8" no-caps
          icon="add"
          :to="'/workspace/create/'"
          ).full-width.full-height
          q-tooltip(dense dark) {{$t('Create new')}}
          //span.text-grey-6 {{$t('Create')}}
    div(:style=`{textAlign: 'center'}`).row.full-width.justify-center.q-pt-xs
      small.text-grey-5 {{$t('You can add from YouTube, Instagram, Vimeo etc')}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ContentApi } from 'src/api/content'
import { UserApi } from 'src/api/user'
import viewUpload from 'src/pages/app/workspace/page_create/view_upload'

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
          this.contentKalpaFound(await ContentApi.contentCreateFromUrl(to, true))
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
          paid: false,
        }
        bookmark = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, bookmarkInput)
        if (!await UserApi.isSubscribed(contentKalpa.oid)) await UserApi.subscribe(contentKalpa.oid)
      }
      // go to content
      this.$router.push('/content/' + contentKalpa.oid)
    }
  },
  mounted () {
    this.$log('mounted')
    // let t = navigator.clipboard.readText()
    // this.$log('t', t)
  }
}
</script>
