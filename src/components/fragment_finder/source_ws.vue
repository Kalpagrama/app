<template lang="pug">
.column.fit.bg-white
  //- header
  div(:style=`{height: '60px'}`).row.full-width
    .col.full-height
      .row.fit.items-center.q-px-md
        //- span.text-bold Take from workspace
        span.text-bold {{ type }}
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="clear" @click="$emit('hide')")
  //- body
  .col.full-width.scroll
    div(:style=`{paddingBottom: '70px'}`).row.full-width.items-start.content.start.q-px-md.q-pt-md
      div(
        v-for="(i, ii) in items" :key="ii" @click="itemClick(i, ii)"
        :style=`{height: '60px', borderRadius: '10px'}`
        ).row.full-width.items-center.q-px-md.bg-grey-2.q-mb-sm
        span {{ i.name }}
</template>

<script>
export default {
  name: 'fragmentFinder__sourceWs',
  props: ['type'],
  data () {
    return {
    }
  },
  computed: {
    items () {
      return this.$store.state.workspace.workspace[this.type]
    }
  },
  methods: {
    itemClick (i, ii) {
      this.$log('itemClick', i, ii)
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
