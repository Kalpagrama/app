<template lang="pug">
div(:style=`{paddingBottom: '50px',}`).row.fit.q-pt-md
  div(
    :style=`{
      position: 'relative',
      borderRadius: $store.state.ui.borderRadius+'px',
    }`
    ).column.fit.b-60
    //- header: content.name, content.name, urls...
    .row.full-width.q-pa-md
      span(:style=`{fontSize: '20px'}`).text-white.text-bold {{ content.name }}
      .row.full-width
        small(@click="sourceClick()").text-grey-4.cursor-pointer {{$t('source', 'Источник')}}: {{ content.url }}
    .row.full-width
    //- body: spheres
    .col.full-width.scroll
      .row.fit.q-pa-md
        //- span.text-white {{$t('Spheres', 'Сферы')}}
    //- footer: delete, share
    .row.full-width.q-pa-sm
      q-btn(round flat dense color="red" icon="delete_outline" @click="deleteStart()")
      .col
      q-btn(round flat dense color="white" icon="share" @click="shareStart()")
</template>

<script>
export default {
  name: 'videoEditor-pageDetails',
  props: ['content'],
  // inject: ['sidEditor', 'sidPlayer'],
  computed: {
    // storeEditor () {
    //   return window.stores[this.sidEditor]
    // }
  },
  methods: {
    sourceClick () {
      this.$log('sourceClick')
    },
    shareStart () {
      this.$log('shareStart')
    },
    deleteStart () {
      this.$log('deleteStart')
    }
  }
}
</script>
