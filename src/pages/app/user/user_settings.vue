<template lang="pug">
div(:style=`{borderRadius: '10px'}`).column.fit.bg-white
  div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-pl-md.q-pr-sm
    span.text-bold User settings
    .col
    q-btn(round flat color="red" icon="clear" @click="cancel()")
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-sm
      //- cover
      //- avatar
      //- set status
      .row.full-width.q-px-sm.q-mt-md
        span Set status
      input(
        v-model="user.profile.about"
        :style=`{height: '60px', border: 'none', borderRadius: '10px'}`).full-width.bg-grey-4.q-px-md.q-py-sm
      //- name
      .row.full-width.q-px-sm.q-mt-md
        span Set name
      input(
        v-model="user.name"
        :style=`{height: '60px', borderRadius: '10px'}`).full-width.bg-grey-4.q-px-md
      //- set about
      .row.full-width.q-px-sm.q-mt-md
        span Set about
      textarea(
        v-model="user.profile.about"
        :style=`{minHeight: '120px', border: 'none', borderRadius: '10px'}`).full-width.bg-grey-4.q-px-md.q-py-sm
      //- login
      //- password
      //- email
      //- phone
      //- span {{ user }}
  div(:style=`{height: '70px'}`).row.full-width.q-pa-sm
    q-btn(push no-caps color="green" @click="save()").fit
      span.text-bold Save
</template>

<script>
export default {
  name: 'pageAppUser_userSettings',
  props: ['value'],
  data () {
    return {
      user: null
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (to, from) {
        this.$log('value CHANGED', to)
        if (to) this.user = JSON.parse(JSON.stringify(to))
      }
    }
  },
  methods: {
    cancel () {
      this.$log('cancel')
      this.$emit('hide')
    },
    async save () {
      this.$log('save')
      let res = await this.$store.dispatch('objects/update', {
        oid: this.user.oid,
        path: 'profile.nameFull',
        newValue: this.user.name
      })
    }
  }
}
</script>
