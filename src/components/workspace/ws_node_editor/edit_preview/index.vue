<template lang="pug">
.column.fit
  div().row.full-with.q-pa-md
  div(:style=`{position: 'relative'}`).col.full-width.scroll
    //- .row.fit.q-px-sm
    //-   div(:style=`{borderRadius: '10px', overflow: 'hidden'}`
    //-     ).row.fit.items-center.content-center.justify-center.b-70
    //-     q-spinner(size="50px" color="green")
    node(
      ctx="workspace"
      :node="nodePreview" :nodeFullReady="nodePreview"
      :visible="true" :active="true" :mini="false"
      :style=`{
        minHeight: '400px',
      }`).fit
  .row.full-width.items-center.content-center.q-px-sm.q-py-md
    q-btn(
      flat color="white" no-caps icon-right="keyboard_arrow_down"
      :style=`{height: '50px'}`).b-70 Layout
    .col
    q-btn(
      push color="green" no-caps @click="nodePublish()"
      :style=`{height: '50px'}`).q-px-xl Publish node
</template>

<script>
import { NodeApi } from 'src/api/node'

export default {
  name: 'editPreview',
  props: ['node'],
  data () {
    return {
      nodePublishing: false
    }
  },
  computed: {
    nodePreview () {
      return {
        layout: 'PIP',
        name: this.node.name,
        // meta: this.node,
        items: this.node.items,
        spheres: this.node.spheres,
        category: this.node.category,
        author: null
      }
    }
  },
  methods: {
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        // await this.$wait(2000)

        let res = await NodeApi.nodeCreate(this.node)
        // let res = await this.$store.dispatch('node/nodeCreate', JSON.parse(JSON.stringify(this.node)))
        this.$log('nodePublish res=', res)
        // this.nodePublishing = false
        // go to node
        this.node.stage = 'published'
        this.$emit('close')
        // this.$router.push('/account')
      } finally {
        this.nodePublishing = false
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
