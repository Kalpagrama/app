<template lang="pug">
.row.full-width
  //- NameFirst
  q-dialog(ref="changeNameFirst" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px; width: 60px`).row.justify-center.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.changeNameFirst.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing NameFirst')}}
    .column.bg-white.q-px-md
      .row.content-start.justify-center
        q-input(v-model="newNameFirst" stack-label label="NameFirst" filled).full-width.q-my-md
        q-btn(
          push no-caps dense color="accent" @click="changeNameFirst()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Change NameFirst') }}
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changeNameFirst.show()").row.full-width.justify-left.items-center.q-py-sm.q-px-md.cursor-pointer.hr
    .row.full-width
      span {{$t("First name")}}
    .row.full-width
      small.text-grey  {{ currentFirstName }}
      div(v-if="!currentFirstName").row.full-width.items-center
        small.text-grey {{$t('Add your first name')}}
        q-icon(name="warning" color="accent" size="20px").q-ml-xs
</template>
<script>
export default {
  name: 'nameFirstDialog',
  data () {
    return {
      newNameFirst: ''
    }
  },
  computed: {
    currentFirstName () {
      return this.$store.state.objects.currentUser.profile.nameFirst
    },
  },
  methods: {
    async changeNameFirst () {
      try {
        this.$log('changePhone start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.nameFirst',
          value: this.newNameFirst
        })
        this.$log('changeFirstName done', res)
        this.$q.notify({message: 'Changed First name', color: 'green', textColor: 'white'})
      } catch (e) {
        this.$log('changeFirstName ERROR', e)
        this.$q.notify({message: 'Cant change First name', color: 'red', textColor: 'white'})
      }
    },
  }
}
</script>
