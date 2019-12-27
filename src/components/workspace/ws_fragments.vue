<template lang="pug">
div(:style=`{position: 'relative'}`
  ).column.full-width
  //- header
  div(:style=`{height: '74px', borderBottom: '1px solid #eee'}`
    ).row.full-width.items-center
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-pt-md.q-px-sm
      div(
        v-for="(f, fi) in fragments" :key="fi" @click="$emit('itemClick', f)"
        :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.bg-grey-4.q-mb-sm.cursor-pointer
        div(
          :style=`{height: '60px', width: '100px', borderRadius: '10px', overflow: 'hidden'}`
          ).row.bg-black
          img(
            :src="f.item.content.thumbUrl" draggable="false"
            :style=`{width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none'}`)
        .col.full-height
          .row.fit.items-center.q-px-md
            span(:style=`{userSelect: 'none'}`) {{ f.item.name || f.item.content.name | cut(20) }}
</template>

<script>
export default {
  name: 'wsFragments',
  data () {
    return {
    }
  },
  computed: {
    fragments () {
      return this.$store.state.workspace.workspace.nodes.reduce((acc, val) => {
        if (val.fragments.length === 1) {
          val.fragments.map((f, fi) => {
            acc.push({
              type: 'fragment',
              fragmentIndex: fi,
              item: f,
              node: val
            })
          })
        }
        return acc
      }, [])
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
