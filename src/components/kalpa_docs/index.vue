<style lang="sass">
.doc-item
  color: #424242
  &:hover
    color: #4caf50 !important
</style>

<template lang="pug">
.row.full-width.q-px-sm
  .row.full-width
    router-link(
      v-if="false"
      flat no-caps color="grey-9" align="left"
      :to="'/about'"
      :class=`{
      }`
      :style=`{
        textAlign: 'start',
        borderRadius: '10px',
      }`
      @click="$go('/about')"
      )
      .doc-item
        //q-icon(name="help_outline" size="20px" color="grey-7").q-pr-sm
        small {{$t('How it work?', 'Как работает Кальпаграма')}}
  div(v-for="(d,di) in docs" :key="d.id").row.full-width
    router-link(
      flat no-caps align="left"
      :to="'/help/'+d.id"
      :class=`{
      }`
      :style=`{
        textAlign: 'end',
        borderRadius: '10px',
      }`
      @click="docClick(d,di)"
      ).doc-item
      small(:style=`{color: docColor, textAlign: docAlign}`) {{ d.name }}
      //small {{ d.name }}
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
    docAlign: {
      type: String,
      default: 'left'
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
