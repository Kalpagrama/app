<template lang="pug">
  .row.text-white {{item.providerInfo.description}}
  //И. Ильф и Е. Петров завершили роман «Двенадцать стульев» в 1928 году, но еще до первой публикации цензоры изрядно сократили, «почистили» его. Правка продолжалась от издания к изданию еще десять лет. В итоге книга уменьшилась почти на треть. Публикуемый ныне вариант – первый полный – реконструирован по архивным материалам. Книга снабжена обширным историко-литературным и реальным комментарием.

</template>

<script>
import {assert} from 'src/system/common/utils'
import {ContentApi} from '../../../../api/content';

export default {
  name: 'itemDescription',
  props: ['item'],
  components: {
  },
  data () {
    return {
    }
  },
  computed: {
  },
  mounted() {
    this.$log('mounted')
    assert('providerInfo' in this.item && 'description' in this.item.providerInfo, 'description should be not null')
  }
}
</script>
