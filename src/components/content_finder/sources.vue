<template lang="pug">
div(:style="{width: width+'px'}").column.full-height
  div(body-scroll-lock-ignore).col.scroll
    //- source items wrapper
    .row.full-width.items-start.content-start
      //- source item
      div(v-for="(s, skey) in sources" :key="skey"
        :style=`{height: '70px'}`).row.full-width
        //- mini
        div(:style=`{width: '70px', height: '70px'}`).row.items-center.justify-center
          q-btn(
            @click="sourceClick(s, skey)"
            :disable="disable"
            round
            :flat="skey !== source"
            :icon="s.icon ? s.icon : ''" :color="skey === source ? 'green' : 'grey-8'")
            span(v-if="!s.icon").text-bold {{ s.nameMini || s.name }}
        //- full name
        div(v-if="false").col.full-height
          span {{ s.name }}
        q-tooltip {{ s.name }}
      //- source add
      div(:style=`{height: '70px'}`).row.full-width.items-center
        div(:style=`{height: '70px', width: '70px'}`).row.items-center.justify-center
          q-btn(round flat icon="add" color="primary" @click="sourceAdd()")
</template>

<script>
export default {
  name: 'contentFinder__sources',
  props: ['source', 'sources', 'disable'],
  data () {
    return {
      width: 70
    }
  },
  methods: {
    sourceClick (s, skey) {
      this.$log('sourceClick', s, skey)
      this.$emit('source', skey)
    },
    sourceAdd () {
      this.$log('sourceAdd')
    }
  },
  async mounted () {
    this.$log('mounted')
    // await this.$wait(200)
    this.sourceClick(null, 'url')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
