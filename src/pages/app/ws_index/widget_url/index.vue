<template lang="pug">
.row.full-width.q-px-sm
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
      ).row.full-width.b-40.q-pr-md
      q-input(
        v-model="url"
        dark borderless placeholder="Вставье сслыку на контент"
        :loading="urlLoading"
        :input-style=`{
          padding: '12px',
          //- background: 'rgb(40,40,40)',
          //- borderRadius: '10px',
        }`
        ).full-width
      //- template(v-slot:prepend)
        q-btn(
          round flat dense color="grey-5" icon="menu")
    div(:style=`{textAlign: 'center'}`).row.full-width.justify-center.q-py-sm
      small.text-grey-5 YouTube Twitter Spotify Webpage Instagram
      small.text-grey-5 популярные сервисы откуда мы принимаем ссылки и soon может быть перечислить
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ContentApi } from 'src/api/content'
import { UserApi } from 'src/api/user'

export default {
  name: 'widgetUrl',
  data () {
    return {
      url: '',
      urlLoading: false
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
      let [bookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: contentKalpa.oid}})
      if (bookmark) {
        // revive from dead ?
        // await bookmark.restoreFromTrash()
      }
      else {
        let bookmarkInput = {
          type: this.type,
          oid: this.oid,
          name: this.name,
          thumbUrl: this.thumbUrl,
          ...this.fields || {},
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
