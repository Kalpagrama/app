<template lang="pug">
div(
  :style=`{width: width+'px'}`
  ).column.full-height
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      div(
        v-for="(s, si) in sections" :key="si" @click="sectionClick(s, si)"
        :style=`{height: '60px'}`
        ).row.full-width.items-center.content-center.q-px-md
        span(
          :class=`{
            'text-white': s.id !== $route.params.section,
            'text-green': s.id === $route.params.section
            }`
        ).text-bold {{ s.name }}
</template>

<script>
export default {
  name: 'wsMenu',
  data () {
    return {
      width: 400,
      sections: [
        {id: 'contents', name: 'Contents'},
        {id: 'compositions', name: 'Compositions'},
        {id: 'nodes', name: 'Nodes'},
        {id: 'settings', name: 'Settings'}
      ]
    }
  },
  methods: {
    sectionClick (s, si) {
      this.$log('sectionClick', s, si)
      this.$router.push({params: {section: s.id}})
    }
  }
}
</script>
