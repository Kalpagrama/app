<style lang="sass">
.doc-item
  color: #424242
  &:hover
    color: #4caf50 !important
.doc-item2
  color: #9E9E9E
  &:hover
    color: #4caf50 !important
</style>

<template lang="pug">
.row.full-width
  div(v-for="(d,di) in docs" :key="d.id" :class=`[alignClass]`).row.full-width
    router-link(
      flat no-caps
      :to="'/help/'+d.id"
      @click="docClick(d,di)"
      )
      small(:class=`[docColor]`) {{ d.name }}
</template>

<script>
export default {
  name: 'kalpaDocs',
  components: {
  },
  props: {
    title: {
      type: String
    },
    docColor: {
      type: String,
      default: 'doc-item'
    },
    alignClass: {
      type: String,
      default: ''
    },
  },
  data () {
    return {
      docsPack: null,
      docs: null,
    }
  },
  methods: {
    async getDocsPack () {
      this.$log('getDocs')
      const {items: [doc]} = await this.$contentful.getEntries({
        content_type: 'docs_pack',
        'fields.id': 'kalpa_app_rus',
      })
      return doc
    },
  },
  async mounted () {
    this.$log('mounted')
    this.docsPack = await this.getDocsPack()
    this.$log('docsPack', this.docsPack)
    this.docs = this.docsPack.fields.docs.map(d => {
      return {
        id: d.sys.id,
        name: d.fields.name,
        body: d.fields.body
      }
    })
  }
}
</script>
