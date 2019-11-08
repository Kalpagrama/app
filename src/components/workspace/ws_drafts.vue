<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $q.screen.width+'px'}`).column.fit.bg-white
  //- action
  q-btn(
    v-if="true"
    round color="primary" icon="add" size="lg" @click="draftCreate()"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '10px', right: '10px'}`)
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
  div(body-scroll-lock-ignore).col.scroll.full-width.bg-grey-1.q-pa-sm
    ws-filters(ref="wsFilters" :items="drafts")
      template(v-slot:items="{items}")
        .row.full-width.items-start.content-start
          ws-draft-item(v-for="(d, di) in items" :key="d.uid" :item="d" @clicked="draftClick")
</template>

<script>
import wsFilters from './ws_filters'
import wsDraftItem from './ws_draft_item'

export default {
  name: 'wsDrafts',
  components: {wsFilters, wsDraftItem},
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
    async draftCreate () {
      this.$log('draftCreate')
      let draft = await this.$store.dispatch('workspace/addWSDraft', {})
      this.$store.commit('workspace/stateSet', ['draft', draft])
      this.$nextTick(() => {
        this.$router.push('/app/create')
      })
    },
    draftClick (d, di) {
      this.$log('draftClick', d, di)
      this.$store.commit('workspace/stateSet', ['draft', d])
      this.$nextTick(() => {
        this.$router.push('/app/create')
      })
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
