<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  //- action
  q-btn(
    v-if="false"
    round color="primary" icon="add" size="lg" @click="fragmentCreate()"
    :style=`{position: 'absolute', right: '10px', bottom: '10px'}`)
  //- header
  div(:style=`{minHeight: '70px'}`).row.full-width.items-center
    //- menu
    div(:style=`{width: '70px'}`).row.full-height.items-center.justify-center
      q-btn(icon="menu" round flat color="primary" @click="$emit('menu')").q-mx-sm
    //- name
    .col.full-height
      .row.fit.items-center.content-center.justify-center.q-px-sm
        span.text-bold.text-black Фрагменты
    //- search
    div(:style=`{width: '70px'}`).row.full-height.items-center.justify-center
      q-btn(round flat icon="search" color="grey-6" @click="$refs.wsFilters.toggle()")
  //- body
  div(body-scroll-lock-ignore).col.scroll.full-width.bg-grey-3
    ws-filters(ref="wsFilters" :items="fragments")
      template(v-slot:items="{items}")
        .row.full-width.items-start.content-start.q-pa-sm
          div(
            v-for="(f, fi) in fragments" :key="f.uid" @click="fragmentClick(f, fi)"
            :style=`{minHeight: '50px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.bg-white.q-mb-sm
            img(
              :src="f.thumbUrl"
              :style=`{height: '50px', width: '89px', objectFit: 'contain', borderRadius: '10px', overflow: 'hidden'}`).bg-black
            .col
              .row.fit.items-center.q-px-sm
                span.text-bold {{ f.name }}
          div(:style=`{height: '80px'}`).row.full-width
</template>

<script>
import wsFilters from './ws_filters'

export default {
  name: 'wsFragments',
  components: {wsFilters},
  data () {
    return {
    }
  },
  computed: {
    fragments () {
      return this.$store.getters['workspace/fragments']
    }
  },
  methods: {
    fragmentCreate () {
      this.$log('fragmentCreate')
    },
    fragmentClick (f, fi) {
      this.$log('fragmentClick', f, fi)
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
