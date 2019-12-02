<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  div(
    :style=`{height: headerHeight+'px', overflow: 'hidden'}`).row.full-width
    .col.full-height
      .row.fit.items-center.q-px-sm
        q-btn(round flat icon="search")
    div(:style=`{height: '55px', width: '55px'}`).row.items-center.justify-center
      q-btn(round flat icon="add" @click="draftNew()")
  div(
    @scroll="onScroll"
    v-touch-pan.down.prevent.mouse="scrollTop === 0 ? handlePan : () => false").col.scroll
    .row.full-width.items-start.content-start.q-pa-sm
      div(
        v-for="(d, di) in drafts" :key="di" @click="draftClick(d, di)"
        :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden', ...draftStyles(d, di)}`
        ).row.full-width.items-center.bg-white.q-px-sm.q-mb-sm
        span Draft {{ di }}
</template>

<script>
export default {
  name: 'nodeComposerDrafts',
  data () {
    return {
      headerHeight: 0,
      draftIndex: -1,
      scrollTop: 0
    }
  },
  computed: {
    drafts () {
      return this.$store.state.workspace.workspace.drafts
    }
  },
  methods: {
    async draftNew () {
      this.$log('draftNew')
      // save prev draft, and go to editor
      await this.$wait(200)
      this.$emit('new')
    },
    async draftClick (d, di) {
      this.$log('draftClick', d, di)
      this.draftIndex = di
      await this.$wait(200)
      this.$emit('draft', d)
    },
    draftStyles (d, di) {
      if (di === this.draftIndex) {
        return {
          border: '3px solid black'
        }
      } else {
        return {}
      }
    },
    handlePan (e) {
      // this.$log('handlePan', e)
      let to = this.headerHeight + e.delta.y
      if (to < 200) this.headerHeight = to
      if (e.isFinal) {
        this.$tween.to(this, 0.2, {headerHeight: 60})
      }
    },
    onScroll (e) {
      // this.$log('onScroll', e)
      this.scrollTop = e.target.scrollTop
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
