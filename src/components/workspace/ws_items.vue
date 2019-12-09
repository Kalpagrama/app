<style lang="stylus">
</style>

<template lang="pug">
k-colls(ref="wsItemsColls" :coll="coll" @coll="coll = $event" :colls="collsFiltered" :tabs="true" :style=`{height: '100%'}`)
  template(v-slot:notes)
    .column.fit
      div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
        span Total: {{ notes.length }}
        .col
        q-btn(round flat icon="search")
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-px-sm
          div(
            v-for="(n, ni) in notes" :key="ni" @click="$emit('itemClick', ['note', n])"
            :style=`{height: '60px', borderRadius: '10px'}`
            ).row.full-width.items-center.q-px-sm.bg-white.q-mb-sm
            span {{ n.name }}
  template(v-slot:fragments)
    .column.fit
      div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
        span Total: {{ fragments.length }}
        .col
        q-btn(round flat icon="search")
      .col.full-width.scroll.kscroll
        .row.full-width.items-start.content-start.q-px-sm
          div(
            v-for="(f, fi) in fragments" :key="fi" @click="$emit('itemClick', ['fragment', f])"
            :style=`{position: 'relative', minHeight: '60px', borderRadius: '10px'}`
            ).row.full-width.items-center.bg-white.q-mb-md
            img(
              :src="f.content.thumbUrl" draggable="false"
              :style=`{
                width: '100%', height: '100%', maxHeight: '300px', objectFit: 'contain',
                borderRadius: '10px'}`)
            span(:style=`{position: 'absolute', zIndex: 100, bottom: '50px', left: '16px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)'}`
              ).q-pa-sm.text-white fragment {{fi}}
            small(:style=`{position: 'absolute', zIndex: 100, bottom: '16px', left: '16px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)'}`
              ).q-pa-sm.text-white {{ f.content.name | cut(50) }}
  template(v-slot:contents)
    .column.fit
      div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
        span Total: {{ contents.length }}
        .col
        q-btn(round flat icon="search")
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-px-sm
          div(
            v-for="(c, ci) in contents" :key="ci" @click="$emit('itemClick', ['content', c])"
            :style=`{position: 'relative', minHeight: '60px'}`
            ).row.full-width.items-center.q-px-sm.q-mb-md
            img(
              :src="c.thumbUrl" draggable="false"
              :style=`{
                width: '100%', height: '100%', maxHeight: '300px', objectFit: 'contain',
                borderRadius: '10px'}`)
            span(:style=`{position: 'absolute', zIndex: 100, bottom: '16px', left: '16px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)'}`
              ).q-pa-sm.text-white {{ c.name | cut(40) }}
  template(v-slot:nodes)
    .column.fit
      div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
        span Total: {{ nodes.length }}
        .col
        q-btn(round flat icon="search")
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-px-sm
          div(
            v-for="(n, ni) in nodes" :key="n.oid" @click="$emit('itemClick', ['node', n])"
            :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.justify-center.bg-white.q-mb-sm
            span {{ n.name }}
</template>

<script>
export default {
  name: 'wsItems',
  props: ['types', 'nodeClickOverride'],
  data () {
    return {
      coll: 'fragments',
      colls: [
        {id: 'notes', name: 'Notes'},
        {id: 'fragments', name: 'Fragments'},
        {id: 'contents', name: 'Contents'},
        {id: 'nodes', name: 'Nodes'}
      ]
    }
  },
  computed: {
    collsFiltered () {
      if (this.types) {
        return this.colls.filter((c, ci) => {
          return this.types.includes(c.id)
        })
      } else {
        return this.colls
      }
    },
    notes () {
      return this.$store.state.workspace.workspace.nodes.filter((n, i) => {
        return n.fragments.length === 0
      })
    },
    fragments () {
      return this.$store.state.workspace.workspace.nodes.reduce((acc, val) => {
        val.fragments.map(f => (acc.push(f)))
        return acc
      }, [])
    },
    contents () {
      return this.$store.state.workspace.workspace.nodes.reduce((acc, val) => {
        val.fragments.map(f => (acc.push(f.content)))
        return acc
      }, [])
    },
    nodes () {
      return this.$store.state.workspace.workspace.nodes.filter((n, i) => {
        return n.fragments.length > 0
      })
    }
  },
  methods: {
    nodeClick (n, ni) {
      this.$logD('nodeClick', n, ni)
      if (this.nodeClickOverride) {
        this.$emit('nodeClick', [n, ni])
      } else {
        // open node click for editor?
      }
    }
  },
  mounted () {
    this.$logD('mounted')
  }
}
</script>
