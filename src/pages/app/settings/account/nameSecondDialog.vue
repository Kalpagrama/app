<template lang="pug">
.row.full-width
  //- NameSecond
  q-dialog(ref="changeNameSecond" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px; width: 60px`).row.justify-center.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.changeNameSecond.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing NameSecond')}}
    .column.bg-white.q-px-md
      .row.content-start.justify-center
        q-input(v-model="newNameSecond" stack-label label="NameSecond" filled).full-width.q-my-md
        q-btn(
          push no-caps dense color="accent" @click="changeNameSecond()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Change NameSecond') }}
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changeNameSecond.show()").row.full-width.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span {{$t("Second name")}}
    .row.full-width
      small.text-grey  {{ currentSecondName }}
      div(v-if="!currentSecondName").row.full-width.items-center
        small.text-grey {{$t('Add your second name')}}
        q-icon(name="warning" color="accent" size="20px").q-ml-xs
</template>
<script>
export default {
  name: 'nameSecondDialog',
  data () {
    return {
      newNameSecond: ''
    }
  },
  computed: {
    currentNameSecond () {
      return this.$store.state.objects.currentUser.profile.nameSecond
    },
  },
  methods: {
    async changeNameSecond () {
      try {
        this.$log('changePhone start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.nameSecond',
          value: this.newNameSecond
        })
        this.$log('changeSecondName done', res)
        this.$q.notify({message: 'Changed Second name', color: 'green', textColor: 'white'})
      } catch (e) {
        this.$log('changeSecondName ERROR', e)
        this.$q.notify({message: 'Cant change Second name', color: 'red', textColor: 'white'})
      }
    },
  }
}
</script>
