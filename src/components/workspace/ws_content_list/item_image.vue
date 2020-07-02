<template lang="pug">
div.col-xs-6.col-sm-4.q-pa-xs
  div(
    @click="$emit('pick')"
    :style=`{position: 'relative', borderRadius: '10px',}`).cursor-pointer.b-60
    q-btn(
      round flat color="white" icon="more_vert"
      :style=`{
        position: 'absolute', zIndex: 1000,
        top: '0px', right: '0px',
        background: 'rgba(0,0,0,0.1)',
      }`)
      kalpa-menu-popup(:actions="actions")
    img(
      :src="content.thumbOid"
      :style=`{
        borderRadius: '10px',
      }`).full-width
    div().row.full-width.q-pa-sm
      small(:style=`{userSelect: 'none'}`).text-white {{ content.name }}
</template>

<script>
export default {
  name: 'itemImage',
  props: ['content', 'contentKalpa'],
  data () {
    return {
    }
  },
  computed: {
    actions () {
      return {
        explore: {
          name: this.$t('Посмотреть'),
          fn: () => {
            this.$log('explore')
            this.$emit('pick')
          }
        },
        rename: {
          name: this.$t('Переименовать'),
          fn: () => {
            this.$log('rename')
            this.$emit('rename')
          }
        },
        delete: {
          name: this.$t('Удалить'),
          fn: () => {
            this.$log('delete')
            this.$emit('delete')
          }
        }
      }
    }
  }
}
</script>
