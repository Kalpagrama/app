<template lang="pug">
q-page(
  :style=`{
    paddingTop: '0px',
    paddingBottom: '0px',
  }`
  ).row.full-width.justify-center
  q-page-sticky(
    expand position="top"
    :style=`{zIndex: 2000}`).row.full-width.justify-center.b-30
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-px-md.b-30
      q-tabs(
        no-caps active-color="green" align="left" dense
        stretch :breakpoint="100" inline-label
        :switch-indicator="true").full-width.text-grey-8
        q-route-tab(
          v-for="t in tabs" :key="t.id"
          inline-label
          :to="t.id" :name="t.id" :label="t.name" :icon="t.icon").q-px-sm
  div().row.full-width
    small.text-white {{$route.params.tab}}
</template>

<script>
export default {
  name: 'user_pageWorkspace',
  props: ['user'],
  computed: {
    tabs () {
      return [
        {id: 'feeds', name: this.$t('Collections', 'Коллекции'), icon: 'view_week'},
        {id: 'nodes', name: this.$t('Nodes', 'Ядра'), icon: 'filter_tilt_shift'},
        {id: 'joints', name: this.$t('Joints', 'Связи'), icon: 'link'},
        {id: 'votes', name: this.$t('Votes', 'Голоса'), icon: 'adjust'},
        {id: 'followers', name: this.$t('Subscribers', 'Подписчики'), icon: 'supervisor_account'},
      ]
    },
  },
  watch: {
    '$route.params.tab': {
      immediate: true,
      handler (to, from) {
        if (to) {
        }
        else {
          this.$router.replace({params: {tab: 'nodes'}})
        }
      }
    }
  }
}
</script>
