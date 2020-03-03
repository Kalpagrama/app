<template lang="pug">
.row.fit
  .column.fit
    //- header
    div(:style=`{height: '113px'}`).row.full-width
      //- header
      div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-md
        span.text-bold.text-green {{ sphere ? sphere.name : '' }}
      //- header pages
      //- TODO pages, my nodes, system nodes, contents, users, and so on
      .row.full-width.items-center.q-px-md
        span(
          v-for="(p,pi) in pages" :key="pi" @click="pageClick(p,pi)"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`
          ).q-pa-sm.q-mr-sm.text-white.bg-grey-8.cursor-pointer {{ p.name }}
    //- body
    .col.full-width.scroll
      div(v-if="value").row.full-width.items-start.content-start.q-pa-md
        h1.text-red {{ value.oid }}
    //- footer
</template>

<script>
export default {
  name: 'wsSphere',
  props: ['value'],
  data () {
    return {
      sphere: null,
      page: undefined,
      pages: [
        {id: 'workspace', name: 'My workspace'},
        {id: 'kalpagramma', name: 'From kalpagramma'}
      ]
    }
  },
  watch: {
    '$route.params.oid': {
      async handler (to, from) {
        this.$log('$route.params.oid CHANGED', to)
        if (to) {
          this.sphere = await this.$store.dispatch('objects/get', { oid: to, priority: 0 })
        }
      }
    }
  },
  methods: {
    pageClick (p, pi) {
      this.$log('pageClick', p, pi)
      this.page = p.id
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
