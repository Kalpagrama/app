<template lang="pug">
.row.full-width
  //- Phone
  q-dialog(ref="changePhone" :maximized="true" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px; width: 60px`).row.justify-center.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="closing()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Changing phone number')}}
    .column.bg-white.q-px-md
      .row.full-width.justify-left.q-my-md
        span {{$t('You can attach your personal phone number to the page. This will protect your page.')}}
      div(style=`border-radius: 10px;`).row.content-start.justify-center
        q-input(v-if="currentPhone" v-model="currentPhone" readonly disable stack-label :label="$t('Current number')" filled).full-width.q-mb-md
        q-input(v-model="newPhone" unmasked-value mask="(###)-###-##-##" stack-label :label="$t('New number')" prefix="+7" filled).full-width.q-mb-md
        q-btn(
          push no-caps dense color="accent" @click="changePhone()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Get code') }}
        .row.full-width.justify-start
          small.text-grey {{ $t('Example for Russia')}} +7 (921)-000-00-07
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changePhone.show()").row.full-width.justify-left.items-center.q-py-sm.cursor-pointer.hr
    .row.full-width
      span {{$t("Phone number")}}
    .row.full-width
      small.text-grey  {{ currentPhone }}
      div(v-if="!currentPhone").row.full-width.items-center
        small.text-grey {{$t('Add your phone number')}}
        q-icon(name="warning" color="accent" size="20px").q-ml-xs
</template>
<script>
export default {
  name: 'phoneDialog',
  data () {
    return {
      newPhone: '',
    }
  },
  computed: {
    currentPhone () {
      return this.$store.state.objects.currentUser.profile.phone
    }
  },
  methods: {
    closing () {
      this.$log('reset start')
      this.newPhone = null
      this.$refs.changePhone.toggle()
    },
    async changePhone () {
      try {
        this.$log('changePhone start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.phone',
          value: '+7 ' + this.newPhone
        })
        this.$log('changePhone done', res)
        this.$q.notify({message: 'Changed PHONE', color: 'green', textColor: 'white'})
      } catch (e) {
        this.$log('changePhone ERROR', e)
        this.$q.notify({message: 'Cant change PHONE', color: 'red', textColor: 'white'})
      }
    },
  }
}
</script>
