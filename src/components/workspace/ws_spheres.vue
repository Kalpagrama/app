<template lang="pug">
.row.fit
  .column.fit
    div(:style=`{height: '80px'}`).row.full-width.items-center.content-center.q-px-md
      div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white
        q-input(v-model="sphere" color="green" placeholder="Type a new sphere" @keyup.enter="sphereAdd"
          :input-style=`{paddingLeft: '10px'}`).full-width
    .col.full-width
      div(v-if="node").row.full-width.items-start.content-start.q-pa-md
        div(
          v-for="(s,si) in node.spheres" :key="si" @click="sphereClick(s,si)"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`
          ).row.bg-grey-8.q-mr-sm.q-mb-sm
          span(:style=`{whiteSpace: 'nowrap'}`).text-white.q-pa-sm {{ s.name }}
</template>

<script>
import { throttle } from 'quasar'

export default {
  name: 'wsSpheres',
  data () {
    return {
      sphere: '',
      node: null,
      nodeSaving: false,
      nodeSavingError: null
    }
  },
  computed: {
  },
  watch: {
    node: {
      deep: true,
      handler (to, from) {
        this.$log('node CHANGED', to)
        if (to) {
          this.nodeSave()
        }
      }
    }
  },
  methods: {
    sphereAdd () {
      this.$log('sphereAdd')
      this.node.spheres.push({name: this.sphere})
      this.sphere = ''
    },
    sphereClick (s, si) {
      this.$log('sphereClick')
      this.node.spheres = this.node.spheres.filter(sphere => sphere.name !== s.name)
    },
    async spheresLoad () {
      this.$log('spheresLoad')
      // try to load node with spheres
      let {items} = await this.$store.dispatch('lists/wsItems', {
        pagination: {pageSize: 30, pageToken: null},
        sortStrategy: 'HOT',
        filter: {types: ['NODE'], name: 'SPHERE'}
      })
      this.$log('nodeFind', items)
      if (items.length === 0) {
        this.$log('create sphere node')
        let node = {
          name: 'SPHERE',
          layout: 'PIP',
          category: 'FUN',
          spheres: [],
          compositions: []
        }
        let res = await this.$store.dispatch('workspace/wsNodeSave', node)
        this.$log('res', res)
        // this.node = res.object
        this.node = res
      } else {
        this.node = items[0].object
      }
    },
    async nodeSave (node) {
      try {
        this.$log('nodeSave start', this.node)
        this.nodeSaving = true
        let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(this.node)))
        this.$log('res', res)
        this.nodeSaving = false
        this.nodeSavingError = null
        // this.node = res.object
        this.node = res
        this.$log('nodeSave done')
      } catch (e) {
        this.$log('nodeSave error', e)
        this.nodeSaving = false
        this.nodeSavingError = e
      }
    }
  },
  created () {
    this.nodeSave = throttle(this.nodeSave, 500)
  },
  mounted () {
    this.$log('mounted')
    this.spheresLoad()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
