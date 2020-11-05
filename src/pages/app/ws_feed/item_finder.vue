<template lang="pug">
q-layout(
  view="hHh Lpr lff" container
  :style=`{
  }`).b-30
  q-header(reveal).b-30
    .row.full-width.justify-center.q-pt-sm
      div(
        :style=`{height: '60px',}`
        ).row.full-width.items-center.content-center.q-px-sm.b-30
        span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-ml-sm Добавить элементы
        .col
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  q-page-container
    page(id="all")
      template(v-slot:tint=`{item}`)
        div(
          :style=`{
            position: 'absolute', zIndex: 200,
          }`
          ).row.fit
          div(
            v-if="item && items.includes(item.id)"
            @click="$emit('itemDelete', item)"
            :style=`{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
            }`
            ).row.fit.items-center.content-center.justify-end.q-pa-md.cursor-pointer
            q-checkbox(
              v-if="item"
              color="green"
              :value="true"
              )
          div(
            v-else
            @click="$emit('itemAdd', item)"
            :style=`{
              borderRadius: '10px',
            }`
            ).row.fit.cursor-pointer
</template>

<script>
export default {
  name: 'wsFeed_itemFinder',
  props: ['items'],
  components: {
    page: () => import('./page.vue')
  },
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>
