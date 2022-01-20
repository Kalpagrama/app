<template lang="pug">
.row.full-width.items-start.content-start.q-px-sm
  div(@click="$emit('close')").row.full-width.cursor-pointer
    .q-pa-sm.text-h6.text-bold.text-white {{$t('Description')}}
    .col
    q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  .row.full-width
    //span.text-white {{item.description}}
    div(v-html="item.description").text-grey
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectApi } from 'src/api/object'

export default {
  name: 'pageDescription',
  components: {
  },
  props: ['item', 'height', 'player'],
  data () {
    return {
    }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
