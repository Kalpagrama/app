<template lang="pug">
.row.fit
  .column.fit
    //- header
    div(:style=`{height: '80px'}`).row.full-width.items-center.content-center.q-px-md
      div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white
        q-input(v-model="sphere" color="green" placeholder="Type a new sphere" @keyup.enter="sphereAdd"
          :input-style=`{paddingLeft: '10px'}`).full-width
    //- body
    .col.full-width.scroll
      div(v-if="node").row.full-width.items-start.content-start.q-pa-md
        div(
          v-for="(s,si) in node.spheres" :key="si" @click="sphereClick(s,si)"
          :class=`{'bg-grey-8': s.oid !== oid, 'bg-white': s.oid === oid}`
          :style=`{borderRadius: '10px', overflow: 'hidden'}`
          ).row.q-mr-sm.q-mb-sm.cursor-pointer
          span(
            :class=`{
              'text-bold': s.oid === oid,
              'text-green': s.oid === oid,
              'text-white': s.oid !== oid
            }`
            :style=`{whiteSpace: 'nowrap'}`
            ).q-pa-sm {{ s.name }}
</template>

<script>
import { debounce } from 'quasar'

export default {
  name: 'wsSpheres',
  props: ['oid'],
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
      this.$emit('item', s)
      // TODO open this sphere and show your nodes and system nodes on the right...
      // then u can delete it? but... u are using this sphere in another nodes...
      // delete it from everyone?
      // this.node.spheres = this.node.spheres.filter(sphere => sphere.name !== s.name)
    },
    async spheresLoad () {
      this.$log('spheresLoad')
      // try to load node with spheres
      let name = 'SPHERE-' + this.$store.state.auth.userOid
      let item = await this.$store.dispatch('workspace/get', { name })
      this.$log('nodeFind', item)
      if (!item) {
        this.$log('create sphere node')
        let node = {
          name,
          layout: 'PIP',
          category: 'FUN',
          spheres: [],
          compositions: []
        }
        let res = await this.$store.dispatch('workspace/wsNodeSave', node)
        this.$log('res', res)
        this.node = res
      } else {
        this.node = item
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
        // this.node = JSON.parse(JSON.stringify(res))
        this.$log('nodeSave done')
      } catch (e) {
        this.$log('nodeSave error', e)
        this.nodeSaving = false
        this.nodeSavingError = e
      }
    }
  },
  created () {
    this.nodeSave = debounce(this.nodeSave, 1000)
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
