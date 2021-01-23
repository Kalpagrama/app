<template lang="pug">
.row.full-width
  div(
    :style=`{
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
    }`
    ).row.full-width.q-pa-md
    .row.full-width.justify-center.q-py-md
      span(:style=`{fontSize: '18px',}`).text-white Добавить контент по ссылке
    div(
      :style=`{borderRadius: '10px',}`
      ).row.full-width.b-40
      q-input(
        v-model="url"
        color="green"
        placeholder="Вставье сслыку на контент"
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
        }`
        @focus="urlInputFocused = true"
        @blur="urlInputFocused = false"
        ).full-width.text-white.b-40
    div(:style=`{textAlign: 'center'}`).row.full-width.justify-center.q-py-sm
      small.text-grey-5 YouTube Twitter Spotify Webpage Instagram
  //- from device
  //- .row.full-width
    .row.full-width.q-pt-sm.q-px-md
      //- to="/workspace/create"
      //- TODO: upload from device !
      q-btn(
        outline color="grey-8" no-caps
        :style=`{
          height: '60px',
        }`
        ).full-width
        span.text-grey-6 Загрузить с устройства
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ContentApi } from 'src/api/content'
import { UserApi } from 'src/api/user'

export default {
  name: 'widgetUpload',
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
          this.contentKalpaFound(await ContentApi.contentCreateFromUrl(to))
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
      let {items: [bookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: contentKalpa.oid}})
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
        bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
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
