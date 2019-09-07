<template lang="pug">
k-page(name="Content explorer" :items="items" :item="item" @item="item = $event")
  template(v-slot:body)
    content-explorer(v-if="content" :content="content")
</template>

<script>
import contentExplorer from 'components/content_explorer'

export default {
  name: 'page_app_content',
  components: {contentExplorer},
  props: [],
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
