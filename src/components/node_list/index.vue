<template lang="pug">
.row.full-width.items-start.content-start.justify-start
  node(
    v-for="(n, ni) in nodes" :key="n.oid" :accessKey="ni"
    v-if="nodesBan ? !nodesBan.includes(n.oid) : true"
    :ctx="'inList'"
    :node="n"
    :needFull="ni >= friends[0] && ni <= friends[1]"
    :visible="ni === nodeOidVisible"
    @error="nodesBan.push(n.oid)"
    @nodeClick="$event => $emit('nodeClick', $event)"
    :style=`{}`
    v-observe-visibility=`{
      callback: nodeVisible,
      throttle: 300,
      intersection: {
        threshold: 0.98
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
      nodeOidVisible: undefined
    }
  },
  computed: {
    nodesLength () {
      return this.nodes.length
    },
    friends () {
      let from = this.nodeOidVisible - 2
      let to = this.nodeOidVisible + 2
      if (from < 0) from = 0
      if (to > this.nodesLength) to = this.nodesLength
      return [from, to]
    }
  },
  methods: {
    nodeVisible (isVisible, entry) {
      if (isVisible) {
        this.$log('nodeVisible', isVisible, entry.target.accessKey)
        this.nodeOidVisible = parseInt(entry.target.accessKey)
      } else {
        if (this.nodeOidVisible === entry.target.accessKey) this.nodeOidVisible = undefined
      }
    },
    nodeClick (n, ni) {
      this.$logd('nodeClick', n, ni)
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
