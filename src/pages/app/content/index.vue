<template lang="pug">
div(:style=`{height: 'calc(var(--vh, 1vh) * 100)'}`).column.full-width
  .col
    content-explorer(v-if="content" :content="content")
</template>

<script>
import contentExplorer from 'components/content_explorer'

export default {
  name: 'page_app_content',
  components: {contentExplorer},
  props: ['width', 'height'],
  data () {
    return {
      item: 'content',
      items: {
        content: {name: 'Content'},
        some: {name: 'какие-нибудь'},
        points: {name: 'пункты'},
        menu: {name: 'меню'}
      },
      content: null
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler (to, from) {
        if (to.params.oid) {
          this.$logD('$route CHANGED', to.params.oid)
          this.content = await this.contentLoad(to.params.oid)
        }
      }
    },
  },
  methods: {
    async contentLoad (oid) {
      this.$logD('contentLoad start', oid)
      let content = await this.$store.dispatch('objects/get', { oid, fragmentName: 'objectFragment', priority: 0 })
      // let {data: {objectList: [content]}} = await this.$apollo.query({
      //   query: gql`
      //     query contentLoad ($oid: OID!) {
      //       objectList(oids: [$oid]) {
      //         oid
      //         type
      //         name
      //         ...on Video {
      //           duration
      //           thumbUrl(preferWidth: 600)
      //           url
      //           height
      //           width
      //         }
      //       }
      //     }
      //   `,
      //   variables: {
      //     oid: oid
      //   }
      // })
      this.$logD('contentLoad done', content)
      return content
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
