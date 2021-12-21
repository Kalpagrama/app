<template lang="pug">
div(:style=`{
width: '400px',
borderRadius: '20px'
}`).relative-position.row.b-40.text-white
  .column.full-width.q-py-md.q-px-sm.q-gutter-y-sm.text-white.items-center
    .row.full-width.justify-center.text-white.q-mb-sm.q-pl-lg.q-pr-sm
      //q-icon(name="report" size="35px" color="red")
      span(:style=`{fontSize: '15px'}`).text-white.text-center {{$t('Report')}}
      q-btn(round flat color="white" icon="clear" v-close-popup).absolute-top-right
    q-select(
      v-model="model"
      dark
      :options="options"
      outlined color='green'
      :label="$t('Report reason')"
      label-color="white"
      stack-label
      bg-color='grey-9'
      options-cover
      :style=`{width: '300px'}`
      )
    q-input(
      v-model="text"
      outlined
      :style=`{width: '300px'}`
      :placeholder="$t('Message..')"
      color='green'
      autogrow
      :input-style="{ color: '#fff' }"
      bg-color='grey-9'
      )
    .row.full-width.justify-center.q-gutter-sm
      //q-btn(:label= "$t('Cancel')" no-caps outline color="green" v-close-popup)
      q-btn(:label= "$t('Send Report')" no-caps outline color="red" @click="hide")
</template>

<script>

export default {
  name: 'kalpaReport',
  props: ['essence'],
  data () {
    return {
      text: (''),
      model: null,
      options: [
        this.$t('Image of a naked body'),
        this.$t('Violence'),
        this.$t('Harassment'),
        this.$t('Suicide/self-mutilation'),
        this.$t('Spam'),
        this.$t('Unauthorized trading'),
        this.$t('Hostile statements'),
        this.$t('Terrorism'),
        this.$t('Obscene materials')
      ]
    }
  },
  computed: {
  },
  methods: {
    async hide(){
      await this.$rxdb.hideObjectOrSource(this.essence.oid, null)
    }
  }
}
</script>
