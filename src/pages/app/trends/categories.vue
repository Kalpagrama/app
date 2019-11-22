<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.bg-white
  //- debug
  div(v-if="debug").row.full-width.bg-red
    small.full-width category: {{ category }}
  //- body
  .col.full-width.scroll
    div(:style=`{paddingBottom: '100px'}`).row.full-width.items-start.content-start
      div(
        v-for="(c, ckey, ci) in categories" :key="ckey" @click="categoryClick(c, ckey, ci)"
        :style=`{height: '60px'}`
        ).row.full-width.items-center.q-px-md.cursor-pointer
        span(
          :class=`{'bg-green': ckey === category}`
          :style=`{color: ckey === category ? 'white' : 'black', borderRadius: '4px'}`).q-pa-sm {{ `#${c.name.charAt(0).toUpperCase() + c.name.slice(1)}` }}
</template>

<script>
export default {
  name: 'pageApp__hot__categories',
  props: ['categories', 'category'],
  data () {
    return {
      debug: true
    }
  },
  methods: {
    async categoryClick (c, ckey, ci) {
      this.$log('categoryClick', c, ckey, ci)
      this.$router.push({params: {category: ckey}})
    }
  }
}
</script>
