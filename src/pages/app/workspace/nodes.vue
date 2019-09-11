<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- header
  div(v-if="true" :style=`{height: '60px'}`).row.full-width.q-px-sm
    div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.fit.items-center.bg-white.q-px-sm
      q-btn(color="grey-7" round flat icon="search")
      .col
        .row.fit.items-center.content-center.q-px-sm
          small.full-width search: name, content.type/name, sphere;
          small.full-width group: content.type/oid, sphere;
          small.full-width sort: name, createdAt;
      slot(name="actions")
      q-btn(color="grey-7" round flat icon="keyboard_arrow_left")
  //- body
  .col.full-width.scroll.q-pt-md
    node-list(:nodes="nodesRaw" @nodeClick="nodeClick")
</template>

<script>
import nodeList from 'components/node_list'

export default {
  name: 'pageApp__Workspace__Nodes',
  components: {nodeList},
  data () {
    return {
      types: ['VIDEO', 'IMAGE']
    }
  },
  computed: {
    nodesRaw () {
      return this.$store.state.workspace.workspace.nodes
    },
    spheres  () {
      let s = this.nodesRaw.reduce((res, val) => {
        if (val.spheres) res = [...res, ...val.spheres]
        return res
      }, [])
      return _.unionBy(s, 'oid')
    },
    contents () {
      let c = this.nodesRaw.reduce((res, val) => {
        val.fragments.map(f => {
          res.push({oid: f.content.oid, name: f.content.name, type: f.content.type})
        })
        return res
      }, [])
      return _.unionBy(c, 'oid')
    }
  },
  methods: {
    nodeClick (n) {
      this.$log('nodeClick', n)
      this.$emit('nodeClick', n)
    }
  },
  mounted () {
    this.$log('mounted')
    // by types node with one fragment and with 2 and more?
    // by spheres?
    // by name
    // by contents
    // group by
    // sort by createdAt
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
