<template lang="pug">
kalpa-layout()
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$screenProps.isMobile || pageId==='images' || pageId==='essences'")
      template(v-if="pageId==='essences' || pageId==='images'" v-slot:all)
        q-btn(v-if="pageId==='essences'"
          flat ripple=false icon="add" color="green" :label="$t('Добавить свой смысл')"
          @click="$store.getters.isGuest ? $store.commit('ui/stateSet', ['authGuard', {message: 'авторизуйтесь для добавления смысла'}]) : $refs.nodeExtended.itemEditorShow=true")
        q-btn(v-if="pageId==='images'"
          flat ripple=false icon="add" color="green" :label="$t('Добавить свой образ')"
          @click="$store.getters.isGuest ? $store.commit('ui/stateSet', ['authGuard', {message: 'авторизуйтесь для добавления образа'}]) : $refs.nodeExtended.itemEditorShow=true")
      template(v-if="pageId!=='essences' || pageId!=='images'" v-slot:left-button)
        nav-mobile(
          :pageId="pageId"
          @pageId="pageIdChange")
      template(v-if="pageId!=='essences' || pageId!=='images'" v-slot:center)
        .row.content-center.items-center.justify-center
          span.text-grey-7 {{$t('Essence core')}}
  template(v-slot:body)
    .row.full-width.items-start.content-start.justify-center
        node-extended(ref="nodeExtended" :oid="$route.params.oid", @oid="$router.replace({ params: { oid: $event } })" @pageId="pageId=$event"
          :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`)
</template>

<script>

import nodeExtended from 'src/components/kalpa_item/item_extended/node_extended'
import navMobile from 'src/components/kalpa_menu_mobile/nav_mobile.vue'

export default {
  name: 'pageNode',
  components: {
    nodeExtended,
    navMobile,
  },
  data() {
    return {
      pageId: null,
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
