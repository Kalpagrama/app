<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: 650+'px',
      borderRadius: '20px 20px 0 0',
      paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
    }`
    ).row.full-width.justify-between.b-50.q-px-sm.q-pt-sm
    //- back
    q-btn(
      @click="$routerKalpa.back()"
      flat color="grey-7" icon="west" no-caps
      :style=`{
        width: size+'px',
        height: size+'px',
      }`)
      small(:style=`{marginTop: '-2px', whiteSpace: 'nowrap'}`) {{$t('Back')}}
    //- pages
    q-btn(
      v-for="(p,pi) in pages" :key="p.id"
      @click="pageId === p.id ? $emit('pageId', null) : $emit('pageId', p.id)"
      flat no-caps
      :color="p.id === pageId ? 'green' : 'grey-7'"
      :icon="p.icon"
      :style=`{
        width: size+'px',
        height: size+'px',
      }`)
      small(:style=`{marginTop: '-2px', whiteSpace: 'nowrap'}`) {{ p.name }}
    //- menu
    kalpa-menu-popup-global(
      color="grey-7"
      :styles=`{
        width: size+'px',
        height: size+'px',
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
    size () {
      if (this.$q.screen.width > 350) return 46
      else return 46
    }
  }
}
</script>
