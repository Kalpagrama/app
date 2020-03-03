<template lang="pug">
.row.fit.q-px-sm
  node-saver(:value="nodeRes")
    template(v-slot:editor=`{node, saving}`)
      node-spheres-editor(
        :node="node" mode="edit"
        @explore="sphereExplore")
</template>

<script>
export default {
  name: 'wsSphereList',
  props: [],
  data () {
    return {
      nodeRes: null,
      sphere: ''
    }
  },
  computed: {
    oid () {
      return this.$route.params.oid
    }
  },
  methods: {
    // sphereAdd () {
    //   this.$log('sphereAdd')
    //   this.node.spheres.push({name: this.sphere})
    //   this.sphere = ''
    // },
    // sphereClick (s, si) {
    //   this.$log('sphereClick')
    //   this.$emit('item', s)
    //   // TODO open this sphere and show your nodes and system nodes on the right...
    //   // then u can delete it? but... u are using this sphere in another nodes...
    //   // delete it from everyone?
    //   // this.node.spheres = this.node.spheres.filter(sphere => sphere.name !== s.name)
    // },
    sphereExplore (s) {
      this.$log('sphereExplore', s)
      this.$router.push({params: { oid: s.oid }})
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
        // this.node = JSON.parse(JSON.stringify(item))
        this.nodeRes = item
      } else {
        this.$log('*** CREATE node-spheres')
        let node = {
          name,
          layout: 'PIP',
          category: 'FUN',
          spheres: [],
          compositions: []
        }
        this.nodeRes = await this.$store.dispatch('workspace/wsNodeSave', node)
      }
    }
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
