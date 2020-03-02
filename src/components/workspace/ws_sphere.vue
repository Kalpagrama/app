<template lang="pug">
.row.fit
  .column.fit
    //- header
    div(:style=`{height: '113px'}`).row.full-width
      //- header
      div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-md
        span.text-bold.text-green {{ value ? value.name : '' }}
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
      page: undefined,
      pages: [
        {id: 'workspace', name: 'My workspace'},
        {id: 'kalpagramma', name: 'From kalpagramma'}
      ]
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
