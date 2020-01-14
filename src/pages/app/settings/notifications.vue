<template lang="pug">
.column.fit.bg-white
  //- div(v-for="(n, ni) in n_settings" :key="ni" :style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
  //-   span {{$t(n.name)}}
  //-   .col
  //-   q-toggle(v-model="n.model" color="accent")
  //-   span {{n.model}}
  div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
    span {{$t('Pause all')}}
    .col
    q-toggle(v-model="pauseAllNotifications" @input="save(pauseAllNotifications)" color="accent")
  div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
    span {{$t('Assessments')}}
    .col
    q-toggle(v-model="assessmentsNotifications" @input="save(assessmentsNotifications)" color="accent")
  div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
    span {{$t('Subscriptions')}}
    .col
    q-toggle(v-model="subscriptionsNotifications" @input="save(subscriptionsNotifications)" color="accent")
  div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
    span {{$t('Mentions')}}
    .col
    q-toggle(v-model="mentionsNotifications" @input="save(mentionsNotifications)" color="accent")
  div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
    span {{$t('Shared')}}
    .col
    q-toggle(v-model="sharedNotifications" @input="save(sharedNotifications)" color="accent")
  div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
    span {{$t('The kernel is added to your content')}}
    .col
    q-toggle(v-model="nodeCreatedNotifications" @input="save(nodeCreatedNotifications)" color="accent")
  div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
    span {{$t('The kernel is added to the chain')}}
    .col
    div(@click="save()")
      q-toggle(v-model="nodeAddedNotifications" @input="save(nodeAddedNotifications)" color="accent")
  //- span {{pauseAllNotifications}}
  //- span {{$store.getters.currentUser.settings.notifications.pauseAllNotifications}}
</template>

<script>
export default {
  name: 'pageApp__Settings__Notifications',
  data () {
    return {
      pauseAllNotifications: null,
      assessmentsNotifications: null,
      subscriptionsNotifications: null,
      mentionsNotifications: null,
      sharedNotifications: null,
      nodeCreatedNotifications: null,
      nodeAddedNotifications: null,
    }
  },
  computed: {
  },
  methods: {
    toggle () {
      this.save()
    },
    async save (n) {
      try {
        this.$log('changing start', n)
        let res = await this.$store.dispatch('objects/update', {
          oid: this.$store.getters.currentUser.oid,
          path: 'settings.notifications',
          value: this.n
        })
        this.$log('changing done', res)
        this.$q.notify({message: 'Changing', color: 'green', textColor: 'white'})
      } catch (e) {
        this.$log('changing ERROR', e)
        this.$q.notify({message: 'Cant changing', color: 'red', textColor: 'white'})
      }
    },
  },
  mounted () {
    this.$logD('mounted')
    this.pauseAllNotifications = this.$store.getters.currentUser.settings.notifications.pauseAllNotifications
    this.assessmentsNotifications = this.$store.getters.currentUser.settings.notifications.assessmentsNotifications
    this.subscriptionsNotifications = this.$store.getters.currentUser.settings.notifications.subscriptionsNotifications
    this.mentionsNotifications = this.$store.getters.currentUser.settings.notifications.mentionsNotifications
    this.sharedNotifications = this.$store.getters.currentUser.settings.notifications.sharedNotifications
    this.nodeCreatedNotifications = this.$store.getters.currentUser.settings.notifications.nodeCreatedNotifications
    this.nodeAddedNotifications = this.$store.getters.currentUser.settings.notifications.nodeAddedNotifications
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
