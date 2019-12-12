<template lang="pug">
.column.fit.bg-grey-1
  q-dialog(ref="sessions" :maximized="true" transition-show="slide-left" transition-hide="slide-right")
    div(style=`height: 60px`).row.items-center.bg-primary
      div(style=`height: 60px; width: 60px`).row.justify-center.items-center
        q-btn(round flat icon="arrow_back" color="white" @click="$refs.sessions.toggle()")
      .col.row.justify-start.items-center.q-px-sm
        span.text-bold.text-white {{$t('Sessions')}}
    .column.bg-grey-3.q-px-md
      .row.content-start.justify-center.q-pt-md
        div(
          v-for="(s, si) in sessions" :key="si"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`
          ).row.full-width.items-center.q-mb-sm.bg-white.cursor-pointer.q-px-sm
          .col
            span {{s.ip}}
          div(style=`height: 60px; width: 40px`).row.justify-center.items-center
            q-icon(name="more_vert" size="25px" @click="sessionIndex < 0 ? sessionIndex = si : sessionIndex = -1" color="black")
          div(style=`height: 60px; width: 40px`).row.justify-center.items-center
            q-icon(name="clear" size="25px" @click="deleteSession(s.token)" color="black")
          //-  leave-active-class="animated fadeOut"
          transition(appear enter-active-class="animated fadeIn")
            div(v-if="si === sessionIndex").row.full-width.justify-center
              span {{s.userAgent}}
              span {{showBool}}
        .row.full-width.items-center.justify-center.q-my-sm
          q-btn(
            push color="accent" no-caps @click="deleteSession(null)"
            :style=`{height: '50px', borderRadius: '10px'}`)
            span.text-bold.q-ml-md {{ $t('Delete all sessions exept your') }}
  div(:style=`{height: '50px', borderBottom: '1px solid #eee'}` @click="$refs.sessions.show()").row.full-width.justify-start.items-center.q-px-md
    span {{$t('Sessions')}}
  span {{sessions}}
</template>

<script>
export default {
  name: 'pageApp__Settings__Security',
  data () {
    return {
      inf: false,
      token: '',
      sessionIndex: -1
    }
  },
  computed: {
    session () {
      if (this.sessionIndex) return this.sessions[this.sessionIndex]
      else return null
    },
    sessions () {
      return this.$store.state.user.user.sessions
    }
  },
  methods: {
    async deleteSession (s) {
      this.token = s
      try {
          this.$log('delete start')
          let res = await this.$store.dispatch('auth/logout', {token: this.token})
          this.$log('deleted done', res)
          this.$q.notify({message: 'Session deleted', color: 'green', textColor: 'white'})
        } catch (e) {
          this.$log('delete session ERROR', this.token)
          this.$q.notify({message: 'Cant delete session', color: 'red', textColor: 'white'})
        }
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
