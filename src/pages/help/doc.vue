<style lang="sass">
.doc
  color: white
  a
    color: rgb(76,175,80)
    font-weight: bold
  a:hover
    color: rgb(76,175,80)
</style>

<template lang="pug">
kalpa-layout().b-30
  template(v-slot:header)
    .row.full-width.justify-center.q-pa-sm.b-30
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(:style=`{background: 'rgb(40,40,40)', borderRadius: '10px',}`).row.full-width.items-center.content-center.q-pa-sm
          q-btn(round flat icon="west" color="white" @click="$router.back()").q-mr-sm
          span(v-if="doc").text-white.text-bold {{ doc.name }}
  template(v-slot:body)
    .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-pa-md.doc
        RichTextRenderer(
          v-if="doc"
          :document="doc.body")
</template>

<script>
import RichTextRenderer from 'contentful-rich-text-vue-renderer'

export default {
  name: 'pageHelpDoc',
  components: {
    RichTextRenderer
  },
  data () {
    return {
      doc: null,
    }
  },
  watch: {
    '$route.params.docId': {
      immediate: true,
      async handler (to, from) {
        await this.getDoc(to)
      }
    }
  },
  methods: {
    async getDoc (id) {
      this.$log('getDoc')
      const doc = await this.$contentful.getEntry(id)
      this.$log('doc', doc)
      this.doc = doc.fields
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
