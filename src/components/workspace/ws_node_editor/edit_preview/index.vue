<template lang="pug">
.column.fit
  div().row.full-with.q-pa-md
  div(:style=`{position: 'relative'}`).col.full-width.scroll
    .row.fit.q-px-sm
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`
        ).row.fit.items-center.content-center.justify-center.b-70
        q-spinner(size="50px" color="green")
    //- node(
    //-   ctx="workspace"
    //-   :node="nodePreview" :nodeFullReady="nodePreview"
    //-   :visible="true" :active="true" :mini="false"
    //-   :style=`{
    //-     minHeight: '400px',
    //-   }`).fit
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
        // create
        this.$q.loading.show({spinnerColor: 'green', message: 'Creating node...'})
        await this.$wait(400)
        let res = await NodeApi.nodeCreate(this.node)
        this.$log('nodePublish res', res)
        // publish
        this.$q.loading.show({spinnerColor: 'green', message: 'Publishing node...'})
        await this.$wait(1000)
        this.node.stage = 'published'
        // done
        this.$q.loading.show({spinnerColor: 'green', message: 'Done !'})
        await this.$wait(2000)
        this.$q.loading.hide()
        this.nodePublishing = false
        this.$router.push(`/user/${this.$store.getters.currentUser().oid}`).catch(e => e)
        this.$emit('close')
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
