<template lang="pug">
  div(style=`maxWidth: 600px`).row.full-width.justify-center.items-start
    div(:style=`{height: '60px'}`).row.full-width.items-center.justify-end.q-px-md.bg-white
      .row.items-center.full-width
        span.text-bold.text-black Мои уведомления
        .col
        q-btn(flat no-caps dense round icon="edit" color="primary" @click="")
    div(:style=`{height: 'calc(100vh - 80px)'}`).row.full-width.justify-center.items-start.scroll
      div(
        v-for="(e, ee) in userEvents" :key="e.id"
        :style=`{height: '50px'}`
        ).row.full-width.justify-center.items-center.bg-white.q-px-md.cursor-pointer.hr
        div(@click="pageEvent(e)").row.full-width.items-center
          div(:style=`{width: '40px', height: '40px', backgroundImage: 'url('+ e.thumbUrl +')'}`).image
          .row.items-center.justify-center.q-ml-md
            span {{e.name | cut(10)}}
          .col
          div(v-if="false").row.items-center.q-ml-md
            q-btn(icon="clear" round dense flat color="primary" @click="")
      div(v-if="userEvents.length === 0" :style=`{ height: '100px', borderRadius: '0 0 10px 10px'}`).row.full-width.justify-center.q-px-md.items-center.bg-white
        span.text-center.text-bold У вас нету уведомлений.
</template>

<script>
export default {
  name: 'notifications',
  data () {
    return {
      // userEvents: [
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''},
      //   {name: 'qwfqf', type: 'chain', thumbUrl: ''}
      // ]
    }
  },
  methods: {
    async pageEvent (e) {
      this.$log('pageClick', e)
      let path = ''
      switch (e.type) {
        case 'chain': {
          path = '/app/chain/' + e.oid
          break
        }
        case 'user': {
          path = '/app/user/' + e.oid
          break
        }
        case 'sphere': {
          path = '/app/sphere/' + e.oid
          break
        }
        case 'content': {
          path = '/app/content/' + e.oid
          break
        }
      }
      this.$router.push(path)
    },
    userEvents () {
      return this.$store.state.events.userEvents
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
