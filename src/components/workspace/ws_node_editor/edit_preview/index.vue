<template lang="pug">
.row.fit.justify-center
  div(
    :style=`{
      maxWidth: '600px',
    }`
    ).column.fit.q-py-md
    //- div().row.full-with.q-pa-md
    div(:style=`{position: 'relative'}`).col.full-width.scroll
      div(
        :style=`{
          height: '400px',
          borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.justify-center.b-60
        q-spinner(size="50px" color="green")
      //- node(
      //-   ctx="workspace"
      //-   :node="nodePreview" :nodeFullReady="nodePreview"
      //-   :visible="true" :active="true" :mini="false"
      //-   :style=`{
      //-     minHeight: '400px',
      //-   }`).fit
      .row.full-width.items-center.content-center.q-py-sm
        //- q-btn(
        //-   flat color="white" no-caps icon-right="keyboard_arrow_down"
        //-   :style=`{height: '40px'}`).b-70 Picture in picture
        .col.q-pr-sm
          q-select(
            filled
            dark color="white" label="Layout"
            :value="layout(node.layout)" @input="layoutSelected"
            :options="layouts"
            :style=`{
              borderRadius: '10px', overflow: 'hidden',
              zIndex: 2000, transform: 'translate3d(0,0,0)',
            }`).full-width
        q-btn(
          push color="green" no-caps @click="nodePublish()"
          :style=`{height: '56px'}`).q-px-md Publish
</template>

<script>
import { NodeApi } from 'src/api/node'

export default {
  name: 'editPreview',
  props: ['node'],
  data () {
    return {
      nodePublishing: false,
      layouts: [
        {value: 'PIP', label: 'Picture in picture'},
        {value: 'HORIZONTAL', label: 'Compare'},
        {value: 'SLIDER', label: 'Slider'}
      ]
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
    layout (val) {
      return this.layouts.find(l => l.value === val)
    },
    layoutSelected (e) {
      this.$log('layoutSelected', e)
      this.node.layout = e.value
    },
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
