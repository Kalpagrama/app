<template lang="pug">
.row.full-width.justify-center.q-pa-sm
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
    div(
      :style=`{
        width: '200px',
        height: $q.screen.height-90+'px',
      }`
      ).column
      .col.full-width.scroll
        .row.full-width.items-start.content-start
          div(
            v-for="(d,di) in docs" :key="d.id"
            flat no-caps color="white" align="left"
            :class=`{
              'b-40': doc ? doc.id === d.id : false,
              //- 'b-35': doc ? doc.id !== d.id : false,
            }`
            :style=`{
              textAlign: 'start',
              borderRadius: '10px',
            }`
            @click="docClick(d,di)"
            ).row.full-width.justify-start.q-pa-sm.cursor-pointer.q-mb-sm
            span(:style=`{userSelect: 'none'}`).text-white {{ d.name }}
    .col
      div(
        :style=`{
          height: $q.screen.height-90+'px',
        }`
        ).column.full-width
        .col.full-width.scroll
          .row.full-width.items-start.content-start.q-pa-md.text-white
            RichTextRenderer(
              v-if="doc"
              :document="doc.body")
</template>

<script>
import RichTextRenderer from 'contentful-rich-text-vue-renderer'

export default {
  name: 'viewDocs',
  components: {
    RichTextRenderer
  },
  data () {
    return {
      docs: [],
      doc: null,
    }
  },
  watch: {
    '$route.query.docId': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (this.docs.length === 0) await this.getDocs()
        if (to) {
          this.doc = this.docs.find(d => d.id === to)
        }
        else {
          this.$router.push({query: {docId: this.docs[0].id}})
        }
      }
    }
  },
  methods: {
    async getDocs () {
      this.$log('getDocs')
      const {items: [doc]} = await this.$contentful.getEntries({
        content_type: 'docs_pack',
        'fields.id': 'kalpa_app_rus',
      })
      this.docs = doc.fields.docs.map(d => {
        return {
          id: d.sys.id,
          name: d.fields.name,
          body: d.fields.body
        }
      })
    },
    docClick (d, di) {
      this.$log('docClick', d, di)
      this.$router.push({query: {docId: d.id}})
    }
  },
  async mounted () {
    this.$log('mounted')
  }
}
</script>
