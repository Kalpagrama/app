<template lang="pug">
component(:is="componentName", :item="item" :types="types")
</template>

<script>
import { ObjectTypeEnum } from 'src/system/common/enums'
import kalpa from './kalpa'
import youtube from './youtube'
export default {
  name: 'pageSimilar',
  props: {
    item: {type: Object},
  },
  components: {
    kalpa,
    youtube,
  },
  computed: {
    componentName () {
      if (this.item.type === ObjectTypeEnum.VIDEO && this.item.contentProvider === 'YOUTUBE') return 'youtube'
      else return 'kalpa'
    },
    types() {
      if (this.item.type === ObjectTypeEnum.VIDEO) return [ObjectTypeEnum.VIDEO, ObjectTypeEnum.BOOK, ObjectTypeEnum.IMAGE]
      else if (this.item.type === ObjectTypeEnum.BOOK) return [ObjectTypeEnum.VIDEO, ObjectTypeEnum.BOOK, ObjectTypeEnum.IMAGE]
      else if (this.item.type === ObjectTypeEnum.IMAGE) return [ObjectTypeEnum.VIDEO, ObjectTypeEnum.BOOK, ObjectTypeEnum.IMAGE]
      else return ['NODE', 'JOINT', 'BLOCK']
    }
  }
}
</script>
