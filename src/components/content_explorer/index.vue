<template lang="pug">
.row.full-width.window-height
  content-video(v-if="content && content.type === 'VIDEO'" :content="content")
  //- content-image
  //- content-book
</template>

<script>
import contentVideo from './content_video'

export default {
  name: 'contentExplorer',
  components: {contentVideo},
  data () {
    return {
      content: null,
    }
  },
  watch: {
    '$route': {
      immediate: true,
      async handler (to, from) {
        if (to.params.oid) {
          this.$log('$route CHANGED', to.params.oid)
          this.content = await this.contentLoad(to.params.oid)
        }
      }
    },
  },
  methods: {
    async contentLoad (oid) {
      this.$log('contentLoad start', oid)
      let {data: {objectList: [content]}} = await this.$apollo.query({
        query: gql`
          query objectList ($oid: OID!) {
            objectList(oids: [$oid]) {
              oid
              type
              name
              ...on Video {
                duration
                thumbUrl(preferWidth: 600)
                url
                height
                width
              }
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      this.$log('contentLoad done', content)
      return content
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
