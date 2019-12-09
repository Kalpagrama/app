<template lang="pug">
.row.full-width
  //- Language
  q-dialog(ref="changeLanguage" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px; width: 60px`).row.justify-center.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.changeLanguage.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing language')}}
    .column.bg-white.q-px-md
      .row.content-start.justify-center
        q-input(v-model="newLanguage" stack-label label="Language" filled).full-width.q-my-md
        q-btn(
          push no-caps dense color="accent" @click="changeLanguage()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Change language') }}
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changeLanguage.show()").row.full-width.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span {{$t('Language')}}
    .row.full-width
      small.text-grey  {{ currentLanguage }}
</template>
<script>
export default {
  name: 'languageDialog',
  data () {
    return {
      newLanguage: '',
    }
  },
  computed: {
    currentLanguage () {
      return this.$store.state.objects.currentUser.profile.lang
    }
  },
  methods: {
    async changeLanguage () {
      try {
        this.$log('changeLanguage start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.lang',
          value: this.newLanguage
        })
        this.$log('changeLanguage done', res)
        this.$q.notify({message: 'Cant change LANGUAGE', color: 'green', textColor: 'white'})
      } catch (e) {
        this.$log('changeLanguage ERROR', e)
        this.$q.notify({message: 'Cant change LANGUAGE', color: 'red', textColor: 'white'})
      }
    }
  }
}
</script>
