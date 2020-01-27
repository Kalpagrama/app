<template lang="pug">
div(
  :style=`{position: 'relative', right: '0px', width: width+'px'}`
  ).row.full-height.bg-grey-8
  //- toggle
  div(
    :style=`{
      position: 'absolute', top: 0, left: '-60px',
      width: '60px', height: '60px'}`
    ).row.items-center.justify-center
    q-btn(
      flat color="green" @click="show = !show"
      :icon="show ? 'keyboard_arrow_right' : 'keyboard_arrow_left'"
      :style=`{width: '40px', height: '40px', borderRadius: '10px'}`)
  //- body
  .column.fit
    //- header
    div(:style=`{height: '60px'}`
      ).row.full-width.items-center.content-center.q-px-md
      span(v-if="width > 150").text-bold.text-green My contents
    //- body list
    .col.full-width.scroll
      .row.full-width.items-start.content-start.q-px-sm
        div(
          v-for="(c, ckey, ci) in contents" :key="ckey"
          ).row.full-width.q-mb-md
          img(
            :src="c.thumbUrl"
            :style=`{width: '100%'}`)
</template>

<script>
export default {
  name: 'contentFinderContents',
  data () {
    return {
      show: false,
      width: 0
    }
  },
  computed: {
    contents () {
      return []
      // return this.$store.state.workspace.nodes
    }
  },
  watch: {
    show: {
      immediate: true,
      handler (to, from) {
        this.$log('show CHANGED', to)
        this.$tween.to(this, 0.5, {width: to ? 500 : 0})
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
