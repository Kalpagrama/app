<template lang="pug">
.row.full-width
  //- Gender
  q-dialog(ref="changeGender" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px; width: 60px`).row.justify-center.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.changeGender.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing Gender')}}
    .column.bg-white.q-px-md
      .row.content-start.justify-center
        q-input(v-model="newGender" stack-label label="Gender" filled).full-width.q-my-md
        q-btn(
          push no-caps dense color="accent" @click="changeGender()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Change Gender') }}
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changeGender.show()").row.full-width.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span {{$t('Gender')}}
    .row.full-width
      small.text-grey  {{ currentGender }}
</template>
<script>
export default {
  name: 'genderDialog',
  data () {
    return {
      newGender: '',
    }
  },
  computed: {
    currentGender () {
      return this.$store.state.objects.currentUser.profile.gender
    }
  },
  methods: {
    async changegender () {
      try {
        this.$log('changegender start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.gender',
          value: this.newgender
        })
        this.$log('changeGender done', res)
        this.$q.notify({message: 'Cant change Gender', color: 'green', textColor: 'white'})
      } catch (e) {
        this.$log('changeGender ERROR', e)
        this.$q.notify({message: 'Cant change Gender', color: 'red', textColor: 'white'})
      }
    }
  }
}
</script>
