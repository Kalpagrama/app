<style lang="sass">
.doc-item
  &:hover
    color: white !important
</style>

<template lang="pug">
.row.full-width.text-grey-4.q-px-sm
//- .row.full-width.items-start.content-start.justify-center
  //- header
  div(
    v-if="title"
    ).row.full-width.justify-center.q-py-sm
    small.text-grey-9 {{ title }}
  //- body
  div(
    :style=`{
      ...styles,
    }`
    ).row.full-width.items-start.content-start.justify-center.q-px-sm
    router-link(
      v-for="(d,di) in docs" :key="di"
      :to="'/docs/'+d.id"
      :style=`{
      }`
      ).row.full-width.justify-start
      small.text-grey-9.doc-item {{ d.name }}
</template>

<script>
import RichTextRenderer from 'contentful-rich-text-vue-renderer'

export default {
  name: 'kalpaDocs',
  components: {
    RichTextRenderer
  },
  props: {
    title: {
      type: String
    },
    titleColor: {
      type: String,
      default: 'white',
    },
    docColor: {
      type: String,
      default: 'white'
    },
  },
  data () {
    return {
      doc: null,
      // docs: []
    }
  },
  methods: {
    async getDocs () {
      const {items: [doc]} = await this.$contentful.getEntries({
        content_type: 'docs_pack',
        'fields.id': 'kalpa_app_rus',
      })
      return doc
    },
  },
  async mounted () {
    this.$log('created')
    let doc = await this.getDocs()
    this.$log('doc', doc)
    this.doc = doc.fields.docs[0].fields.body
  }
}
</script>
