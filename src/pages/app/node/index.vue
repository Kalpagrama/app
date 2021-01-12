<template lang="pug">
q-layout(
  view="hHh Lpr lff").b-30
  //- q-header(reveal).b-30
    .row.full-width.justify-center.q-pt-sm.q-px-sm
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
          minHeight: '60px',
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-px-sm.b-40
        q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()").q-mr-sm
        .col
          span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ title }}
  q-footer(
    reveal)
    transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      div(
        v-if="showEssences"
        :style=`{height: '526px'}`).column.full-width.b-30
        .row.full-width.items-center.content-center
          .col.q-pa-sm
            span.text-white Другие смыслы - 213
          q-btn(round flat color="white" icon="clear" @click="showEssences = false")
        .col.full-width.scroll
          div(
            v-for="n in 100" :key="n" :style=`{}`
            ).row.full-width.q-pa-sm.q-mb-sm
            span.text-white lorem ipsum {{ n }}
    //- navigation
    .row.full-width.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
          height: '70px',
          borderRadius: '10px 10px 0 0',
        }`
        ).row.full-width.items-center.content-center.justify-between.b-40.q-px-sm
        q-btn(
          @click="$routerKalpa.back()"
          flat color="grey-7" icon="west" no-caps
          :style=`{maxWidth: '60px'}`)
          .row.full-width.justify-center
            small Назад
        q-btn(
          flat icon="tonality" no-caps
          :color="pageId === 'drafts' ? 'green' : 'grey-7'"
          :style=`{maxWidth: '60px'}`)
          .row.full-width.justify-center
            small Разборы
        q-btn(
          @click="jointCreating = !jointCreating"
          color="green" icon="link"
          :style=`{
            width: '50px', height: '50px',
            borderRadius: '50%',
          }`)
        q-btn(
          flat icon="list" no-caps
          :color="pageId === 'drafts' ? 'green' : 'grey-7'"
          :style=`{maxWidth: '60px'}`)
          .row.full-width.justify-center
            small Смыслы
        q-btn(
          flat icon="link" no-caps
          :color="pageId === 'drafts' ? 'green' : 'grey-7'"
          :style=`{maxWidth: '60px'}`)
          .row.full-width.justify-center
            small Связи
  q-page-container
    q-page.row.full-width.justify-center
      div(
        v-if="node"
        :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`
        ).row.full-width.items-start.content-start
        node-feed(
          :node="node"
          :isActive="true"
          :isVisible="true")
        //- .row.full-width.q-pa-md
          p.text-grey-5 Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
        //- .row.full-width.q-pa-sm
          div(
            @click="showEssences = true"
            :style=`{
              borderRadius: '10px',
              background: 'rgb(35,35,35)',
            }`
            ).row.full-width.items-center.content-center.justify-center.q-px-sm.q-py-md
            span.text-white Показать другие смыслы - 123
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_node',
  data () {
    return {
      node: null,
      showEssences: false,
    }
  },
  computed: {
    title () {
      if (this.node) {
        if (this.node.items.length === 1) return 'Ядро'
        else return 'Связь'
      }
      else {
        return ''
      }
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.oid TO', to)
        if (to) {
          this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
  created () {
    this.$log('created')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
  }
}
</script>
