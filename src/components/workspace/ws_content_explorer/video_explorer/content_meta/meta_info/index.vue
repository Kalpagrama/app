<template lang="pug">
div(
  :style=`{paddingTop: '44px'}`
  ).row.fit.justify-center
  div(
    :style=`{
      maxWidth: '600px',
      position: 'relative',
      borderRadius: $store.state.ui.borderRadius+'px',
      overflow: 'hidden',
    }`
    ).column.fit.b-60
    .row.full-width.q-px-sm
      div(v-if="true").row.full-width.q-pt-md.q-px-md
        span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ stateExplorer.content.name }}
    .row.full-width.items-center.content-center.q-px-md
      //- small.text-grey-6.q-mx-sm [{{ stateExplorer.content.type }}]
      a(
        :href="stateExplorer.content.url"
        target="_blank"
        :style=`{}`
        )
        small.text-grey-6.q-mx-sm {{ stateExplorer.content.url }}
    .row.full-width.q-pt-md
      .row.full-width.q-px-md
        q-input(
          v-model="sphere"
          filled dark dense color="grey-6"
          label="Find or create sphere"
          ).full-width
    .col.full-width
    .row.full-width.q-pa-sm
      q-btn(round flat dense color="red" icon="delete_outline" @click="contentDelete()")
      .col
      q-btn(round flat dense color="grey-6" icon="share" @click="contentShare()")
</template>

<script>
export default {
  name: 'metaInfo',
  props: ['stateExplorer', 'resizable'],
  data () {
    return {
      sphere: ''
    }
  },
  methods: {
    contentShare () {
      this.$log('contentShare')
    },
    contentDelete () {
      this.$log('contentDelete')
    }
  }
}
</script>
