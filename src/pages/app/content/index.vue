<template lang="pug">
div(:style=`{height: $q.screen.height+'px'}`).row.full-width
  div(:style=`{position: 'relative'}`).col.full-height
    span(
      v-if="content"
      :style=`{
        position: 'absolute', zIndex: 2000, top: '10px', left: '10px',
        borderRadius: '10px', background: 'rgba(0,0,0,0.2)'
      }`
      ).q-pa-sm.text-green.text-bold {{ content.name }}
    composition(
      v-if="content"
      ctx="workspace" :value="{layers: [{content, figuresAbsolute: [], figuresRelative: [], spheres: []}]}" :visible="true" :active="true" :mini="false")
  div(:style=`{width: '400px'}`).column.full-height
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
      span.text-bold.text-green Related nodes
    .col.full-width.scroll
      kalpa-loader(v-if="sphereOid" type="sphereNodes" :variables="variables" ref="contentNodesLoader")
        template(v-slot:items=`{items}`)
          node-list(:nodes="items" :style=`{maxWidth: '390px'}`
            @nodeMiddle="nodeMiddle")
</template>

<script>
export default {
  name: 'pageAppContent',
  components: {},
  props: [],
  data () {
    return {
      content: null
    }
  },
  computed: {
    sphereOid () {
      return this.content ? this.content.oid : false
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 10 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler (to, from) {
        if (to && to.params.oid) {
          this.$log('$route CHANGED to.params.oid', to.params.oid)
          this.content = null
          await this.$wait(300)
          this.content = await this.contentLoad(to.params.oid)
        }
      }
    }
  },
  methods: {
    nodeMiddle (index) {
      this.$log('nodeMiddle')
      let node = this.$refs.contentNodesLoader.query.items[index]
      this.$log('node.name', node.name)
    },
    async contentFound (content) {
      this.$log('contentFound', content)
      // add content to ws
      let res = await this.$store.dispatch('workspace/wsItemAdd', content.oid)
      this.$log('res', res)
      // go to content/oid
      this.$router.push('/content/' + content.oid)
    },
    async contentLoad (oid) {
      this.$log('contentLoad start', oid)
      let content = await this.$store.dispatch('objects/get', { oid, priority: 0 })
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
