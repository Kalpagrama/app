<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: 650+'px',
      borderRadius: '20px 20px 0 0',
      paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
    }`
    ).row.full-width.justify-between.b-50.q-pt-sm.q-px-sm
    //- back
    q-btn(
      @click="$routerKalpa.back()"
      flat color="grey-7" icon="west" no-caps
      :style=`{
        width: navHeight+'px',
        height: navHeight+'px',
      }`)
      span {{$t('Back')}}
    //- pages
    q-btn(
      v-for="(p,pi) in pages" :key="p.id"
      @click="pageId === p.id ? $emit('pageId', null) : $emit('pageId', p.id)"
      flat no-caps
      :color="p.id === pageId ? 'green' : 'grey-7'"
      :icon="p.icon"
      :style=`{
        width: navHeight+'px',
        height: navHeight+'px',
      }`)
      span {{ p.name }}
    //- menu
    kalpa-menu-popup-global(
      color="grey-7"
      :showLabel="true" :isRound="true"
      :styles=`{
        width: navHeight+'px',
        height: navHeight+'px',
      }`)
</template>

<script>
export default {
  name: 'navBottom',
  props: ['pageId'],
  data () {
    return {
    }
  },
  computed: {
    pages () {
      return [
        {id: 'drafts', icon: 'filter_tilt_shift', name: this.$t('Drafts')},
        {id: 'nodes', icon: 'adjust', name: this.$t('Nodes')},
        {id: 'info', icon: 'fas fa-info', name: this.$t('Info')}
      ]
    },
    navHeight () {
      if (this.$q.screen.width > 350) return 70
      else return 50
    }
  },
  messages: [
    {id: 'm1', name: 'hello', author: {id: 'a1', name: 'Oleg'}},
    {id: 'm2', name: 'Bye', author: {id: 'a2', name: 'Mike'}}
  ]
}
</script>
