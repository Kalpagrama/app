<template lang="pug">
.row.full-width
  //- City
  q-dialog(ref="changeCity" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px; width: 60px`).row.justify-center.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.changeCity.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing city')}}
    .column.bg-white.q-px-md
      .row.content-start.justify-center
        q-input(v-model="newCity" stack-label label="city" filled).full-width.q-my-md
        q-btn(
          push no-caps dense color="accent" @click="changeCity()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Change city') }}
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changeCity.show()").row.full-width.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span {{$t('City')}}
    .row.full-width
      small.text-grey  {{ currentCity }}
</template>
<script>
export default {
  name: 'cityDialog',
  data () {
    return {
      newCity: '',
    }
  },
  computed: {
    currentCity () {
      return this.$store.state.objects.currentUser.profile.city
    }
  },
  methods: {
    async changeCity () {
      try {
        this.$log('changeCity start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.city',
          value: this.newCity
        })
        this.$log('changeCity done', res)
        this.$q.notify({message: 'Cant change City', color: 'green', textColor: 'white'})
      } catch (e) {
        this.$log('changeCity ERROR', e)
        this.$q.notify({message: 'Cant change City', color: 'red', textColor: 'white'})
      }
    }
  }
}
</script>
