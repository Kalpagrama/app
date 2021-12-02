<template lang="pug">
div(:style=`{width: 150*1.618+'px', height: '150px'}`).relative-position
  q-skeleton(type='rect' height='100%' animation='none' dark).b-0.br-10
  div(:style=`{
      fontSize: fontSize+'px',
      fontWeight: fontWeight,
      textAlign: 'center',
      zIndex: 10
    }`).absolute-bottom.row.full-width.items-end.content-end.justify-center.no-wrap.q-px-sm
    q-icon(:name="namePrefix" color="grey-5").q-pb-sm
    span.text-grey-5.ellipsis.q-pl-xs.q-pb-xs {{item.name}}
</template>

<script>
export default {
  name: 'skeletonCardTiny',
  props: ['item', 'animation'],
  computed: {
    fontSize () {
      let l = this.item.name.length
      let w = 100
      if (l < 20 && w > 300) return 22
      else if (l < 30 && w > 300) return 20
      else if (l < 40 && w > 300) return 16
      else if (l <= 20 && w < 300) return 12
      else if (l > 20 && w < 300) return 12
      else return 14
    },
    fontWeight () {
      return 800
    },
    namePrefix () {
      switch (this.item.type) {
        case 'NODE':
          return 'adjust'
        case 'JOINT':
          return 'fas fa-link'
        case 'USER':
          return 'person'
        case 'BLOCK':
          return 'dashboard_customize'
        case 'VIDEO':
        case 'BOOK':
        case 'IMAGE':
          return 'select_all'
        default:
          return 'adjust'
      }
    }
  }
}
</script>
