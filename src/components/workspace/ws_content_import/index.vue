<template lang="pug">
.row.fit.items-center.content-center.justify-center
  //- valid URL
  div(v-if="urlValid").row.full-width.justify-center
    span.text-white {{ url }}
  //- invalid URL
  div(v-else).row.full-width.justify-center
    span.text-green URL is invalid
    //- q-btn(round flat color="green")
</template>

<script>
import { ContentApi } from 'src/api/content'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsContentImport',
  data () {
    return {
      url: null,
      urlValid: false
    }
  },
  computed: {
  },
  watch: {
    '$route.query.url': {
      immediate: true,
      handler (to, from) {
        this.$log('$route.params.url TO', to)
        if (to && this.isURL(to)) {
          this.urlValid = true
          this.url = to
          this.contentComp(to)
        }
        else {
          this.urlValid = false
          this.url = null
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
    async contentComp (url) {
      this.$log('contentComp')
      let content = await this.contentFromURL(url)
      this.$log('content', content)
      let {items: contentFind} = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
          contentOid: content.oid
        }
      })
      this.$log('contentAdd contentFind', contentFind)
    },
    async contentFromURL (url) {
      try {
        this.$log('contentFromURL start', url)
        let content = await ContentApi.contentCreateFromUrl(url)
        this.$log('contentFromURL done')
        return content
      } catch (e) {
        this.$log('contentFromURL error', e)
      }
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
