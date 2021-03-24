<template lang="pug">
.row.full-width.q-pa-sm
  .row.full-width.q-px-sm.q-pb-sm
    span.text-white.text-bold {{$t('Pick language')}}
  q-btn-group(
    flat
    :style=`{
      borderRadius: '10px',
    }`).b-40.full-width
    q-btn(
      v-for="l in langs" :key="l.id"
      flat no-caps
      :color="l.id === lang ? 'green' : 'grey-6'"
      :style=`{
        height: '50px',
        borderRadius: '10px',
      }`
      @click="langSet(l)").col
      span(
        :class=`{
          'text-bold': l.id === lang,
        }`
        ) {{ l.name }}
</template>

<script>
export default {
  name: 'editLang',
  props: ['currentUser'],
  data () {
    return {
      langs: [
        {id: 'RUS', name: 'Русский'},
        {id: 'ENG', name: 'English'}
      ]
    }
  },
  computed: {
    lang () {
      return this.currentUser.profile.lang
    }
  },
  methods: {
    langSet (l) {
      this.$log('langSet', l)
      // TODO: edit
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
