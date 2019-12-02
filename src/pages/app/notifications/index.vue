<template lang="pug">
q-layout(container :style=`{height: height+'px', width: width+'px'}`).column.bg-grey-2
  q-header(reveal)
    div(:style=`{height: '60px'}`).row.full-width.bg-white
      .row.items-center
        q-btn(round @click="$router.back(1)" flat color="accent" icon="arrow_back")
      .col.full-height
        .row.fit.items-center.q-px-md
          span.text-bold.text-black {{ $t('Notifications') }}
  q-page-container
    q-page.bg-grey-2
      div(v-if="events.length === 0").row.fit.justify-center.bg-white.q-py-xl
        span.text-grey.text-h6 You dont have notifications.
      .row.full-width.items-start.content-start.justify-center.q-pa-md
        div(:style=`{maxWidth: '500px'}`).row.full-width
          div(
            v-for="(e, ei) in events" :key="ei"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.bg-white.q-mb-sm.q-pa-sm
            div().row.fit
              div(:style=`{width: '40px', height: '40px'}`).row.items-center.justify-center
                img(:src="e.subject.thumbUrl"
                  :style=`{height: '40px', borderRadius: '50%', overflow: 'hidden'}`)
              .col.full-height
                //- SUBJECT
                div(@click="subjectClick(e.subject)").row.items-center.q-px-md
                  span {{ $t(e.subject.name) }}
                //- INFO
                .row.full-width.q-px-md
                  span(style=`font-size: 10px`).q-mr-xs {{ $t(textAction(e)) }}
                  span(style=`font-size: 10px`).text-lowercase {{ $t(e.object.type) }}
                //- OBJECT
                div(@click="objectClick(e.object)").row.items-center.q-px-md.text-blue.cursor-pointer
                  span {{ $t(e.object.name) | cut(20) }}
</template>

<script>
export default {
  name: 'pageApp__notifications',
  props: ['width', 'height'],
  data () {
    return {
    }
  },
  computed: {
    events () {
      return this.$store.state.events.userEvents
    },
    eventsCount () {
      return this.events.length
    }
  },
  methods: {
    textAction (e) {
      if (e.type === 'NODE_RATED') return 'rated'
      if (e.type === 'NODE_CREATED') return 'created'
      if (e.type === 'NODE_DELETED') return 'deleted'
      if (e.type === 'USER_SUBSCRIBED') return 'subscribed to'
      if (e.type === 'USER_UNSUBSCRIBED') return 'unsubscribed from'
      if (e.type === 'USER_CHANGED') return 'changed'
      if (e.type === 'USER_CONFIRMED') return 'confirmed'
      if (e.type === 'WS_ITEM_CREATED') return 'in workspace created'
      if (e.type === 'WS_ITEM_UPDATED') return 'in workspace updated'
      if (e.type === 'WS_ITEM_DELETED') return 'in workspace deleted'
    },
    editToggle () {
      this.$log('editToggle')
    },
    subjectClick (s) {
      this.$log('subjectClick')
      switch (s.type) {
        case 'VIDEO':
        case 'AUDIO':
        case 'BOOK':
        case 'IMAGE': {
          this.$router.push(`/app/content/${s.oid}`)
          break
        }
        case 'USER': {
          this.$router.push(`/app/user/${s.oid}`)
          break
        }
        case 'SPHERE': {
          this.$router.push(`/app/sphere/${s.oid}`)
          break
        }
        case 'NODE': {
          this.$router.push(`/app/node/${s.oid}`)
          break
        }
      }
    },
    objectClick (o) {
      this.$log('objectClick')
      switch (o.type) {
        case 'VIDEO':
        case 'AUDIO':
        case 'BOOK':
        case 'IMAGE': {
          this.$router.push(`/app/content/${o.oid}`)
          break
        }
        case 'USER': {
          this.$router.push(`/app/user/${o.oid}`)
          break
        }
        case 'SPHERE': {
          this.$router.push(`/app/sphere/${o.oid}`)
          break
        }
        case 'NODE': {
          this.$router.push(`/app/node/${o.oid}`)
          break
        }
      }
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

<style lang="stylus">
.q-footer {
  background: none !important
}
</style>
