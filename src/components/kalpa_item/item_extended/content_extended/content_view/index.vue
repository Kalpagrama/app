// образы на суть
<template lang="pug">
component(
  v-bind="$props"
  :is="componentName")
</template>

<script>

import { assert } from 'src/system/common/utils'
import { ObjectTypeEnum } from 'src/system/common/enums'
import video from './video'
import book from './book'
import image from './image'

export default {
  name: 'pageContent',
  components: {video, book, image},
  props: ['content', 'mode', 'isActive'],
  data () {
    return {
    }
  },
  computed: {
    componentName() {
      assert(this.content)
      switch (this.content.type) {
        case ObjectTypeEnum.VIDEO: return 'video'
        case ObjectTypeEnum.IMAGE: return 'image'
        case ObjectTypeEnum.BOOK: return 'book'
        default: throw new Error('bad type' + this.content.type)
      }
    }
  },
  watch: {},
  async created () {
    this.$log('created')
    assert(this.content)
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
