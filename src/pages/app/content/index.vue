<template lang="pug">
.row.window-height.full-width.bg-white
  .col.full-height
    content-video(v-if="content && content.type === 'VIDEO'" :content="content" :width="width/2" :height="height" @now="now = $event")
  .col.full-height
    content-nodes(v-if="content" :content="content" :width="width/2" :height="height" :now="now")
</template>

<script>
import contentVideo from './content_video'
import contentNodes from './content_nodes'

export default {
  name: 'pageApp__Content',
  components: {contentVideo, contentNodes},
  props: ['width', 'height'],
  data () {
    return {
      oid: undefined,
      content: null,
      now: null
    }
  },
  watch: {
    '$route': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
        this.$set(this, 'content', await this.contentLoad(to.params.oid))
      }
    }
  },
  methods: {
    async contentLoad (oid) {
      try {
        this.$log('contentLoad start', oid)
        let {data: {objectList}} = await this.$apollo.query({
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
        // TODO: check objectList
        // if (objectList)
        this.$log('contentLoad done', objectList[0])
        return objectList[0]
      } catch (e) {
        this.$log('contentLoad error', e)
      }
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
