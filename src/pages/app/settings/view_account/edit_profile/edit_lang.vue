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
import { ObjectApi } from 'src/api/object'
import {setLocale} from 'src/boot/i18n'

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
    async langSet (l) {
      this.$log('langSet', l)
      await ObjectApi.update(this.currentUser.oid, 'profile.lang', l.id)
      await setLocale(l.id === 'RUS' ? 'ru' : 'en')
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
