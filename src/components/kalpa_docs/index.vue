<style lang="sass">
.doc-item
  color: white
  &:hover
    color: green !important
</style>

<template lang="pug">
.row.full-width.q-px-sm
  div(v-for="(d,di) in docs" :key="d.id").row.full-width
    router-link(
      flat no-caps color="white" align="left"
      :to="'/help/'+d.id"
      :class=`{
      }`
      :style=`{
        textAlign: 'start',
        borderRadius: '10px',
      }`
      @click="docClick(d,di)"
      ).doc-item
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
    titleColor: {
      type: String,
      default: 'text-grey-9',
    },
    docColor: {
      type: String,
      default: 'text-grey-9'
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
