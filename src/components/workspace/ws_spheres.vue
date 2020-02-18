<template lang="pug">
.row.fit
  .column.fit
    //- header
    div(:style=`{height: '80px'}`).row.full-width.items-center.content-center.q-px-sm
      div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white
        input(
          v-model="sphere" color="black" placeholder="Type a new sphere" @keyup.enter="sphereAdd"
          :style=`{height: '56px', paddingLeft: '10px'}`
          ).full-width
    //- body
    .col.full-width.scroll
      div(v-if="node").row.full-width.items-start.content-start.q-px-sm
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
  props: [],
  data () {
    return {
      sphere: '',
      node: null,
      nodeSavePause: false,
      nodeSaving: false,
      nodeSavingError: null
    }
  },
  computed: {
    oid () {
      return this.$route.params.oid
    }
  },
  watch: {
    node: {
      deep: true,
      handler (to, from) {
        this.$log('node CHANGED', to)
        if (this.nodeSavePause) {
          this.nodeSavePause = false
        } else {
          this.nodeSave(to)
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
      let name = 'SPHERES-' + this.$store.state.auth.userOid
      let item = await this.$store.dispatch('workspace/get', { name })
      this.$log('item: node-spheres', item)
      if (item) {
        this.$log('*** USE node-spheres')
        this.nodeSavePause = true
        this.node = JSON.parse(JSON.stringify(item))
      } else {
        this.$log('*** CREATE node-spheres')
        let node = {
          name,
          layout: 'PIP',
          category: 'FUN',
          spheres: [],
          compositions: []
        }
        this.nodeSave(node)
      }
    },
    async nodeSave (node) {
      try {
        this.$log('nodeSave start', node)
        this.nodeSaving = true
        let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(node)))
        this.$log('res', res)
        this.nodeSavePause = true
        this.node = JSON.parse(JSON.stringify(res))
        this.$log('nodeSave done')
        this.nodeSaving = false
        this.nodeSavingError = null
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
