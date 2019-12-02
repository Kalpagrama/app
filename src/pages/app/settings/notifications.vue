<template lang="pug">
.column.fit.bg-white
  div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
    span {{$t('Pause all')}}
    .col
    q-toggle(v-model="all" color="accent")
  div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
    span {{$t('Assessments')}}
    .col
    q-toggle(v-model="assessments" color="accent")
  div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
    span {{$t('Subscriptions')}}
    .col
    q-toggle(v-model="subscriptions" color="accent")
  div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
    span {{$t('Mentions')}}
    .col
    q-toggle(v-model="mentions" color="accent")
  div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
    span {{$t('Shared')}}
    .col
    q-toggle(v-model="shared" color="accent")
  div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
    span {{$t('The kernel is added to your content')}}
    .col
    q-toggle(v-model="nodeCreated" color="accent")
  div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
    span {{$t('The kernel is added to the chain.')}}
    .col
    q-toggle(v-model="nodeAdded" color="accent")
  //- q-dialog(ref="feedback" :maximized="true")
  //-   .column.fit.bg-white
  //-     .row.full-width.q-px-md
  //-       div(style=`height: 60px`).row.justify-left.items-center
  //-         q-btn(round flat icon="arrow_back" @click="$refs.feedback.toggle()")
  //-       .col.row.justify-start.items-center.q-px-sm
  //-         span.text-bold Rated
  //-     div(style=`height: 40px`).row.full-width.items-center.q-px-md.q-mt-md
  //-       span.text-grey.text-caption.text-bold Show notifications
  //-     div(:style=`{borderBottom: '1px solid #eee'}`).row.justify-left.items-center.q-px-md
  //-       q-radio(v-model="showNot" color="accent" val="all" label="All").row.full-width
  //-       q-radio(v-model="showNot" color="accent" val="important" label="Important").row.full-width
  //-       q-radio(v-model="showNot" color="accent" val="neither" label="Neither").row.full-width
  //-     div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md
  //-       span Push-notifications
  //-       .col
  //-       q-toggle(v-model="push" color="accent")
  //-     div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center.items-center.q-px-md.hr.cursor-pointer
  //-       span System settings
  //- div(:style=`{height: '50px', border: '1px solid #eee'}`).row.justify-left.items-center.q-px-md.cursor-pointer.hr
  //-   .row.full-width
  //-     span Do not disturb
  //- div(style=`height: 40px`).row.full-width.items-center.q-px-md.q-mt-md
  //-   span.text-grey.text-caption.text-bold Messages
  //- div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.justify-left.items-center.q-px-md.cursor-pointer.hr
  //-   .row.full-width
  //-     span Private messages
  //-   .row.full-width
  //-     small.text-grey Name and text
  //- div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.justify-left.items-center.q-px-md.cursor-pointer.hr
  //-   .row.full-width
  //-     span Conversations and text
  //-   .row.full-width
  //-     small.text-grey Name and text
  //- div(style=`height: 40px`).row.full-width.items-center.q-px-md.q-mt-md
  //-   span.text-grey.text-caption.text-bold Feedback
  //- div(clickable v-for="(f, ff) in feedback" :key="ff" @click="$refs.feedback.show()" :style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.justify-left.items-center.q-px-md.cursor-pointer.hr
  //-   .row.full-width
  //-     span {{ f.name }}
</template>

<script>
export default {
  name: 'pageApp__Settings__Notifications',
  data () {
    return {
      nodeAdded: true,
      all: true,
      assessments: true,
      subscriptions: true,
      mentions: true,
      shared: true,
      nodeCreated: true,
      push: true,
      showNot: 'all',
      feedback: [
        {name: 'Rated', icon: '', ref: 'rate'},
        {name: 'Comented', icon: '', ref: ''}
      ]
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
