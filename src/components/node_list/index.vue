<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.justify-start
  //- div(:style=`{position: 'fixed', zIndex: 1000, top: '500px'}`).row.bg-red
  //-   span.full-width nodesVisible: {{ nodesVisible }}
  //-   span.full-width friends: {{friends}}
  node(
    v-for="(n, ni) in nodes" :key="n.oid" :accessKey="ni"
    v-if="nodesBan ? !nodesBan.includes(n.oid) : true"
    :ctx="'inList'"
    :node="n" :index="ni"
    :needFull="ni >= friends[0] && ni <= friends[1]"
    :visible="nodesVisible[0] ? nodesVisible[0] === ni : ni === 0"
    @error="nodesBan.push(n.oid)"
    @nodeClick="$event => $emit('nodeClick', $event)"
    :style=`{}`
    v-observe-visibility=`{
      callback: nodeVisible,
      throttle: 200,
      intersection: {
        threshold: 0.8
      }
    }`
    ).bg-white.q-mb-lg
  //- div(
  //-   v-for="(n, ni) in 100" :key="ni" :accessKey="ni"
  //-   :style=`{position: 'relative', height: '300px', borderRadius: '10px'}`
  //-   v-observe-visibility=`{
  //-     callback: nodeVisible,
  //-     throttle: 300,
  //-     intersection: {
  //-       threshold: 0.98
  //-     }
  //-   }`
  //-   ).row.full-width.items-center.justify-center.q-mb-lg.bg-white
  //-   div(:style=`{position: 'absolute', right: '10px', bottom: '10px', width: '100px', height: '60px', borderRadius: '10px'}`).row.bg-grey-2
  //-   small.full-width node: {{ ni }}
  //-   small.full-width nodesLength: {{nodesLength}}
  //-   small.full-width friends: {{friends}}
  //-   h3(v-if="ni === nodeOidVisible") dick
</template>

<script>
export default {
  name: 'nodeList',
  // props: ['nodes', 'nodesBan', 'selected'],
  props: {
    nodes: {type: Array},
    nodesBan: {type: Array, default () { return [] }},
    selected: {type: Array}
  },
  data () {
    return {
      nodeHeight: 50,
      nodeOidVisible: undefined,
      nodesVisible: []
    }
  },
  computed: {
    nodesLength () {
      return this.nodes.length
    },
    friends () {
      // let from = this.nodeOidVisible - 2
      // let to = this.nodeOidVisible + 2
      let from = this.nodesVisible[0] ? this.nodesVisible[0] - 2 : 0
      let to = this.nodesVisible[0] ? this.nodesVisible[0] + 2 : 2
      if (from < 0) from = 0
      if (to > this.nodesLength) to = this.nodesLength
      return [from, to]
    }
  },
  methods: {
    nodeVisible (isVisible, entry) {
      if (isVisible) {
        this.$log('nodeVisible', isVisible, entry.target.accessKey)
        // this.nodeOidVisible = parseInt(entry.target.accessKey)
        this.nodesVisible.unshift(parseInt(entry.target.accessKey))
      } else {
        // if (this.nodeOidVisible === entry.target.accessKey) this.nodeOidVisible = undefined
        this.nodesVisible = this.nodesVisible.filter(n => (n !== parseInt(entry.target.accessKey)))
      }
    },
    nodeClick (n, ni) {
      this.$logD('nodeClick', n, ni)
      this.$emit('nodeClick', n)
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
