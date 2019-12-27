<template lang="pug">
.row.full-width
  //- Email
  q-dialog(ref="changeEmail" :maximized="$q.screen.xs" transition-show="slide-left" transition-hide="slide-right").bg-secondary
    .column
      div(style=`height: 60px`).row.items-center.bg-primary
        div(style=`height: 60px; width: 60px`).row.justify-center.items-center
          q-btn(round flat icon="arrow_back" color="white" @click="closing()")
        .col.row.justify-start.items-center.q-px-sm
          span.text-bold.text-white {{$t('Changing email')}}
      .column.bg-white.q-px-md
        .row.content-start.justify-center
          q-input(v-model="$store.state.objects.currentUser.profile.email" standout disable readonly stack-label :label="$t('Current email')").full-width.q-my-md.text-black
          div(v-if="!waitingCode").row.full-width
            q-input(v-model="newEmail" @keyup.enter="emailSend()" stack-label :label="$t('New email')" filled).full-width.q-mb-md
            q-btn(
              push no-caps dense color="accent" @click=""
              :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Get the code', 'Получить код') }}
          div(v-else).row.full-width
            q-input(v-model="newEmail" stack-label :label="$t('Code')" filled).full-width.q-mb-md
            q-btn(
              push no-caps dense color="accent" @click="changeEmail()"
              :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm {{ $t('Change', 'Сменить') }}
  div(:style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="$refs.changeEmail.show()").row.full-width.justify-left.items-center.q-py-sm.cursor-pointer.hr
    .row.full-width
      span {{$t('Email')}}
    .row.full-width
      small.text-grey {{ currentEmail }}
      div(v-if="!currentEmail").row.full-width.items-center
        small.text-grey {{$t('Add your email')}}
        q-icon(name="warning" color="accent" size="20px").q-ml-xs
</template>
<script>
export default {
  name: 'emailDialog',
  data () {
    return {
      newEmail: '',
      waitingCode: false
    }
  },
  computed: {
    currentEmail () {
      return this.$store.state.objects.currentUser.profile.email
    }
  },
  methods: {
    closing () {
      this.$log('reset start')
      this.newPhone = null
      this.$refs.changeEmail.toggle()
    },
    async changeEmail () {
      try {
        this.$log('changeEmail start')
        let res = await this.$store.dispatch('objects/setObjectValue', {
          oid: this.$store.state.objects.currentUser.oid,
          path: 'profile.email',
          value: this.newEmail
        })
        this.$log('changeEmail done', res)
        this.$q.notify({message: 'Changed EMAIL', color: 'green', textColor: 'white'})
      } catch (e) {
        this.$log('changeEmail ERROR', e)
        this.$q.notify({message: 'Cant change EMAIL', color: 'red', textColor: 'white'})
      }
    },
  }
}
</script>
