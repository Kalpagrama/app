<template lang="pug">
.row.fit.items-center.content-center.justify-center
  //- valid URL
  div(v-if="urlValid").row.full-width.justify-center
    span.text-white {{ url }}
  //- invalid URL
  div(v-else).row.full-width.justify-center
    span.text-green {{$t('URL is invalid')}}
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
      async handler (to, from) {
        this.$log('$route.params.url TO', to)
        if (to && this.isURL(to)) {
          this.urlValid = true
          this.url = to
          let contentWs = await this.contentAdd(await this.contentFromURL(to))
          this.$log('contentWs', contentWs)
          this.$router.replace(`/workspace/content/${contentWs.id}`).catch(e => e)
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
    async contentAdd (content) {
      this.$log('contentAdd content', content)
      // todo неверное решение! мастерская автономна! oid появится только после синхронизации!!!!
      let {items: contentFind} = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
          contentOid: content.oid
        }
      })
      this.$log('contentAdd contentFind', contentFind)
      // create rxDoc
      if (contentFind.length === 0) {
        let contentInput = {
          wsItemType: 'WS_CONTENT',
          thumbOid: content.thumbUrl,
          name: content.name,
          layers: [],
          spheres: [],
          contentOid: content.oid,
          contentType: content.type,
          operation: {
            items: null,
            operations: null,
            type: 'CONCAT'
          }
        }
        this.$log('contentAdd contentInput', contentInput)
        let res = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, contentInput)
        this.$log('contentAdd res', res)
        return res
      } else {
        return contentFind[0]
      }
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
