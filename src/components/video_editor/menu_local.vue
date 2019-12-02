<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).column.fit.bg-white
  //- header
  div(:style=`{height: '60px'}`).row.full-width
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="keyboard_arrow_down" @click="$emit('hide')")
    .col
      .row.fit.items-center.justify-end.q-px-sm
        q-btn(
          color="accent" no-caps @click="$emit('fragment')"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`) Save and exit
  q-tabs(v-model="tab")
    q-tab(v-for="t in tabs" :key="t.id" :name="t.id" :label="t.name" no-caps)
  //- body
  .col.full-width.scroll
    q-tab-panels(ref="ncPanels" v-model="tab" :swipeable="$q.screen.lt.md" animated keep-alive :style=`{background: 'none', margin: 0, padding: 0}`).row.fit
      q-tab-panel(name="fragments" style=`position: relative; margin: 0; padding: 0`).column.fit.bg-white
        //- add
        q-btn(
          round color="accent" size="lg" icon="add" @click="pointAdd()"
          :style=`{position: 'absolute', right: '10px', bottom: '10px'}`)
        //- ready
        .col.scroll
          div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
            //- list
            div(
              v-for="(p, pi) in points"
              :style=`{minHeight: '60px'}`).row.full-width.items-center.q-px-sm
              div(:style=`{width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: $randomColor(pi)}`)
              .col.full-height
                .row.fit.items-center.q-px-sm
                  span point {{pi}}: {{ p }}
      q-tab-panel(name="settings" style=`margin: 0; padding: 0`).column.fit.bg-grey-2
        .col.scroll
          .row.full-width.items-start
            h1 settings
</template>

<script>
// import fragmentEditor from './fragment_editor'

export default {
  name: 'videoEditor__menuLocal',
  components: {},
  props: ['fragment', 'now', 'duration'],
  data () {
    return {
      tab: 'fragments',
      tabs: [
        {id: 'fragments', name: 'Фрагменты'},
        {id: 'settings', name: 'Настройки'}
      ]
    }
  },
  computed: {
    points () {
      return this.fragment.relativeCuts.filter((p, pi) => {
        return (pi + 1) % 2 !== 0
      })
    }
  },
  methods: {
    pointAdd () {
      this.$logD('pointAdd')
      let start = this.now
      let end = this.now + 10 > this.duration ? this.duration : this.now + 10
      // this.fragment.relativePoints.push({x: start})
      // this.fragment.relativePoints.push({x: end})
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
