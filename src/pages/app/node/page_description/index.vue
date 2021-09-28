<template lang="pug">
.row.full-width.items-start.content-start.q-px-sm
  .q-pa-sm.text-h6.text-bold.text-white {{$t('Description')}}
  .col
  q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  span.text-white askldflksad jfal ksjdhflkasjdhf lksajdfhk lsajhfklsajdfhslka djfhksaldjfhklsdj fhlskdfjhls kdjfhlksadjhflks adjh flksadjfhalksfj lskjgfldkjgldskgf dsflg dsfgjhdslkf h dsfkgh sdlkhgldks ghdlskfgh hdskfgh lkjsdhfg sdfg hklsdjfhg sdkjfhg lksdfgh lsdjfhg lkdsjfghldskjfgh sdfkjgh lsdkfjgh
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectApi } from 'src/api/object'

export default {
  name: 'pageDescription',
  components: {
  },
  props: ['node', 'height'],
  data () {
    return {
    }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
