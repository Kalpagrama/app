<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- div(:style=`{height: '60px'}`).row.full-width
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      div(
        v-for="(i, ii) in contents" :key="ii"
        :style=`{position: 'relative', zIndex: 10, borderRadius: '10px', overflow: 'hidden'}`
        ).col-6.q-pa-sm
        img(
          :src="i.item.thumbUrl" draggable="false" @click="contentClick(i, ii)"
          :style=`{
            width: '100%', height: '100%', objectFit :'contain',
            userSelect: 'none',
            borderRadius: '10px', overflow: 'hidden'}`).cursor-pointer
        small(
          :style=`{
            position: 'absolute', zIndex: 100, top: '16px', left: '16px',
            borderRadius: '10px', overflow: 'hidden', background: 'rgba(0,0,0,0.8)',
            maxWidth: '80%'}`
          ).text-white.q-px-sm.q-py-xs {{ i.item.name | cut(60) }}
</template>

<script>
export default {
  name: 'wsContents',
  props: ['ctx'],
  data () {
    return {
      contentIndex: -1
    }
  },
  computed: {
    contents () {
      return this.$store.state.workspace.workspace.nodes
        .reduce((acc, val) => {
          val.fragments.map(f => {
            if (!acc[f.content.oid]) {
              acc[f.content.oid] = {
                type: 'content',
                item: f.content,
                node: val,
                nodes: 1
              }
            } else {
              acc[f.content.oid].nodes += 1
            }
          })
          return acc
        }, {})
    }
  },
  methods: {
    async contentUse (i, ii) {
      this.$log('contentClick', i, ii)
      this.$store.commit('workspace/stateSet', ['wsItem', {type: 'content', item: JSON.parse(JSON.stringify(i.item))}])
      await this.$wait(300)
      this.$router.push('/create')
    },
    async contentClick (i, ii) {
      if (this.ctx === 'inEditor') {
        this.$emit('item', i)
      } else {
        this.contentUse(i, ii)
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
