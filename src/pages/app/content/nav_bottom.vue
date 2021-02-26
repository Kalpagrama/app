<template lang="pug">
div(
  :style=`{
    //- paddingBottom: 'env(safe-area-inset-bottom)',
  }`
  ).row.full-width.justify-center
  div(
    :style=`{
      maxWidth: 650+'px',
      //- height: navHeight+'px',
      background: 'rgba(40,40,40,1)',
      borderRadius: '10px 10px 0 0',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }`
    ).row.full-width.justify-between
    //- back
    q-btn(
      @click="$routerKalpa.back()"
      flat color="white" icon="west" no-caps
      :style=`{
        width: navHeight+'px',
        height: navHeight+'px',
      }`)
      span Назад
    //- pages
    q-btn(
      v-for="(p,pi) in pages" :key="p.id"
      @click="pageId === p.id ? $emit('pageId', null) : $emit('pageId', p.id)"
      flat no-caps
      :color="p.id === pageId ? 'green' : 'white'"
      :icon="p.icon"
      :style=`{
        width: navHeight+'px',
        height: navHeight+'px',
      }`)
      span {{ p.name }}
    //- menu
    kalpa-menu-popup-global(
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
        {id: 'drafts', icon: 'filter_tilt_shift', name: 'Заметки'},
        {id: 'nodes', icon: 'adjust', name: 'Ядра'},
        {id: 'info', icon: 'fas fa-info', name: 'Инфо'}
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
