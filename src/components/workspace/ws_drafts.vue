<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  //- action
  q-btn(
    round color="primary" icon="add" size="lg" @click="draftCreate()"
    :style=`{position: 'absolute', bottom: '10px', right: '10px'}`)
  //- header
  div(:style=`{minHeight: '70px'}`).row.full-width.items-center
    //- menu
    div(:style=`{width: '70px', height: '70px'}`).row.full-height.items-center.justify-center
      q-btn(icon="menu" round flat color="primary" @click="$emit('menu')").q-mx-sm
    //- name
    .col.full-height
      .row.fit.items-center.content-center.justify-center.q-px-sm
        span.text-bold Черновики
    //- search
    div(:style=`{width: '70px', height: '70px'}`).row.full-height.items-center.justify-center
      q-btn(icon="search" round flat color="grey-6" @click="$refs.wsFilters.toggle()").q-mx-sm
  //- body
  div(body-scroll-lock-ignore).col.scroll.full-width.bg-grey-1
    ws-filters(ref="wsFilters" :items="drafts")
      template(v-slot:items="{items}")
        .row.full-width.items-start.content-start.q-px-sm
          div(
            v-for="(d, di) in items" :key="di"
            :style=`{height: '100px'}`).row.full-width.bg-white.q-mb-md
            span draft
          div(:style=`{height: '70px'}`).row.full-width
</template>

<script>
import wsFilters from './ws_filters'

export default {
  name: 'wsDrafts',
  components: {wsFilters},
  data () {
    return {
    }
  },
  computed: {
    drafts () {
      return this.$store.getters['workspace/drafts']
    }
  },
  methods: {
    draftCreate () {
      this.$log('draftCreate')
      this.$router.push('/app/create')
      // TODO: goes to node creator with empty node
    },
    draftClick (d, di) {
      this.$log('draftClick', d, di)
      this.$router.push('/app/create')
      // TODO: goes to node creator with empty or not node...
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
