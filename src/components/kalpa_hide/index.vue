<template lang="pug">
div(:style=`{
borderRadius: '20px'
}`).row.b-40
  .column.full-width.text-white.q-mx-md
    //q-icon(name="task_alt" size="40px" color="green").q-mt-md
    .row.full-width.justify-center.q-mt-sm
      span.text-grey.text-center.q-mb-md.q-mt-md.q-px-sm {{$t('This publication will be hidden. From now on, we will show less of this content. Why did the publication seem uninteresting to you?')}}
      q-btn(
        v-for="(r,i) in reasons" :key="i"
        :label="r.name" no-caps flat :style=`{borderRadius: '0px', fontSize: fontSize+'px', width: '100%'}` @click="hide(r.id)")
    div(:style=`{
      content: '',
      width: '100%',
      height: '1px',
      background: 'rgb(73,66,61)',}`).q-mt-md
    .row.full-width
      q-btn(
        :label="$t('Cancel')" no-caps flat color="red" v-close-popup
        :style=`{borderRadius: '0 0 20px 20px', width: '100%'}`).q-py-sm
</template>

<script>

export default {
  name: 'kalpaHide',
  props: ['essence'],
  data () {
    return {
      reasons: [
        {id: 'b', name: this.$t('Мне нравится эта тема, но не эта публикация')},
        {id: 'c', name: this.$t('Эта тема мне не интересна')},
        {id: 'd', name: this.$t('Не хочу видеть публикации этого автора')},
        {id: 'e', name: this.$t('Иное')}]
    }
  },
  computed: {
    fontSize() {
      if (this.$q.screen.width > this.$store.state.ui.pageMinWidthDesktop) return 14
      else return 12
    },
  },
  methods: {
    async hide(reasonId){
      switch (reasonId){
        case 'd':
          await this.$rxdb.hideObjectOrSource(null, this.essence.author.oid)
          break
        default:
          await this.$rxdb.hideObjectOrSource(this.essence.oid, null)
          break
      }
    }
  }
}
</script>
